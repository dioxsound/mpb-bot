import pool from "./config_model.js";

export default class BankService {
    static async findBankByUserId(userId, client = null) {
        const dbClient = client || (await pool.connect());
        try {
            const query = `SELECT * FROM bank WHERE "user_id" = $1`;
            const { rows } = await dbClient.query(query, [userId]);
            return rows[0] || null;
        } finally {
            if (!client) dbClient.release();
        }
    }

    /**
     * Обновляет банк пользователя
     * @param {string} user_id - Идентификатор пользователя
     * @param {number} newAmount - Число на которое меняется баланс
     */
    static async updateBankAmount(user_id, newAmount) {
        const updateQuery = `
                UPDATE bank
                SET "bank_amount" = $1
                WHERE "user_id" = $2
                RETURNING *;
            `;
        const values = [newAmount, user_id];
        const { rows } = await pool.query(updateQuery, values);
        return rows[0] || null;
    }
}
