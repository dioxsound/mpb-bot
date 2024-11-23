import pool from "../../database_services/config_model.js";
import UsernameSaleListView from "./username_list_view.js";

export default class UsernameListModel {
    static async listSales(context) {
        try {
            const client = await pool.connect();
            try {
                const query = `
                    SELECT * FROM username_sales
                    WHERE listed_at >= NOW() - INTERVAL '1 day'
                `;
                const { rows } = await client.query(query);

                if (rows.length === 0) {
                    return await context.reply(UsernameSaleListView.noSales(), { parse_mode: "HTML" });
                }

                await context.reply(UsernameSaleListView.salelist(rows), { parse_mode: "HTML" });
            } finally {
                client.release();
            }
        } catch (error) {
            console.error("Ошибка при получении списка никнеймов на продажу:", error);
            await context.reply("Произошла ошибка при получении списка никнеймов на продажу.");
        }
    }
}
