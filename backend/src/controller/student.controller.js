import Experience from "../models/experience.model.js";
import Job from "../models/job.model.js";
import Application from "../models/application.model.js";
import Interview from "../models/interview.model.js";

const sumExperience = (experiences) =>
  experiences.reduce((sum, item) => sum + (item.equivalenceYears || 0), 0);

export const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user._id;

    const [experiences, applications, verifiedCount] = await Promise.all([
      Experience.find({ student: studentId }).sort({ createdAt: -1 }),
      Application.find({ student: studentId }).populate("job", "title location jobType requiredExperienceYears"),
      Experience.countDocuments({ student: studentId, status: "verified" }),
    ]);

    const totalExperienceYears = sumExperience(experiences.filter((exp) => exp.status === "verified"));
    const profileFields = [req.user.fullName, req.user.email, req.user.location];
    const profileCompletion = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);

    res.status(200).json({
      stats: {
        totalExperienceYears,
        verifiedExperiences: verifiedCount,
        totalExperiences: experiences.length,
        applications: applications.length,
        profileCompletion,
      },
      experiences,
      applications,
    });
  } catch (error) {
    console.error("Error in getStudentDashboard:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createExperience = async (req, res) => {
  try {
    const {
      title,
      type,
      startDate,
      endDate,
      duration,
      durationUnit,
      description,
      supportingEvidence = "",
      cvUrl = "",
    } = req.body;

    if (!title || !type || !startDate || !endDate || !duration || !durationUnit || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const experience = await Experience.create({
      student: req.user._id,
      title,
      type,
      startDate,
      endDate,
      duration,
      durationUnit,
      description,
      supportingEvidence,
      cvUrl,
      status: "pending",
    });

    res.status(201).json(experience);
  } catch (error) {
    console.error("Error in createExperience:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getStudentExperiences = async (req, res) => {
  try {
    const experiences = await Experience.find({ student: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(experiences);
  } catch (error) {
    console.error("Error in getStudentExperiences:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const listOpenJobs = async (_req, res) => {
  try {
    const jobs = await Job.find({ status: "open" })
      .populate("employer", "fullName industry location")
      .sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    console.error("Error in listOpenJobs:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const applyToJob = async (req, res) => {
  try {
    const { jobId, notes = "" } = req.body;
    if (!jobId) return res.status(400).json({ message: "jobId is required" });

    const job = await Job.findById(jobId);
    if (!job || job.status !== "open") {
      return res.status(404).json({ message: "Job not found or closed" });
    }

    const existing = await Application.findOne({ student: req.user._id, job: jobId });
    if (existing) {
      return res.status(400).json({ message: "Already applied to this job" });
    }

    const application = await Application.create({
      student: req.user._id,
      employer: job.employer,
      job: job._id,
      status: "applied",
      notes,
    });

    res.status(201).json(application);
  } catch (error) {
    console.error("Error in applyToJob:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate("job", "title location jobType requiredExperienceYears")
      .populate("employer", "fullName")
      .sort({ createdAt: -1 });
    res.status(200).json(applications);
  } catch (error) {
    console.error("Error in getMyApplications:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyApplicationInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findOne({ _id: id, student: req.user._id });
    if (!application) return res.status(404).json({ message: "Application not found" });

    const interview = await Interview.findOne({
      application: application._id,
      student: req.user._id,
      status: "scheduled",
    })
      .populate({
        path: "application",
        populate: [{ path: "job", select: "title" }, { path: "employer", select: "fullName email" }],
      })
      .sort({ createdAt: -1 });

    if (!interview) return res.status(404).json({ message: "Interview not found" });

    res.status(200).json(interview);
  } catch (error) {
    console.error("Error in getMyApplicationInterview:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
