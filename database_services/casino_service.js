import pool from "./config_model.js";
import BankService from "./bank_service.js"; // Убедитесь, что путь правильный

export default class CasinoService {
    /**
     * Добавляет или обновляет информацию о букмекере пользователя.
     * @param {number|string} userId - Идентификатор пользователя.
     * @param {string} casino_bookmaker - Выбранный букмекер.
     * @param {number} casino_coefficient - Коэффициент букмекера.
     * @param {number} casino_chance - Шанс букмекера.
     * @param {number} casino_commission - Комиссия букмекера.
     */
    static async addOrUpdateUserBookmaker(
        userId,
        casino_bookmaker,
        casino_coefficient,
        casino_chance,
        casino_commission
    ) {
        const query = `
            INSERT INTO casino (user_id, casino_bookmaker, casino_coefficient, casino_chance, casino_commission, last_change)
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id) 
            DO UPDATE SET 
                casino_bookmaker = EXCLUDED.casino_bookmaker,
                casino_coefficient = EXCLUDED.casino_coefficient,
                casino_chance = EXCLUDED.casino_chance,
                casino_commission = EXCLUDED.casino_commission,
                last_change = CURRENT_TIMESTAMP
        `;
        const values = [userId, casino_bookmaker, casino_coefficient, casino_chance, casino_commission];
        await pool.query(query, values);
    }

    /**
     * Обновляет баланс казино пользователя.
     * @param {number|string} userId - Идентификатор пользователя.
     * @param {number} newBalance - Новый баланс казино.
     * @returns {object} - Обновлённая запись казино.
     */
    static async updateCasinoBalance(userId, newBalance) {
        const query = `
            UPDATE casino
            SET "casino_balance" = $1
            WHERE "user_id" = $2
            RETURNING *;
        `;
        const values = [newBalance, userId];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    /**
     * Пополняет баланс казино пользователя с выбранного банковского счета.
     * @param {number|string} userId - Идентификатор пользователя.
     * @param {number} bankAcc - Номер банковского счета (1 или 2).
     * @param {number} amount - Сумма пополнения.
     * @returns {object} - Новые балансы банка и казино.
     */
    static async depositToCasino(userId, bankAcc, amount) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // Получаем текущий баланс выбранного банковского счета
            const currentBankAmount = await BankService.findBankByUserIdAndAccount(userId, bankAcc, client);
            if (currentBankAmount === null) {
                throw new Error("Пользователь не найден в банковской системе.");
            }

            if (currentBankAmount < amount) {
                throw new Error("Недостаточно средств на выбранном банковском счёте для пополнения казино.");
            }

            const newBankAmount = currentBankAmount - amount;
            await BankService.updateBankAccount(userId, bankAcc, newBankAmount, client);

            // Обновляем баланс казино
            const casinoResult = await client.query(
                `SELECT "casino_balance" FROM casino WHERE "user_id" = $1 FOR UPDATE;`,
                [userId]
            );
            if (casinoResult.rows.length === 0) {
                throw new Error("Пользователь не найден в казино.");
            }
            const currentCasinoBalance = parseFloat(casinoResult.rows[0].casino_balance);
            const newCasinoBalance = currentCasinoBalance + amount;

            await client.query(`UPDATE casino SET "casino_balance" = $1 WHERE "user_id" = $2;`, [
                newCasinoBalance,
                userId,
            ]);

            await client.query("COMMIT");

            return { newBankAmount, newCasinoBalance };
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Выводит средства из баланса казино пользователя на выбранный банковский счет.
     * @param {number|string} userId - Идентификатор пользователя.
     * @param {number} bankAcc - Номер банковского счета (1 или 2).
     * @param {number} amount - Сумма вывода.
     * @returns {object} - Новые балансы банка и казино.
     */
    static async withdrawFromCasino(userId, bankAcc, amount) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // Обновляем баланс казино
            const casinoResult = await client.query(
                `SELECT "casino_balance" FROM casino WHERE "user_id" = $1 FOR UPDATE;`,
                [userId]
            );
            if (casinoResult.rows.length === 0) {
                throw new Error("Пользователь не найден в казино.");
            }
            const currentCasinoBalance = parseFloat(casinoResult.rows[0].casino_balance);

            if (currentCasinoBalance < amount) {
                throw new Error("Недостаточно средств в казино для вывода.");
            }

            const newCasinoBalance = currentCasinoBalance - amount;
            await client.query(`UPDATE casino SET "casino_balance" = $1 WHERE "user_id" = $2;`, [
                newCasinoBalance,
                userId,
            ]);

            // Обновляем выбранный банковский счет
            const currentBankAmount = await BankService.findBankByUserIdAndAccount(userId, bankAcc, client);
            if (currentBankAmount === null) {
                throw new Error("Пользователь не найден в банковской системе.");
            }

            const newBankAmount = currentBankAmount + amount;
            await BankService.updateBankAccount(userId, bankAcc, newBankAmount, client);

            await client.query("COMMIT");

            return { newBankAmount, newCasinoBalance };
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Получает время последнего изменения букмекера пользователя.
     * @param {number|string} userId - Идентификатор пользователя.
     * @returns {Date|null} - Дата последнего изменения или null.
     */
    static async getLastBookmakerChange(userId) {
        const casinoData = await CasinoService.findCasinoByUserID(userId);
        return casinoData ? casinoData.last_change : null;
    }

    /**
     * Находит запись казино по user_id.
     * @param {string} user_id - Идентификатор пользователя.
     * @returns {object|null} - Запись из казино или null.
     */
    static async findCasinoByUserID(user_id) {
        const query = `SELECT * FROM casino WHERE "user_id" = $1;`;
        const { rows } = await pool.query(query, [user_id]);
        return rows[0] || null;
    }
}
