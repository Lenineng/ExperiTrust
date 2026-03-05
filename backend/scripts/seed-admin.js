import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../src/models/user.model.js";

dotenv.config();

const required = ["MONGODB_URI", "ADMIN_EMAIL", "ADMIN_PASSWORD", "ADMIN_FULL_NAME"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
    const existing = await User.findOne({ email });

    if (existing) {
      if (existing.role !== "admin") {
        existing.role = "admin";
        await existing.save();
        console.log("Existing user promoted to admin");
      } else {
        console.log("Admin already exists. No changes made.");
      }
      return;
    }

    const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    await User.create({
      fullName: process.env.ADMIN_FULL_NAME.trim(),
      email,
      password: hash,
      role: "admin",
    });

    console.log("Admin created successfully.");
  } catch (error) {
    console.error("Failed to seed admin:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
