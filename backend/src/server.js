import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import studentRoutes from "./routes/student.route.js";
import employerRoutes from "./routes/employer.route.js";
import adminRoutes from "./routes/admin.route.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";

dotenv.config();
const app = express();

const PORT = process.env.PORT;
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      try {
        const parsed = new URL(origin);
        const isLocalhost =
          (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") &&
          (parsed.protocol === "http:" || parsed.protocol === "https:");

        if (isLocalhost) {
          callback(null, true);
          return;
        }
      } catch (_) {
        // fall through to blocked origin
      }

      callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/employer", employerRoutes);
app.use("/api/admin", adminRoutes);
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  connectDB();
  console.log("Server is running on port " + PORT);
});
