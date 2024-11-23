// username_service.js
import pool from "./config_model.js";

export default class UsernameService {
    static async createSale(userId, user_name, salePrice, client = null) {
        const dbClient = client || (await pool.connect());
        try {
            const query = `
                INSERT INTO username_sales ("user_id", "user_name", "sale_price", "listed_at")
                VALUES ($1, $2, $3, NOW())
                RETURNING *
            `;
            const values = [userId, user_name, salePrice];
            const { rows } = await dbClient.query(query, values);
            return rows[0];
        } finally {
            if (!client) dbClient.release();
        }
    }

    static async removeSale(saleId, client = null) {
        const dbClient = client || (await pool.connect());
        try {
            const query = `DELETE FROM username_sales WHERE "sale_id" = $1`;
            await dbClient.query(query, [saleId]);
        } finally {
            if (!client) dbClient.release();
        }
    }

    static async removeSaleByUserId(userId, client) {
        const query = `DELETE FROM username_sales WHERE user_id = $1`;
        const values = [userId];
        await client.query(query, values);
    }

    static async findSaleByUsername(user_name, client = null) {
        const dbClient = client || (await pool.connect());
        try {
            const query = `SELECT * FROM username_sales WHERE LOWER(user_name) = LOWER($1) LIMIT 1`;
            const values = [user_name];
            const res = await pool.query(query, values);
            return res.rows[0];
        } finally {
            if (!client) dbClient.release();
        }
    }

    static async findSaleByUsername(user_name, client = null) {
        const dbClient = client || (await pool.connect());
        try {
            const query = `SELECT * FROM username_sales WHERE LOWER(user_name) = LOWER($1) LIMIT 1`;
            const values = [user_name];
            const res = await dbClient.query(query, values);
            return res.rows[0] || null;
        } finally {
            if (!client) dbClient.release();
        }
    }

    static async isUserSelling(userId, client = null) {
        const dbClient = client || (await pool.connect());
        try {
            const query = `SELECT * FROM username_sales WHERE "user_id" = $1`;
            const { rows } = await dbClient.query(query, [userId]);
            return rows.length > 0;
        } finally {
            if (!client) dbClient.release();
        }
    }

    static async updateUsername(newUserName, userId, client = null) {
        const dbClient = client || (await pool.connect());
        try {
            const query = `
                UPDATE people
                SET "user_name" = $1
                WHERE "user_id" = $2
                RETURNING *
            `;
            const { rows } = await dbClient.query(query, [newUserName, userId]);
            return rows[0] || null;
        } finally {
            if (!client) dbClient.release();
        }
    }
}
