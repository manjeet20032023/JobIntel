import express, { Request, Response } from 'express';
import openWebNinjaService from '../services/openWebNinjaService';
import { authenticateToken as authenticate } from '../middleware/auth';
import * as scraperController from '../controllers/scraperController';
import * as linkedinScraperController from '../controllers/linkedinScraperController';
import debug from 'debug';

const log = debug('jobintel:scraper-routes');
const router = express.Router();

// ===== INDIA-FOCUSED LINKEDIN JOB SCRAPER ENDPOINTS =====

/**
 * GET /api/scraper/presets
 * Get all preset searches (India-focused)
 */
router.get('/presets', linkedinScraperController.getPresetSearches);

/**
 * GET /api/scraper/locations
 * Get all available Indian locations
 */
router.get('/locations', linkedinScraperController.getLocations);

/**
 * GET /api/scraper/experience-levels
 * Get experience level options
 */
router.get('/experience-levels', linkedinScraperController.getExperienceLevels);

/**
 * GET /api/scraper/employment-types
 * Get employment type options
 */
router.get('/employment-types', linkedinScraperController.getEmploymentTypes);

/**
 * GET /api/scraper/trending
 * Get trending jobs across India
 */
router.get('/trending', linkedinScraperController.getTrendingJobs);

/**
 * GET /api/scraper/salary
 * Get salary insights for a position and location in India
 * Query: position, location, experienceLevel
 */
router.get('/salary', linkedinScraperController.getSalaryInsights);

/**
 * POST /api/scraper/preset-search
 * Run one of the preset searches
 * Body: { presetId: number, pages?: number }
 */
router.post('/preset-search', linkedinScraperController.runPresetSearch);

/**
 * POST /api/scraper/advanced-search
 * Advanced job search with custom filters
 * Body: { keyword, location, employmentType, datePosted, remote, experienceLevel, pages }
 */
router.post('/advanced-search', linkedinScraperController.advancedSearch);

/**
 * POST /api/scraper/company-search
 * Search jobs by company name
 * Body: { company, location? }
 */
router.post('/company-search', linkedinScraperController.searchByCompany);

/**
 * GET /api/scraper/history
 * Get user's search history (Protected)
 */
router.get('/history', authenticate, linkedinScraperController.getSearchHistory);

/**
 * GET /api/scraper/results/:searchId
 * Get results from a specific search (Protected)
 */
router.get('/results/:searchId', authenticate, linkedinScraperController.getSearchResults);

/**
 * POST /api/scraper/export/:searchId
 * Export search results to CSV or JSON (Protected)
 */
router.post('/export/:searchId', authenticate, linkedinScraperController.exportJobsToCSV);

/**
 * POST /api/scraper/export-all
 * Bulk export all user searches (Protected)
 */
router.post('/export-all', authenticate, linkedinScraperController.bulkExportSearches);

/**
 * POST /api/scraper/export-salary
 * Export salary data (Protected)
 */
router.post('/export-salary', authenticate, linkedinScraperController.exportSalaryData);

/**
 * GET /api/scraper/salary-report
 * Get salary comparison report
 */
router.get('/salary-report', linkedinScraperController.getSalaryReport);

// ===== LEGACY ENDPOINTS (Keep for backward compatibility) =====

/**
 * POST /api/scraper/search
 * Search for jobs on LinkedIn via OpenWeb Ninja
 */
router.post('/search', async (req: Request, res: Response) => {
  try {
    const {
      query,
      country = 'India',
      page = 1,
      num_pages = 1,
      employment_type,
      date_posted,
      remote_jobs_only = false,
    } = req.body;

    log(`🔍 Job search: ${query} in ${country}`);

    const result = await openWebNinjaService.searchJobs({
      query,
      country,
      page,
      num_pages,
      employment_type,
      date_posted,
      remote_jobs_only,
    });

    res.json({
      success: true,
      data: result.data,
      count: result.data?.length || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    log(`❌ Search error: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/scraper/job/:jobId
 * Get detailed job information
 */
router.get('/job/:jobId', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    log(`📋 Getting job details: ${jobId}`);

    const result = await openWebNinjaService.getJobDetails(jobId);

    res.json({
      success: true,
      data: result.data,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    log(`❌ Job details error: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/scraper/salary
 * Query salary information
 */
router.post('/salary', async (req: Request, res: Response) => {
  try {
    const {
      job_title,
      location,
      experience_level,
      company,
    } = req.body;

    log(`💰 Salary query: ${job_title} in ${location}`);

    const result = await openWebNinjaService.querySalary({
      job_title,
      location,
      experience_level,
      company,
    });

    res.json({
      success: true,
      data: result.data,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    log(`❌ Salary query error: ${error.message}`);
    res.status(400).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
