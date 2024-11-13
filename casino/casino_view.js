// views/casino_view.js

import formatCurrency from "../services/format_currency.js";

class CasinoView {
    static positionDictionary = {
        1: { name: "Гореносец", emoji: "🧟‍♂️", pronouns: "ты" },
        2: { name: "Изувер", emoji: "🎭", pronouns: "ты" },
        3: { name: "Местный Бог", emoji: "⛩", pronouns: "ты" },
        4: { name: "Правая рука", emoji: "🫴🏼", pronouns: "ты" },
        5: { name: "Созидатель", emoji: "🤴🏻", pronouns: "Вы" },
    };

    static getHelpMessage() {
        return (
            "Для игры в казино введи команду в формате:\n" +
            "казино [тип ставки] [сумма/все/процент/суффикс]\n\n" +
            "Примеры:\n" +
            "казино кр 100\n" +
            "казино д1 все\n" +
            "казино зеленый 10млн\n" +
            "казино черный 50%\n\n" +
            "Допустимые типы суффиксов:\n" +
            "к = 1,000.00 | млн = 1,000,000.00 | млрд = 1,000,000,000.00 | трлн = 1,000,000,000,000.00 | квадр = 1,000,000,000,000,000.00\n" +
            "Допустимые типы ставок:\n" +
            "кр/красный | чр/черный | зл/зеленый | чт/четное | нч/нечетное | д1/дюжина1 | д2/дюжина2 | д3/дюжина3"
        );
    }

    static getInvalidBetTypeMessage() {
        return (
            "Пожалуйста, укажи корректный тип ставки:\n" +
            "кр/красный | чр/черный | зл/зеленый | чт/четное | нч/нечетное | д1/дюжина1 | д2/дюжина2 | д3/дюжина3"
        );
    }

    static getWinMessage(userName, payout, result, newBalance, commission, bookmaker, position) {
        const positionData = this.positionDictionary[position] || { name: "Игрок", emoji: "🎲", pronouns: "ты" };
        const positionEmoji = positionData.emoji;
        const pronouns = positionData.pronouns;

        // Adjust the winning message format based on pronouns
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

        // Adjust the losing message format based on pronouns
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
        return `<b>❔ Как пополнить баланс казино:</b>\n` + `  –   <code>пополнить казино <сумма></code>`;
    }

    static getWithdrawHelpMessage() {
        return `<b>❔ Как вывести баланс из казино:</b>\n` + `  –   <code>вывести казино <сумма></code>`;
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

    static getBookmakerOptionsMessage() {
        return (
            `🃏 <b>Выберите букмекера (смена раз в сутки):</b>` +
            `\n  –   2Y: <code>малые шансы, высокая скорость</code>` +
            `\n  –   DOWNY: <code>большие шансы, низкая скорость</code>` +
            `\n  –   BLINOV: <code>большие шансы, высокая скорость</code>` +
            `\n  –   TUNDR9: <code>малые шансы, низкая скорость</code>`
        );
    }

    static getUnknownBookmakerMessage(bookmaker) {
        return (
            `🃏 <b>Неизвестный букмекер:</b> <code>${bookmaker}</code>` +
            `\n  –   Пожалуйста, выберите одного из предложенных букмекеров.`
        );
    }

    static getHoursLeftMessage(hoursLeft) {
        return (
            `🃏 <b>Вы можете сменить букмекера только раз в сутки</b>` +
            `\n  –   Следующая смена будет доступна через: <code>${hoursLeft} часов</code>`
        );
    }

    static getBookmakerSelectedMessage(bookmaker, casino_chance, casino_commission, casino_coefficient) {
        return (
            `🃏 <b>Вы выбрали букмекера:</b> <code>${bookmaker}</code>` +
            `\n  –   Описание: <code>${casino_chance}% шанс, комиссия: ${casino_commission}%</code>` +
            `\n  –   Коэффициент: <code>${casino_coefficient}</code>`
        );
    }

    static getErrorNoCasinoMessage() {
        return (
            "Вы не выбрали букмекера. Пожалуйста, выберите букмекера командой <code>букмекер</code>."
        );
    }
}

export default CasinoView;
