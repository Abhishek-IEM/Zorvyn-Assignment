import express from "express";
import { z } from "zod";

import {
  createRecordHandler,
  deleteRecordHandler,
  getRecords,
  updateRecordHandler,
} from "../controllers/records.controller.js";
import { requireRole } from "../middleware/requireRole.js";
import { validate } from "../middleware/validate.js";
import { recordTypes } from "../models/FinancialRecord.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

const createRecordSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  type: z.enum(recordTypes),
  category: z.string().trim().min(1).max(80),
  recordDate: z.string().date(),
  notes: z.string().trim().max(500).optional(),
});

const updateRecordSchema = z
  .object({
    amount: z.number().positive("Amount must be greater than 0").optional(),
    type: z.enum(recordTypes).optional(),
    category: z.string().trim().min(1).max(80).optional(),
    recordDate: z.string().date().optional(),
    notes: z.string().trim().max(500).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required for update",
  });

const listQuerySchema = z.object({
  type: z.enum(recordTypes).optional(),
  category: z.string().trim().max(80).optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

router.get(
  "/",
  requireRole("viewer", "analyst", "admin"),
  validate(listQuerySchema, "query"),
  asyncHandler(getRecords),
);
router.post(
  "/",
  requireRole("admin"),
  validate(createRecordSchema),
  asyncHandler(createRecordHandler),
);
router.put(
  "/:id",
  requireRole("admin"),
  validate(updateRecordSchema),
  asyncHandler(updateRecordHandler),
);
router.delete("/:id", requireRole("admin"), asyncHandler(deleteRecordHandler));

export { router as recordsRouter };
