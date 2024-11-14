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
        const match = amountStr.trim().match(regex);

        if (!match) {
            throw new Error("Некорректная сумма ставки");
        }

        const amount = parseFloat(match[1]);
        const suffix = match[2] ? match[2].toLowerCase() : "";
        const multiplier = Constants.AMOUNT_SUFFIXES[suffix] || 1;
        return amount * multiplier;
    }

    /**
     * Генерирует случайный сектор рулетки.
     * @returns {object} - Объект с номером и цветом сектора.
     */
    static spinWheel() {
        const sectors = Constants.SECTORS;
        if (!sectors.length) {
            throw new Error("Секторы рулетки не определены");
        }
        const randomIndex = Math.floor(Math.random() * sectors.length);
        return sectors[randomIndex];
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
        const payout = betAmount * multiplier * coefficient;
        const commissionAmount = (payout * casino_commission) / 100;

        return { payout: payout - commissionAmount, casino_commission: commissionAmount };
    }

    /**
     * Проверяет, выиграла ли ставка по результату рулетки.
     * @param {object} result - Результат рулетки.
     * @param {string} betType - Тип ставки.
     * @returns {boolean} - Выиграл ли пользователь.
     */
    static isBetWin(result, betType) {
        const number = result.number;
        const color = result.color;

        const winConditions = {
            красный: () => color === "red",
            черный: () => color === "black",
            четное: () => number !== 0 && number % 2 === 0,
            нечетное: () => number !== 0 && number % 2 !== 0,
            дюжина1: () => number >= 1 && number <= 12,
            дюжина2: () => number >= 13 && number <= 24,
            дюжина3: () => number >= 25 && number <= 36,
            зеленый: () => color === "green",
        };

        const condition = winConditions[betType];
        return condition ? condition() : false;
    }

    /**
     * Получает пользователя и данные казино.
     * @param {number} userId - ID пользователя.
     * @returns {object} - Объект с пользователем и данными казино.
     * @throws {Error} - Если пользователь или данные казино не найдены.
     */
    static async getUserAndCasino(userId) {
        const [user, casinoData] = await Promise.all([
            UserService.findUserById(userId),
            CasinoService.findCasinoByUserID(userId),
        ]);

        if (!user) {
            throw new Error("Пользователь не найден");
        }

        if (!casinoData || !casinoData.casino_bookmaker) {
            throw new Error("Нет данных казино для пользователя");
        }

        return { user, casinoData };
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
        const { user, casinoData } = await Casino.getUserAndCasino(userId);

        let casinoBalance = parseFloat(casinoData.casino_balance);

        if (typeof betAmount === "string") {
            betAmount = Casino.parseBetAmountString(betAmount, casinoBalance);
        }

        if (casinoBalance < betAmount) {
            throw new Error("Ставка превышает баланс казино");
        }

        const { casino_bookmaker, casino_coefficient, casino_commission } = casinoData;

        const result = Casino.spinWheel();
        const isWin = Casino.isBetWin(result, betType);

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
     * Парсит строку суммы ставки, включая процентные и все ставки.
     * @param {string} betAmountStr - Строка суммы ставки.
     * @param {number} casinoBalance - Баланс казино.
     * @returns {number} - Числовое значение суммы ставки.
     * @throws {Error} - Если сумма некорректна.
     */
    static parseBetAmountString(betAmountStr, casinoBalance) {
        const trimmed = betAmountStr.trim().toLowerCase();

        if (trimmed.includes("%")) {
            const percentage = parseFloat(trimmed.replace("%", ""));
            if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
                throw new Error("Некорректный процент ставки");
            }
            if (((casinoBalance * percentage) / 100) == 0) {
                if (casinoBalance === 0) {
                    throw new Error("Нельзя поставить нулевую сумму ставки");
                }
            }
            return (casinoBalance * percentage) / 100;
        }

        if (trimmed === "все" || trimmed === "всё") {
            if (casinoBalance === 0) {
                throw new Error("Нельзя поставить нулевую сумму ставки");
            }
            return casinoBalance;
        }

        return Casino.parseBetAmount(trimmed);
    }

    /**
     * Универсальный метод для обработки транзакций (депозит и вывод).
     * @param {object} context - Контекст пользователя.
     * @param {number} amount - Сумма транзакции.
     * @param {string} type - Тип транзакции ('deposit' или 'withdraw').
     */
    static async handleTransaction(context, amount, type) {
        const userId = context.from.id;
        try {
            const [casinoData, user] = await Promise.all([
                CasinoService.findCasinoByUserID(userId),
                UserService.findUserById(userId)
            ]);

            if (!casinoData || !casinoData.casino_bookmaker) {
                return await context.send(CasinoView.getErrorNoCasinoMessage(user.user_position, user), { parse_mode: "HTML" });
            }

            if (type === 'deposit') {
                const depositResult = await CasinoService.depositToCasino(userId, amount);
                await context.reply(
                    CasinoView.getDepositSuccessMessage(
                        user.user_name,
                        formatCurrency(amount),
                        formatCurrency(depositResult.newCasinoBalance),
                        formatCurrency(depositResult.newBankAmount)
                    ),
                    { parse_mode: "HTML" }
                );
            } else if (type === 'withdraw') {
                const withdrawResult = await CasinoService.withdrawFromCasino(userId, amount);
                await context.reply(
                    CasinoView.getWithdrawSuccessMessage(
                        user.user_name,
                        formatCurrency(amount),
                        formatCurrency(withdrawResult.newCasinoBalance),
                        formatCurrency(withdrawResult.newBankAmount)
                    ),
                    { parse_mode: "HTML" }
                );
            }
        } catch (error) {
            await context.reply(CasinoView.getErrorMessage(error.message));
        }
    }

    /**
     * Обрабатывает команду пополнения баланса казино.
     * Пример команды: "пополнить казино 500"
     * @param {object} context - Контекст пользователя.
     */
    static async handleDepositCommand(context) {
        await UserService.addUserIfNotExists(context);
        const input = context.text.trim().toLowerCase();
        const args = input.split(/\s+/);
        const amountStr = args[2];
        const userId = context.from.id;

        try {
            const { user, casinoData } = await Casino.getUserAndCasino(userId);
            const position = user.user_position;

            if (!amountStr) {
                return await context.reply(CasinoView.getDepositHelpMessage(), { parse_mode: "HTML" });
            }

            const amount = Casino.parseBetAmount(amountStr);
            if (isNaN(amount) || amount <= 0) {
                throw new Error("Указана некорректная сумма для пополнения.");
            }

            await Casino.handleTransaction(context, amount, 'deposit');
        } catch (error) {
            let errorMessage = "";
            if (error.message === "Нет данных казино для пользователя") {
                const user = await UserService.findUserById(userId);
                errorMessage = CasinoView.getErrorNoCasinoMessage(user.user_position, user);
            } else {
                errorMessage = CasinoView.getErrorMessage(error.message);
            }
            await context.reply(errorMessage, { parse_mode: "HTML" });
        }
    }

    /**
     * Обрабатывает команду вывода средств из баланса казино.
     * Пример команды: "вывести казино 500"
     * @param {object} context - Контекст пользователя.
     */
    static async handleWithdrawCommand(context) {
        await UserService.addUserIfNotExists(context);
        const input = context.text.trim().toLowerCase();
        const args = input.split(/\s+/);
        const amountStr = args[2];
        const userId = context.from.id;

        try {
            const { user, casinoData } = await Casino.getUserAndCasino(userId);
            const position = user.user_position;

            if (!amountStr) {
                return await context.reply(CasinoView.getWithdrawHelpMessage(), { parse_mode: "HTML" });
            }

            const amount = Casino.parseBetAmount(amountStr);
            if (isNaN(amount) || amount <= 0) {
                throw new Error("Указана некорректная сумма для вывода.");
            }

            await Casino.handleTransaction(context, amount, 'withdraw');
        } catch (error) {
            let errorMessage = "";
            if (error.message === "Нет данных казино для пользователя") {
                const user = await UserService.findUserById(userId);
                errorMessage = CasinoView.getErrorNoCasinoMessage(user.user_position, user);
            } else {
                errorMessage = CasinoView.getErrorMessage(error.message);
            }
            await context.reply(errorMessage, { parse_mode: "HTML" });
        }
    }

    /**
     * Обрабатывает команду игры в казино.
     * Пример команды: "казино красный 500"
     * @param {object} context - Контекст пользователя.
     */
    static async handleCasinoCommand(context) {
        await UserService.addUserIfNotExists(context);
        const input = context.text.replace(/^казино\s+/i, "").trim().toLowerCase();
        const args = input.split(/\s+/);
        const [betTypeInput, ...amountParts] = args;
        const amountStr = amountParts.join(" ");
        const betType = Constants.BET_TYPE_MAP[betTypeInput] || betTypeInput;
        const userId = context.from.id;

        try {
            const { user, casinoData } = await Casino.getUserAndCasino(userId);
            const position = user.user_position;

            if (!betTypeInput || !amountStr) {
                return await context.reply(CasinoView.getHelpMessage(), { parse_mode: "HTML" });
            }

            if (!Constants.VALID_BET_TYPES.has(betType)) {
                return await context.reply(CasinoView.getInvalidBetTypeMessage(), { parse_mode: "HTML" });
            }

            const response = await Casino.processBet(context, betType, amountStr);
            const updatedUser = await UserService.findUserById(userId);

            if (response.win) {
                await context.reply(
                    CasinoView.getWinMessage(
                        updatedUser.user_name,
                        response.payout,
                        response.result,
                        response.newBalance,
                        response.casino_commission,
                        response.casino_bookmaker,
                        updatedUser.user_position
                    ),
                    { parse_mode: "HTML" }
                );
            } else {
                await context.reply(
                    CasinoView.getLoseMessage(
                        updatedUser.user_name,
                        response.betAmount,
                        response.result,
                        response.newBalance,
                        response.casino_bookmaker,
                        updatedUser.user_position
                    ),
                    { parse_mode: "HTML" }
                );
            }
        } catch (error) {
            let errorMessage = "";
            const user = await UserService.findUserById(userId);
            const position = user ? user.user_position : null;

            switch (error.message) {
                case "Нельзя поставить нулевую сумму ставки":
                    errorMessage = CasinoView.getIncorrectBetAmountMessage('0');
                    break;
                case "Ставка превышает баланс казино":
                    errorMessage = CasinoView.getIncorrectBetAmountMessage('betMoreThanCasino');
                    break;
                case "Нет данных казино для пользователя":
                    errorMessage = CasinoView.getErrorNoCasinoMessage(position, user);
                    break;
                case "Некорректный процент ставки":
                    errorMessage = CasinoView.getIncorrectBetAmountMessage('%');
                    break;
                case "Некорректная сумма ставки":
                    errorMessage = CasinoView.getIncorrectBetAmountMessage('incorrect');
                    break;
                case "Пользователь не найден":
                    errorMessage = CasinoView.getErrorMessage(error.message);
                    break;
                default:
                    errorMessage = CasinoView.getErrorMessage("Неизвестная ошибка.");
            }

            await context.reply(errorMessage, { parse_mode: "HTML" });
        }
    }
}

export default Casino;
