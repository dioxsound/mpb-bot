const AMOUNT_SUFFIXES = {
    к: 1e3,
    тыс: 1e3,
    м: 1e6,
    млн: 1e6,
    б: 1e9,
    миллиард: 1e9,
    т: 1e12,
    трлн: 1e12,
    кв: 1e15,
    квадр: 1e15,
};

export default function parseAmount(amountStr) {
    const regex = /^(\d+(?:\.\d+)?)(к|тыс|м|млн|б|миллиард|т|трлн|кв|квадр)?$/i;
    const match = amountStr.trim().match(regex);

    if (!match) {
        throw new Error("Некорректная сумма перевода");
    }

    const amount = parseFloat(match[1]);
    const suffix = match[2] ? match[2].toLowerCase() : "";
    const multiplier = AMOUNT_SUFFIXES[suffix] || 1;
    return amount * multiplier;
}