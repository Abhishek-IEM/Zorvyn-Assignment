import bcrypt from "bcryptjs";
import { app } from "./app.js";
import { connectDatabase } from "./config/db.js";
import env from "./config/env.js";
import { User } from "./models/User.js";

async function ensureAdminUser() {
  const existing = await User.findOne({ username: env.adminUsername }).exec();
  if (existing) {
    return;
  }

  const passwordHash = await bcrypt.hash(env.adminPassword, 10);
  await User.create({
    username: env.adminUsername,
    fullName: env.adminFullName,
    passwordHash,
    role: "admin",
    isActive: true,
  });
}

async function start() {
  console.log("Connecting to MongoDB...");
  await connectDatabase(env.mongoUri);
  await ensureAdminUser();

  app.listen(env.port, () => {
    console.log(`Server listening on port ${env.port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
