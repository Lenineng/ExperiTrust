import express from "express";
import { authorizeRoles, protectRoute } from "../middleware/auth.middleware.js";
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
router.post("/jobs", createJob);
router.put("/jobs/:id", updateJob);
router.patch("/jobs/:id/close", closeJob);

router.get("/applicants", getApplicants);
router.patch("/applications/:id/status", updateApplicationStatus);
router.post("/interviews", scheduleInterview);

router.get("/candidates/search", searchCandidates);

export default router;
