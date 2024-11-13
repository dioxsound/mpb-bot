import pool from "./config_model.js";

export default class UserService {
    /**
     * Добавляет пользователя в таблицы, если его еще нет
     * @param {object} context - Контекст пользователя
     */
    static async addUserIfNotExists(context) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            const userExists = await UserService.findUserById(context.from.id, client);
            if (!userExists) {
                const uniqueBankID = await IDGenerator.generateUniqueBankID(client);
                const uniquePassport = await IDGenerator.generateUniquePassport(client);
                const currentDate = new Date().toISOString().split("T")[0];

                await UserService.createUser(context.from.id, uniquePassport, currentDate, client);
                await UserService.createBankAccount(uniqueBankID, context.from.id, client);
            }

            await client.query("COMMIT");
        } catch (error) {
            await client.query("ROLLBACK");
            console.error("Ошибка добавления пользователя:", error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Ищет пользователя по ID
     * @param {number} userId - Идентификатор пользователя
     * @param {object} client - Клиент базы данных
     * @returns {object|null} Пользователь или null
     */
    static async findUserById(userId, client = null) {
        const dbClient = client || (await pool.connect());
        try {
            const query = `SELECT * FROM people WHERE "user_id" = $1`;
            const { rows } = await dbClient.query(query, [userId]);
            return rows[0] || null;
        } finally {
            if (!client) dbClient.release();
        }
    }

    /**
     * Находит пользователя по паспортному номеру
     * @param {string} user_passport - Паспортный номер пользователя
     * @param {object} client - Клиент базы данных
     * @returns {object|null} Пользователь или null
     */
    static async findUserByPassport(user_passport, client = pool) {
        const findUserQuery = `
            SELECT * FROM people
            WHERE "user_passport" = $1
        `;
        const result = await client.query(findUserQuery, [user_passport]);
        return result.rows[0] || null;
    }

    /**
     * Создаёт нового пользователя
     * @param {number} userId - Идентификатор пользователя
     * @param {string} passport - Паспортный номер пользователя
     * @param {string} spawnDate - Дата создания пользователя
     * @param {object} client - Клиент базы данных
     */
    static async createUser(userId, passport, spawnDate, client) {
        const insertQuery = `
            INSERT INTO people ("user_id", "user_name", "user_level", "user_position", "user_passport", "user_status", "date_spawn")
            VALUES ($1, DEFAULT, DEFAULT, DEFAULT, $2, DEFAULT, $3)
            RETURNING *
        `;
        await client.query(insertQuery, [userId, passport, spawnDate]);
    }

    /**
     * Создаёт банковский счёт для пользователя
     * @param {string} bankId - Уникальный идентификатор банковского счёта
     * @param {number} userId - Идентификатор пользователя
     * @param {object} client - Клиент базы данных
     */
    static async createBankAccount(bankId, userId, client) {
        const insertQuery = `
            INSERT INTO bank ("bank_id", "bank_amount", "user_id")
            VALUES ($1, DEFAULT, $2)
        `;
        await client.query(insertQuery, [bankId, userId]);
    }


    /**
     * Ищет банк пользователя по банковскому счету
     * @param {string} bankId - Уникальный идентификатор банковского счёта
     * @param {object} client - Клиент базы данных
     * @returns {object|null} Пользователь или null
     */
    static async findUserByBankId(bankId, client = null) {
        const dbClient = client || (await pool.connect());
        try {
            const query = `SELECT * FROM bank WHERE "bank_id" = $1`;
            const { rows } = await dbClient.query(query, [bankId]);
            return rows[0] || null;
        } finally {
            if (!client) dbClient.release();
        }
    }

    /**
     * Ищет пользователя по номеру паспорта
     * @param {string} passport - Паспортный номер пользователя
     * @param {object} client - Клиент базы данных
     * @returns {object|null} Пользователь или null
     */
    static async findUserByPassport(passport, client = null) {
        const dbClient = client || (await pool.connect());
        try {
            const query = `SELECT * FROM people WHERE "user_passport" = $1`;
            const { rows } = await dbClient.query(query, [passport]);
            return rows[0] || null;
        } finally {
            if (!client) dbClient.release();
        }
    }
}

class IDGenerator {
    /**
     * Генерирует уникальный bank_id
     * @param {object} client - Клиент базы данных
     * @returns {string} Уникальный bank_id
     */
    static async generateUniqueBankID(client) {
        while (true) {
            const bankId = Math.floor(Math.random() * 10 ** 16)
                .toString()
                .padStart(16, "0");

            const existingUser = await UserService.findUserByBankId(bankId, client);
            if (!existingUser) {
                return bankId;
            }
        }
    }

    /**
     * Генерирует уникальный паспортный номер
     * @param {object} client - Клиент базы данных
     * @returns {string} Уникальный паспортный номер
     */
    static async generateUniquePassport(client) {
        const digits = "0123456789";
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        while (true) {
            let passport = "";
            for (let i = 0; i < 6; i++) {
                passport +=
                    i % 2 === 0
                        ? digits[Math.floor(Math.random() * digits.length)]
                        : letters[Math.floor(Math.random() * letters.length)];
            }

            const existingUser = await UserService.findUserByPassport(passport, client);
            if (!existingUser) {
                return passport;
            }
        }
    }
}
