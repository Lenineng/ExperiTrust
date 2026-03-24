import express from "express";
import { authorizeRoles, protectRoute } from "../middleware/auth.middleware.js";
import { validateApplyToJob, validateCreateExperience, validateObjectIdParam } from "../middleware/validate.middleware.js";
import {
  applyToJob,
  createExperience,
  getMyApplicationInterview,
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
router.get("/applications/:id/interview", validateObjectIdParam("id"), getMyApplicationInterview);

export default router;
