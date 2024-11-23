import formatCurrency from "../../services/format_currency.js";

export default class UsernameSaleListView {
    static salelist(rows) {
        let response = "🪪 <b>Продающиеся никнеймы:</b>\n";
        rows.forEach((sale) => {
            response += `  –   <code>${sale.user_name}</code>: ${formatCurrency(sale.sale_price)}\n`;
        });
        return response
    }

    static noSales() {
        return `🪪 <b>Нет никаких никнеймов на продажу</b>\n`
    }
}