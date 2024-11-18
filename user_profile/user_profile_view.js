import wrapText from "../services/wrap_text.js";

export default class UserProfileView {
    static profileResponse(user, context) {
        if (!user) {
            return UserProfileView.infoNotFound();
        }

        const user_name = user.user_name;
        const user_id = user.user_id;
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
            1: { name: "Гореносец", emoji: "🤹🏼‍♂️", pronouns: "твой" },
            2: { name: "Изувер", emoji: "🎭", pronouns: "твой" },
            3: { name: "Местный Бог", emoji: "⛩", pronouns: "твой" },
            4: { name: "Правая рука", emoji: "🫴🏼", pronouns: "твой" },
            5: { name: "Созидатель", emoji: "🤴🏻", pronouns: "Ваш" },
        };

        const positionData = positionDictionary[position] || { name: "Неизвестно", emoji: "❓", pronouns: "твой" };
        const positionText = positionData.name;
        const positionEmoji = positionData.emoji;
        const pronouns = positionData.pronouns;

        let formattedDateString;
        const formattedDate = new Date(date_spawn);
        const day = String(formattedDate.getDate()).padStart(2, "0");
        const month = String(formattedDate.getMonth() + 1).padStart(2, "0");
        const year = String(formattedDate.getFullYear()).slice(2);

        if (position === 5) {
            formattedDateString = "██.██.██";
        } else if (position === 4) {
            formattedDateString = `?${day.slice(-1)}.${month}.??`;
        } else {
            formattedDateString = `${day}.${month}.${year}`;
        }

        let profileHeader;
        if (user_id == context.from.id) {
            profileHeader = `${positionEmoji} <b>${user_name}, ${pronouns} профиль:</b>`;
        } else {
            profileHeader = `<b>👁 Профиль <a href="tg://user?id=${user_id}">${user_name}</a>'а ${positionEmoji}:</b>`;
        }

        let profileStatus;
        if (user_status == "заблокирован") {
            profileStatus = `\n  –   Статус: <code>устранен</code>` + `\n  –   Причина: <code>${ban_reason}</code>`;
        } else {
            profileStatus = `\n  –   Статус: <code>${user_status}</code>`;
        }

        return (
            profileHeader +
            `\n  –   Паспорт: <code>${user_passport}</code>` +
            `\n  –   Уровень: <code>${user_level}</code>` +
            `\n  –   Масть: <code>${positionText}</code>` +
            `\n  –   Дата р-ции: <code>${formattedDateString}</code>` +
            profileStatus
        );
    }

    static infoNotFound() {
        return `<b>⚠️ Ошибка профиля: </b><code>информация не найдена!</code>`;
    }

    static userNotFound() {
        return `<b>⚠️ Ошибка профиля: </b><code>пользователь не найден!</code>`;
    }

    static errorFetchingProfile() {
        return `<b>Произошла ошибка при получении профиля!</b>`;
    }
}
