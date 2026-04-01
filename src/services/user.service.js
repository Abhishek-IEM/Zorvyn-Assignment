import bcrypt from "bcryptjs";
import { Types } from "mongoose";

import { User } from "../models/User.js";
import { httpError } from "../utils/httpError.js";

async function listUsers() {
  return User.find().select("-passwordHash").sort({ createdAt: -1 }).lean();
}

async function createUser(payload) {
  const { username, fullName, password, role, isActive } = payload;

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

  return {
    id: user._id,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

async function updateUser(id, payload) {
  if (!Types.ObjectId.isValid(id)) {
    throw httpError(400, "Invalid user id");
  }

  const updatePayload = { ...payload };

  if (updatePayload.password) {
    updatePayload.passwordHash = await bcrypt.hash(updatePayload.password, 10);
    delete updatePayload.password;
  }

  const updated = await User.findByIdAndUpdate(id, updatePayload, {
    new: true,
    runValidators: true,
  })
    .select("-passwordHash")
    .lean();

  if (!updated) {
    throw httpError(404, "User not found");
  }

  return updated;
}

export { listUsers, createUser, updateUser };
