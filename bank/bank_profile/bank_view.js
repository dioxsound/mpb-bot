import formatCurrency from "../../services/format_currency.js";

export default class BankProfileView {
    static bankResponse(user, bank, context) {
        if (!user || !bank) {
            return BankProfileView.infoNotFound(context, user);
        }

        const positionDictionary = {
            1: { name: "Гореносец", emoji: "🧟‍♂️", pronouns: "твоем" },
            2: { name: "Изувер", emoji: "🎭", pronouns: "твоем" },
            3: { name: "Местный Бог", emoji: "⛩", pronouns: "твоем" },
            4: { name: "Правая рука", emoji: "🫴🏼", pronouns: "твоем" },
            5: { name: "Созидатель", emoji: "🤴🏻", pronouns: "вашем" },
        };

        const positionData = positionDictionary[user.user_position] || {
            name: "Неизвестно",
            emoji: "❓",
            pronouns: "твоем",
        };
        const positionText = user.user_name ? user.user_name : positionData.name;
        const positionEmoji = positionData.emoji;
        const pronouns = positionData.pronouns;

        const formattedBankId = `${bank.bank_id.slice(0, 4)} ${bank.bank_id.slice(4, 8)} ${bank.bank_id.slice(
            8,
            12
        )} ${bank.bank_id.slice(12, 16)}`;

        const formattedAmount = formatCurrency(bank.bank_amount);

        let profileHeader;
        if (user.user_id == context.from.id) {
            profileHeader = `${positionEmoji} <b><a href="tg://user?id=${user.user_id}">${positionText}</a>, данные о ${pronouns} банке:</b>`;
        } else {
            profileHeader = `<b>🏦 Банк пользователя <a href="tg://user?id=${user.user_id}">${user.user_name}</a>:</b>`;
        }

        const bankInfo =
            `  –   ${bank.bank_name || "Смирнофф Стандарт (S-Bank)"}:\n` +
            `       <code>${formattedBankId}</code>\n` +
            `  –   1-ый счет: <code>${formattedAmount}</code>`;

        return context.send(profileHeader + "\n" + bankInfo, {
            parse_mode: "HTML",
        });
    }

    static infoNotFound(context, user) {
        return context.send(`<b>🤷🏼‍♂️ Увы, но информация о банке </b> <code>${user}</code> <b>не найдена</b>`, {
            parse_mode: "HTML",
        });
    }

    static userNotFound(context) {
        return context.send(`<b>🤷🏼‍♂️ Увы, но информация не найдена</b>`, {
            parse_mode: "HTML",
        });
    }

    static bankNotFound(context) {
        return context.send(`<b>🤷🏼‍♂️ Увы, но информация не найдена</b>`, {
            parse_mode: "HTML",
        });
    }

    static errorFetchingProfile(context) {
        return context.send(`<b>Произошла ошибка</b>`, {
            parse_mode: "HTML",
        });
    }
}
