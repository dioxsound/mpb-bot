/** 
 *  Функция парса суммы денег в читаемый стринг,
 * пример: 4,900,000.00$
    @param {number} amount - сумма денег
 */
export default function formatCurrency(amount) {
    return (
        Number(amount).toLocaleString("en-US", {
            style: "decimal",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }) + "$"
    );
}
