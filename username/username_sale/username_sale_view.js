import formatCurrency from "../../services/format_currency.js";

export default class UsernameSaleView {
    static alreadySelling() {
        return `<b>⚠️ Ошибка продажи никнейма: </b>` + `<code>отмените текущую продажу перед тем, как выставить новую!</code>`;

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
        return `<b>📃 Успешное выставление никнейма:</b> <code>${username}</code> за ${formatCurrency(price)}`
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
        return `<b>📃 Успешная покупка никнейма:</b>\n` + 
            `  –   Новый никнейм: <code>${username}</code>\n` +
            `  –   Потрачено: <code>${formatCurrency(price)}</code>\n`;
    }

    static errorBuyingUsername() {
        return `<b>⚠️ Ошибка покупки никнейма: </b>` + `<code>пожалуйста, попробуйте позже.</code>`;

    }

    static errorSellingUsername() {
        return `<b>⚠️ Ошибка продажи никнейма: </b>` + `<code>пожалуйста, попробуйте позже.</code>`;

    }

    static errorCancellingSale() {
        return `<b>⚠️ Ошибка отмены никнейма: </b>` + `<code>пожалуйста, попробуйте позже.</code>`;

    }

    static notSellingUsername() {
        return `<b>📃 Вы не выставляли свой никнейм на продажу</b>`;
        
    }

    static usernameSaleCancelled() {
        return `<b>📃 Отменена продажа никнейма</b>`;
    }
}