import cors from "cors";
import express from "express";
import morgan from "morgan";

import { requireAuth } from "./middleware/auth.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./routes/auth.routes.js";
import { dashboardRouter } from "./routes/dashboard.routes.js";
import { recordsRouter } from "./routes/records.routes.js";
import { usersRouter } from "./routes/users.routes.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("combined"));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/users", requireAuth, usersRouter);
app.use("/api/records", requireAuth, recordsRouter);
app.use("/api/dashboard", requireAuth, dashboardRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
