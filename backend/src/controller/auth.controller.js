import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

const allowedRoles = ["student", "employer", "admin"];

const roleAllowedProfileFields = {
  student: ["fullName", "email", "profilePic", "location", "university", "fieldOfStudy", "educationLevel"],
  employer: ["fullName", "email", "profilePic", "location", "industry"],
  admin: ["fullName", "email", "profilePic", "location"],
};

const buildUserResponse = (userDoc) => ({
  _id: userDoc._id,
  fullName: userDoc.fullName,
  email: userDoc.email,
  role: userDoc.role,
});

export const signup=async(req, res)=>{
  const { fullName, email, password, role = "student" } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Fill in all fields" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Your password must be at least 6 characters long." });
    }
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: "The email address already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashdPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashdPassword,
      role,
    });

    await newUser.save();
    generateToken(newUser._id, res);

    res.status(201).json(buildUserResponse(newUser));
  } catch (error) {
    console.log("error in signup controller", error.message);
    res.status(500).json({ message: "internal Server Error" });
  }
};
export const login=async(req, res)=>{
  const { email, password } = req.body;
  try {
    const normalizedEmail = email?.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token=generateToken(user._id, res);
    res.status(200).json({...buildUserResponse(user), token});
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const logout=(req, res)=>{
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Disconnected successfully" });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile=async(req, res)=>{
  try {
    const userId = req.user._id;
    const allowedFields = roleAllowedProfileFields[req.user.role] || ["fullName", "email", "profilePic"];
    const updates = {};

    const assignTrimmedIfAllowed = (field) => {
      if (allowedFields.includes(field) && typeof req.body[field] === "string") {
        updates[field] = req.body[field].trim();
      }
    };

    assignTrimmedIfAllowed("fullName");
    assignTrimmedIfAllowed("location");
    assignTrimmedIfAllowed("university");
    assignTrimmedIfAllowed("fieldOfStudy");
    assignTrimmedIfAllowed("educationLevel");
    assignTrimmedIfAllowed("industry");

    if (allowedFields.includes("email") && typeof req.body.email === "string") {
      const normalizedEmail = req.body.email.trim().toLowerCase();
      const duplicateEmail = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: userId },
      });

      if (duplicateEmail) {
        return res.status(400).json({ message: "The email address already exists" });
      }
      updates.email = normalizedEmail;
    }

    if (allowedFields.includes("profilePic") && typeof req.body.profilePic === "string" && req.body.profilePic.trim()) {
      if (req.body.profilePic.startsWith("data:image")) {
        const uploadResponse = await cloudinary.uploader.upload(req.body.profilePic);
        updates.profilePic = uploadResponse.secure_url;
      } else {
        updates.profilePic = req.body.profilePic.trim();
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password");
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth=(req, res)=>{
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.error("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "internal server error" });
  }
};
