import wrapText from "./utils/wrap_text.js";
export default class ProfileView {

    static profileResponse(anotherUserId, result, context) {
        const user = result;
        if (!user) {
            return "Пользователь не найден.";
        }

        const user_name = user.user_name;
        const user_id = anotherUserId;
        const user_passport = user.user_passport;
        const user_level = user.user_level;
        const position = user.user_position;
        const date_spawn = user.date_spawn;
        const user_status = user.user_status;
        let ban_reason = user.ban_reason;

        if (ban_reason) {
            ban_reason = wrapText(ban_reason, 16);
        }

        const positionDictionary = {
            1: { name: "Гореносец", emoji: "🧟‍♂️", pronouns: "твои" },
            2: { name: "Изувер", emoji: "🎭", pronouns: "твои" },
            3: { name: "Местный Бог", emoji: "⛩", pronouns: "твои" },
            4: { name: "Правая рука", emoji: "🫴🏼", pronouns: "твои" },
            5: { name: "Созидатель", emoji: "🤴🏻", pronouns: "ваши" },
        };

        const positionData = positionDictionary[position] || { name: "Неизвестно", emoji: "❓", pronouns: "твои" };
        const positionText = positionData.name;
        const positionEmoji = positionData.emoji;
        const pronouns = positionData.pronouns;

        let formattedDateString;
        if (position === 5) {
            formattedDateString = "██.██.██";
        } else {
            const formattedDate = new Date(date_spawn);
            const day = String(formattedDate.getDate()).padStart(2, "0");
            const month = String(formattedDate.getMonth() + 1).padStart(2, "0");
            const year = String(formattedDate.getFullYear()).slice(2);
            formattedDateString = `${day}.${month}.${year}`;
        }

        let profileHeader;
        if (user_id === context.from.id) {
            profileHeader = `${positionEmoji} <b><a href="tg://user?id=${user_id}">${user_name}</a>, ${pronouns} данные:</b>`;
        } else {
            profileHeader = `<b>👤 Собранные данные <a href="tg://user?id=${user_id}">${user_name}</a>:</b>`;
        }

        let profileStatus;
        if (user_status === "заблокирован") {
            profileStatus = `\n  –   Статус: <code>устранен</code>` +
                `\n  –   Причина: <code>${ban_reason}</code>`;
        } else {
            profileStatus = `\n  –   Статус: <code>${user_status}</code>`;
        }

        return context.send(
            profileHeader +
            `\n  –   Паспорт: <code>${user_passport}</code>` +
            `\n  –   Уровень: <code>${user_level}</code>` +
            `\n  –   Положение: <code>${positionText}</code>` +
            `\n  –   Дата появления: <code>${formattedDateString}</code>` +
            profileStatus,
            {
                parse_mode: "HTML",
            }
        );
    }
}
