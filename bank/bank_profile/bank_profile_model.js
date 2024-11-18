import BankProfileView from "./bank_profile_view.js";
import UserService from "../../database_services/user_service.js";
import BankService from "../../database_services/bank_service.js";

export default class BankProfileModel {
    static async viewBankProfile(context) {
        await UserService.addUserIfNotExists(context);
        const passport = context.text.split(" ")[1];
        if (!passport) {
            try {
                const user = await UserService.findUserById(context.from.id);

                const bank = await BankService.findBanksByUserId(user.user_id);

                await await context.reply(BankProfileView.bankResponse(user, bank, context), {parse_mode: "HTML"});
            } catch (error) {
                BankProfileView.errorFetchingProfile(context);
            }
        } else {
            try {
                const user = await UserService.findUserByPassport(passport);
                if (!user) {
                    return await context.reply(BankProfileView.userNotFound(), {parse_mode: "HTML"});
                }

                const bank = await BankService.findBanksByUserId(user.user_id);

                await await context.reply(BankProfileView.bankResponse(user, bank, context), {parse_mode: "HTML"});
            } catch (error) {
                console.error("Ошибка профиля банка:", error);
                await context.reply(BankProfileView.errorFetchingProfile(), {parse_mode: "HTML"});
            }
        }
    }
}
