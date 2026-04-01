import express from "express";
import { z } from "zod";

import {
  createUserHandler,
  getUsers,
  updateUserHandler,
} from "../controllers/users.controller.js";
import { requireRole } from "../middleware/requireRole.js";
import { validate } from "../middleware/validate.js";
import { roles } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

const createUserSchema = z.object({
  username: z.string().trim().min(3).max(50),
  fullName: z.string().trim().min(1).max(100),
  password: z.string().min(6).max(100),
  role: z.enum(roles),
  isActive: z.boolean().optional().default(true),
});

const updateUserSchema = z
  .object({
    fullName: z.string().trim().min(1).max(100).optional(),
    password: z.string().min(6).max(100).optional(),
    role: z.enum(roles).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required for update",
  });

router.get("/", requireRole("admin"), asyncHandler(getUsers));
router.post(
  "/",
  requireRole("admin"),
  validate(createUserSchema),
  asyncHandler(createUserHandler),
);
router.patch(
  "/:id",
  requireRole("admin"),
  validate(updateUserSchema),
  asyncHandler(updateUserHandler),
);

export { router as usersRouter };
