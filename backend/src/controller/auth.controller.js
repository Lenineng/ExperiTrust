import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

const allowedRoles = ["student", "employer", "admin"];

const buildUserResponse = (userDoc) => ({
  _id: userDoc._id,
  fullName: userDoc.fullName,
  email: userDoc.email,
  role: userDoc.role,
  profilePic: userDoc.profilePic,
  location: userDoc.location,
  university: userDoc.university,
  fieldOfStudy: userDoc.fieldOfStudy,
  educationLevel: userDoc.educationLevel,
  industry: userDoc.industry,
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

    generateToken(user._id, res);
    res.status(200).json(buildUserResponse(user));
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
    const {
      fullName,
      email,
      location,
      university,
      fieldOfStudy,
      educationLevel,
      industry,
      profilePic,
    } = req.body;

    const updates = {};

    if (typeof fullName === "string") updates.fullName = fullName.trim();
    if (typeof location === "string") updates.location = location.trim();
    if (typeof university === "string") updates.university = university.trim();
    if (typeof fieldOfStudy === "string") updates.fieldOfStudy = fieldOfStudy.trim();
    if (typeof educationLevel === "string") updates.educationLevel = educationLevel.trim();
    if (typeof industry === "string") updates.industry = industry.trim();

    if (typeof email === "string") {
      const normalizedEmail = email.trim().toLowerCase();
      const duplicateEmail = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: userId },
      });

      if (duplicateEmail) {
        return res.status(400).json({ message: "The email address already exists" });
      }
      updates.email = normalizedEmail;
    }

    if (typeof profilePic === "string" && profilePic.trim()) {
      if (profilePic.startsWith("data:image")) {
        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        updates.profilePic = uploadResponse.secure_url;
      } else {
        updates.profilePic = profilePic;
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
