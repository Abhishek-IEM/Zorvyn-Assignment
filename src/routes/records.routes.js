import express from "express";
import { Types } from "mongoose";
import { z } from "zod";

import { requireRole } from "../middleware/requireRole.js";
import { validate } from "../middleware/validate.js";
import { FinancialRecord, recordTypes } from "../models/FinancialRecord.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";

const router = express.Router();

const createRecordSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(recordTypes),
  category: z.string().min(1).max(80),
  recordDate: z.string().date(),
  notes: z.string().max(500).optional(),
});

const updateRecordSchema = z.object({
  amount: z.number().positive().optional(),
  type: z.enum(recordTypes).optional(),
  category: z.string().min(1).max(80).optional(),
  recordDate: z.string().date().optional(),
  notes: z.string().max(500).optional(),
});

const listQuerySchema = z.object({
  type: z.enum(recordTypes).optional(),
  category: z.string().max(80).optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

router.get(
  "/",
  requireRole("analyst", "admin"),
  validate(listQuerySchema, "query"),
  asyncHandler(async (req, res) => {
    const { type, category, startDate, endDate, page, limit } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.recordDate = {};
      if (startDate) filter.recordDate.$gte = new Date(startDate);
      if (endDate) filter.recordDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [rows, total] = await Promise.all([
      FinancialRecord.find(filter)
        .sort({ recordDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "username fullName role")
        .lean(),
      FinancialRecord.countDocuments(filter),
    ]);

    res.json({
      data: rows,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }),
);

router.post(
  "/",
  requireRole("admin"),
  validate(createRecordSchema),
  asyncHandler(async (req, res) => {
    const record = await FinancialRecord.create({
      ...req.body,
      recordDate: new Date(req.body.recordDate),
      createdBy: req.user.id,
    });

    res.status(201).json({ data: record });
  }),
);

router.put(
  "/:id",
  requireRole("admin"),
  validate(updateRecordSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      throw httpError(400, "Invalid record id");
    }

    const payload = { ...req.body };
    if (payload.recordDate) {
      payload.recordDate = new Date(payload.recordDate);
    }

    const updated = await FinancialRecord.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) {
      throw httpError(404, "Record not found");
    }

    res.json({ data: updated });
  }),
);

router.delete(
  "/:id",
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      throw httpError(400, "Invalid record id");
    }

    const deleted = await FinancialRecord.findByIdAndDelete(id).lean();

    if (!deleted) {
      throw httpError(404, "Record not found");
    }

    res.status(204).send();
  }),
);

export { router as recordsRouter };
