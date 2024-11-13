import pool from "../../database/config_model.js";
import UserService from "../../database/user_service.js";
import UsernameView from "./username_view.js";
import BankService from "../../database/bank_service.js";
import formatCurrency from "../../services/format_currency.js";
import levenshtein from "fast-levenshtein";
import { FORBIDDEN_USERNAMES, SIMILARITY_THRESHOLD } from "./constants.js";

export default class UsernameModel {
    static async changeUsername(context) {
        try {
            await UserService.addUserIfNotExists(context);
            const bank = await BankService.findBankByUserId(context.from.id);
            const user = await UserService.findUserById(context.from.id)

            if (bank.bank_amount < 50000) {
                const deficiency = formatCurrency(50000 - bank.bank_amount);
                return await context.reply(UsernameView.insufficientFunds(deficiency), { parse_mode: "HTML" });
            }

            let newUserName = context.text.split(" ")[1];

            if (!newUserName) {
                return await context.reply(UsernameView.noUsernameProvided(user.user_name), { parse_mode: "HTML" });
            }

            if (newUserName == user.user_name) {
                return await context.reply(UsernameView.sameUsername(), { parse_mode: "HTML" });
            }
            if (newUserName.startsWith("@")) {
                newUserName = newUserName.substring(1);
            }

            if (newUserName.length > 12 || newUserName.length < 3) {
                return await context.reply(UsernameView.usernameResponse(false, context), { parse_mode: "HTML" });
            }

            const lowerCaseUsername = newUserName.toLowerCase();

            if (FORBIDDEN_USERNAMES.includes(lowerCaseUsername)) {
                return await context.reply(UsernameView.forbiddenUsername(), { parse_mode: "HTML" });
            }

            for (const forbidden of FORBIDDEN_USERNAMES) {
                const distance = levenshtein.get(lowerCaseUsername, forbidden);
                if (distance <= SIMILARITY_THRESHOLD) {
                    return await context.reply(UsernameView.forbiddenUsernameSimilarity(), { parse_mode: "HTML" });
                }
            }

            const usernameRegex = /^[a-zA-Zа-яА-Я0-9_]+$/;
            if (!usernameRegex.test(newUserName)) {
                return await context.reply(UsernameView.invalidCharacters(), { parse_mode: "HTML" });
            }

            const changeUsernameQuery = `UPDATE people SET "user_name" = $1 WHERE "user_id" = $2 RETURNING *`;
            const changeUsernameResult = await pool.query(changeUsernameQuery, [newUserName, user.user_id]);

            const newAmount = bank.bank_amount - 50000;
            await BankService.updateBankAmount(user.user_id, newAmount);

            await context.reply(UsernameView.usernameResponse(true, context, changeUsernameResult), {
                parse_mode: "HTML",
            });
        } catch (error) {
            console.error("Ошибка смены никнейма игрока:", error);
            await context.reply(UsernameView.errorChangingUsername(), { parse_mode: "HTML" });
        }
    }
}
