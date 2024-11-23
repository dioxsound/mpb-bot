import CasinoService from "../database_services/casino_service.js";
import CasinoWheelView from "./casino_wheel_view.js";
import UserService from "../database_services/user_service.js";
import BankService from "../database_services/bank_service.js";
import parseAmount from "../services/parse_amount.js";
import pool from "../database_services/config_model.js";

class WheelTransactionModel {
    static async handleTransaction(context, amount, type, bankAcc) {
        const userId = context.from.id;
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            const [casinoData, user] = await Promise.all([
                CasinoService.findCasinoByUserID(userId, client),
                UserService.findUserById(userId, client),
            ]);

            if (!casinoData || !casinoData.casino_bookmaker) {
                throw new Error("Нет данных казино для пользователя");
            }

            if (type === "deposit") {
                const depositResult = await CasinoService.depositToCasino(userId, bankAcc, amount, client);

                await client.query("COMMIT");

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
                const withdrawResult = await CasinoService.withdrawFromCasino(userId, bankAcc, amount, client);

                await client.query("COMMIT");

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
            } else {
                throw new Error("Неизвестный тип транзакции.");
            }
        } catch (error) {
            await client.query("ROLLBACK");

            let errorMessage = "";
            let user = null;

            try {
                user = await UserService.findUserById(userId, client);
            } catch (err) {
                console.error("Ошибка при получении данных пользователя:", err);
            }

            const position = user ? user.user_position : null;

            switch (error.message) {
                case "Нет данных казино для пользователя":
                    errorMessage = CasinoWheelView.getErrorNoCasinoMessage(position, user);
                    break;
                case "Сумма депозита превышает баланс банковского счёта.":
                case "Сумма вывода превышает баланс казино.":
                    errorMessage = CasinoWheelView.getIncorrectBetAmountMessage("betMoreThanCasino");
                    break;
                case "Не удалось получить баланс банковского счёта.":
                    errorMessage = CasinoWheelView.getErrorMessage("Ошибка при получении баланса банковского счёта.");
                    break;
                case "Неизвестный тип транзакции.":
                    errorMessage = CasinoWheelView.getErrorMessage("Неизвестный тип транзакции.");
                    break;
                default:
                    errorMessage = CasinoWheelView.getErrorMessage(error.message);
            }

            await context.reply(errorMessage, { parse_mode: "HTML" });
        } finally {
            client.release();
        }
    }

    static async handleDepositCommand(context) {
        try {
            await UserService.addUserIfNotExists(context);
            const userId = context.from.id;
            const input = context.text.trim();
            const args = input.split(/\s+/);

            if (args.length < 4) {
                return await context.reply(CasinoWheelView.getDepositHelpMessage(), { parse_mode: "HTML" });
            }

            const bankAccStr = args[2];
            const amountStr = args.slice(3).join(" ");

            const bankAcc = parseInt(bankAccStr, 10);
            if (![1, 2].includes(bankAcc)) {
                const error = new Error("Некорректный номер банковского счёта, используйте 1 или 2!");
                error.code = "bank_parse";
                throw error;
            }

            const bankBalance = await BankService.findBankByUserIdAndAccount(userId, bankAcc);
            if (bankBalance === null || bankBalance === undefined) {
                throw new Error("Не удалось получить баланс банковского счёта.");
            }

            const amount = parseAmount(amountStr, bankBalance, { allowAll: true });

            if (isNaN(amount) || amount <= 0) {
                throw new Error("Указана некорректная сумма для пополнения.");
            }

            await WheelTransactionModel.handleTransaction(context, amount, "deposit", bankAcc);
        } catch (error) {
            error.code = error.code || "GENERAL_ERROR";
            switch (error.code) {
                case "balance_parse":
                    await context.reply(CasinoWheelView.getAmountError(error.message), { parse_mode: "HTML" });
                    break;
                case "bank_parse":
                    await context.reply(CasinoWheelView.getBankAccError(error.message), { parse_mode: "HTML" });
                    break;
                default:
                    await context.reply(CasinoWheelView.getAmountError(error.message), { parse_mode: "HTML" });
                    break;
            }
        }
    }

    static async handleWithdrawCommand(context) {
        try {
            await UserService.addUserIfNotExists(context);
            const userId = context.from.id;
            const input = context.text.trim();
            const args = input.split(/\s+/);

            if (args.length < 4) {
                return await context.reply(CasinoWheelView.getWithdrawHelpMessage(), { parse_mode: "HTML" });
            }

            const bankAccStr = args[2];
            const amountStr = args.slice(3).join(" ");

            const bankAcc = parseInt(bankAccStr, 10);
            if (![1, 2].includes(bankAcc)) {
                const error = new Error("Некорректный номер банковского счёта, используйте 1 или 2!");
                error.code = "bank_parse";
                throw error;
            }

            const casinoData = await CasinoService.findCasinoByUserID(userId);
            if (!casinoData || !casinoData.casino_bookmaker) {
                throw new Error("Нет данных казино для пользователя");
            }

            const casinoBalance = parseFloat(casinoData.casino_balance);

            const amount = parseAmount(amountStr, casinoBalance, { allowAll: true });

            if (isNaN(amount) || amount <= 0) {
                throw new Error("Указана некорректная сумма для вывода.");
            }

            await WheelTransactionModel.handleTransaction(context, amount, "withdraw", bankAcc);
        } catch (error) {
            error.code = error.code || "GENERAL_ERROR";
            switch (error.code) {
                case "balance_parse":
                    await context.reply(CasinoWheelView.getAmountError(error.message), { parse_mode: "HTML" });
                    break;
                case "bank_parse":
                    await context.reply(CasinoWheelView.getBankAccError(error.message), { parse_mode: "HTML" });
                    break;
                default:
                    await context.reply(CasinoWheelView.getAmountError(error.message), { parse_mode: "HTML" });
                    break;
            }
        }
    }
}

export default WheelTransactionModel;
