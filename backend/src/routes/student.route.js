import express from "express";
import { authorizeRoles, protectRoute } from "../middleware/auth.middleware.js";
import { validateApplyToJob, validateCreateExperience } from "../middleware/validate.middleware.js";
import {
  applyToJob,
  createExperience,
  getMyApplications,
  getStudentDashboard,
  getStudentExperiences,
  listOpenJobs,
} from "../controller/student.controller.js";

const router = express.Router();

router.use(protectRoute, authorizeRoles("student"));

router.get("/dashboard", getStudentDashboard);
router.get("/experiences", getStudentExperiences);
router.post("/experiences", validateCreateExperience, createExperience);
router.get("/jobs", listOpenJobs);
router.post("/applications", validateApplyToJob, applyToJob);
router.get("/applications", getMyApplications);

export default router;
