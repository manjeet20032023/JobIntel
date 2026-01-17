import mongoose, { Schema, Document } from 'mongoose';

export interface IScraperJob extends Document {
  jobId: string;
  title: string;
  company: string;
  location: string;
  salary?: {
    min?: number;
    max?: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  benefits?: string[];
  experienceLevel?: string;
  employmentType: string;
  remote: boolean;
  postedDate: Date;
  applyUrl: string;
  rawData: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface IScraperSearch extends Document {
  userId?: mongoose.Types.ObjectId;
  searchQuery: string;
  filters: {
    keyword?: string;
    location?: string;
    employmentType?: string;
    datePosted?: string;
    remote?: boolean;
    experienceLevel?: string;
    salaryMin?: number;
    salaryMax?: number;
  };
  resultsCount: number;
  results: mongoose.Types.ObjectId[];
  status: 'pending' | 'completed' | 'failed';
  error?: string;
  executedAt: Date;
  createdAt: Date;
}

export interface ISalaryData extends Document {
  position: string;
  location: string;
  experienceLevel?: string;
  salaryRange: {
    min: number;
    max: number;
    median: number;
    currency: string;
  };
  currency: string;
  dataSource: string;
  sampleSize: number;
  lastUpdated: Date;
  createdAt: Date;
}

// Scraper Job Schema
const scraperJobSchema = new Schema<IScraperJob>(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      index: true,
    },
    company: {
      type: String,
      required: true,
      index: true,
    },
    location: {
      type: String,
      required: true,
      index: true,
    },
    salary: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'INR',
      },
    },
    description: String,
    requirements: [String],
    benefits: [String],
    experienceLevel: String,
    employmentType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contractor', 'Internship'],
    },
    remote: {
      type: Boolean,
      default: false,
      index: true,
    },
    postedDate: {
      type: Date,
      index: true,
    },
    applyUrl: String,
    rawData: Schema.Types.Mixed,
  },
  {
    timestamps: true,
    collection: 'scraper_jobs',
  }
);

// Scraper Search Schema (for history)
const scraperSearchSchema = new Schema<IScraperSearch>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    searchQuery: {
      type: String,
      required: true,
    },
    filters: {
      keyword: String,
      location: String,
      employmentType: String,
      datePosted: String,
      remote: Boolean,
      experienceLevel: String,
      salaryMin: Number,
      salaryMax: Number,
    },
    resultsCount: {
      type: Number,
      default: 0,
    },
    results: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ScraperJob',
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    error: String,
    executedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'scraper_searches',
  }
);

// Salary Data Schema
const salaryDataSchema = new Schema<ISalaryData>(
  {
    position: {
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
    salaryRange: {
      min: {
        type: Number,
        required: true,
      },
      max: {
        type: Number,
        required: true,
      },
      median: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: 'INR',
      },
    },
    currency: {
      type: String,
      default: 'INR',
    },
    dataSource: String,
    sampleSize: Number,
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'salary_data',
  }
);

// Create compound indexes for common queries
scraperJobSchema.index({ location: 1, employmentType: 1 });
scraperJobSchema.index({ company: 1, location: 1 });
scraperJobSchema.index({ title: 1, location: 1 });
scraperJobSchema.index({ 'salary.min': 1, 'salary.max': 1 });

scraperSearchSchema.index({ userId: 1, createdAt: -1 });
scraperSearchSchema.index({ status: 1, createdAt: -1 });

salaryDataSchema.index({ position: 1, location: 1, experienceLevel: 1 });

// Export models - with guards to prevent recompilation during hot reload
export const ScraperJob = mongoose.models.ScraperJob || mongoose.model<IScraperJob>('ScraperJob', scraperJobSchema);
export const ScraperSearch = mongoose.models.ScraperSearch || mongoose.model<IScraperSearch>('ScraperSearch', scraperSearchSchema);
export const SalaryData = mongoose.models.SalaryData || mongoose.model<ISalaryData>('SalaryData', salaryDataSchema);
