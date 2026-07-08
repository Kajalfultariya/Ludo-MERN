import GameResult from "../models/GameResult.js";
import User from "../models/User.js";

export async function saveResult(req, res) {
  try {
    const { players, winnerColor, totalTurns, durationSeconds } = req.body;
    if (!Array.isArray(players) || players.length < 2) {
      return res.status(400).json({ message: "At least 2 players are required" });
    }

    const result = await GameResult.create({
      user: req.userId || null,
      players,
      winnerColor,
      totalTurns: totalTurns || 0,
      durationSeconds: durationSeconds || 0,
    });

    if (req.userId) {
      const account = await User.findById(req.userId);
      const winner = players.find((p) => p.color === winnerColor);
      const won =
        account && winner && winner.name?.toLowerCase() === account.username.toLowerCase();
      await User.findByIdAndUpdate(req.userId, {
        $inc: { "stats.played": 1, "stats.wins": won ? 1 : 0 },
      });
    }

    res.status(201).json({ result });
  } catch (err) {
    res.status(500).json({ message: "Could not save result", error: err.message });
  }
}

export async function getHistory(req, res) {
  try {
    const results = await GameResult.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ message: "Could not load history", error: err.message });
  }
}
