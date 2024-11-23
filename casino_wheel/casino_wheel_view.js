import formatCurrency from "../services/format_currency.js";

class CasinoWheelView {
    static positionDictionary = {
        1: { emoji: "🤹🏼‍♂️", emojiWin: "🫨", emojiLose: "🤣", pronouns: "ты" },
        2: { emoji: "🎭", emojiWin: "😮‍💨", emojiLose: "🤭", pronouns: "ты" },
        3: { emoji: "⛩", emojiWin: "🤑", emojiLose: "😯", pronouns: "Вы" },
        4: { emoji: "🫴🏼", emojiWin: "🤟", emojiLose: "🖕", pronouns: "Вы" },
        5: { emoji: "🤴🏻", emojiWin: "🥶", emojiLose: "💀", pronouns: "Вы" },
    };

    static getHelpMessage() {
        return (
            "<b>📃 Справочник для игры в казино:</b>\n" +
            "  –   Команда: <code>казино [ставка] [сумма]</code>\n" +
            "  –   Суффиксы: <code>к/млн/млрд/трлн/квадр</code>\n" +
            "  –   Ставки:\n" +
            `        <code>кр/красный</code>\n` +
            `        <code>чр/черный</code>\n` +
            `        <code>зл/зеленый</code>\n` +
            `        <code>чт/четное</code>\n` +
            `        <code>нч/нечетное</code>\n` +
            `        <code>д1/дюжина1</code>\n` +
            `        <code>д2/дюжина2</code>\n` +
            `        <code>д3/дюжина3</code>\n` +
            "  –   Примеры:\n" +
            `        <code>казино кр 100</code>\n` +
            `        <code>казино черный 50%</code>\n` +
            `        <code>казино д1 все</code>\n` +
            `        <code>казино зеленый 10млн</code>\n`
        );
    }

    static getInvalidBetTypeMessage() {
        return (
            `<b>📃 Допустимые ставки:</b>\n` +
            `<code>кр/красный</code>,\n` +
            `<code>чр/черный</code>,\n` +
            `<code>зл/зеленый</code>,\n` +
            `<code>чт/четное</code>,\n` +
            `<code>нч/нечетное</code>,\n` +
            `<code>д1/дюжина1</code>,\n` +
            `<code>д2/дюжина2</code>,\n` +
            `<code>д3/дюжина3</code>`
        );
    }

    static getWinMessage(userName, payout, result, newBalance, commission, bookmaker, position) {
        const positionData = this.positionDictionary[position] || { emoji: "🎲", pronouns: "ты" };
        const positionWinEmoji = positionData.emojiWin;

        return (
            `${positionWinEmoji} <b>${userName || "Игрок"} ОБСТАВИЛ:</b>` +
            `\n  –   <code>${formatCurrency(payout)}</code>` +
            `\n      (комиссия ${formatCurrency(commission)})` +
            `\n🎲 <b>Выпавший номер:</b>` +
            `\n  –   <code>${result.number} (${result.color})</code>` +
            `\n<b>💳 Баланс (${bookmaker}):</b>` +
            `\n  –   <code>${formatCurrency(newBalance)}</code>`
        );
    }

    static getLoseMessage(userName, betAmount, result, newBalance, bookmaker, position) {
        const positionData = this.positionDictionary[position] || { emoji: "🎲", pronouns: "ты" };
        const positionLoseEmoji = positionData.emojiLose;

        return (
            `${positionLoseEmoji} <b>${userName || "Игрок"} ПРОИГРАЛ:</b>` +
            `\n  –   <code>${formatCurrency(betAmount)}</code>` +
            `\n🎲 <b>Выпавший номер:</b>` +
            `\n  –   <code>${result.number} (${result.color})</code>` +
            `\n<b>💳 Баланс (${bookmaker}):</b>` +
            `\n  –   <code>${formatCurrency(newBalance)}</code>`
        );
    }

    static getErrorMessage(errorMessage) {
        return `⚠️ <b>Произошла ошибка:</b> <code>${errorMessage}</code>`;
    }

    static getDepositHelpMessage() {
        return (
            `<b>❔ Как пополнить баланс казино:</b>\n` +
            `  –   Команда: <code>пополнить казино [счет] [сумма]</code>\n` +
            `  –   Примеры:\n` +
            `        <code>пополнить казино 1 100к</code>\n` +
            `        <code>пополнить казино 2 10%</code>\n` +
            `        <code>пополнить казино 1 все</code>`
        );
    }

    static getWithdrawHelpMessage() {
        return (
            `<b>❔ Как вывести баланс из казино:</b>\n` +
            `  –   Команда: <code>вывести казино [счет] [сумма]</code>\n` +
            `  –   Примеры:\n` +
            `        <code>вывести казино 2 50к</code>\n` +
            `        <code>вывести казино 1 20%</code>\n` +
            `        <code>вывести казино 2 все</code>`
        );
    }

    /**
     * Возвращает сообщение об успешном пополнении казино.
     * @param {string} userName - Имя пользователя.
     * @param {string} amount - Сумма пополнения.
     * @param {string} newCasinoBalance - Новый баланс казино.
     * @param {string} newBankAmount - Новый баланс банковского счета.
     * @param {number} bankAcc - Номер банковского счета.
     * @returns {string} - Сообщение об успехе.
     */
    static getDepositSuccessMessage(amount, newCasinoBalance, newBankAmount, bankAcc) {
        return (
            `<b>🎡 Успешное пополнение казино:</b>\n` +
            `  –   Потрачено: <code>${formatCurrency(amount)}</code>\n` +
            `      (из ${bankAcc == 1 ? "1-го счет:" : "2-го счет:"} ${formatCurrency(newBankAmount)})\n` +
            `  –   Баланс: <code>${formatCurrency(newCasinoBalance)}</code>\n`
        );
    }

    static getWithdrawSuccessMessage(userName, amount, newCasinoBalance, newBankAmount, bankAcc) {
        return (
            `<b>🎡 Успешный вывод из казино:</b>\n` +
            `  –   Выведено: <code>${formatCurrency(amount)}</code>\n` +
            `      (на ${bankAcc == 1 ? "1-ый счет:" : "2-ой счет:"} ${formatCurrency(newBankAmount)})\n` +
            `  –   Баланс казино: <code>${formatCurrency(newCasinoBalance)}</code>\n`
        );
    }

    static getBankAccError(error) {
        return `<b>[🚫💳] Ошибка банка: </b><code>${error}</code>`
    }

    static getInvalidBankAccMessage() {
        return `<b>[🚫💳] Ошибка банка: </b><code>некорректный номер банк. счета, используйте 1 или 2!</code>`
    }

    static getAmountError(error) {
        return `<b>[🚫💸] Ошибка суммы: </b><code>${error}</code>`
    }

    static getErrorNoCasinoMessage(position, user) {
        const positionData = this.positionDictionary[position] || { name: "Игрок", emoji: "🎲", pronouns: "ты" };
        const emoji = positionData.emoji
        const name = user.user_name;
        const pronouns = positionData.pronouns;
        return (
            `<b>${emoji} ${name}, ${pronouns === "ты" ? "ты не выбрал" : "Вы не выбрали"} букмекера :(</b>\n` +
            `  –   Команда: <code>букмекер [букмекер]</code>`
        );
    }
}

export default CasinoWheelView;
