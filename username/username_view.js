import formatCurrency from "../services/format_currency.js";

export default class UsernameView {
    static usernameResponse(success, changeUsernameResult, cost) {
        if (success) {
            const newUsername = changeUsernameResult.user_name;
            return `<b>🪪 Успешная смена никнейма:</b>\n` + 
            `  –   Новый никнейм: <code>${newUsername}</code>\n` +
            `  –   Потрачено: <code>${formatCurrency(cost)}</code>\n`;
        } else {
            return `<b>⚠️ Ошибка смены никнейма: </b>` + `<code>надо от 3 до 12 символов!</code>`;
        }
    }

    static insufficientFunds(deficiency) {
        return `<b>⚠️ Ошибка смены никнейма: </b>` + `<code>недостаточно ${deficiency}</code>`;
    }

    static forbiddenUsername() {
        return `<b>⚠️ Ошибка смены никнейма: </b>` + `<code>такой ник запрещен!</code>`;
    }

    static invalidCharacters() {
        return `<b>⚠️ Ошибка смены никнейма: </b>` + `<code>только a-Zа-Я0-9_</code>`;
    }

    static sameUsername() {
        return `<b>⚠️ Ошибка смены никнейма: </b>` + `<code>нельзя сменить на тот же ник!</code>`;
    }

    static noUsernameProvided(username, cost) {
        return (
            `<b>🪪 Текущий никнейм: <code>${username}</code></b>\n` +
            `  –   Смена никнейма: <code>никнейм [ник]</code>\n` +
            `  –   Условия для [ник]: <code>от 3 до 12 см.</code>\n` +
            `  –   Стоимость: <code>${formatCurrency(cost)}</code>`
        );
    }

    static usernameNotUnique() {
        return `<b>⚠️ Ошибка смены никнейма: </b>` + `<code>такой никнейм занят!</code>`;
    }

    static errorChangingUsername(error) {
        return `<b>⚠️ Ошибка смены никнейма: </b>` + `<code>${error}</code>`;
    }
}
