// casino_bookmaker.js
import CasinoService from "../database_services/casino_service.js";
import UserService from "../database_services/user_service.js";
import BookmakerView from "./bookmaker_view.js";

export default class BookmakerModel {
    static bookmakers = {
        "100XBET": { casino_coefficient: 1.5, casino_chance: 80, casino_commission: 30 },
        SPARTAK: { casino_coefficient: 1.0, casino_chance: 95, casino_commission: 5 },
        BETBANG: { casino_coefficient: 1.25, casino_chance: 80, casino_commission: 15 },
        LEVONRU: { casino_coefficient: 1.0, casino_chance: 80, casino_commission: 5 },
    };

    /**
     * Обрабатывает выбор букмекера пользователем.
     * @param {object} context - Контекст сообщения пользователя.
     */
    static async chooseBookmaker(context) {
        try {
            await UserService.addUserIfNotExists(context);
            const userId = context.from.id;
            const user = await UserService.findUserById(userId);
            const position = user.user_position;
            const bookmakerInput = context.text.split(" ")[1];
            const bookmaker = bookmakerInput ? bookmakerInput.toUpperCase() : null;
            const casinoData = await CasinoService.findCasinoByUserID(userId);

            if (!bookmaker) {
                return await context.send(BookmakerView.getBookmakerOptionsMessage(position, casinoData), {
                    parse_mode: "HTML",
                });
            }
            const lastChange = await CasinoService.getLastBookmakerChange(context.from.id);
            if (lastChange) {
                const now = new Date();
                const lastChangeTime = new Date(lastChange);
                const diffInHours = (now - lastChangeTime) / (1000 * 60 * 60);

                if (diffInHours < 24) {
                    const hoursLeft = 24 - Math.floor(diffInHours);
                    // Вызов метода с передачей параметра
                    return await context.send(BookmakerView.getHoursLeftMessage(hoursLeft, position, user), {
                        parse_mode: "HTML",
                    });
                }
            }
            const selectedBookmaker = BookmakerModel.bookmakers[bookmaker];
            if (!selectedBookmaker) {
                // Вызов метода с передачей параметра
                return await context.send(BookmakerView.getUnknownBookmakerMessage(bookmaker), { parse_mode: "HTML" });
            }

            await CasinoService.addOrUpdateUserBookmaker(
                context.from.id,
                bookmaker,
                selectedBookmaker.casino_coefficient,
                selectedBookmaker.casino_chance,
                selectedBookmaker.casino_commission
            );

            return await context.send(
                BookmakerView.getBookmakerSelectedMessage(
                    bookmaker,
                    selectedBookmaker.casino_chance,
                    selectedBookmaker.casino_commission,
                    selectedBookmaker.casino_coefficient,
                    position,
                    user
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
