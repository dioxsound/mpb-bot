import formatCurrency from "../../services/format_currency.js";

export default class UsernameView {
    static usernameResponse(success, changeUsernameResult, cost) {
        if (success) {
            const newUsername = changeUsernameResult.user_name;
            return (
                `<b>🪪 Успешная смена никнейма:</b>\n` +
                `  –   Новый никнейм: <code>${newUsername}</code>\n` +
                `  –   Потрачено: <code>${formatCurrency(cost)}</code>\n`
            );
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

    static alreadySelling() {
        return (
            `<b>⚠️ Ошибка продажи никнейма: </b>` +
            `<code>отмените текущую продажу перед тем, как выставить новую!</code>`
        );
    }

    static invalidSellCommand() {
        return "Неверный формат команды. Используйте: `продать никнейм сумма`";
    }

    static cannotSellDefaultUsername() {
        return `<b>⚠️ Ошибка продажи никнейма: </b>` + `<code>нельзя продать дефолтный никнейм!</code>`;
    }

    static insufficientFunds(deficiency) {
        return `Недостаточно средств для покупки никнейма. Необходимо дополнительно: ${deficiency}`;
    }

    static usernameListedForSale(username, price) {
        return `<b>📃 Успешное выставление никнейма:</b> <code>${username}</code> за ${formatCurrency(price)}`;
    }

    static errorSellingUsername() {
        return "Произошла ошибка при попытке выставить никнейм на продажу. Пожалуйста, попробуйте позже.";
    }

    static invalidBuyCommand() {
        return "Неверный формат команды. Используйте: `купить никнейм [никнейм]`";
    }

    static usernameNotForSale() {
        return `<b>📃 Никнейм не выставлен на продажу или не существует.</b>`;
    }

    static cannotBuyOwnUsername() {
        return `<b>📃 Нельзя купить свой никнейм</b>`;
    }

    static cannotBuyUsernameWhenSelling() {
        return `<b>📃 Нельзя купить никнейм, когда сам продаешь</b>`;
    }

    static usernamePurchased(username, price) {
        return (
            `<b>📃 Успешная покупка никнейма:</b>\n` +
            `  –   Новый никнейм: <code>${username}</code>\n` +
            `  –   Потрачено: <code>${formatCurrency(price)}</code>\n`
        );
    }

    static errorBuyingUsername() {
        return `<b>⚠️ Ошибка покупки никнейма: </b>` + `<code>пожалуйста, попробуйте позже.</code>`;
    }

    static errorSellingUsername() {
        return `<b>⚠️ Ошибка продажи никнейма: </b>` + `<code>пожалуйста, попробуйте позже.</code>`;
    }

    static notSellingUsername() {
        return `<b>📃 Вы не выставляли свой никнейм на продажу</b>`;
    }

    static usernameSaleCancelled() {
        return `<b>📃 Отменена продажа никнейма</b>`;
    }
}
