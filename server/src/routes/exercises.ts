import express, { Response } from "express";
import { Exercise } from "../models/Exercise";
import { authenticate, requireAdmin, AuthRequest } from "../middleware/auth";
import { syncExercisesFromSheets } from "../services/googleSheets";

const router = express.Router();

// Machine type order: mat first, then others in spreadsheet order
const MACHINE_TYPE_ORDER: Record<string, number> = {
  mat: 1,
  reformer: 2,
  "wunda chair": 3,
  cadillac: 4,
  "spring board": 5,
  "ladder barrel": 6,
};

// Get all exercises (protected route)
router.get(
  "/",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const exercises = await Exercise.find();
      
      // Sort exercises: first by machine type (mat first), then by order field
      const sortedExercises = exercises.sort((a, b) => {
        const aMachineType = (a.Machine_type || "").toLowerCase();
        const bMachineType = (b.Machine_type || "").toLowerCase();
        
        const aOrder = MACHINE_TYPE_ORDER[aMachineType] || 999;
        const bOrder = MACHINE_TYPE_ORDER[bMachineType] || 999;
        
        // First sort by machine type order
        if (aOrder !== bOrder) {
          return aOrder - bOrder;
        }
        
        // Then sort by order field (spreadsheet row order)
        const aRowOrder = a.order || 0;
        const bRowOrder = b.order || 0;
        return aRowOrder - bRowOrder;
      });
      
      res.json(sortedExercises);
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
