import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["Academic Project", "Volunteering", "Internship", "Personal Project"],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
    },
    durationUnit: {
      type: String,
      enum: ["Hours", "Days", "Weeks", "Months"],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    supportingEvidence: {
      type: String,
      default: "",
      trim: true,
    },
    cvUrl: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
      index: true,
    },
    equivalenceYears: {
      type: Number,
      default: 0,
      min: 0,
    },
    adminNotes: {
      type: String,
      default: "",
      trim: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Experience = mongoose.model("Experience", experienceSchema);

export default Experience;
