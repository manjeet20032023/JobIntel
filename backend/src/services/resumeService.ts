import { User } from "../models/User";
import { ResumeEmbedding, IResumeEmbedding } from "../models/ResumeEmbedding";
import { getEmbedding, hashText } from "./embeddingService";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

/**
 * Parse PDF or DOCX resume text
 * @param buffer - File buffer
 * @param mimeType - File MIME type
 * @returns Extracted text
 */
export async function parseResumeFile(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  try {
    if (mimeType === "application/pdf") {
      const pdf = await pdfParse(buffer);
      return pdf.text;
    } else if (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimeType === "application/msword"
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else {
      throw new Error("Unsupported file type. Only PDF and DOCX are supported.");
    }
  } catch (error) {
    console.error("Error parsing resume file:", error);
    throw error;
  }
}

/**
 * Process resume: parse, extract text, generate embedding
 * @param userId - User ID
 * @param buffer - File buffer
 * @param mimeType - File MIME type
 * @returns { resumeText, embedding, textHash }
 */
export async function processResume(
  userId: string,
  buffer: Buffer,
  mimeType: string
): Promise<{
  resumeText: string;
  embedding: number[];
  textHash: string;
}> {
  try {
    // Parse resume file
    const resumeText = await parseResumeFile(buffer, mimeType);

    if (!resumeText || resumeText.trim().length === 0) {
      throw new Error("Resume file is empty");
    }

    // Generate hash to detect changes
    const textHash = hashText(resumeText);

    // Generate embedding
    console.log(`Generating embedding for user ${userId}...`);
    const embedding = await getEmbedding(resumeText);

    // Update user with resume text
    await User.findByIdAndUpdate(userId, {
      resume: {
        rawText: resumeText,
        parsedAt: new Date(),
      },
    });

    // Save or update embedding
    await ResumeEmbedding.findOneAndUpdate(
      { userId },
      {
        userId,
        embedding,
        textHash,
      },
      { upsert: true, new: true }
    );

    console.log(`Resume processed successfully for user ${userId}`);

    return { resumeText, embedding, textHash };
  } catch (error) {
    console.error("Error processing resume:", error);
    throw error;
  }
}

/**
 * Get resume embedding for user (without re-processing)
 * @param userId - User ID
 * @returns Embedding or null if not found
 */
export async function getResumeEmbedding(
  userId: string
): Promise<IResumeEmbedding | null> {
  return ResumeEmbedding.findOne({ userId }).lean();
}

/**
 * Check if user has resume
 * @param userId - User ID
 * @returns true if user has resume text
 */
export async function userHasResume(userId: string): Promise<boolean> {
  const user = await User.findById(userId).select("resume").lean();
  return !!(user?.resume?.rawText && user.resume.rawText.trim().length > 0);
}
