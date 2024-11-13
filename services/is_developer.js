import "dotenv/config";

const devIDs = process.env.DEV_IDS.split(",").map((id) => parseInt(id.trim(), 10));
/** 
 *  Функция распознования разработчика, возвращающая булево
    @param {number} userId - идентификатор пользователя
    @returns {boolean} True или False
 */
export default function isDeveloper(userId) {
    return devIDs.includes(userId);
}
