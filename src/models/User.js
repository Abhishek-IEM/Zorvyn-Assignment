import mongoose from "mongoose";

const roles = ["viewer", "analyst", "admin"];

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: roles, default: "viewer" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export { User, roles };
