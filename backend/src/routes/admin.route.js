import express from "express";
import { authorizeRoles, protectRoute } from "../middleware/auth.middleware.js";
import { validateObjectIdParam, validateVerifyExperience } from "../middleware/validate.middleware.js";
import {
  getAdminDashboard,
  getAllStudents,
  getPendingExperiences,
  getVerifiedExperiences,
  rejectExperience,
  verifyExperience,
} from "../controller/admin.controller.js";

const router = express.Router();

router.use(protectRoute, authorizeRoles("admin"));

router.get("/dashboard", getAdminDashboard);
router.get("/experiences/pending", getPendingExperiences);
router.get("/experiences/verified", getVerifiedExperiences);
router.patch("/experiences/:id/verify", validateObjectIdParam("id"), validateVerifyExperience, verifyExperience);
router.patch("/experiences/:id/reject", validateObjectIdParam("id"), rejectExperience);
router.get("/students", getAllStudents);

export default router;
