import formatCurrency from "../services/format_currency.js";

class CasinoView {
    static positionDictionary = {
        1: { emoji: "🧟‍♂️", pronouns: "ты" },
        2: { emoji: "🎭", pronouns: "ты" },
        3: { emoji: "⛩", pronouns: "ты" },
        4: { emoji: "🫴🏼", pronouns: "Вы" },
        5: { emoji: "🤴🏻", pronouns: "Вы" },
    };

    static getHelpMessage() {
        return (
            "<b>📃 Справочник для игры в казино:</b>\n" +
            "  –   Команда: <code>казино</code> <code>[ставка]</code> <code>[сумма]</code>\n" +
            "  –   Cуффиксы: <code>к/млн/млрд/трлн/квадр</code>\n" +
            "  –   Ставки: <code>кр/красный</code>\n" +
            `                     <code>чр/черный</code>\n` +
            `                     <code>зл/зеленый</code>\n` +
            `                     <code>чт/четное</code>\n` +
            `                     <code>нч/нечетное</code>\n` +
            `                     <code>д1/дюжина1</code>\n` +
            `                     <code>д2/дюжина2</code>\n` +
            `                     <code>д3/дюжина3</code>\n` +
            "  –   Примеры: <code>казино кр 100</code>\n" +
            `                         <code>казино кр 100</code>\n` +
            `                         <code>казино черный 50%</code>\n` +
            `                         <code>казино д1 все</code>\n` +
            `                         <code>казино зеленый 10млн</code>\n`
        );
    }

    static getInvalidBetTypeMessage() {
        return (
            `<b>📃 Допустимые ставки:</b> ` +
            `<code>чр/черный</code>, ` +
            `<code>зл/зеленый</code>, ` +
            `<code>чт/четное</code>, ` +
            `<code>нч/нечетное</code>, ` +
            `<code>д1/дюжина1</code>, ` +
            `<code>д2/дюжина2</code>, ` +
            `<code>д3/дюжина3</code>`
        );
    }

    static getWinMessage(userName, payout, result, newBalance, commission, bookmaker, position) {
        const positionData = this.positionDictionary[position] || { name: "Игрок", emoji: "🎲", pronouns: "ты" };
        const positionEmoji = positionData.emoji;
        const pronouns = positionData.pronouns;

        return (
            `${positionEmoji} <b>${userName || "Игрок"}, ${pronouns === "ты" ? "ты ВЫИГРАЛ:" : "Вы ВЫИГРАЛИ:"}</b>` +
            `\n  –   <code>${formatCurrency(payout)}</code>` +
            `\n      (коммисия ${formatCurrency(commission)})` +
            `\n🎲 <b>Выпавший номер:</b>` +
            `\n  –   <code>${result.number} (${result.color})</code>` +
            `\n<b>💳 Баланс (${bookmaker}):</b>` +
            `\n  –   <code>${formatCurrency(newBalance)}</code>`
        );
    }

    static getLoseMessage(userName, betAmount, result, newBalance, bookmaker, position) {
        const positionData = this.positionDictionary[position] || { name: "Игрок", emoji: "🎲", pronouns: "ты" };
        const positionEmoji = positionData.emoji;
        const pronouns = positionData.pronouns;

        return (
            `${positionEmoji} <b>${userName || "Игрок"}, ${pronouns === "ты" ? "ты ПРОИГРАЛ:" : "Вы ПРОИГРАЛИ:"}</b>` +
            `\n  –   <code>${formatCurrency(betAmount)}</code>` +
            `\n🎲 <b>Выпавший номер:</b>` +
            `\n  –   <code>${result.number} (${result.color})</code>` +
            `\n<b>💳 Баланс (${bookmaker}):</b>` +
            `\n  –   <code>${formatCurrency(newBalance)}</code>`
        );
    }

    static getErrorMessage(errorMessage) {
        return `Произошла ошибка: ${errorMessage}`;
    }

    static getDepositHelpMessage() {
        return `<b>❔ Как пополнить баланс казино:</b>\n` + 
        `  –   Команда <code>пополнить казино [сумма]</code>`;
    }

    static getWithdrawHelpMessage() {
        return `<b>❔ Как вывести баланс из казино:</b>\n` + 
        `  –   Команда <code>вывести казино [сумма]</code>`;
    }

    static getDepositSuccessMessage(userName, amount, newCasinoBalance, newBankAmount) {
        return (
            `<b>✔️ ${userName} успешно пополнил баланс казино:</b>\n` +
            `  –   Сумма пополнения: <code>${amount}</code>\n` +
            `  –   Баланс казино: <code>${newCasinoBalance}</code>\n` +
            `  –   Баланс на банк. счете: <code>${newBankAmount}</code>`
        );
    }

    static getWithdrawSuccessMessage(userName, amount, newCasinoBalance, newBankAmount) {
        return (
            `<b>✔️ ${userName} успешно вывел баланс казино:</b>\n` +
            `  –   Сумма вывода: <code>${amount}</code>\n` +
            `  –   Баланс казино: <code>${newCasinoBalance}</code>\n` +
            `  –   Баланс на банк. счете: <code>${newBankAmount}</code>`
        );
    }

    static getBookmakerOptionsMessage(position, user) {
        const positionData = this.positionDictionary[position] || { name: "Игрок", emoji: "🎲", pronouns: "ты" };
        const pronouns = positionData.pronouns;
        return (
            `🃏 <b>${pronouns === "ты" ? "Выбери" : "Выберите"} букмекера (смена раз в сутки):</b>` +
            `\n  –   2Y: <code>малые шансы, высокая скорость</code>` +
            `\n  –   DOWNY: <code>большие шансы, низкая скорость</code>` +
            `\n  –   BLINOV: <code>большие шансы, высокая скорость</code>` +
            `\n  –   TUNDR9: <code>малые шансы, низкая скорость</code>`
        );
    }

    static getUnknownBookmakerMessage(bookmaker) {
        return (
            `🃏 <b>Неизвестный букмекер:</b> <code>${bookmaker}</code>` +
            `\n  –   Возможные букмекеры: <code>2Y</code>, <code>DOWNY</code>, <code>BLINOV</code>, <code>TUNDR9</code>`
        );
    }

    static getHoursLeftMessage(hoursLeft, position, user) {
        const positionData = this.positionDictionary[position] || { name: "Игрок", emoji: "🎲", pronouns: "ты" };
        const name = user.user_name;
        const pronouns = positionData.pronouns;
        return (
            `🃏 <b>${name}, ${pronouns === "ты" ? "ты можешь" : "Вы можете"} сменить букмекера только раз в сутки</b>` +
            `\n  –   Следующая смена будет доступна через: <code>${hoursLeft} часов</code>`
        );
    }

    static getBookmakerSelectedMessage(
        bookmaker,
        casino_chance,
        casino_commission,
        casino_coefficient,
        position,
        user
    ) {
        const positionData = this.positionDictionary[position] || { name: "Игрок", emoji: "🎲", pronouns: "ты" };
        const name = user.user_name;
        const pronouns = positionData.pronouns;
        return (
            `🃏 <b>${name}, ${
                pronouns === "ты" ? "ты выбрал" : "Вы выбрали"
            } букмекера:</b> <code>${bookmaker}</code>` +
            `\n  –   Описание: <code>${casino_chance}% шанс, комиссия: ${casino_commission}%</code>` +
            `\n  –   Коэффициент: <code>${casino_coefficient}</code>`
        );
    }

    static getErrorNoCasinoMessage(position, user) {
        const positionData = this.positionDictionary[position] || { name: "Игрок", emoji: "🎲", pronouns: "ты" };
        const name = user.user_name;
        const pronouns = positionData.pronouns;
        return (
            `<b>🫥 ${name}, ${pronouns === "ты" ? "ты не выбрал" : "Вы не выбрали"} букмекера :(</b>\n` +
            `  –   Команда: <code>букмекер [букмекер]</code>`
        );
    }

    static getIncorrectBetAmountMessage(option) {
        if (option == "%") {
            return `<b>Не, ☝🏼 указан некорректный процент ставки</b>`;
        }
        if (option == "0") {
            return `<b>Не, ☝🏼 нельзя поставить нулевую сумму ставки</b>`;
        }
        if (option == "incorrect") {
            return `<b>Не, ☝🏼 указана некорректная сумма ставки</b>`;
        }
        if (option == "betMoreThanCasino") {
            return `<b>Недостаточно баланса в казино</b>`;
        }
    }
}

export default CasinoView;
