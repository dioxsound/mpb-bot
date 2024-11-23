// username_sale_model.js

import pool from "../../database_services/config_model.js";
import UserService from "../../database_services/user_service.js";
import UsernameService from "../../database_services/username_service.js";
import BankService from "../../database_services/bank_service.js";
import UsernameSaleView from "./username_sale_view.js";
import parseAmount from "../../services/parse_amount.js";
import formatCurrency from "../../services/format_currency.js";

export default class UsernameSaleModel {
    static async getUser(context) {
        await UserService.addUserIfNotExists(context);
        const userId = context.from.id;
        return await UserService.findUserById(userId);
    }

    static parseCommand(text, expectedKeyword) {
        const parts = text.trim().split(" ");
        if (parts.length !== 3 || parts[1].toLowerCase() !== expectedKeyword.toLowerCase()) {
            return null;
        }
        return parts;
    }

    static async handleTransaction(callback) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            await callback(client);
            await client.query("COMMIT");
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    static async sendError(context, errorType) {
        const errorReplies = {
            selling: UsernameSaleView.errorSellingUsername(),
            buying: UsernameSaleView.errorBuyingUsername(),
            cancelling: UsernameSaleView.errorCancellingSale(),
            invalidSell: UsernameSaleView.invalidSellCommand(),
            invalidBuy: UsernameSaleView.invalidBuyCommand(),
        };

        await context.reply(errorReplies[errorType] || UsernameSaleView.genericError(), { parse_mode: "HTML" });
    }

    static async sellUsername(context) {
        try {
            const user = await UsernameSaleModel.getUser(context);
            const userId = context.from.id;

            const isSelling = await UsernameService.isUserSelling(userId);
            if (isSelling) {
                return await context.reply(UsernameSaleView.alreadySelling(), { parse_mode: "HTML" });
            }

            const parts = UsernameSaleModel.parseCommand(context.text, "никнейм");
            if (!parts) {
                return await context.reply(UsernameSaleView.invalidSellCommand(), { parse_mode: "HTML" });
            }

            const [command, keyword, amountStr] = parts;
            // Отключаем проверку баланса при продаже
            const salePrice = parseAmount(amountStr, 0, { checkBalance: false });

            if (user.user_name.toLowerCase() === "игрок") {
                return await context.reply(UsernameSaleView.cannotSellDefaultUsername(), { parse_mode: "HTML" });
            }

            await UsernameSaleModel.handleTransaction(async (client) => {
                await UsernameService.createSale(userId, user.user_name.toLowerCase(), salePrice, client);
            });

            await context.reply(UsernameSaleView.usernameListedForSale(user.user_name, salePrice), {
                parse_mode: "HTML",
            });
        } catch (error) {
            console.error("Ошибка при продаже никнейма:", error);
            await UsernameSaleModel.sendError(context, "selling");
        }
    }

    static async buyUsername(context) {
        try {
            const buyer = await UsernameSaleModel.getUser(context);
            const buyerId = context.from.id;

            const parts = UsernameSaleModel.parseCommand(context.text, "никнейм");
            if (!parts) {
                return await context.reply(UsernameSaleView.invalidBuyCommand(), { parse_mode: "HTML" });
            }

            const [command, keyword, desiredUsernameInput] = parts;
            const desiredUsername = desiredUsernameInput.toLowerCase();

            const sale = await UsernameService.findSaleByUsername(desiredUsername);
            if (!sale) {
                return await context.reply(UsernameSaleView.usernameNotForSale(), { parse_mode: "HTML" });
            }

            const isSelling = await UsernameService.isUserSelling(buyerId);
            if (isSelling) {
                return await context.reply(UsernameSaleView.cannotBuyUsernameWhenSelling(), { parse_mode: "HTML" });
            }

            const sellerId = sale.user_id;
            const salePrice = parseFloat(sale.sale_price);

            if (buyerId === sellerId) {
                return await context.reply(UsernameSaleView.cannotBuyOwnUsername(), { parse_mode: "HTML" });
            }

            const buyerBank = await BankService.findBanksByUserId(buyerId);
            const funds = UsernameSaleModel.hasSufficientFunds(buyerBank, salePrice);
            if (!funds.hasFunds) {
                const deficiency = formatCurrency(
                    salePrice - (funds.account === "bank_acc_one" ? buyerBank.bank_acc_one : buyerBank.bank_acc_two)
                );
                return await context.reply(UsernameSaleView.insufficientFunds(deficiency), { parse_mode: "HTML" });
            }

            await UsernameSaleModel.handleTransaction(async (client) => {
                if (funds.account === "bank_acc_one") {
                    await BankService.updateBankAccount(buyerId, 1, buyerBank.bank_acc_one - salePrice, client);
                } else if (funds.account === "bank_acc_two") {
                    await BankService.updateBankAccount(buyerId, 2, buyerBank.bank_acc_two - salePrice, client);
                }

                const sellerBank = await BankService.findBanksByUserId(sellerId, client);
                await BankService.updateBankAccount(
                    sellerId,
                    1,
                    parseFloat(sellerBank.bank_acc_one) + salePrice,
                    client
                );

                await UsernameService.updateUsername("Игрок", sellerId, client);
                await UsernameService.updateUsername(desiredUsernameInput, buyerId, client);

                await UsernameService.removeSale(sale.sale_id, client);
            });

            await context.reply(UsernameSaleView.usernamePurchased(desiredUsernameInput, salePrice), {
                parse_mode: "HTML",
            });
        } catch (error) {
            console.error("Ошибка при покупке никнейма:", error);
            await UsernameSaleModel.sendError(context, "buying");
        }
    }

    static async cancelUsernameSale(context) {
        try {
            const userId = context.from.id;
            await UserService.addUserIfNotExists(context);

            const isSelling = await UsernameService.isUserSelling(userId);
            if (!isSelling) {
                return await context.reply(UsernameSaleView.notSellingUsername(), { parse_mode: "HTML" });
            }

            await UsernameSaleModel.handleTransaction(async (client) => {
                await UsernameService.removeSaleByUserId(userId, client);
            });

            await context.reply(UsernameSaleView.usernameSaleCancelled(), { parse_mode: "HTML" });
        } catch (error) {
            console.error("Ошибка при отмене продажи никнейма:", error);
            await UsernameSaleModel.sendError(context, "cancelling");
        }
    }

    static hasSufficientFunds(bank, amount) {
        if (parseFloat(bank.bank_acc_one) >= amount) {
            return { hasFunds: true, account: "bank_acc_one" };
        } else if (parseFloat(bank.bank_acc_two) >= amount) {
            return { hasFunds: true, account: "bank_acc_two" };
        } else {
            return { hasFunds: false, account: null };
        }
    }
}
