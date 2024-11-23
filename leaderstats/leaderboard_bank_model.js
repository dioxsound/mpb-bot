import pool from "../database_services/config_model.js";
import LeaderboardBankView from "./leaderboard_bank_view.js";
import UserService from "../database_services/user_service.js";

export default class LeaderboardBankModel {

    static async getTopPlayers() {
        const query = `SELECT 
            p.user_name AS "user", 
            p.user_id,
            b.bank_acc_one + b.bank_acc_two AS "Total"
        FROM 
            bank b
        JOIN 
            people p ON b.user_id = p.user_id
        ORDER BY 
            "Total" DESC
        LIMIT 10;`;
        try {
            const { rows } = await pool.query(query);
            return rows.length > 0 ? rows : [];
        } catch (error) {
            console.error('Ошибка при выполнении запроса getTopPlayers:', error);
            throw error;
        }
    }

    static formatNumber(number) {
        if (number >= 1_000_000_000_000) {
            return `${(number / 1_000_000_000_000).toFixed(2)} трлн$`;
        } else if (number >= 1_000_000_000) {
            return `${(number / 1_000_000_000).toFixed(2)} млрд$`;
        } else if (number >= 1_000_000) {
            return `${(number / 1_000_000).toFixed(2)} млн$`;
        } else if (number >= 1_000) {
            return `${(number / 1_000).toFixed(2)} тыс$`;
        } else {
            return `${number.toFixed(2)}$`;
        }
    }

    static async sendTopPlayers(context) {
        await UserService.addUserIfNotExists(context)
        try {
            const leaders = await LeaderboardBankModel.getTopPlayers();
            if (leaders.length === 0) {
                return context.reply(LeaderboardBankView.emptyLeaderboardMessage());
            }
            let message = LeaderboardBankView.headerMessage();
            leaders.forEach((leader, index) => {
                const formattedTotal = LeaderboardBankModel.formatNumber(parseFloat(leader.Total));
                if (index === 0) {
                    message += LeaderboardBankView.topPlayerEntry('🥇', leader.user, leader.user_id, formattedTotal);
                } else if (index === 1) {
                    message += LeaderboardBankView.topPlayerEntry('🥈', leader.user, leader.user_id, formattedTotal);
                } else if (index === 2) {
                    message += LeaderboardBankView.topPlayerEntry('🥉', leader.user, leader.user_id, formattedTotal);
                } else {
                    message += LeaderboardBankView.regularPlayerEntry(index + 1, leader.user, leader.user_id, formattedTotal);
                }
            });

            await context.reply(message, { parse_mode: "HTML" });
        } catch (error) {
            console.error('Ошибка при отправке топ-листа:', error);
            await context.reply(LeaderboardBankView.errorMessage(), { parse_mode: "HTML" });
        }
    }
}
