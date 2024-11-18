import formatCurrency from "../../services/format_currency.js";

export default class BankTransferView {
    static transferHelp() {
        return (
            `<b>💳 Инструкция по переводу:</b>\n` +
            `  –   Способ первый (bank_id):\n` +
            `       <code>перевести [карта] [счет] [сумма]</code>\n` +
            `  –   Способ второй (ответом):\n` +
            `       <code>перевести [счет] [сумма]</code>`
        );
    }

    static invalidBankId() {
        return `<b>⚠️ Ошибка перевода средств: </b>` + `<code>некорректный номер карты!</code>`;

    }

    static invalidAccountNumber() {
        return `<b>⚠️ Ошибка перевода средств: </b>` + `<code>некорректный номер счета!</code>`;
        
    }

    static invalidAmount() {
        return `<b>⚠️ Ошибка перевода средств: </b>` + `<code>некорректная сумма перевода!</code>`;

    }

    static lessAmount() {
        return `<b>⚠️ Ошибка перевода средств: </b>` + `<code>недостаточно средств!</code>`;

    }

    static recipientNotFound(isSame) {
        if (isSame) {
            return `<b>⚠️ Ошибка перевода средств: </b>` + `<code>нельзя переводить себе!</code>`;
        } else {
            return `<b>⚠️ Ошибка перевода средств: </b>` + `<code>получатель с номером карты не найден!</code>`;
        }
    }

    static transferSuccess(data) {
        const {recipient, amount} = data;
        return (
            `<b>💳 Успешный перевод средств:</b>\n` +
            `  –   Получатель: <a href="tg://user?id=${recipient.user_id}">${recipient.user_name}</a>\n` +
            `  –   Сумма перевода: <code>${formatCurrency(amount)}</code>`
        );
    }

    static transferError(errorMessage) {
        return `<b>⚠️ Ошибка перевода средств: </b>` + `<code>${errorMessage}</code>`;
    }
}
