import UserService from "../database/user_service.js";
import ProfileView from "./profile_view.js";

export default class ProfileModel {
    static async viewProfile(context) {
        await UserService.addUserIfNotExists(context);
        const anotherProfile = context.text.split(" ")[1];
        if (!anotherProfile) {
            try {
                const result = await UserService.findUserById(context.from.id);
                await ProfileView.profileResponse(context.from.id, result, context);
            } catch (error) {
                console.error("Ошибка профиля игрока:", error);
            }
        } else {
            try {
                await UserService.addUserIfNotExists(context);

                const result = await UserService.findUserByPassport(anotherProfile);
                const anotherUserId = result.user_id;
                await ProfileView.profileResponse(anotherUserId, result, context);
            } catch (error) {
                console.error("Ошибка профиля игрока:", error);
            }
        }
    }
}
