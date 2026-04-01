import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";

import env from "../config/env.js";
import { validate } from "../middleware/validate.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";

const router = express.Router();

const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
});

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username }).exec();

    if (!user) {
      throw httpError(401, "Invalid username or password");
    }

    if (!user.isActive) {
      throw httpError(403, "User is inactive");
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      throw httpError(401, "Invalid username or password");
    }

    const token = jwt.sign(
      {
        role: user.role,
        username: user.username,
      },
      env.jwtSecret,
      {
        subject: user._id.toString(),
        expiresIn: env.jwtExpiresIn,
      },
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
      },
    });
  }),
);

export { router as authRouter };
