import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  mongodbUri: process.env.MONGODB_URI || "",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  googleServiceAccountPath: process.env.GOOGLE_SERVICE_ACCOUNT_PATH || "",
  googleSheetId: process.env.GOOGLE_SHEET_ID || "",
  nodeEnv: process.env.NODE_ENV || "development",
};

// Validate required environment variables
const requiredEnvVars = [
  "MONGODB_URI",
  "JWT_SECRET",
  "GOOGLE_SERVICE_ACCOUNT_PATH",
  "GOOGLE_SHEET_ID",
];

if (config.nodeEnv === "production") {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
}
