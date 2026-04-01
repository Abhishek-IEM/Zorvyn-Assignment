import jwt from "jsonwebtoken";

import env from "../config/env.js";
import { User } from "../models/User.js";
import { httpError } from "../utils/httpError.js";

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(httpError(401, "Missing or invalid authorization token"));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(payload.sub).lean();

    if (!user || !user.isActive) {
      return next(httpError(401, "User is not active or does not exist"));
    }

    req.user = {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      isActive: user.isActive,
    };

    return next();
  } catch (error) {
    return next(httpError(401, "Invalid or expired token"));
  }
}

export { requireAuth };
