
export default class LeaderboardBankView {

    static headerMessage() {
        return "💰 <b>ТОП 10 ПО БАЛАНСУ БАНКА:</b>\n————————————————————\n";
    }

    static topPlayerEntry(medal, username, user_id, total) {
        return `${medal} <b><a href="tg://user?id=${user_id}">${username}</a>:</b> <code>${total}</code>\n`;
    }


    static regularPlayerEntry(rank, username, user_id, total) {
        return `[${rank}]  <b><a href="tg://user?id=${user_id}">${username}</a>:</b> <code>${total}</code>\n`;

    }

    static emptyLeaderboardMessage() {
        return "Топ-лист игроков по балансу пока пуст.";
    }

 
    static errorMessage() {
        return "<b>Произошла ошибка при получении топ-листа. Пожалуйста, попробуйте позже.</b>";
    }
}
