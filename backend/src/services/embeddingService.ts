import crypto from "crypto";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const OPENAI_KEY = process.env.OPENAI_API_KEY || "";
const EMBEDDINGS_URL = process.env.OPENAI_EMBEDDINGS_URL || "https://api.openai.com/v1/embeddings";
const EMBEDDINGS_MODEL = process.env.OPENAI_EMBEDDINGS_MODEL || "text-embedding-ada-002";

/**
 * Generate SHA256 hash of text
 */
export function hashText(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

/**
 * Calculate cosine similarity between two vectors
 * @param vecA - Vector A
 * @param vecB - Vector B
 * @returns Similarity score between 0 and 1
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same dimension");
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Get embedding from OpenAI
 * @param text - Text to embed
 * @returns Embedding vector (1536 dimensions for ada-002)
 */
export async function getEmbedding(text: string): Promise<number[]> {
  if (!OPENAI_KEY) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  // Truncate text to avoid token limits (OpenAI has limits)
  const maxChars = 8000;
  const truncatedText = text.length > maxChars ? text.substring(0, maxChars) : text;

  try {
    const response = await fetch(EMBEDDINGS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        input: truncatedText,
        model: EMBEDDINGS_MODEL,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as any;
    const embedding = data?.data?.[0]?.embedding;

    if (!embedding || !Array.isArray(embedding)) {
      throw new Error("Invalid embedding response from OpenAI");
    }

    return embedding;
  } catch (error) {
    console.error("Error getting embedding:", error);
    throw error;
  }
}

/**
 * Convert similarity score (0-1) to match percentage (0-100)
 * @param similarity - Cosine similarity score
 * @returns Match score as percentage
 */
export function similarityToMatchScore(similarity: number): number {
  // Convert 0-1 to 0-100
  return Math.round(similarity * 100);
}

/**
 * Check if similarity meets threshold (70%)
 * @param similarity - Cosine similarity score
 * @returns true if similarity >= 0.7
 */
export function meetsMatchThreshold(similarity: number): boolean {
  return similarity >= 0.7;
}
