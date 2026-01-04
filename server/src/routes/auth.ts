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

      const newUser = new User({
        email: email.toLowerCase(),
        password,
        role: role || "user",
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

export default router;
