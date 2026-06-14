import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import "./db/index.js";
import { sessionMiddleware } from "./lib/session.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./routes/auth/index.js";
import { healthRouter } from "./routes/health.js";
import { jwtNotesRouter } from "./routes/notes/jwtNotes.js";
import { sessionNotesRouter } from "./routes/notes/sessionNotes.js";

const app = express();
const port = Number(process.env.PORT) || 3001;
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Session middleware runs globally — only used by /api/auth/session and /api/session/notes
app.use(sessionMiddleware);

app.get("/", (_req, res) => {
  res.json({
    name: "@cyoa/api",
    message: "Choose Your Authentication — multi-auth playground",
    methods: "/api/auth/methods",
  });
});

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);

// Separate note endpoints per auth method so each can use its own middleware
app.use("/api/session/notes", sessionNotesRouter);
app.use("/api/jwt/notes", jwtNotesRouter);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});
