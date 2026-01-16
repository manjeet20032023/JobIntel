import mongoose from "mongoose";

const { Schema } = mongoose;

export interface IResumeEmbedding extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  embedding: number[];
  textHash: string; // To detect if resume changed
  createdAt: Date;
  updatedAt: Date;
}

const ResumeEmbeddingSchema = new Schema<IResumeEmbedding>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    embedding: { type: [Number], required: true }, // Vector of 1536 dimensions (OpenAI ada-002)
    textHash: { type: String, required: true }, // SHA256 hash of resume text
  },
  { timestamps: true }
);

export const ResumeEmbedding = mongoose.model<IResumeEmbedding>("ResumeEmbedding", ResumeEmbeddingSchema);
