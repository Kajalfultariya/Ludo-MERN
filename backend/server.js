import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";

dotenv.config();
const app = express();

  app.use(
    cors({
        origin: [
            "http://localhost:5176",
            "https://ludo-game-eta-one.vercel.app",
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);
app.use(express.json());
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MERN backend is running",
  });
});
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/game", gameRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

const PORT = process.env.PORT || 5176;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`[server] Listening on port ${PORT}`));
});
