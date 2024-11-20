// File: ./casino_transaction_service.js
import CasinoService from "../database_services/casino_service.js";
import CasinoWheelView from "./casino_wheel_view.js";
import UserService from "../database_services/user_service.js";
import parseAmount from "../services/parse_amount.js";

class WheelTransactionModel {
    static async handleTransaction(context, amount, type, bankAcc) {
        const userId = context.from.id;
        try {
            const [casinoData, user] = await Promise.all([
                CasinoService.findCasinoByUserID(userId),
                UserService.findUserById(userId),
            ]);

            if (!casinoData || !casinoData.casino_bookmaker) {
                return await context.reply(CasinoWheelView.getErrorNoCasinoMessage(user.user_position, user), {
                    parse_mode: "HTML",
                });
            }

            if (type === "deposit") {
                const depositResult = await CasinoService.depositToCasino(userId, bankAcc, amount);
                await context.reply(
                    CasinoWheelView.getDepositSuccessMessage(
                        amount,
                        depositResult.newCasinoBalance,
                        depositResult.newBankAmount,
                        bankAcc
                    ),
                    { parse_mode: "HTML" }
                );
            } else if (type === "withdraw") {
                const withdrawResult = await CasinoService.withdrawFromCasino(userId, bankAcc, amount);
                await context.reply(
                    CasinoWheelView.getWithdrawSuccessMessage(
                        user.user_name,
                        amount,
                        withdrawResult.newCasinoBalance,
                        withdrawResult.newBankAmount,
                        bankAcc
                    ),
                    { parse_mode: "HTML" }
                );
            }
        } catch (error) {
            await context.reply(CasinoWheelView.getErrorMessage(error.message), { parse_mode: "HTML" });
        }
    }

    static async handleDepositCommand(context) {
        await UserService.addUserIfNotExists(context);
        const input = context.text.trim().toLowerCase();
        const args = input.split(/\s+/);

        if (args.length < 4) {
            return await context.reply(CasinoWheelView.getDepositHelpMessage(), { parse_mode: "HTML" });
        }

        const bankAccStr = args[2];
        const amountStr = args.slice(3).join(" ");
        const userId = context.from.id;

        const bankAcc = parseInt(bankAccStr, 10);
        if (![1, 2].includes(bankAcc)) {
            return await context.reply(CasinoWheelView.getInvalidBankAccMessage(), { parse_mode: "HTML" });
        }

        try {
            const amount = parseAmount(amountStr);
            if (isNaN(amount) || amount <= 0) {
                throw new Error("Указана некорректная сумма для пополнения.");
            }

            await WheelTransactionModel.handleTransaction(context, amount, "deposit", bankAcc);
        } catch (error) {
            let errorMessage = "";
            if (error.message === "Нет данных казино для пользователя") {
                const user = await UserService.findUserById(userId);
                errorMessage = CasinoWheelView.getErrorNoCasinoMessage(user.user_position, user);
            } else {
                errorMessage = CasinoWheelView.getErrorMessage(error.message);
            }
            await context.reply(errorMessage, { parse_mode: "HTML" });
        }
    }

    static async handleWithdrawCommand(context) {
        await UserService.addUserIfNotExists(context);
        const input = context.text.trim().toLowerCase();
        const args = input.split(/\s+/);

        if (args.length < 4) {
            return await context.reply(CasinoWheelView.getWithdrawHelpMessage(), { parse_mode: "HTML" });
        }

        const bankAccStr = args[2];
        const amountStr = args.slice(3).join(" ");
        const userId = context.from.id;

        const bankAcc = parseInt(bankAccStr, 10);
        if (![1, 2].includes(bankAcc)) {
            return await context.reply(CasinoWheelView.getInvalidBankAccMessage(), { parse_mode: "HTML" });
        }

        try {
            const amount = parseAmount(amountStr);
            if (isNaN(amount) || amount <= 0) {
                throw new Error("Указана некорректная сумма для вывода.");
            }

            await WheelTransactionModel.handleTransaction(context, amount, "withdraw", bankAcc);
        } catch (error) {
            let errorMessage = "";
            if (error.message === "Нет данных казино для пользователя") {
                const user = await UserService.findUserById(userId);
                errorMessage = CasinoWheelView.getErrorNoCasinoMessage(user.user_position, user);
            } else {
                errorMessage = CasinoWheelView.getErrorMessage(error.message);
            }
            await context.reply(errorMessage, { parse_mode: "HTML" });
        }
    }
}

export default WheelTransactionModel;
