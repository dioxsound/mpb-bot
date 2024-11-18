import formatCurrency from "../../services/format_currency.js";

export default class BankProfileView {
    static bankResponse(user, bank, context) {
        if (!user || !bank) {
            return BankProfileView.infoNotFound(user);
        }

        const positionDictionary = {
            1: { name: "Гореносец", emoji: "🪙", pronouns: "твой" },
            2: { name: "Изувер", emoji: "🪙", pronouns: "твой" },
            3: { name: "Местный Бог", emoji: "💸", pronouns: "Ваш" },
            4: { name: "Правая рука", emoji: "💎", pronouns: "Ваш" },
            5: { name: "Созидатель", emoji: "🤴🏻", pronouns: "Ваш" },
        };

        const positionData = positionDictionary[user.user_position] || {
            name: "Неизвестно",
            emoji: "❓",
            pronouns: "твоем",
        };
        const positionText = user.user_name ? user.user_name : positionData.name;
        const positionEmoji = positionData.emoji;
        const pronouns = positionData.pronouns;

        const formattedBankOne = formatCurrency(bank.bank_acc_one);
        const formattedBankTwo = formatCurrency(bank.bank_acc_two);

        let profileHeader;
        if (user.user_id == context.from.id) {
            profileHeader = `${positionEmoji} <b>${positionText}, ${pronouns} текущий банк:</b>`;
        } else {
            profileHeader = `<b>👁 Банк <a href="tg://user?id=${user.user_id}">${user.user_name}</a>'а (${positionData.name}):</b>`;
        }

        const bankInfo =
            `  –   ${bank.bank_name || "Смирнофф Стандарт (S-Bank)"}:\n` +
            `       <code>${bank.bank_id}</code>\n` +
            `  –   1-ый счет: <code>${formattedBankOne}</code>\n` +
            `  –   2-ой счет: <code>${formattedBankTwo}</code>`;

        return profileHeader + "\n" + bankInfo;
    }

    static infoNotFound(user) {
        return `<b>⚠️ Ошибка профиля: </b>` + `<code>информация о ${user} не найдена!</code>`;
    }

    static userNotFound() {
        return `<b>⚠️ Ошибка профиля: </b>` + `<code>информация не найдена!</code>`;
    }

    static errorFetchingProfile() {
        return `<b>Произошла ошибка</b>`;
    }
}
