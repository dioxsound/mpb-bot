import UserService from "../database_services/user_service.js";
import ProfileView from "./user_profile_view.js";

export default class UserProfileModel {
    static async viewUserProfile(context) {
        await UserService.addUserIfNotExists(context);
        const passport = context.text.split(" ")[1];

        if (!passport) {
            try {
                const user = await UserService.findUserById(context.from.id);
                await context.reply(ProfileView.profileResponse(user, context), { parse_mode: "HTML" });
            } catch (error) {
                console.error("Ошибка профиля пользователя:", error);
                await context.reply(ProfileView.errorFetchingProfile(), { parse_mode: "HTML" });
            }
        } else {
            try {
                const user = await UserService.findUserByPassport(passport);
                if (!user) {
                    return await context.reply(ProfileView.userNotFound(), { parse_mode: "HTML" });
                }
                await context.reply(ProfileView.profileResponse(user, context), { parse_mode: "HTML" });
            } catch (error) {
                console.error("Ошибка профиля пользователя:", error);
                await context.reply(ProfileView.errorFetchingProfile(), { parse_mode: "HTML" });
            }
        }
    }
}
