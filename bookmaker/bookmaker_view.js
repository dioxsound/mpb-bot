class BookmakerView {
    static positionDictionary = {
        1: { emoji: "🧟‍♂️", pronouns: "ты" },
        2: { emoji: "🎭", pronouns: "ты" },
        3: { emoji: "⛩", pronouns: "ты" },
        4: { emoji: "🫴🏼", pronouns: "Вы" },
        5: { emoji: "🤴🏻", pronouns: "Вы" },
    };

    static getBookmakerOptionsMessage(position, casinoData) {
        const positionData = this.positionDictionary[position] || { name: "Игрок", emoji: "🎲", pronouns: "ты" };
        const pronouns = positionData.pronouns;
        if (!casinoData) return (
            `🃏 <b>${pronouns === "ты" ? "Выбери" : "Выберите"} букмекера (смена раз в сутки):</b>` +
            `\n  –   100XBET: <code>доп. коэфф.: 1.5x, комиссия: 30%</code>` +
            `\n  –   SPARTAK: <code>доп. коэфф.: 0x, комиссия: 5%</code>` +
            `\n  –   BETBANG: <code>доп. коэфф.: 1.25x, комиссия: 15%</code>` +
            `\n  –   LEVONRU: <code>доп. коэфф.: 0x, комиссия: 5%</code>`
        );

        return (
            `🃏 <b>Текущий букмекер:</b> <code>${casinoData.casino_bookmaker}</code>\n` +
            `      (доп. коэфф.: ${casinoData.casino_coefficient}x, комиссия: ${casinoData.casino_commission}%)\n` +
            `  –   Другие букмекеры (смена раз в сутки):\n` +
            `  –   SPARTAK: <code>доп. коэфф.: 0x, комиссия: 5%</code>\n` +
            `  –   BETBANG: <code>доп. коэфф.: 1.25x, комиссия: 15%</code>\n` +
            `  –   LEVONRU: <code>доп. коэфф.: 0x, комиссия: 5%</code>\n`
        );
    }

    static getUnknownBookmakerMessage(bookmaker) {
        return (
            `🃏 <b>Неизвестный букмекер:</b> <code>${bookmaker}</code>` +
            `\n  –   Возможные букмекеры: <code>100XBET</code>, <code>SPARTAK</code>, <code>BETBANG</code>, <code>LEVONRU</code>`
        );
    }

    static getHoursLeftMessage(hoursLeft, position, user) {
        // Вспомогательная функция для склонения слова "час"
        function getHourWord(hours) {
            const lastDigit = hours % 10;
            const lastTwoDigits = hours % 100;
    
            if (lastDigit === 1 && lastTwoDigits !== 11) {
                return 'час';
            } else if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) {
                return 'часа';
            } else {
                return 'часов';
            }
        }
    
        const positionData = this.positionDictionary[position] || { name: "Игрок", emoji: "🎲", pronouns: "ты" };
        const name = user.user_name;
        const pronouns = positionData.pronouns;
        const hourWord = getHourWord(hoursLeft);
    
        return (
            `🃏 <b>${name}, ${pronouns === "ты" ? "ты можешь" : "Вы можете"} сменить букмекера только раз в сутки</b>` +
            `\n  –   Следующая смена будет доступна через: <code>${hoursLeft} ${hourWord}</code>`
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
            } букмекера:</b> <code>${bookmaker}</code>\n` +
            `      (доп. коэфф.: ${casino_coefficient}x, комиссия: ${casino_commission}%)`
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
}

export default BookmakerView;
