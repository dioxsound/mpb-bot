import UserService from "../../database_services/user_service.js";
import BankService from "../../database_services/bank_service.js";
import BankTransferView from "./bank_transfer_view.js";
import parseAmount from "../../services/parse_amount.js";
import pool from "../../database_services/config_model.js";

export default class BankTransferModel {
    static async transferMoney(context) {
        await UserService.addUserIfNotExists(context);

        const args = context.text.trim().split(/\s+/);
        const replyToMessage = context.replyToMessage;

        const parseArgsResult = await BankTransferModel.parseArguments(args, replyToMessage, context);
        if (!parseArgsResult.success) {
            return await context.reply(parseArgsResult.message, { parse_mode: "HTML" });
        }

        const { recipientBankId, senderAccountNumber, amount, senderUserId, recipientUserId } = parseArgsResult.data;

        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            const senderUser = await BankTransferModel.getUser(senderUserId, client);
            const senderBank = await BankTransferModel.getBank(senderUser.user_id, client);
            const senderBalance = BankTransferModel.getAccountBalance(senderBank, senderAccountNumber);

            if (senderBalance < amount) {
                return await context.reply(BankTransferView.lessAmount(), {parse_mode: "HTML"})
            }

            const recipientUser = await BankTransferModel.getUser(recipientUserId, client);
            const recipientBank = await BankTransferModel.getBank(recipientUser.user_id, client);
            const recipientAccountNumber = 1;
            const recipientBalance = BankTransferModel.getAccountBalance(recipientBank, recipientAccountNumber);

            await BankService.updateBankAccount(
                senderUser.user_id,
                senderAccountNumber,
                senderBalance - amount,
                client
            );
            await BankService.updateBankAccount(
                recipientUser.user_id,
                recipientAccountNumber,
                recipientBalance + amount,
                client
            );

            await client.query("COMMIT");

            return await context.reply(
                BankTransferView.transferSuccess({
                    recipient: recipientUser,
                    amount,
                }),
                { parse_mode: "HTML" }
            );
        } catch (error) {
            return await BankTransferModel.handleError(context, client, error.message);
        } finally {
            client.release();
        }
    }

    static async parseArguments(args, replyToMessage, context) {
        let recipientBankId, senderAccountStr, amountStr, recipientUserId;
    
        if (args.length === 3) {
            if (!replyToMessage) {
                return { success: false, message: BankTransferView.transferHelp(context) };
            }
    
            [, senderAccountStr, amountStr] = args;
            const recipientUser = await BankTransferModel.getRecipientUser(context, context.replyToMessage.from.id);
    
            if (!recipientUser) {
                return { success: false, message: BankTransferView.recipientNotFound(false) };
            }
    
            const recipientBank = await BankService.findBanksByUserId(recipientUser.user_id);
    
            recipientBankId = recipientBank.bank_id;
            recipientUserId = recipientUser.user_id;
            
            if (context.from.id == recipientUserId) {
                return { success: false, message: BankTransferView.recipientNotFound(true)};
            }
        } else if (args.length === 4) {
            [, recipientBankId, senderAccountStr, amountStr] = args;
    
            if (!/^\d{1,16}$/.test(recipientBankId)) {
                return { success: false, message: BankTransferView.invalidBankId() };
            }
    
            const recipientUser = await UserService.findUserByBankId(recipientBankId);
            if (!recipientUser) {
                return { success: false, message: BankTransferView.recipientNotFound(false) };
            }
    
            recipientUserId = recipientUser.user_id;

            if (context.from.id == recipientUserId) {
                return { success: false, message: BankTransferView.recipientNotFound(true)};
            }
        } else {
            return { success: false, message: BankTransferView.transferHelp(context) };
        }
    
        const senderAccountNumber = parseInt(senderAccountStr, 10);
        if (![1, 2].includes(senderAccountNumber)) {
            return { success: false, message: BankTransferView.invalidAccountNumber() };
        }
    
        let amount;
        try {
            amount = parseAmount(amountStr);
            if (amount <= 0) {
                throw new Error("Amount must be greater than zero.");
            }
        } catch (error) {
            return { success: false, message: BankTransferView.invalidAmount() };
        }
    
        return {
            success: true,
            data: {
                recipientBankId,
                senderAccountNumber,
                amount,
                senderUserId: context.from.id,
                recipientUserId,
            },
        };
    }    

    static async getRecipientUser(context, repliedUserId) {
        if (repliedUserId === context.from.id) {
            return null;
        }
        return await UserService.findUserById(repliedUserId);
    }

    static async getUser(userId, client) {
        const user = await UserService.findUserById(userId, client);
        if (!user) {
            throw new Error("User not found.");
        }
        return user;
    }

    static async getBank(userId, client) {
        const bank = await BankService.findBanksByUserId(userId, client);
        if (!bank) {
            throw new Error("Bank account not found.");
        }
        return bank;
    }

    static getAccountBalance(bank, accountNumber) {
        return accountNumber === 1 ? parseFloat(bank.bank_acc_one) : parseFloat(bank.bank_acc_two);
    }

    static async handleError(context, client, errorMessage) {
        await client.query("ROLLBACK");
        console.error("Ошибка перевода:", errorMessage);
        return await context.reply(BankTransferView.transferError(errorMessage), { parse_mode: "HTML" });
    }
}
