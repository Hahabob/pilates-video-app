import express, { Request, Response } from "express";
import cors from "cors";
import { config } from "./config/env";
import { connectDB } from "./config/database";
import authRoutes from "./routes/auth";
import exerciseRoutes from "./routes/exercises";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to the Pilates Video App API" });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/exercises", exerciseRoutes);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    const PORT = config.port;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
