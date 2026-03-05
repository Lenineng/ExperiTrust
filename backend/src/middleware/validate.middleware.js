import mongoose from "mongoose";

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
const asNumber = (value) => (typeof value === "number" ? value : Number(value));

const badRequest = (res, message) => res.status(400).json({ message });

export const validateObjectIdParam = (paramName) => (req, res, next) => {
  const value = req.params[paramName];
  if (!mongoose.isValidObjectId(value)) {
    return badRequest(res, `Invalid ${paramName}`);
  }
  next();
};

export const validateSignup = (req, res, next) => {
  const { fullName, email, password, role } = req.body;
  if (!isNonEmptyString(fullName)) return badRequest(res, "fullName is required");
  if (!isNonEmptyString(email)) return badRequest(res, "email is required");
  if (!isNonEmptyString(password) || password.length < 6) {
    return badRequest(res, "password must be at least 6 characters long");
  }
  if (role !== undefined && !["student", "employer", "admin"].includes(role)) {
    return badRequest(res, "Invalid role");
  }
  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!isNonEmptyString(email)) return badRequest(res, "email is required");
  if (!isNonEmptyString(password)) return badRequest(res, "password is required");
  next();
};

export const validateUpdateProfile = (req, res, next) => {
  const allowedFields = [
    "fullName",
    "email",
    "location",
    "university",
    "fieldOfStudy",
    "educationLevel",
    "industry",
    "profilePic",
  ];

  const provided = Object.keys(req.body || {});
  if (!provided.length) return badRequest(res, "At least one profile field is required");

  const hasUnknown = provided.some((field) => !allowedFields.includes(field));
  if (hasUnknown) return badRequest(res, "Request contains unsupported profile fields");

  if (req.body.email !== undefined && !isNonEmptyString(req.body.email)) {
    return badRequest(res, "email must be a non-empty string");
  }
  next();
};

export const validateCreateExperience = (req, res, next) => {
  const { title, type, startDate, endDate, duration, durationUnit, description } = req.body;
  const validTypes = ["Academic Project", "Volunteering", "Internship", "Personal Project"];
  const validDurationUnits = ["Hours", "Days", "Weeks", "Months"];

  if (!isNonEmptyString(title)) return badRequest(res, "title is required");
  if (!validTypes.includes(type)) return badRequest(res, "Invalid experience type");
  if (!isNonEmptyString(startDate) || Number.isNaN(Date.parse(startDate))) {
    return badRequest(res, "startDate must be a valid date");
  }
  if (!isNonEmptyString(endDate) || Number.isNaN(Date.parse(endDate))) {
    return badRequest(res, "endDate must be a valid date");
  }
  if (!validDurationUnits.includes(durationUnit)) {
    return badRequest(res, "Invalid durationUnit");
  }
  if (!isNonEmptyString(description)) return badRequest(res, "description is required");

  const durationNumber = asNumber(duration);
  if (Number.isNaN(durationNumber) || durationNumber <= 0) {
    return badRequest(res, "duration must be a positive number");
  }

  next();
};

export const validateApplyToJob = (req, res, next) => {
  const { jobId } = req.body;
  if (!isNonEmptyString(jobId)) return badRequest(res, "jobId is required");
  if (!mongoose.isValidObjectId(jobId)) return badRequest(res, "Invalid jobId");
  next();
};

export const validateCreateJob = (req, res, next) => {
  const { title, jobType, location, requiredExperienceYears, description } = req.body;
  const validJobTypes = ["Full-time", "Part-time", "Internship", "Contract"];

  if (!isNonEmptyString(title)) return badRequest(res, "title is required");
  if (!validJobTypes.includes(jobType)) return badRequest(res, "Invalid jobType");
  if (!isNonEmptyString(location)) return badRequest(res, "location is required");
  if (!isNonEmptyString(description)) return badRequest(res, "description is required");

  const years = asNumber(requiredExperienceYears);
  if (Number.isNaN(years) || years < 0) {
    return badRequest(res, "requiredExperienceYears must be a number >= 0");
  }

  next();
};

export const validateUpdateJob = (req, res, next) => {
  const allowed = ["title", "jobType", "location", "requiredExperienceYears", "description", "status"];
  const provided = Object.keys(req.body || {});
  if (!provided.length) return badRequest(res, "At least one job field is required");
  if (provided.some((field) => !allowed.includes(field))) {
    return badRequest(res, "Request contains unsupported job fields");
  }

  if (req.body.jobType !== undefined) {
    const validJobTypes = ["Full-time", "Part-time", "Internship", "Contract"];
    if (!validJobTypes.includes(req.body.jobType)) return badRequest(res, "Invalid jobType");
  }

  if (req.body.status !== undefined && !["open", "closed"].includes(req.body.status)) {
    return badRequest(res, "Invalid status");
  }

  if (req.body.requiredExperienceYears !== undefined) {
    const years = asNumber(req.body.requiredExperienceYears);
    if (Number.isNaN(years) || years < 0) {
      return badRequest(res, "requiredExperienceYears must be a number >= 0");
    }
  }

  next();
};

export const validateApplicationStatus = (req, res, next) => {
  const { status } = req.body;
  const allowed = ["under_review", "shortlisted", "interview_scheduled", "rejected"];
  if (!allowed.includes(status)) return badRequest(res, "Invalid status");
  next();
};

export const validateScheduleInterview = (req, res, next) => {
  const { applicationId, interviewDate } = req.body;
  if (!isNonEmptyString(applicationId)) return badRequest(res, "applicationId is required");
  if (!mongoose.isValidObjectId(applicationId)) return badRequest(res, "Invalid applicationId");
  if (!isNonEmptyString(interviewDate) || Number.isNaN(Date.parse(interviewDate))) {
    return badRequest(res, "interviewDate must be a valid ISO date");
  }
  next();
};

export const validateVerifyExperience = (req, res, next) => {
  const years = asNumber(req.body?.equivalenceYears);
  if (Number.isNaN(years) || years < 0) {
    return badRequest(res, "equivalenceYears must be a number >= 0");
  }
  next();
};

