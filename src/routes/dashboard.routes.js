import express from "express";
import { z } from "zod";

import { getSummary } from "../controllers/dashboard.controller.js";
import { requireRole } from "../middleware/requireRole.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

const querySchema = z.object({
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
});

router.get(
  "/summary",
  requireRole("analyst", "admin"),
  validate(querySchema, "query"),
  asyncHandler(getSummary),
);

export { router as dashboardRouter };
