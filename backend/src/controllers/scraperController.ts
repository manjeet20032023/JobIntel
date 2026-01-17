import { Request, Response } from 'express';
import { ScraperSearch, SavedJob, ScraperSalaryQuery } from '../models/ScraperData';
import { User } from '../models/User';
import debug from 'debug';

const log = debug('jobintel:scraper-controller');

/**
 * Get user's search history
 */
export const getSearchHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const searches = await ScraperSearch.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ScraperSearch.countDocuments({ userId });

    res.json({
      success: true,
      data: searches,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    log('Error getting search history:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Save search results
 */
export const saveSearch = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const {
      query,
      country,
      employmentType,
      datePosted,
      remoteOnly,
      page,
      numPages,
      results,
    } = req.body;

    const search = new ScraperSearch({
      userId,
      query,
      country,
      employmentType,
      datePosted,
      remoteOnly,
      page,
      numPages,
      resultCount: results?.length || 0,
      results,
    });

    await search.save();

    log(`✅ Search saved: ${query} in ${country}`);

    res.json({
      success: true,
      data: search,
      message: `Search saved with ${search.resultCount} results`,
    });
  } catch (error: any) {
    log('Error saving search:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Delete search from history
 */
export const deleteSearch = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { searchId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const search = await ScraperSearch.findOneAndDelete({
      _id: searchId,
      userId,
    });

    if (!search) {
      return res
        .status(404)
        .json({ success: false, error: 'Search not found' });
    }

    res.json({
      success: true,
      message: 'Search deleted successfully',
    });
  } catch (error: any) {
    log('Error deleting search:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get saved jobs
 */
export const getSavedJobs = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const savedJobs = await SavedJob.find({ userId })
      .sort({ savedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SavedJob.countDocuments({ userId });

    res.json({
      success: true,
      data: savedJobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    log('Error getting saved jobs:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Save a job
 */
export const saveJob = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const {
      jobId,
      jobTitle,
      company,
      location,
      salary,
      jobLink,
      source = 'linkedin',
      notes,
    } = req.body;

    // Check if already saved
    const existing = await SavedJob.findOne({ userId, jobId });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Job already saved',
      });
    }

    const savedJob = new SavedJob({
      userId,
      jobId,
      jobTitle,
      company,
      location,
      salary,
      jobLink,
      source,
      notes,
    });

    await savedJob.save();

    log(`✅ Job saved: ${jobTitle} at ${company}`);

    res.json({
      success: true,
      data: savedJob,
      message: 'Job saved successfully',
    });
  } catch (error: any) {
    log('Error saving job:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Remove saved job
 */
export const removeSavedJob = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { jobId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const result = await SavedJob.findOneAndDelete({
      userId,
      jobId,
    });

    if (!result) {
      return res
        .status(404)
        .json({ success: false, error: 'Saved job not found' });
    }

    res.json({
      success: true,
      message: 'Job removed from saved',
    });
  } catch (error: any) {
    log('Error removing saved job:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Check if job is saved
 */
export const isJobSaved = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { jobId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const saved = await SavedJob.findOne({ userId, jobId });

    res.json({
      success: true,
      saved: !!saved,
      data: saved || null,
    });
  } catch (error: any) {
    log('Error checking saved job:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get salary query history/cache
 */
export const getSalaryData = async (req: Request, res: Response) => {
  try {
    const { jobTitle, location, experienceLevel } = req.query;

    if (!jobTitle || !location) {
      return res.status(400).json({
        success: false,
        error: 'Job title and location are required',
      });
    }

    const query: any = {
      jobTitle,
      location,
    };

    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    const salaryData = await ScraperSalaryQuery.findOne(query);

    if (!salaryData) {
      return res.status(404).json({
        success: false,
        error: 'Salary data not found',
      });
    }

    res.json({
      success: true,
      data: salaryData,
    });
  } catch (error: any) {
    log('Error getting salary data:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Cache salary query result
 */
export const cacheSalaryData = async (req: Request, res: Response) => {
  try {
    const {
      jobTitle,
      location,
      experienceLevel,
      company,
      salaryData,
    } = req.body;

    let query = await ScraperSalaryQuery.findOne({
      jobTitle,
      location,
      experienceLevel,
      company,
    });

    if (query) {
      query.salaryData = salaryData;
      query.queried += 1;
      query.lastQueried = new Date();
      await query.save();
    } else {
      query = new ScraperSalaryQuery({
        jobTitle,
        location,
        experienceLevel,
        company,
        salaryData,
        queried: 1,
      });
      await query.save();
    }

    log(`✅ Salary data cached: ${jobTitle} in ${location}`);

    res.json({
      success: true,
      data: query,
    });
  } catch (error: any) {
    log('Error caching salary data:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
