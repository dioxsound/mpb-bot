const FORBIDDEN_USERNAMES = [
    /**
     * никнеймы админ. состава
     */
    "dioxsound",
    "kim2chin",
    "depre33ed_boy",
    /**
     * политики
     */
    "пут",
    "put",
    "tin",
    "тин",
    "зелен",
    "zelen",
    "байд",
    "bid",
    "трамп",
    "trump",
    "шойгу",
    "shoygu",
    "кад",
    "kad",
    /**
     * запрещёнка тг
     */
    "tg",
    "тг",
    "телега",
    "telega",
    "telegramm",
    "телеграмм",
    "porn",
    "порно",
    "цп",
    "cp",
    "gore",
    "гор",
    "snuff",
    "снафф",
    "дет",
    "child",
    /**
     * звания админ. и донат. состава
     */
    "созд",
    "creator",
    "dev",
    "дев",
    "админ",
    "admin",
    "vip",
    "вип",
    "владелец",
    "мод",
    "mod",
    "прав",
    "разр",
    "аза",
    "анд",
    "мат"
];



const MIN_BANK_BALANCE = 50000;
const USERNAME_LENGTH = { MIN: 3, MAX: 12 };
const CURRENCY_UPDATE_AMOUNT = 50000;

export { FORBIDDEN_USERNAMES, MIN_BANK_BALANCE, USERNAME_LENGTH, CURRENCY_UPDATE_AMOUNT };
