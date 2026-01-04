import express, { Response } from "express";
import { Exercise } from "../models/Exercise";
import { authenticate, requireAdmin, AuthRequest } from "../middleware/auth";
import { syncExercisesFromSheets } from "../services/googleSheets";

const router = express.Router();

// Get all exercises (protected route)
router.get(
  "/",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const exercises = await Exercise.find().sort({ createdAt: -1 });
      res.json(exercises);
    } catch (error: any) {
      console.error("Get exercises error:", error);
      res.status(500).json({ message: "שגיאה בשרת" });
    }
  }
);

// Get single exercise by ID
router.get(
  "/:id",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const exercise = await Exercise.findById(req.params.id);
      if (!exercise) {
        res.status(404).json({ message: "תרגיל לא נמצא" });
        return;
      }
      res.json(exercise);
    } catch (error: any) {
      console.error("Get exercise error:", error);
      res.status(500).json({ message: "שגיאה בשרת" });
    }
  }
);

// Admin: Sync exercises from Google Sheets
router.post(
  "/sync",
  authenticate,
  requireAdmin,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const result = await syncExercisesFromSheets();
      if (result.success) {
        res.json({
          message: result.message,
          count: result.count,
        });
      } else {
        res.status(500).json({
          message: result.message,
          count: result.count,
        });
      }
    } catch (error: any) {
      console.error("Sync exercises error:", error);
      res.status(500).json({ message: "שגיאה בסנכרון" });
    }
  }
);

export default router;
