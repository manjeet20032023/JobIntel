import { User } from "../models/User";
import { Job } from "../models/Job";
import { ResumeEmbedding } from "../models/ResumeEmbedding";
import { JobEmbedding } from "../models/JobEmbedding";
import { JobMatch } from "../models/JobMatch";
import { cosineSimilarity, similarityToMatchScore, meetsMatchThreshold } from "./embeddingService";

export interface MatchResult {
  userId: string;
  jobId: string;
  matchScore: number;
  similarityScore: number;
}

/**
 * Match a single job against all user resumes
 * @param jobId - Job ID to match
 * @param jobEmbedding - Job embedding vector
 * @returns Array of matching users and their scores
 */
export async function matchJobAgainstAllResumes(
  jobId: string,
  jobEmbedding: number[]
): Promise<MatchResult[]> {
  try {
    // Get all resume embeddings
    const resumeEmbeddings = await ResumeEmbedding.find().lean();

    if (resumeEmbeddings.length === 0) {
      console.log("No resume embeddings found");
      return [];
    }

    const matches: MatchResult[] = [];

    // Compare job embedding against each resume
    for (const resumeEmbed of resumeEmbeddings) {
      try {
        const similarity = cosineSimilarity(jobEmbedding, resumeEmbed.embedding);
        const matchScore = similarityToMatchScore(similarity);

        // Only save matches that meet threshold (70%)
        if (meetsMatchThreshold(similarity)) {
          matches.push({
            userId: resumeEmbed.userId.toString(),
            jobId,
            matchScore,
            similarityScore: similarity,
          });

          // Save to JobMatch collection
          await JobMatch.findOneAndUpdate(
            { userId: resumeEmbed.userId, jobId },
            {
              userId: resumeEmbed.userId,
              jobId,
              matchScore,
              similarityScore: similarity,
              notified: false,
            },
            { upsert: true, new: true }
          );
        }
      } catch (error) {
        console.error(
          `Error comparing job ${jobId} with resume ${resumeEmbed.userId}:`,
          error
        );
      }
    }

    return matches;
  } catch (error) {
    console.error("Error matching job against resumes:", error);
    throw error;
  }
}

/**
 * Get all matching jobs for a user
 * @param userId - User ID
 * @param minScore - Minimum match score (default 70)
 * @returns Array of matching jobs sorted by score
 */
export async function getUserMatchingJobs(
  userId: string,
  minScore: number = 70
): Promise<Array<any>> {
  try {
    const matches = await JobMatch.find({
      userId,
      matchScore: { $gte: minScore },
    })
      .sort({ matchScore: -1 })
      .populate("jobId")
      .lean();

    return matches.map((m: any) => ({
      ...m.jobId,
      matchScore: m.matchScore,
      similarityScore: m.similarityScore,
    }));
  } catch (error) {
    console.error("Error getting user matching jobs:", error);
    throw error;
  }
}

/**
 * Get match details between user resume and job
 * @param userId - User ID
 * @param jobId - Job ID
 * @returns Match details or null
 */
export async function getJobMatchDetails(userId: string, jobId: string) {
  try {
    return await JobMatch.findOne({ userId, jobId }).lean();
  } catch (error) {
    console.error("Error getting match details:", error);
    throw error;
  }
}

/**
 * Mark matches as notified
 * @param matches - Array of { userId, jobId }
 */
export async function markMatchesAsNotified(
  matches: Array<{ userId: string; jobId: string }>
): Promise<void> {
  try {
    const promises = matches.map((m) =>
      JobMatch.updateOne(
        { userId: m.userId, jobId: m.jobId },
        {
          notified: true,
          notificationSentAt: new Date(),
        }
      )
    );
    await Promise.all(promises);
  } catch (error) {
    console.error("Error marking matches as notified:", error);
    throw error;
  }
}

/**
 * Get unnotified matches for a job (new matches)
 * @param jobId - Job ID
 * @returns Unnotified matches
 */
export async function getUnnotifiedMatches(jobId: string) {
  try {
    return await JobMatch.find({
      jobId,
      notified: false,
    })
      .populate("userId", "email name notificationPrefs")
      .lean();
  } catch (error) {
    console.error("Error getting unnotified matches:", error);
    throw error;
  }
}
