import express from "express";
import { authorizeRoles, protectRoute } from "../middleware/auth.middleware.js";
import {
  validateApplicationStatus,
  validateCreateJob,
  validateObjectIdParam,
  validateScheduleInterview,
  validateUpdateJob,
} from "../middleware/validate.middleware.js";
import {
  closeJob,
  createJob,
  getApplicants,
  getEmployerDashboard,
  getEmployerJobs,
  scheduleInterview,
  searchCandidates,
  updateApplicationStatus,
  updateJob,
} from "../controller/employer.controller.js";

const router = express.Router();

router.use(protectRoute, authorizeRoles("employer"));

router.get("/dashboard", getEmployerDashboard);

router.get("/jobs", getEmployerJobs);
router.post("/jobs", validateCreateJob, createJob);
router.put("/jobs/:id", validateObjectIdParam("id"), validateUpdateJob, updateJob);
router.patch("/jobs/:id/close", validateObjectIdParam("id"), closeJob);

router.get("/applicants", getApplicants);
router.patch("/applications/:id/status", validateObjectIdParam("id"), validateApplicationStatus, updateApplicationStatus);
router.post("/interviews", validateScheduleInterview, scheduleInterview);

router.get("/candidates/search", searchCandidates);

export default router;
