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

            if (!UsernameModel.hasSufficientFunds(bank)) {
                const deficiency = formatCurrency(MIN_BANK_BALANCE - bank.bank_acc_one);
                return await context.reply(UsernameView.insufficientFunds(deficiency), { parse_mode: "HTML" });
            }

            let newUserName = UsernameModel.extractUsername(context.text);
            if (!newUserName) {
                return await context.reply(UsernameView.noUsernameProvided(user.user_name, CURRENCY_UPDATE_AMOUNT), { parse_mode: "HTML" });
            }

            const validationError = UsernameModel.validateUsername(newUserName, user.user_name);
            if (validationError) {
                return await context.reply(validationError, { parse_mode: "HTML" });
            }

            const changeUsernameResult = await UsernameModel.updateUsernameInDB(newUserName, user.user_id);

            await BankService.updateBankAccount(user.user_id, 1, bank.bank_acc_one - CURRENCY_UPDATE_AMOUNT);

            await context.reply(UsernameView.usernameResponse(true, changeUsernameResult, CURRENCY_UPDATE_AMOUNT), {
                parse_mode: "HTML",
            });
        } catch (error) {
            console.error("Ошибка смены никнейма игрока:", error);
            await context.reply(UsernameView.errorChangingUsername(), { parse_mode: "HTML" });
        }
    }

    static hasSufficientFunds(bank) {
        return bank.bank_acc_one >= MIN_BANK_BALANCE;
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

    static validateUsername(newUserName, currentUserName) {
        if (newUserName === currentUserName) {
            return UsernameView.sameUsername();
        }

        if (!UsernameModel.isValidLength(newUserName)) {
            return UsernameView.usernameResponse(false, null);
        }

        if (UsernameModel.isForbiddenUsername(newUserName)) {
            return UsernameView.forbiddenUsername();
        }

        if (!UsernameModel.hasValidCharacters(newUserName)) {
            return UsernameView.invalidCharacters();
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

    static async updateUsernameInDB(newUserName, userId) {
        const changeUsernameQuery = `UPDATE people SET "user_name" = $1 WHERE "user_id" = $2 RETURNING *`;
        const changeUsernameResult = await pool.query(changeUsernameQuery, [newUserName, userId]);
        return changeUsernameResult.rows[0];
    }
}
