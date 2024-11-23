const AMOUNT_SUFFIXES = {
    тыс: 1e3,
    к: 1e3,
    млн: 1e6,
    м: 1e6,
    миллиард: 1e9,
    б: 1e9,
    трлн: 1e12,
    т: 1e12,
    квадр: 1e15,
    кв: 1e15,
};

const ALL_KEYWORDS = ["все", "всё", "all"];

export default function parseAmount(amountStr, balance = 0, options = { allowAll: false, checkBalance: true }) {
    const trimmed = amountStr.trim().toLowerCase();

    if (options.allowAll && ALL_KEYWORDS.includes(trimmed)) {
        if (balance === 0) {
            const error = new Error("Нельзя использовать нулевую сумму.");
            error.code = "balance_parse";
            throw error;
        }
        return balance;
    }

    if (trimmed.includes("%")) {
        if (!balance) {
            const error = new Error("Необходим баланс для расчета процента.");
            error.code = "balance_parse";
            throw error;
        }

        const percentageMatch = trimmed.match(/^(\d+(?:\.\d+)?)%$/);
        if (!percentageMatch) {
            const error = new Error("Некорректный формат процента.");
            error.code = "balance_parse";
            throw error;
        }
        const percentage = parseFloat(percentageMatch[1]);
        if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
            const error = new Error("Некорректное значение процента.");
            error.code = "balance_parse";
            throw error;
        }
        const calculatedAmount = (balance * percentage) / 100;
        if (calculatedAmount === 0) {
            if (balance === 0) {
                const error = new Error("Нельзя использовать нулевую сумму.");
                error.code = "balance_parse";
                throw error;
            }
            const error = new Error("Процент слишком мал для расчета суммы.");
            error.code = "balance_parse";
            throw error;
        }
        return calculatedAmount;
    }

    const regex = /^(\d+(?:\.\d+)?)(к|тыс|м|млн|б|миллиард|т|трлн|кв|квадр)?$/i;
    const match = trimmed.match(regex);

    if (!match) {
        const error = new Error("Некорректная сумма.");
        error.code = "balance_parse";
        throw error;
    }

    const amount = parseFloat(match[1]);
    const suffix = match[2] ? match[2].toLowerCase() : "";
    const multiplier = AMOUNT_SUFFIXES[suffix] || 1;
    const finalAmount = amount * multiplier;

    if (isNaN(finalAmount) || finalAmount <= 0) {
        const error = new Error("Некорректная сумма.");
        error.code = "balance_parse";
        throw error;
    }

    if (options.checkBalance && finalAmount > balance) {
        const error = new Error("Сумма превышает доступный баланс.");
        error.code = "balance_parse";
        throw error;
    }

    return finalAmount;
}
