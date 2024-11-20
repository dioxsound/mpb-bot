import UserService from "../database_services/user_service.js";
import CasinoService from "../database_services/casino_service.js";
import CasinoWheelView from "./casino_wheel_view.js";
import parseAmount from "../services/parse_amount.js";
import Constants from "./constants.js";

class CasinoWheelModel {
    static spinWheel() {
        const sectors = Constants.SECTORS;
        if (!sectors.length) {
            throw new Error("Секторы рулетки не определены");
        }
        const randomIndex = Math.floor(Math.random() * sectors.length);
        return sectors[randomIndex];
    }

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

    static async processBet(context, betType, betAmount) {
        const userId = context.from.id;
        const { user, casinoData } = await CasinoWheelModel.getUserAndCasino(userId);

        let casinoBalance = parseFloat(casinoData.casino_balance);

        if (typeof betAmount === "string") {
            betAmount = CasinoWheelModel.parseBetAmountString(betAmount, casinoBalance);
        }

        if (betAmount == 0) {
            throw new Error("Нельзя поставить нулевую сумму ставки");
        }

        if (casinoBalance < betAmount) {
            throw new Error("Ставка превышает баланс казино");
        }

        const { casino_bookmaker, casino_coefficient, casino_commission } = casinoData;

        const result = CasinoWheelModel.spinWheel();
        const isWin = CasinoWheelModel.isBetWin(result, betType);

        let payout = 0.0;
        let commissionAmount = 0.0;

        if (isWin) {
            const payoutData = CasinoWheelModel.calculatePayout(
                betType,
                betAmount,
                casino_coefficient,
                casino_commission
            );
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

    static parseBetAmountString(betAmountStr, casinoBalance) {
        const trimmed = betAmountStr.trim().toLowerCase();

        if (trimmed.includes("%")) {
            const percentage = parseFloat(trimmed.replace("%", ""));
            if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
                throw new Error("Некорректный процент ставки");
            }
            if ((casinoBalance * percentage) / 100 === 0) {
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

        return parseAmount(trimmed);
    }

    static async handleCasinoCommand(context) {
        await UserService.addUserIfNotExists(context);
        const input = context.text
            .replace(/^казино\s+/i, "")
            .trim()
            .toLowerCase();
        const args = input.split(/\s+/);
        const [betTypeInput, ...amountParts] = args;
        const amountStr = amountParts.join(" ");
        const betType = Constants.BET_TYPE_MAP[betTypeInput] || betTypeInput;
        const userId = context.from.id;

        try {
            const { user, casinoData } = await CasinoWheelModel.getUserAndCasino(userId);

            if (!betTypeInput || !amountStr) {
                return await context.reply(CasinoWheelView.getHelpMessage(), { parse_mode: "HTML" });
            }

            if (!Constants.VALID_BET_TYPES.has(betType)) {
                return await context.reply(CasinoWheelView.getInvalidBetTypeMessage(), { parse_mode: "HTML" });
            }

            const response = await CasinoWheelModel.processBet(context, betType, amountStr);
            const updatedUser = await UserService.findUserById(userId);

            if (response.win) {
                await context.reply(
                    CasinoWheelView.getWinMessage(
                        updatedUser.user_name,
                        response.payout,
                        response.result,
                        response.newBalance,
                        response.casino_commission,
                        casinoData.casino_bookmaker,
                        updatedUser.user_position
                    ),
                    { parse_mode: "HTML" }
                );
            } else {
                await context.reply(
                    CasinoWheelView.getLoseMessage(
                        updatedUser.user_name,
                        response.betAmount,
                        response.result,
                        response.newBalance,
                        casinoData.casino_bookmaker,
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
                    errorMessage = CasinoWheelView.getIncorrectBetAmountMessage("0");
                    break;
                case "Ставка превышает баланс казино":
                    errorMessage = CasinoWheelView.getIncorrectBetAmountMessage("betMoreThanCasino");
                    break;
                case "Нет данных казино для пользователя":
                    errorMessage = CasinoWheelView.getErrorNoCasinoMessage(position, user);
                    break;
                case "Некорректный процент ставки":
                    errorMessage = CasinoWheelView.getIncorrectBetAmountMessage("%");
                    break;
                case "Некорректная сумма ставки":
                    errorMessage = CasinoWheelView.getIncorrectBetAmountMessage("incorrect");
                    break;
                default:
                    errorMessage = CasinoWheelView.getErrorMessage(error.message);
            }

            await context.reply(errorMessage, { parse_mode: "HTML" });
        }
    }
}

export default CasinoWheelModel;
