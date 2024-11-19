import UserService from "../database_services/user_service.js";

export default class CommandsViewModel {
    static async showCommands(context) {
        await UserService.addUserIfNotExists(context);
        const message =
            `⚙️ <b> Чтобы начать пользоваться ботом:</b>\n` +
            `  –   Все команды: <a href="https://teletype.in/@dioxsound/mpb_bot_commands">прикрепленная статья</a>`;
        await context.reply(message, { parse_mode: "HTML" });
    }
}
