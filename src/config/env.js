import dotenv from "dotenv";

dotenv.config();

const env = {
  port: process.env.PORT || 4000,
  mongoUri:
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/finance_dashboard",
  jwtSecret: process.env.JWT_SECRET || "dev_secret_change_me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  adminUsername: process.env.ADMIN_USERNAME || "admin",
  adminPassword: process.env.ADMIN_PASSWORD || "admin123",
  adminFullName: process.env.ADMIN_FULL_NAME || "System Admin",
};

export default env;
