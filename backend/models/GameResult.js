import mongoose from "mongoose";

const gameResultSchema = new mongoose.Schema(
  {
    // The logged-in user who reported this result (optional - guests can play too)
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    players: [
      {
        name: { type: String, required: true },
        color: {
          type: String,
          enum: ["red", "green", "yellow", "blue"],
          required: true,
        },
        rank: { type: Number, default: null }, // 1 = winner, 2 = second, etc.
      },
    ],
    winnerColor: { type: String, enum: ["red", "green", "yellow", "blue"] },
    totalTurns: { type: Number, default: 0 },
    durationSeconds: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("GameResult", gameResultSchema);
