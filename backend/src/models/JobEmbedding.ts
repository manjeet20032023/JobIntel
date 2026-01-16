import mongoose from "mongoose";

const { Schema } = mongoose;

export interface IJobEmbedding extends mongoose.Document {
  jobId: mongoose.Types.ObjectId;
  embedding: number[];
  textHash: string; // To detect if job description changed
  createdAt: Date;
  updatedAt: Date;
}

const JobEmbeddingSchema = new Schema<IJobEmbedding>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true, unique: true, index: true },
    embedding: { type: [Number], required: true }, // Vector of 1536 dimensions (OpenAI ada-002)
    textHash: { type: String, required: true }, // SHA256 hash of job description
  },
  { timestamps: true }
);

export const JobEmbedding = mongoose.model<IJobEmbedding>("JobEmbedding", JobEmbeddingSchema);
