import { Router } from "express";
import {
  uploadResume,
  getResumeStatus,
  getMatchingJobs,
  upload,
} from "../controllers/resumeController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// All resume endpoints require authentication
router.use(authenticateToken);

/**
 * POST /api/resume/upload
 * Upload and process resume (PDF or DOCX)
 */
router.post("/upload", upload.single("resume"), uploadResume);

/**
 * GET /api/resume/status
 * Get resume upload status for authenticated user
 */
router.get("/status", getResumeStatus);

/**
 * GET /api/resume/matching-jobs
 * Get all jobs matching user's resume (sorted by match score)
 * Query params: minScore (default 70)
 */
router.get("/matching-jobs", getMatchingJobs);

export default router;
