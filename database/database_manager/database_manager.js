import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../config_model.js";
import isDeveloper from "../../services/is_developer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class DatabaseManager {
    /**
     * Выполняет SQL-запрос из указанного файла.
     * @param {string} fileName - Имя SQL-файла.
     * @param {string} successMessage - Сообщение при успешном выполнении.
     * @param {object} context - Контекст для отправки сообщения.
     */
    static async executeSqlFile(fileName, successMessage, context) {
        try {
            const sqlFilePath = path.join(__dirname, fileName);
            const sqlContent = fs.readFileSync(sqlFilePath, "utf-8");
            await pool.query(sqlContent);
            context.send(successMessage, { parse_mode: "HTML" });
        } catch (error) {
            
            console.error(`Ошибка при выполнении ${fileName}:`, error);
            context.send(`Произошла ошибка при выполнении операции`, { parse_mode: "HTML" });
        }
    }

    /**
     * Инициализирует базу данных, создавая необходимые таблицы.
     * @param {object} context - Контекст для проверки прав и отправки сообщений.
     */
    static async createTables(context) {
        if (isDeveloper(context.from.id)) {
            await DatabaseManager.executeSqlFile("create_tables.sql", `<b>Таблицы успешно созданы :D</b>`, context);
        } else {
            return null;
        }
    }

    /**
     * Удаляет таблицы из базы данных.
     * @param {object} context - Контекст для проверки прав и отправки сообщений.
     */
    static async removeTables(context) {
        if (isDeveloper(context.from.id)) {
            await DatabaseManager.executeSqlFile("remove_tables.sql", `<b>Таблицы успешно удалены >:)</b>`, context);
        } else {
            return null;
        }
    }
}
