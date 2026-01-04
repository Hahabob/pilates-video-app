import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../models/User";
import { config } from "../config/env";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log("Connected to MongoDB");

    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log(`Admin user with email ${adminEmail} already exists`);
      process.exit(0);
    }

    // Create admin user
    const admin = new User({
      email: adminEmail,
      password: adminPassword,
      role: "admin",
    });

    await admin.save();
    console.log(`Admin user created successfully:`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`Role: admin`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();
