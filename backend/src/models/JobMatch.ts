import mongoose from "mongoose";

const { Schema } = mongoose;

export interface IJobMatch extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  matchScore: number; // 0-100 percentage
  similarityScore: number; // 0-1 cosine similarity
  notified: boolean;
  notificationSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const JobMatchSchema = new Schema<IJobMatch>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    matchScore: { type: Number, required: true, min: 0, max: 100 },
    similarityScore: { type: Number, required: true, min: 0, max: 1 },
    notified: { type: Boolean, default: false },
    notificationSentAt: Date,
  },
  { timestamps: true }
);

// Compound index for efficient querying
JobMatchSchema.index({ userId: 1, jobId: 1 }, { unique: true });
JobMatchSchema.index({ userId: 1, matchScore: -1 });

export const JobMatch = mongoose.model<IJobMatch>("JobMatch", JobMatchSchema);
