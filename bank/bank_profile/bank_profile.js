import BankProfileView from "./bank_view.js";
import UserService from "../../database/user_service.js";
import BankService from "../../database/bank_service.js";

export default class BankProfileModel {
    static async viewBankProfile(context) {
        await UserService.addUserIfNotExists(context);
        const passport = context.text.split(" ")[1];
        if (!passport) {
            try {
                const user = await UserService.findUserById(context.from.id);
                if (!user) {
                    return BankProfileView.userNotFound(context);
                }

                const bank = await BankService.findBankByUserId(user.user_id);
                if (!bank) {
                    return BankProfileView.bankNotFound(context);
                }

                await BankProfileView.bankResponse(user, bank, context);
            } catch (error) {
                console.error("Ошибка профиля банка:", error);
                BankProfileView.errorFetchingProfile(context);
            }
        } else {
            try {
                const user = await UserService.findUserByPassport(passport);
                if (!user) {
                    return BankProfileView.userNotFound(context);
                }

                const bank = await BankService.findBankByUserId(user.user_id);
                if (!bank) {
                    return BankProfileView.bankNotFound(context);
                }

                await BankProfileView.bankResponse(user, bank, context);
            } catch (error) {
                console.error("Ошибка профиля банка:", error);
                BankProfileView.errorFetchingProfile(context);
            }
        }
    }
}
