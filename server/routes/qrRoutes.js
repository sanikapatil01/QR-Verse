import express from "express";
import {
  generateQR,
  listHistory,
  getAnalytics,
  updateDynamicDestination,
  publicGenerate,
  renderSvg
} from "../controllers/qrController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", protect, generateQR);
router.get("/history", protect, listHistory);
router.get("/analytics", protect, getAnalytics);
router.patch("/:id/destination", protect, updateDynamicDestination);
router.post("/render/svg", protect, renderSvg);

// Public developer API (no auth, no history stored - MVP)
router.post("/public/generate", publicGenerate);

export default router;
