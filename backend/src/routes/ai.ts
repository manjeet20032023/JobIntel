import express from 'express';
import { parseJobController, matchController, coverController } from '../controllers/aiController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { generateJobEmbedding, triggerJobMatchNotifications } from '../services/jobEmbeddingService';
import { getUserMatchingJobs } from '../services/matchingEngine';

const router = express.Router();

router.post('/parse', parseJobController);
router.post('/match', matchController);
router.post('/cover', coverController);

/**
 * POST /api/ai/job-embedding/:jobId
 * Admin endpoint to manually trigger job embedding (useful for re-embedding)
 * Requires admin role
 */
router.post(
  '/job-embedding/:jobId',
  authenticateToken,
  requireRole('admin'),
  async (req, res) => {
    try {
      const { jobId } = req.params;

      console.log(`Admin triggered embedding for job ${jobId}`);

      const { embedding, matches } = await generateJobEmbedding(jobId);

      // Trigger notifications for matching users
      if (matches && matches.length > 0) {
        try {
          await triggerJobMatchNotifications(jobId, matches);
        } catch (notifErr) {
          console.error('Error triggering match notifications:', notifErr);
        }
      }

      return res.json({
        success: true,
        jobId,
        matchCount: matches?.length || 0,
        embeddingDimensions: embedding.length,
      });
    } catch (error) {
      console.error('Error embedding job:', error);
      return res.status(500).json({
        error: 'Failed to embed job',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

/**
 * GET /api/ai/job-matches/:userId
 * Get all job matches for a user with their resume
 * Requires authentication
 */
router.get('/job-matches/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = (req as any).user;

    // Users can only see their own matches, admins can see any
    if (user._id.toString() !== userId && !user.roles?.includes('admin')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const minScore = parseInt(req.query.minScore as string) || 70;

    const matches = await getUserMatchingJobs(userId, minScore);

    return res.json({
      userId,
      minScore,
      matchCount: matches.length,
      matches,
    });
  } catch (error) {
    console.error('Error getting job matches:', error);
    return res.status(500).json({
      error: 'Failed to get job matches',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
