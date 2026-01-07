import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { config } from "../config/env";
import { authenticate, requireAdmin, AuthRequest } from "../middleware/auth";

const router = express.Router();

// Login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "נא להזין אימייל וסיסמה" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ message: "אימייל או סיסמה שגויים" });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: "אימייל או סיסמה שגויים" });
      return;
    }

    if (!config.jwtSecret) {
      res.status(500).json({ message: "שגיאת תצורת שרת" });
      return;
    }

    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    } as jwt.SignOptions);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ message: "שגיאה בשרת" });
  }
});

// Get current user profile
router.get(
  "/me",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.user!.id).select("-password");
      if (!user) {
        res.status(404).json({ message: "משתמש לא נמצא" });
        return;
      }

      res.json({
        id: user._id,
        email: user.email,
        role: user.role,
      });
    } catch (error: any) {
      console.error("Get profile error:", error);
      res.status(500).json({ message: "שגיאה בשרת" });
    }
  }
);

// Admin: Get all users
router.get(
  "/users",
  authenticate,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await User.find()
        .select("-password")
        .sort({ createdAt: -1 });
      res.json(
        users.map((user) => ({
          id: user._id,
          email: user.email,
          role: user.role,
        }))
      );
    } catch (error: any) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "שגיאה בשרת" });
    }
  }
);

// Admin: Create new user
router.post(
  "/users",
  authenticate,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, role } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: "נא להזין אימייל וסיסמה" });
        return;
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        res.status(400).json({ message: "משתמש עם אימייל זה כבר קיים" });
        return;
      }

      // Validate role
      const validRoles = ["admin", "mat", "machine", "combined"];
      const userRole = role || "combined";
      if (!validRoles.includes(userRole)) {
        res.status(400).json({ message: "רמת גישה לא תקינה" });
        return;
      }

      const newUser = new User({
        email: email.toLowerCase(),
        password,
        role: userRole,
      });

      await newUser.save();

      res.status(201).json({
        message: "משתמש נוצר בהצלחה",
        user: {
          id: newUser._id,
          email: newUser.email,
          role: newUser.role,
        },
      });
    } catch (error: any) {
      console.error("Create user error:", error);
      res.status(500).json({ message: "שגיאה בשרת" });
    }
  }
);

// Admin: Delete user
router.delete(
  "/users/:id",
  authenticate,
  requireAdmin,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.params.id;

      // Prevent admin from deleting themselves
      if (userId === req.user!.id) {
        res.status(400).json({ message: "לא ניתן למחוק את עצמך" });
        return;
      }

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ message: "משתמש לא נמצא" });
        return;
      }

      await User.findByIdAndDelete(userId);
      res.json({ message: "משתמש נמחק בהצלחה" });
    } catch (error: any) {
      console.error("Delete user error:", error);
      res.status(500).json({ message: "שגיאה בשרת" });
    }
  }
);

export default router;
