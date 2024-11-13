// username_view.js
import formatCurrency from "../../services/format_currency.js";

export default class UsernameView {
    /**
     * Ответ при успешном изменении никнейма
     * @param {boolean} success
     * @param {object} context
     * @param {object} changeUsernameResult
     */
    static usernameResponse(success, context, changeUsernameResult) {
        if (success) {
            const newUsername = changeUsernameResult.rows[0].user_name;
            return `<b>🪪 Успешная смена никнейма :D</b>\n` + `  –   Никнейм: <code>${newUsername}</code>\n`;
        } else {
            return "<b>Никнейм должен содержать от 3 до 12 символов!</b>";
        }
    }

    /**
     * Сообщение о недостаточном количестве средств
     * @param {string} deficiency
     */
    static insufficientFunds(deficiency) {
        return `<b>Недостаточно</b> <code>${deficiency}</code> <b>для смены никнейма!</b>`;
    }

    /**
     * Сообщение о запрещённом никнейме
     */
    static forbiddenUsername() {
        return "<b>Неа ☝🏼 Такой ник запрещен!</b>";
    }

    /**
     * Сообщение о недопустимых символах в никнейме
     */
    static invalidCharacters() {
        return "<b>Никнейм может содержать только:</b> <code>a-Z, а-Я, 0-9, _</code>";
    }

    static sameUsername() {
        return "<b>🤦🏼‍♂️ Нельзя сменить на такой же никнейм!</b>";
    }

    /**
     * Сообщение о необходимости указать никнейм
     */
    static noUsernameProvided(username) {
        return (
            `<b>🪪 Текущий никнейм: <code>${username}</code></b>\n` +
            `  –   Смена никнейма: <code>никнейм [ник]</code>\n` +
            `  –   Условия для [ник]: <code>от 3 до 12 см.</code>\n` +
            `  –   Стоимость: <code>${formatCurrency(50000)}</code>`
        );
    }

    static forbiddenUsernameSimilarity() {
        return `<b>Неа ☝🏼 Такой ник похож на запрещённый!</b>`;
    }

    /**
     * Сообщение об ошибке при смене никнейма
     */
    static errorChangingUsername() {
        return "Произошла ошибка при смене никнейма. Пожалуйста, попробуйте позже.";
    }
}
