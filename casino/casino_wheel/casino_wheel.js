import UserService from "../../database/user_service.js";
import CasinoService from "../../database/casino_service.js";
import CasinoView from "../casino_view.js";
import formatCurrency from "../../services/format_currency.js";
import Constants from "./constants.js";

class Casino {
    /**
     * Парсит строку суммы ставки и возвращает числовое значение.
     * Поддерживаются суффиксы: к, тыс, м, млн, б, миллиард, т, трлн, кв, квадр.
     * @param {string} amountStr - Строка суммы ставки.
     * @returns {number} - Числовое значение суммы ставки.
     * @throws {Error} - Если сумма некорректна.
     */
    static parseBetAmount(amountStr) {
        const regex = /^(\d+(?:\.\d+)?)(к|тыс|м|млн|б|миллиард|т|трлн|кв|квадр)?$/i;
        const match = amountStr.match(regex);

        if (match) {
            const amount = parseFloat(match[1]);
            const suffix = match[2] ? match[2].toLowerCase() : "";
            const multiplier = Constants.AMOUNT_SUFFIXES[suffix] || 1;
            return amount * multiplier;
        }

        throw new Error("Некорректная сумма ставки");
    }

    /**
     * Генерирует случайный сектор рулетки.
     * @returns {object} - Объект с номером и цветом сектора.
     */
    static spinWheel() {
        const randomIndex = Math.floor(Math.random() * Constants.SECTORS.length);
        return Constants.SECTORS[randomIndex];
    }

    /**
     * Рассчитывает выплату и комиссию.
     * @param {string} betType - Тип ставки.
     * @param {number} betAmount - Сумма ставки.
     * @param {number} coefficient - Коэффициент букмекера.
     * @param {number} casino_commission - Комиссия (в процентах).
     * @returns {object} - Объект с выплатой и комиссией.
     */
    static calculatePayout(betType, betAmount, coefficient, casino_commission) {
        const payoutMultipliers = {
            красный: 1,
            черный: 1,
            четное: 1,
            нечетное: 1,
            дюжина1: 2,
            дюжина2: 2,
            дюжина3: 2,
            зеленый: 35,
        };

        const multiplier = payoutMultipliers[betType] || 0;
        let payout = betAmount * multiplier * coefficient;
        const commissionAmount = (payout * casino_commission) / 100;
        payout -= commissionAmount;

        return { payout, casino_commission: commissionAmount };
    }

    /**
     * Проверяет, выиграла ли ставка по результату рулетки.
     * @param {object} result - Результат рулетки.
     * @param {string} betType - Тип ставки.
     * @returns {boolean} - Выиграл ли пользователь.
     */
    static isBetWin(result, betType) {
        switch (betType) {
            case "красный":
                return result.color === "red";
            case "черный":
                return result.color === "black";
            case "четное":
                return result.number !== 0 && result.number % 2 === 0;
            case "нечетное":
                return result.number % 2 !== 0;
            case "дюжина1":
                return result.number >= 1 && result.number <= 12;
            case "дюжина2":
                return result.number >= 13 && result.number <= 24;
            case "дюжина3":
                return result.number >= 25 && result.number <= 36;
            case "зеленый":
                return result.color === "green";
            default:
                return false;
        }
    }

    /**
     * Обрабатывает ставку пользователя.
     * @param {object} context - Контекст пользователя.
     * @param {string} betType - Тип ставки.
     * @param {number|string} betAmount - Сумма ставки.
     * @returns {object} - Результат обработки ставки.
     * @throws {Error} - В случае ошибок.
     */
    static async processBet(context, betType, betAmount) {
        const userId = context.from.id;
        const user = await UserService.findUserById(userId);
        if (!user) {
            throw new Error("Пользователь не найден");
        }

        const casinoData = await CasinoService.findCasinoByUserID(userId);
        const position = user.user_position;
        if (!casinoData || !casinoData.casino_bookmaker) {
            return await context.send(CasinoView.getErrorNoCasinoMessage(position, user), { parse_mode: "HTML" });
        }

        let casinoBalance = parseFloat(casinoData.casino_balance);

        if (typeof betAmount === "string") {
            if (betAmount.includes("%")) {
                const percentage = parseFloat(betAmount.replace("%", ""));
                if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
                    throw new Error("Указан некорректный процент ставки");
                }
                betAmount = (casinoBalance * percentage) / 100;
            } else if (betAmount === "все" || betAmount === "всё") {
                betAmount = casinoBalance;
            } else {
                betAmount = Casino.parseBetAmount(betAmount);
                if (isNaN(betAmount) || betAmount <= 0) {
                    throw new Error("Указана некорректная сумма ставки");
                }
            }
        }

        if (casinoBalance < betAmount) {
            throw new Error("Недостаточно средств в балансе казино");
        }

        const { casino_bookmaker, casino_coefficient, casino_chance, casino_commission } = casinoData;

        let result = Casino.spinWheel();

        let isWin = Casino.isBetWin(result, betType);

        let payout = 0.0;
        let commissionAmount = 0.0;

        if (isWin) {
            const payoutData = Casino.calculatePayout(betType, betAmount, casino_coefficient, casino_commission);
            payout = payoutData.payout;
            commissionAmount = payoutData.casino_commission;
            casinoBalance += payout;
        } else {
            casinoBalance -= betAmount;
        }

        await CasinoService.updateCasinoBalance(userId, casinoBalance);

        return {
            win: isWin,
            result,
            payout,
            casino_commission: commissionAmount,
            casino_bookmaker,
            newBalance: casinoBalance,
            betAmount,
        };
    }

    /**
     * Пополняет баланс казино пользователя.
     * @param {object} context - Контекст пользователя.
     * @param {number} amount - Сумма пополнения.
     */
    static async depositToCasino(context, amount) {
        const userId = context.from.id;

        try {
            const depositResult = await CasinoService.depositToCasino(userId, amount);
            const user = await UserService.findUserById(userId);

            await context.reply(
                CasinoView.getDepositSuccessMessage(
                    user.user_name,
                    formatCurrency(amount),
                    formatCurrency(depositResult.newCasinoBalance),
                    formatCurrency(depositResult.newBankAmount)
                ),
                { parse_mode: "HTML" }
            );
        } catch (error) {
            await context.reply(CasinoView.getErrorMessage(error.message));
        }
    }

    /**
     * Обрабатывает команду пополнения баланса казино.
     * Пример команды: "пополнить 500"
     * @param {object} context - Контекст пользователя.
     */
    static async handleDepositCommand(context) {
        await UserService.addUserIfNotExists(context);
        const input = context.text.trim().toLowerCase();
        const args = input.split(/\s+/);
        const amountStr = args[2];
        const userId = context.from.id;
        const casinoData = await CasinoService.findCasinoByUserID(userId);
        const user = await UserService.findUserById(context.from.id);
        const position = user.user_position;
        if (!casinoData || !casinoData.casino_bookmaker) {
            return await context.send(CasinoView.getErrorNoCasinoMessage(position, user), { parse_mode: "HTML" });
        }
        if (!amountStr) {
            return await context.reply(CasinoView.getDepositHelpMessage(), { parse_mode: "HTML" });
        }

        try {
            const amount = Casino.parseBetAmount(amountStr);
            if (isNaN(amount) || amount <= 0) {
                throw new Error("Указана некорректная сумма для пополнения.");
            }

            await Casino.depositToCasino(context, amount);
        } catch (error) {
            await context.reply(CasinoView.getErrorMessage(error.message));
        }
    }

    /**
     * Обрабатывает команду вывода средств из баланса казино.
     * Пример команды: "вывести 500"
     * @param {object} context - Контекст пользователя.
     */
    static async handleWithdrawCommand(context) {
        await UserService.addUserIfNotExists(context);
        const input = context.text.trim().toLowerCase();
        const args = input.split(/\s+/);
        const amountStr = args[2];
        const userId = context.from.id;
        const casinoData = await CasinoService.findCasinoByUserID(userId);
        const user = await UserService.findUserById(context.from.id);
        const position = user.user_position;
        if (!casinoData || !casinoData.casino_bookmaker) {
            return await context.send(CasinoView.getErrorNoCasinoMessage(position, user), { parse_mode: "HTML" });
        }
        if (!amountStr) {
            return await context.reply(CasinoView.getWithdrawHelpMessage());
        }

        try {
            const amount = Casino.parseBetAmount(amountStr);
            if (isNaN(amount) || amount <= 0) {
                throw new Error("Указана некорректная сумма для вывода.");
            }

            const userId = context.from.id;
            const withdrawResult = await CasinoService.withdrawFromCasino(userId, amount);
            const user = await UserService.findUserById(userId);

            await context.reply(
                CasinoView.getWithdrawSuccessMessage(
                    user.user_name,
                    formatCurrency(amount),
                    formatCurrency(withdrawResult.newCasinoBalance),
                    formatCurrency(withdrawResult.newBankAmount)
                ),
                { parse_mode: "HTML" }
            );
        } catch (error) {
            await context.reply(CasinoView.getErrorMessage(error.message));
        }
    }

    /**
     * Обрабатывает команду игры в казино.
     * Пример команды: "казино красный 500"
     * @param {object} context - Контекст пользователя.
     */
    static async handleCasinoCommand(context) {
        await UserService.addUserIfNotExists(context);
        const input = context.text
            .replace(/казино/i, "")
            .trim()
            .toLowerCase();
        const args = input.split(/\s+/);
        const [betTypeInput, ...amountParts] = args;
        const amountStr = amountParts.join(" ");
        const betType = Constants.BET_TYPE_MAP[betTypeInput] || betTypeInput;
        const userId = context.from.id;
        const casinoData = await CasinoService.findCasinoByUserID(userId);
        const user = await UserService.findUserById(context.from.id);
        const position = user.user_position;
        if (!casinoData || !casinoData.casino_bookmaker) {
            return await context.send(CasinoView.getErrorNoCasinoMessage(position, user), { parse_mode: "HTML" });
        }
        if (!betTypeInput || !amountStr) {
            return await context.reply(CasinoView.getHelpMessage(), {parse_mode: "HTML"});
        }

        if (!Constants.VALID_BET_TYPES.has(betType)) {
            return await context.reply(CasinoView.getInvalidBetTypeMessage(), {parse_mode: "HTML"});
        }

        try {
            const response = await Casino.processBet(context, betType, amountStr);
            const user = await UserService.findUserById(context.from.id);

            if (response.win) {
                await context.reply(
                    CasinoView.getWinMessage(
                        user.user_name,
                        response.payout,
                        response.result,
                        response.newBalance,
                        response.casino_commission,
                        response.casino_bookmaker,
                        user.user_position
                    ),
                    { parse_mode: "HTML" }
                );
            } else {
                await context.reply(
                    CasinoView.getLoseMessage(
                        user.user_name,
                        response.betAmount,
                        response.result,
                        response.newBalance,
                        response.casino_bookmaker,
                        user.user_position
                    ),
                    { parse_mode: "HTML" }
                );
            }
        } catch (error) {
            await context.reply(CasinoView.getErrorMessage(error.message));
        }
    }
}

export default Casino;
