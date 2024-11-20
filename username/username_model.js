import pool from "../database_services/config_model.js";
import UserService from "../database_services/user_service.js";
import UsernameView from "./username_view.js";
import BankService from "../database_services/bank_service.js";
import formatCurrency from "../services/format_currency.js";
import { FORBIDDEN_USERNAMES, MIN_BANK_BALANCE, USERNAME_LENGTH, CURRENCY_UPDATE_AMOUNT } from "./constants.js";

export default class UsernameModel {
    static forbiddenRegex = new RegExp(`(${FORBIDDEN_USERNAMES.join("|")})`, "i");

    static async changeUsername(context) {
        try {
            await UserService.addUserIfNotExists(context);
            const userId = context.from.id;
            const bank = await BankService.findBanksByUserId(userId);
            const user = await UserService.findUserById(userId);

            let newUserName = UsernameModel.extractUsername(context.text);
            if (!newUserName) {
                return await context.reply(UsernameView.noUsernameProvided(user.user_name, CURRENCY_UPDATE_AMOUNT), {
                    parse_mode: "HTML",
                });
            }

            const funds = UsernameModel.hasSufficientFunds(bank);
            if (!funds.hasFunds) {
                const deficiency = formatCurrency(
                    MIN_BANK_BALANCE - (funds.account === "bank_acc_one" ? bank.bank_acc_one : bank.bank_acc_two)
                );
                return await context.reply(UsernameView.insufficientFunds(deficiency), { parse_mode: "HTML" });
            }

            const validationError = await UsernameModel.validateUsername(newUserName, user.user_name, userId);
            if (validationError) {
                return await context.reply(validationError, { parse_mode: "HTML" });
            }

            const changeUsernameResult = await UsernameModel.updateUsernameInDB(newUserName, userId);

            if (funds.account === "bank_acc_one") {
                await BankService.updateBankAccount(userId, 1, bank.bank_acc_one - CURRENCY_UPDATE_AMOUNT);
            } else if (funds.account === "bank_acc_two") {
                await BankService.updateBankAccount(userId, 2, bank.bank_acc_two - CURRENCY_UPDATE_AMOUNT);
            }

            await context.reply(UsernameView.usernameResponse(true, changeUsernameResult, CURRENCY_UPDATE_AMOUNT), {
                parse_mode: "HTML",
            });
        } catch (error) {
            console.error("Error changing player's username:", error);
            await context.reply(UsernameView.errorChangingUsername(), { parse_mode: "HTML" });
        }
    }

    static hasSufficientFunds(bank) {
        if (bank.bank_acc_one >= MIN_BANK_BALANCE) {
            return { hasFunds: true, account: "bank_acc_one" };
        } else if (bank.bank_acc_two >= MIN_BANK_BALANCE) {
            return { hasFunds: true, account: "bank_acc_two" };
        } else {
            return { hasFunds: false };
        }
    }

    static extractUsername(text) {
        const parts = text.trim().split(" ");
        if (parts.length < 2) return null;

        let username = parts[1];
        if (username.startsWith("@")) {
            username = username.substring(1);
        }
        return username;
    }

   
    static async validateUsername(newUserName, currentUserName, userId) {
        if (newUserName === currentUserName) {
            return UsernameView.sameUsername();
        }

        const isCaseOnlyChange = newUserName.toLowerCase() === currentUserName.toLowerCase();
        if (isCaseOnlyChange) {
        }

        if (!UsernameModel.isValidLength(newUserName)) {
            return UsernameView.usernameResponse(
                false,
                `Никнейм должен быть от ${USERNAME_LENGTH.MIN} до ${USERNAME_LENGTH.MAX} символов.`
            );
        }

        if (UsernameModel.isForbiddenUsername(newUserName)) {
            return UsernameView.forbiddenUsername();
        }

        if (!UsernameModel.hasValidCharacters(newUserName)) {
            return UsernameView.invalidCharacters();
        }

        const isUnique = await UsernameModel.isUsernameUnique(newUserName, userId);
        if (!isUnique) {
            return UsernameView.usernameNotUnique();
        }

        return null;
    }

    static isValidLength(username) {
        return username.length >= USERNAME_LENGTH.MIN && username.length <= USERNAME_LENGTH.MAX;
    }

    static isForbiddenUsername(username) {
        return UsernameModel.forbiddenRegex.test(username);
    }

    static hasValidCharacters(username) {
        const usernameRegex = /^[a-zA-Zа-яА-Я0-9_]+$/;
        return usernameRegex.test(username);
    }

    static async isUsernameUnique(username, userId) {
        const query = `
            SELECT COUNT(*) 
            FROM people 
            WHERE LOWER("user_name") = LOWER($1) 
              AND "user_id" <> $2
        `;
        const result = await pool.query(query, [username, userId]);
        return parseInt(result.rows[0].count, 10) === 0;
    }

    static async updateUsernameInDB(newUserName, userId) {
        const changeUsernameQuery = `
            UPDATE people 
            SET "user_name" = $1 
            WHERE "user_id" = $2 
            RETURNING *
        `;
        const changeUsernameResult = await pool.query(changeUsernameQuery, [newUserName, userId]);
        return changeUsernameResult.rows[0];
    }
}
