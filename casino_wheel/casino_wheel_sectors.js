export default class CasinoWheelSectors {
    static SECTORS = Array.from({ length: 37 }, (_, i) => ({
        number: i,
        color: i === 0 ? "green" : i % 2 === 0 ? "black" : "red",
    }));

    static VALID_BET_TYPES = new Set([
        "красный",
        "черный",
        "зеленый",
        "четное",
        "нечетное",
        "дюжина1",
        "дюжина2",
        "дюжина3",
    ]);

    static BET_TYPE_PATTERNS = [
        // Красный
        { pattern: /^кр(асн(ый)?)?$/i, standardType: "красный" },
        { pattern: /^красн(?:ое|ый)$/i, standardType: "красный" },
        // Черный
        { pattern: /^чр$/i, standardType: "черный" },
        { pattern: /^ч[её]рн(?:ый)?$/i, standardType: "черный" },
        { pattern: /^чорн(?:ый)?$/i, standardType: "черный" },
        // Зеленый
        { pattern: /^зл$/i, standardType: "зеленый" },
        { pattern: /^зелен(?:ый|ое)$/i, standardType: "зеленый" },
        { pattern: /^зелн[ь]$/i, standardType: "зеленый" },
        // Четное
        { pattern: /^чт$/i, standardType: "четное" },
        { pattern: /^четн?(?:ое)?$/i, standardType: "четное" },
        { pattern: /^чётн?(?:ое)?$/i, standardType: "четное" },
        { pattern: /^чтн?(?:ое)?$/i, standardType: "четное" },
        // Нечетное
        { pattern: /^нч$/i, standardType: "нечетное" },
        { pattern: /^неч$/i, standardType: "нечетное" },
        { pattern: /^нечетн?(?:ое)?$/i, standardType: "нечетное" },
        { pattern: /^нчт?(?:ое)?$/i, standardType: "нечетное" },
        // Дюжина1
        { pattern: /^д1$/i, standardType: "дюжина1" },
        { pattern: /^дюж(?:ина)?1$/i, standardType: "дюжина1" },
        // Дюжина2
        { pattern: /^д2$/i, standardType: "дюжина2" },
        { pattern: /^дюж(?:ина)?2$/i, standardType: "дюжина2" },
        // Дюжина3
        { pattern: /^д3$/i, standardType: "дюжина3" },
        { pattern: /^дюж(?:ина)?3$/i, standardType: "дюжина3" },
    ];

    static mapBetType(input) {
        for (const { pattern, standardType } of this.BET_TYPE_PATTERNS) {
            if (pattern.test(input)) {
                return standardType;
            }
        }
        return null;
    }
}
