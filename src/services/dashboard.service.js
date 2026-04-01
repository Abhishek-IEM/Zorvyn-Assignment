import { FinancialRecord } from "../models/FinancialRecord.js";
import { buildRecordFilter } from "./record.service.js";

async function getDashboardSummary(query) {
  const match = buildRecordFilter(query);

  const [totalsByType, totalsByCategory, recentTransactions, monthlyTrends] =
    await Promise.all([
      FinancialRecord.aggregate([
        { $match: match },
        { $group: { _id: "$type", total: { $sum: "$amount" } } },
      ]),
      FinancialRecord.aggregate([
        { $match: match },
        { $group: { _id: "$category", total: { $sum: "$amount" } } },
        { $sort: { total: -1 } },
      ]),
      FinancialRecord.find(match)
        .sort({ recordDate: -1, createdAt: -1 })
        .limit(5)
        .lean(),
      FinancialRecord.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              year: { $year: "$recordDate" },
              month: { $month: "$recordDate" },
            },
            income: {
              $sum: {
                $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
              },
            },
            expense: {
              $sum: {
                $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
              },
            },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
    ]);

  const totalIncome = totalsByType.find((x) => x._id === "income")?.total || 0;
  const totalExpenses =
    totalsByType.find((x) => x._id === "expense")?.total || 0;

  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    categoryTotals: totalsByCategory.map((x) => ({
      category: x._id,
      total: x.total,
    })),
    recentTransactions,
    monthlyTrends: monthlyTrends.map((x) => ({
      year: x._id.year,
      month: x._id.month,
      income: x.income,
      expense: x.expense,
      net: x.income - x.expense,
    })),
  };
}

export { getDashboardSummary };
