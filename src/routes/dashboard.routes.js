import express from "express";
import { z } from "zod";

import { requireRole } from "../middleware/requireRole.js";
import { validate } from "../middleware/validate.js";
import { FinancialRecord } from "../models/FinancialRecord.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

const querySchema = z.object({
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
});

router.get(
  "/summary",
  requireRole("viewer", "analyst", "admin"),
  validate(querySchema, "query"),
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const match = {};
    if (startDate || endDate) {
      match.recordDate = {};
      if (startDate) match.recordDate.$gte = new Date(startDate);
      if (endDate) match.recordDate.$lte = new Date(endDate);
    }

    const [totalsByType, totalsByCategory, recentActivity, monthlyTrend] =
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
                type: "$type",
              },
              total: { $sum: "$amount" },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]),
      ]);

    const income = totalsByType.find((x) => x._id === "income")?.total || 0;
    const expense = totalsByType.find((x) => x._id === "expense")?.total || 0;

    res.json({
      data: {
        totalIncome: income,
        totalExpenses: expense,
        netBalance: income - expense,
        categoryTotals: totalsByCategory.map((x) => ({
          category: x._id,
          total: x.total,
        })),
        recentActivity,
        monthlyTrends: monthlyTrend.map((x) => ({
          year: x._id.year,
          month: x._id.month,
          type: x._id.type,
          total: x.total,
        })),
      },
    });
  }),
);

export { router as dashboardRouter };
