import { Parser } from 'json2csv';
import * as fs from 'fs';
import * as path from 'path';

export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  includeMetadata?: boolean;
  filters?: {
    minSalary?: number;
    maxSalary?: number;
    location?: string;
    employmentType?: string;
  };
}

class DataExportService {
  private exportsDir = path.join(process.cwd(), 'exports');

  constructor() {
    this.ensureExportsDir();
  }

  /**
   * Ensure exports directory exists
   */
  private ensureExportsDir() {
    if (!fs.existsSync(this.exportsDir)) {
      fs.mkdirSync(this.exportsDir, { recursive: true });
    }
  }

  /**
   * Export jobs to CSV
   */
  async exportToCSV(
    jobs: any[],
    fileName?: string
  ): Promise<{
    success: boolean;
    filePath?: string;
    fileName?: string;
    error?: string;
  }> {
    try {
      const fields = [
        'jobId',
        'title',
        'company',
        'location',
        'salary.min',
        'salary.max',
        'salary.currency',
        'employmentType',
        'remote',
        'postedDate',
        'description',
        'applyUrl',
      ];

      const parser = new Parser({ fields });
      const csv = parser.parse(jobs);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const file = fileName || `jobs_${timestamp}.csv`;
      const filePath = path.join(this.exportsDir, file);

      fs.writeFileSync(filePath, csv);

      return {
        success: true,
        filePath,
        fileName: file,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Export jobs to JSON
   */
  async exportToJSON(
    jobs: any[],
    fileName?: string,
    metadata?: any
  ): Promise<{
    success: boolean;
    filePath?: string;
    fileName?: string;
    error?: string;
  }> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const file = fileName || `jobs_${timestamp}.json`;
      const filePath = path.join(this.exportsDir, file);

      const data = {
        exportedAt: new Date().toISOString(),
        jobCount: jobs.length,
        metadata: metadata || {},
        jobs,
      };

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

      return {
        success: true,
        filePath,
        fileName: file,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Filter jobs by criteria
   */
  filterJobs(
    jobs: any[],
    filters: ExportOptions['filters']
  ): any[] {
    if (!filters) return jobs;

    return jobs.filter((job) => {
      if (filters.minSalary && job.salary?.min < filters.minSalary) return false;
      if (filters.maxSalary && job.salary?.max > filters.maxSalary) return false;
      if (filters.location && !job.location.includes(filters.location)) return false;
      if (filters.employmentType && job.employmentType !== filters.employmentType) return false;
      return true;
    });
  }

  /**
   * Export salary data
   */
  async exportSalaryData(
    data: any[],
    fileName?: string
  ): Promise<{
    success: boolean;
    filePath?: string;
    fileName?: string;
    error?: string;
  }> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const file = fileName || `salary_data_${timestamp}.csv`;
      const filePath = path.join(this.exportsDir, file);

      const fields = [
        'position',
        'location',
        'experienceLevel',
        'salaryRange.min',
        'salaryRange.max',
        'salaryRange.median',
        'currency',
        'dataSource',
        'sampleSize',
      ];

      const parser = new Parser({ fields });
      const csv = parser.parse(data);

      fs.writeFileSync(filePath, csv);

      return {
        success: true,
        filePath,
        fileName: file,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate salary comparison report
   */
  generateSalaryComparison(salaryData: any[]): any {
    const byPosition = new Map();
    const byLocation = new Map();

    salaryData.forEach((data) => {
      // Group by position
      if (!byPosition.has(data.position)) {
        byPosition.set(data.position, []);
      }
      byPosition.get(data.position).push(data);

      // Group by location
      if (!byLocation.has(data.location)) {
        byLocation.set(data.location, []);
      }
      byLocation.get(data.location).push(data);
    });

    return {
      totalPositions: byPosition.size,
      totalLocations: byLocation.size,
      byPosition: Object.fromEntries(byPosition),
      byLocation: Object.fromEntries(byLocation),
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Get available exports
   */
  getAvailableExports(): string[] {
    try {
      return fs.readdirSync(this.exportsDir);
    } catch (error) {
      return [];
    }
  }

  /**
   * Delete old exports (older than 7 days)
   */
  cleanupOldExports(daysOld: number = 7): number {
    const now = Date.now();
    const maxAge = daysOld * 24 * 60 * 60 * 1000;
    let deletedCount = 0;

    try {
      const files = fs.readdirSync(this.exportsDir);

      files.forEach((file) => {
        const filePath = path.join(this.exportsDir, file);
        const stats = fs.statSync(filePath);

        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      });
    } catch (error) {
      console.error('Error cleaning up exports:', error);
    }

    return deletedCount;
  }
}

export const dataExportService = new DataExportService();
