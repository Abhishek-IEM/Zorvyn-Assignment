import bcrypt from "bcryptjs";
import express from "express";
import { Types } from "mongoose";
import { z } from "zod";

import { requireRole } from "../middleware/requireRole.js";
import { validate } from "../middleware/validate.js";
import { roles, User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";

const router = express.Router();

const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  fullName: z.string().min(1).max(100),
  password: z.string().min(6).max(100),
  role: z.enum(roles),
  isActive: z.boolean().optional().default(true),
});

const updateUserSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  password: z.string().min(6).max(100).optional(),
  role: z.enum(roles).optional(),
  isActive: z.boolean().optional(),
});

router.get(
  "/",
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const users = await User.find()
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ data: users });
  }),
);

router.post(
  "/",
  requireRole("admin"),
  validate(createUserSchema),
  asyncHandler(async (req, res) => {
    const { username, fullName, password, role, isActive } = req.body;

    const exists = await User.findOne({ username }).lean();
    if (exists) {
      throw httpError(409, "Username already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      fullName,
      passwordHash,
      role,
      isActive,
    });

    res.status(201).json({
      data: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  }),
);

router.patch(
  "/:id",
  requireRole("admin"),
  validate(updateUserSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      throw httpError(400, "Invalid user id");
    }

    const payload = { ...req.body };

    if (payload.password) {
      payload.passwordHash = await bcrypt.hash(payload.password, 10);
      delete payload.password;
    }

    const updated = await User.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    })
      .select("-passwordHash")
      .lean();

    if (!updated) {
      throw httpError(404, "User not found");
    }

    res.json({ data: updated });
  }),
);

export { router as usersRouter };
