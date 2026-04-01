import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import env from "../config/env.js";
import { User } from "../models/User.js";
import { httpError } from "../utils/httpError.js";

async function loginUser({ username, password }) {
  const user = await User.findOne({ username }).exec();

  if (!user) {
    throw httpError(401, "Invalid username or password");
  }

  if (!user.isActive) {
    throw httpError(403, "User is inactive");
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    throw httpError(401, "Invalid username or password");
  }

  const token = jwt.sign(
    { role: user.role, username: user.username },
    env.jwtSecret,
    {
      subject: user._id.toString(),
      expiresIn: env.jwtExpiresIn,
    },
  );

  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
    },
  };
}

export { loginUser };
