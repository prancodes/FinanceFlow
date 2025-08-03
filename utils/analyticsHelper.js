import { Account } from "../models/Account.model.js";
import CustomError from "./CustomError.js";
export async function getAccountAnalytics(accountId,year)
{
    const selectedYear=year?parseInt(year):new Date().getFullYear();
    if(isNaN(selectedYear)){
        res.status(400).json({message:"Invalid year provided."});
    }
    const startDate = new Date(`${selectedYear}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${selectedYear}-12-31T23:59:59.999Z`);
    const account = await Account.findById(accountId).populate({
        path: "transactions",
        match: { type: "Expense", date: { $gte: startDate, $lte: endDate } },
      });
    
    if (!account) throw new CustomError(404, "Account not found.");
    const expensesByCategory = account.transactions.reduce((acc, transaction) => {
        const category = transaction.category || 'General';
        const amount = parseFloat(transaction.amount.toString());
        acc[category] = (acc[category] || 0) + amount;
        return acc;
      }, {});
      
      const totalSpending = account.transactions.reduce((sum, txn) => sum + parseFloat(txn.amount.toString()), 0);
    
      return {
        accountName: account.name,
        currentBalance: parseFloat(account.balance.toString()),
        totalSpending: totalSpending,
        expensesByCategory,
        year: selectedYear,
      };
}
export function formatAnalyticsForWhatsapp(data) {
    let message = `📊 *Financial Report for ${data.accountName} (${data.year})*\n\n`;
    message += `💰 *Current Balance:* ₹${data.currentBalance.toFixed(2)}\n`;
    message += `💸 *Total Spending:* ₹${data.totalSpending.toFixed(2)}\n\n`;
    message += `*Spending by Category:*\n`;
  
    const categories = Object.entries(data.expensesByCategory)
      .filter(([, amount]) => amount > 0) 
      .sort(([, a], [, b]) => b - a); 
    if (categories.length === 0) {
      message += `_No spending recorded for ${data.year}._`;
    } else {
      categories.forEach(([category, amount]) => {
        message += `  - ${category}: ₹${amount.toFixed(2)}\n`;
      });
    }
    
    return message;
  }
  