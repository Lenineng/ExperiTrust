import Experience from "../models/experience.model.js";
import User from "../models/user.model.js";
import Job from "../models/job.model.js";

export const getAdminDashboard = async (_req, res) => {
  try {
    const [pendingVerifications, totalStudents, verifiedToday, activeJobs] = await Promise.all([
      Experience.countDocuments({ status: "pending" }),
      User.countDocuments({ role: "student" }),
      Experience.countDocuments({
        status: "verified",
        reviewedAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      }),
      Job.countDocuments({ status: "open" }),
    ]);

    res.status(200).json({
      stats: { pendingVerifications, totalStudents, verifiedToday, activeJobs },
    });
  } catch (error) {
    console.error("Error in getAdminDashboard:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPendingExperiences = async (_req, res) => {
  try {
    const items = await Experience.find({ status: "pending" })
      .populate("student", "fullName email university")
      .sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    console.error("Error in getPendingExperiences:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getVerifiedExperiences = async (_req, res) => {
  try {
    const items = await Experience.find({ status: "verified" })
      .populate("student", "fullName email university")
      .sort({ reviewedAt: -1, createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    console.error("Error in getVerifiedExperiences:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const { equivalenceYears, adminNotes = "" } = req.body;
    if (equivalenceYears === undefined || Number(equivalenceYears) < 0) {
      return res.status(400).json({ message: "Valid equivalenceYears is required" });
    }

    const updated = await Experience.findByIdAndUpdate(
      id,
      {
        status: "verified",
        equivalenceYears: Number(equivalenceYears),
        adminNotes,
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      },
      { new: true }
    ).populate("student", "fullName email");

    if (!updated) return res.status(404).json({ message: "Experience not found" });
    res.status(200).json(updated);
  } catch (error) {
    console.error("Error in verifyExperience:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const rejectExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes = "" } = req.body;

    const updated = await Experience.findByIdAndUpdate(
      id,
      {
        status: "rejected",
        equivalenceYears: 0,
        adminNotes,
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      },
      { new: true }
    ).populate("student", "fullName email");

    if (!updated) return res.status(404).json({ message: "Experience not found" });
    res.status(200).json(updated);
  } catch (error) {
    console.error("Error in rejectExperience:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllStudents = async (_req, res) => {
  try {
    const students = await User.find({ role: "student" }).select("-password").sort({ createdAt: -1 });

    const totals = await Experience.aggregate([
      { $match: { student: { $in: students.map((s) => s._id) } } },
      {
        $group: {
          _id: "$student",
          verifiedCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "verified"] }, 1, 0],
            },
          },
          pendingCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
            },
          },
          totalExperience: {
            $sum: {
              $cond: [{ $eq: ["$status", "verified"] }, "$equivalenceYears", 0],
            },
          },
        },
      },
    ]);

    const totalsMap = Object.fromEntries(totals.map((row) => [String(row._id), row]));
    const result = students.map((student) => ({
      ...student.toObject(),
      verifiedCount: totalsMap[String(student._id)]?.verifiedCount || 0,
      pendingCount: totalsMap[String(student._id)]?.pendingCount || 0,
      totalExperience: totalsMap[String(student._id)]?.totalExperience || 0,
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getAllStudents:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
