// casino_bookmaker.js
import CasinoService from "../database/casino_service.js";
import UserService from "../database/user_service.js";
import CasinoView from "./casino_view.js";

export default class CasinoBookmaker {
    static bookmakers = {
        "2Y": { casino_coefficient: 0.8, casino_chance: 95, casino_commission: 10 },
        DOWNY: { casino_coefficient: 1.5, casino_chance: 80, casino_commission: 15 },
        BLINOV: { casino_coefficient: 1.2, casino_chance: 80, casino_commission: 30 },
        TUNDR9: { casino_coefficient: 0.8, casino_chance: 100, casino_commission: 5 },
    };

    /**
     * Обрабатывает выбор букмекера пользователем.
     * @param {object} context - Контекст сообщения пользователя.
     */
    static async chooseBookmaker(context) {
        try {
            await UserService.addUserIfNotExists(context);

            const bookmakerInput = context.text.split(" ")[1];
            const bookmaker = bookmakerInput ? bookmakerInput.toUpperCase() : null;

            if (!bookmaker) {
                // Вызов метода CasinoView с ()
                return await context.send(CasinoView.getBookmakerOptionsMessage(), { parse_mode: "HTML" });
            }

            const selectedBookmaker = CasinoBookmaker.bookmakers[bookmaker];
            if (!selectedBookmaker) {
                // Вызов метода с передачей параметра
                return await context.send(CasinoView.getUnknownBookmakerMessage(bookmaker), { parse_mode: "HTML" });
            }

            const lastChange = await CasinoService.getLastBookmakerChange(context.from.id);

            if (lastChange) {
                const now = new Date();
                const lastChangeTime = new Date(lastChange);
                const diffInHours = (now - lastChangeTime) / (1000 * 60 * 60);

                if (diffInHours < 24) {
                    const hoursLeft = 24 - Math.floor(diffInHours);
                    // Вызов метода с передачей параметра
                    return await context.send(CasinoView.getHoursLeftMessage(hoursLeft), { parse_mode: "HTML" });
                }
            }

            await CasinoService.addOrUpdateUserBookmaker(
                context.from.id,
                bookmaker,
                selectedBookmaker.casino_coefficient,
                selectedBookmaker.casino_chance,
                selectedBookmaker.casino_commission
            );

            return await context.send(
                CasinoView.getBookmakerSelectedMessage(
                    bookmaker,
                    selectedBookmaker.casino_chance,
                    selectedBookmaker.casino_commission,
                    selectedBookmaker.casino_coefficient
                ),
                { parse_mode: "HTML" }
            );
        } catch (error) {
            console.error(`Ошибка в chooseBookmaker для пользователя ${context.from.id}:`, error);
            await context.send(`<b>Произошла ошибка при выборе букмекера. Пожалуйста, попробуйте позже.</b>`, {
                parse_mode: "HTML",
            });
        }
    }
}
