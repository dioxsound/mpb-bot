import pool from "./config_model.js";

export default class BankService {
    /**
     * Получает банковские счета пользователя по userId.
     * @param {number|string} userId - Идентификатор пользователя.
     * @param {object} client - Клиент базы данных (опционально).
     * @returns {object|null} - Объект с банковскими счетами или null.
     */
    static async findBanksByUserId(userId, client = null) {
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
     * Получает баланс конкретного банковского счета пользователя.
     * @param {number|string} userId - Идентификатор пользователя.
     * @param {number} accountNumber - Номер счета (1 или 2).
     * @param {object} client - Клиент базы данных (опционально).
     * @returns {number|null} - Баланс счета или null.
     */
    static async findBankByUserIdAndAccount(userId, accountNumber, client = null) {
        const dbClient = client || (await pool.connect());
        try {
            let column;
            if (accountNumber === 1) {
                column = 'bank_acc_one';
            } else if (accountNumber === 2) {
                column = 'bank_acc_two';
            } else {
                throw new Error("Неверный номер банковского счета. Используйте 1 или 2.");
            }

            const query = `SELECT ${column} FROM bank WHERE "user_id" = $1`;
            const { rows } = await dbClient.query(query, [userId]);
            if (rows.length === 0) return null;
            return parseFloat(rows[0][column]);
        } finally {
            if (!client) dbClient.release();
        }
    }

    /**
     * Обновляет баланс конкретного банковского счета пользователя.
     * @param {number|string} userId - Идентификатор пользователя.
     * @param {number} accountNumber - Номер счета (1 или 2).
     * @param {number} newAmount - Новый баланс счета.
     * @param {object} client - Клиент базы данных (опционально).
     * @returns {object|null} - Обновленная запись банка или null.
     */
    static async updateBankAccount(userId, accountNumber, newAmount, client = null) {
        const dbClient = client || (await pool.connect());
        try {
            let column;
            if (accountNumber === 1) {
                column = 'bank_acc_one';
            } else if (accountNumber === 2) {
                column = 'bank_acc_two';
            } else {
                throw new Error("Неверный номер банковского счета. Используйте 1 или 2.");
            }

            const updateQuery = `
                UPDATE bank
                SET "${column}" = $1
                WHERE "user_id" = $2
                RETURNING *;
            `;
            const values = [newAmount, userId];
            const { rows } = await dbClient.query(updateQuery, values);
            return rows[0] || null;
        } finally {
            if (!client) dbClient.release();
        }
    }

    /**
     * Обновляет баланс банковских счетов пользователя.
     * @param {number|string} userId - Идентификатор пользователя.
     * @param {object} newBalances - Объект с новыми балансами счетов { bank_acc_one, bank_acc_two }.
     * @returns {object|null} - Обновленная запись банка или null.
     */
    static async updateBankBalances(userId, newBalances, client = null) {
        const dbClient = client || (await pool.connect());
        try {
            const { bank_acc_one, bank_acc_two } = newBalances;
            const updateQuery = `
                UPDATE bank
                SET "bank_acc_one" = $1,
                    "bank_acc_two" = $2
                WHERE "user_id" = $3
                RETURNING *;
            `;
            const values = [bank_acc_one, bank_acc_two, userId];
            const { rows } = await dbClient.query(updateQuery, values);
            return rows[0] || null;
        } finally {
            if (!client) dbClient.release();
        }
    }
}
