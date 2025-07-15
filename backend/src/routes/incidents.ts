import express from "express";
import { authenticateToken } from "../middleware/auth";
import {
  createIncidentController,
  listIncidentsController,
  updateIncidentStatusController,
  exportIncidentsController,
  summarizeIncidentController,
} from "../controllers/incident";

const router = express.Router();

router.post("/", authenticateToken, createIncidentController);
router.get("/", authenticateToken, listIncidentsController);
router.patch("/:id/status", authenticateToken, updateIncidentStatusController);
router.get("/export", authenticateToken, exportIncidentsController);
router.post("/:id/summarize", authenticateToken, summarizeIncidentController);

export default router;
