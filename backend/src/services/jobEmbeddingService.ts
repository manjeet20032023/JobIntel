import { Job } from "../models/Job";
import { JobEmbedding } from "../models/JobEmbedding";
import { getEmbedding, hashText } from "./embeddingService";
import { matchJobAgainstAllResumes, markMatchesAsNotified } from "./matchingEngine";
import { enqueueNotification } from "../queues/notificationQueue";

/**
 * Generate embedding for job description
 * @param jobId - Job ID
 * @returns { embedding, textHash, matches }
 */
export async function generateJobEmbedding(jobId: string): Promise<{
  embedding: number[];
  textHash: string;
  matches: any[];
}> {
  try {
    const job = await Job.findById(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    // Combine job text for better embeddings
    const jobText = [
      job.title,
      job.description,
      (job.requirements || []).join(" "),
      (job.responsibilities || []).join(" "),
    ]
      .filter((s) => s && s.trim())
      .join(" ");

    if (!jobText || jobText.trim().length === 0) {
      throw new Error("Job has no content to embed");
    }

    // Generate hash to detect changes
    const textHash = hashText(jobText);

    // Check if we already have this exact job embedding (avoid regenerating)
    const existingEmbed = await JobEmbedding.findOne({ jobId });
    if (existingEmbed && existingEmbed.textHash === textHash) {
      console.log(`Job ${jobId} embedding already exists (unchanged)`);
      return { embedding: existingEmbed.embedding, textHash, matches: [] };
    }

    console.log(`Generating embedding for job ${jobId}...`);
    const embedding = await getEmbedding(jobText);

    // Save job embedding
    const savedEmbed = await JobEmbedding.findOneAndUpdate(
      { jobId },
      {
        jobId,
        embedding,
        textHash,
      },
      { upsert: true, new: true }
    );

    // Now match this job against all user resumes
    console.log(`Matching job ${jobId} against all resumes...`);
    const matches = await matchJobAgainstAllResumes(jobId, embedding);

    console.log(`Found ${matches.length} matches for job ${jobId}`);

    return { embedding, textHash, matches };
  } catch (error) {
    console.error("Error generating job embedding:", error);
    throw error;
  }
}

/**
 * Trigger notifications for new job matches
 * @param jobId - Job ID
 * @param matches - Array of { userId, matchScore, similarityScore }
 */
export async function triggerJobMatchNotifications(
  jobId: string,
  matches: any[]
): Promise<void> {
  try {
    if (matches.length === 0) {
      console.log("No matches to notify");
      return;
    }

    const job = await Job.findById(jobId).select("title").lean();
    if (!job) {
      console.warn(`Job ${jobId} not found for notification`);
      return;
    }

    // Get unnotified matches from DB
    const unnotifiedMatches = await JobEmbedding.aggregate([
      { $match: { jobId } },
      {
        $lookup: {
          from: "jobmatches",
          let: { jobId: "$jobId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$jobId", "$$jobId"] },
                notified: false,
              },
            },
          ],
          as: "matches",
        },
      },
    ]);

    if (!unnotifiedMatches || unnotifiedMatches.length === 0) {
      console.log("All matches already notified");
      return;
    }

    // Queue notification for each user
    const userIds = new Set<string>();
    for (const match of matches) {
      if (!userIds.has(match.userId)) {
        userIds.add(match.userId);

        const notificationPayload = {
          userId: match.userId,
          jobId,
          type: "new_job_match",
          channel: "email", // Default channel
          message: `New job match found: ${job.title} (Match Score: ${match.matchScore}%)`,
          data: {
            jobId,
            matchScore: match.matchScore,
            jobTitle: job.title,
          },
        };

        try {
          await enqueueNotification(notificationPayload);
          console.log(
            `Queued notification for user ${match.userId} on job ${jobId}`
          );
        } catch (error) {
          console.error(
            `Error queuing notification for user ${match.userId}:`,
            error
          );
        }
      }
    }

    // Mark as notified
    try {
      const matchIds = matches.map((m) => ({
        userId: m.userId,
        jobId,
      }));
      await markMatchesAsNotified(matchIds);
      console.log(`Marked ${matches.length} matches as notified`);
    } catch (error) {
      console.error("Error marking matches as notified:", error);
    }
  } catch (error) {
    console.error("Error triggering job match notifications:", error);
    throw error;
  }
}

/**
 * Get embedding for job (without regenerating)
 * @param jobId - Job ID
 * @returns Job embedding or null
 */
export async function getJobEmbedding(jobId: string) {
  return JobEmbedding.findOne({ jobId }).lean();
}
