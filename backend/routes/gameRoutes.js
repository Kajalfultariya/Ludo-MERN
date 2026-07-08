import { Router } from "express";
import { saveResult, getHistory } from "../controllers/gameController.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";

const router = Router();

router.post("/result", optionalAuth, saveResult);
router.get("/history", requireAuth, getHistory);

export default router;
