import express from "express";
import { z } from "zod";

import { login } from "../controllers/auth.controller.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

const loginSchema = z.object({
  username: z.string().trim().min(3).max(50),
  password: z.string().min(6).max(100),
});

router.post("/login", validate(loginSchema), asyncHandler(login));

export { router as authRouter };
