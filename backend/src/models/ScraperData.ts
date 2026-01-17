import mongoose, { Schema, Document } from 'mongoose';

/**
 * ScraperSearch - Stores job scraper search history
 * This model tracks all searches performed by users
 */
interface IScraperSearch extends Document {
  userId: mongoose.Types.ObjectId;
  query: string;
  country: string;
  employmentType?: string;
  datePosted?: string;
  remoteOnly?: boolean;
  page?: number;
  numPages?: number;
  resultCount: number;
  results: Array<{
    jobId: string;
    title: string;
    company: string;
    location: string;
    salary?: {
      min?: number;
      max?: number;
      currency?: string;
    };
    link: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ScraperSearchSchema = new Schema<IScraperSearch>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    query: {
      type: String,
      required: true,
      index: true,
    },
    country: {
      type: String,
      required: true,
      index: true,
    },
    employmentType: String,
    datePosted: String,
    remoteOnly: { type: Boolean, default: false },
    page: { type: Number, default: 1 },
    numPages: { type: Number, default: 1 },
    resultCount: {
      type: Number,
      default: 0,
      index: true,
    },
    results: [
      {
        jobId: String,
        title: String,
        company: String,
        location: String,
        salary: {
          min: Number,
          max: Number,
          currency: String,
        },
        link: String,
      },
    ],
  },
  { timestamps: true }
);

/**
 * ScraperSalaryQuery - Stores salary intelligence queries
 * Caches salary data to reduce API calls
 */
interface IScraperSalaryQuery extends Document {
  jobTitle: string;
  location: string;
  experienceLevel?: string;
  company?: string;
  salaryData: {
    currency: string;
    median?: number;
    min?: number;
    max?: number;
    sourceCount: number;
  };
  queried: number;
  lastQueried: Date;
}

const ScraperSalaryQuerySchema = new Schema<IScraperSalaryQuery>(
  {
    jobTitle: {
      type: String,
      required: true,
      index: true,
    },
    location: {
      type: String,
      required: true,
      index: true,
    },
    experienceLevel: String,
    company: String,
    salaryData: {
      currency: String,
      median: Number,
      min: Number,
      max: Number,
      sourceCount: { type: Number, default: 0 },
    },
    queried: {
      type: Number,
      default: 0,
    },
    lastQueried: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

/**
 * SavedJob - User's saved/bookmarked jobs from scraper
 */
interface ISavedJob extends Document {
  userId: mongoose.Types.ObjectId;
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  jobLink: string;
  source: 'linkedin' | 'company_page' | 'other';
  notes?: string;
  savedAt: Date;
}

const SavedJobSchema = new Schema<ISavedJob>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    jobId: {
      type: String,
      required: true,
      index: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
      index: true,
    },
    location: String,
    salary: {
      min: Number,
      max: Number,
      currency: String,
    },
    jobLink: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      enum: ['linkedin', 'company_page', 'other'],
      default: 'linkedin',
    },
    notes: String,
    savedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

// Create compound unique index to prevent duplicate saved jobs per user
ScraperSearchSchema.index({ userId: 1, query: 1, country: 1 });
SavedJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });
ScraperSalaryQuerySchema.index(
  { jobTitle: 1, location: 1, experienceLevel: 1 },
  { unique: true }
);

export const ScraperSearch = mongoose.model<IScraperSearch>(
  'ScraperSearch',
  ScraperSearchSchema
);

export const ScraperSalaryQuery = mongoose.model<IScraperSalaryQuery>(
  'ScraperSalaryQuery',
  ScraperSalaryQuerySchema
);

export const SavedJob = mongoose.model<ISavedJob>(
  'SavedJob',
  SavedJobSchema
);

export { IScraperSearch, IScraperSalaryQuery, ISavedJob };
