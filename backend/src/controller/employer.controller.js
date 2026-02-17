import Job from "../models/job.model.js";
import Application from "../models/application.model.js";
import Interview from "../models/interview.model.js";
import Experience from "../models/experience.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

export const getEmployerDashboard = async (req, res) => {
  try {
    const employerId = req.user._id;
    const jobs = await Job.find({ employer: employerId });
    const jobIds = jobs.map((job) => job._id);

    const [applicationsCount, shortlistedCount, interviewsCount] = await Promise.all([
      Application.countDocuments({ employer: employerId }),
      Application.countDocuments({ employer: employerId, status: "shortlisted" }),
      Interview.countDocuments({ employer: employerId, status: "scheduled" }),
    ]);

    res.status(200).json({
      stats: {
        activeJobs: jobs.filter((job) => job.status === "open").length,
        totalApplicants: applicationsCount,
        shortlisted: shortlistedCount,
        interviews: interviewsCount,
      },
      jobs: jobs.sort((a, b) => b.createdAt - a.createdAt),
      hasJobs: jobIds.length > 0,
    });
  } catch (error) {
    console.error("Error in getEmployerDashboard:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createJob = async (req, res) => {
  try {
    const { title, jobType, location, requiredExperienceYears, description } = req.body;
    if (!title || !jobType || !location || requiredExperienceYears === undefined || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const job = await Job.create({
      employer: req.user._id,
      title,
      jobType,
      location,
      requiredExperienceYears,
      description,
      status: "open",
    });

    res.status(201).json(job);
  } catch (error) {
    console.error("Error in createJob:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getEmployerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    console.error("Error in getEmployerJobs:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findOne({ _id: id, employer: req.user._id });
    if (!job) return res.status(404).json({ message: "Job not found" });

    const allowedUpdates = ["title", "jobType", "location", "requiredExperienceYears", "description", "status"];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) job[field] = req.body[field];
    });
    await job.save();
    res.status(200).json(job);
  } catch (error) {
    console.error("Error in updateJob:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const closeJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findOneAndUpdate(
      { _id: id, employer: req.user._id },
      { status: "closed" },
      { new: true }
    );
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.status(200).json(job);
  } catch (error) {
    console.error("Error in closeJob:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getApplicants = async (req, res) => {
  try {
    const applications = await Application.find({ employer: req.user._id })
      .populate("student", "fullName email university fieldOfStudy")
      .populate("job", "title")
      .sort({ createdAt: -1 });

    const studentIds = [...new Set(applications.map((app) => String(app.student?._id)).filter(Boolean))];
    const objectStudentIds = studentIds.map((id) => new mongoose.Types.ObjectId(id));
    const experienceTotals = await Experience.aggregate([
      { $match: { student: { $in: objectStudentIds }, status: "verified" } },
      { $group: { _id: "$student", total: { $sum: "$equivalenceYears" } } },
    ]);

    const totalsMap = Object.fromEntries(experienceTotals.map((item) => [String(item._id), item.total]));
    const decorated = applications.map((app) => ({
      ...app.toObject(),
      studentTotalExperience: totalsMap[String(app.student?._id)] || 0,
    }));

    res.status(200).json(decorated);
  } catch (error) {
    console.error("Error in getApplicants:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ["under_review", "shortlisted", "interview_scheduled", "rejected"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await Application.findOneAndUpdate(
      { _id: id, employer: req.user._id },
      { status },
      { new: true }
    )
      .populate("student", "fullName email")
      .populate("job", "title");

    if (!application) return res.status(404).json({ message: "Application not found" });
    res.status(200).json(application);
  } catch (error) {
    console.error("Error in updateApplicationStatus:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const scheduleInterview = async (req, res) => {
  try {
    const { applicationId, interviewDate, notes = "" } = req.body;
    if (!applicationId || !interviewDate) {
      return res.status(400).json({ message: "applicationId and interviewDate are required" });
    }

    const application = await Application.findOne({ _id: applicationId, employer: req.user._id });
    if (!application) return res.status(404).json({ message: "Application not found" });

    const interview = await Interview.create({
      application: application._id,
      employer: req.user._id,
      student: application.student,
      interviewDate,
      notes,
      status: "scheduled",
    });

    application.status = "interview_scheduled";
    await application.save();

    res.status(201).json(interview);
  } catch (error) {
    console.error("Error in scheduleInterview:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const searchCandidates = async (req, res) => {
  try {
    const { fieldOfStudy, university, minExperience } = req.query;
    const filters = { role: "student" };

    if (fieldOfStudy) filters.fieldOfStudy = { $regex: fieldOfStudy, $options: "i" };
    if (university) filters.university = { $regex: university, $options: "i" };

    const students = await User.find(filters).select("-password").sort({ createdAt: -1 });

    const experienceMap = await Experience.aggregate([
      { $match: { student: { $in: students.map((s) => s._id) }, status: "verified" } },
      { $group: { _id: "$student", totalExperience: { $sum: "$equivalenceYears" } } },
    ]);

    const totals = Object.fromEntries(experienceMap.map((row) => [String(row._id), row.totalExperience]));
    const minExp = minExperience ? Number(minExperience) : 0;

    const result = students
      .map((student) => ({
        ...student.toObject(),
        totalExperience: totals[String(student._id)] || 0,
      }))
      .filter((student) => student.totalExperience >= minExp);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in searchCandidates:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
