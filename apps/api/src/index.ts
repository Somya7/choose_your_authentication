import "dotenv/config";
import cors from "cors";
import express from "express";
import "./db/index.js";
import { validateCsrf } from "./middleware/csrf.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { sessionMiddleware } from "./lib/session.js";
import { authRouter } from "./routes/auth.js";
import { healthRouter } from "./routes/health.js";
import { notesRouter } from "./routes/notes.js";

const app = express();
const port = Number(process.env.PORT) || 3001;
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  }),
);
app.use(express.json());
app.use(sessionMiddleware);
app.use(validateCsrf);

app.get("/", (_req, res) => {
  res.json({
    name: "@cyoa/api",
    message: "Choose Your Authentication API",
    docs: "/api/health",
  });
});

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/notes", notesRouter);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});
