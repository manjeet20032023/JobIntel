import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  TrendingUp,
  Filter,
  Clock,
  BookmarkPlus,
  Loader,
  AlertCircle,
  Send,
  History,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';

interface Job {
  job_id: string;
  job_title: string;
  company_name: string;
  location: string;
  job_link: string;
  job_snippet: string;
  employment_type?: string;
  salary_currency?: string;
  salary_min?: number;
  salary_max?: number;
}

interface SearchResult {
  status: string;
  data: Job[];
  count: number;
}

interface FilterOptions {
  countries: string[];
  employmentTypes: Array<{ value: string; label: string }>;
  dateFilters: Array<{ value: string; label: string }>;
  experienceLevels: Array<{ value: string; label: string }>;
  preBuiltSearches: Array<{
    id: number;
    query: string;
    country: string;
  }>;
}

const ScraperComponent: React.FC = () => {
  const { user } = useAuthStore();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

  // State
  const [activeTab, setActiveTab] = useState('quick-search');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Job[]>([]);
  const [resultCount, setResultCount] = useState(0);

  // Search filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('USA');
  const [selectedEmploymentType, setSelectedEmploymentType] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [numPages, setNumPages] = useState(1);

  // Salary search
  const [salaryQuery, setSalaryQuery] = useState('');
  const [salaryLocation, setSalaryLocation] = useState('USA');
  const [salaryExperience, setSalaryExperience] = useState('');
  const [salaryResults, setSalaryResults] = useState<any>(null);
  const [salaryLoading, setSalaryLoading] = useState(false);

  // Filter options
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    countries: [],
    employmentTypes: [],
    dateFilters: [],
    experienceLevels: [],
    preBuiltSearches: [],
  });

  // Load filter options
  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      const [countries, types, dates, levels, searches] = await Promise.all([
        axios.get(`${API_URL}/scraper/countries`),
        axios.get(`${API_URL}/scraper/employment-types`),
        axios.get(`${API_URL}/scraper/date-filters`),
        axios.get(`${API_URL}/scraper/experience-levels`),
        axios.get(`${API_URL}/scraper/prebuilt-searches`),
      ]);

      setFilterOptions({
        countries: countries.data.data,
        employmentTypes: types.data.data.map((t: string) => ({
          value: t.toLowerCase(),
          label: t,
        })),
        dateFilters: dates.data.data,
        experienceLevels: levels.data.data,
        preBuiltSearches: searches.data.data,
      });
    } catch (err) {
      console.error('Failed to load filter options:', err);
    }
  };

  // Search jobs
  const handleSearch = async (
    query: string,
    country: string,
    employment?: string,
    date?: string,
    remote?: boolean,
    pages?: number
  ) => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await axios.post(`${API_URL}/scraper/search`, {
        query,
        country,
        employment_type: employment,
        date_posted: date,
        remote_jobs_only: remote,
        num_pages: pages || 1,
      });

      const data = response.data;
      setResults(data.data || []);
      setResultCount(data.count || 0);

      // Save to history if authenticated
      if (user) {
        try {
          await axios.post(
            `${API_URL}/scraper/history`,
            {
              query,
              country,
              employmentType: employment,
              datePosted: date,
              remoteOnly: remote,
              numPages: pages || 1,
              results: (data.data || []).slice(0, 10).map((job: Job) => ({
                jobId: job.job_id,
                title: job.job_title,
                company: job.company_name,
                location: job.location,
                salary: {
                  min: job.salary_min,
                  max: job.salary_max,
                  currency: job.salary_currency,
                },
                link: job.job_link,
              })),
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );
        } catch (err) {
          console.error('Failed to save search history:', err);
        }
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          'Failed to search jobs. Please try again.'
      );
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Query salary
  const handleSalaryQuery = async () => {
    if (!salaryQuery.trim() || !salaryLocation.trim()) {
      setError('Please enter job title and location');
      return;
    }

    setSalaryLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/scraper/salary`, {
        job_title: salaryQuery,
        location: salaryLocation,
        experience_level: salaryExperience,
      });

      setSalaryResults(response.data.data);

      // Cache the result
      if (user) {
        try {
          await axios.post(
            `${API_URL}/scraper/salary-cache`,
            {
              jobTitle: salaryQuery,
              location: salaryLocation,
              experienceLevel: salaryExperience,
              salaryData: response.data.data,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );
        } catch (err) {
          console.error('Failed to cache salary data:', err);
        }
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          'Failed to query salary data. Please try again.'
      );
      setSalaryResults(null);
    } finally {
      setSalaryLoading(false);
    }
  };

  // Save job
  const handleSaveJob = async (job: Job) => {
    if (!user) {
      setError('Please log in to save jobs');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/scraper/saved-jobs`,
        {
          jobId: job.job_id,
          jobTitle: job.job_title,
          company: job.company_name,
          location: job.location,
          salary: {
            min: job.salary_min,
            max: job.salary_max,
            currency: job.salary_currency,
          },
          jobLink: job.job_link,
          source: 'linkedin',
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      alert('Job saved successfully!');
    } catch (err: any) {
      if (err.response?.status === 400) {
        alert('This job is already saved');
      } else {
        setError('Failed to save job');
      }
    }
  };

  return (
    <div className="w-full bg-background rounded-lg border border-border">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">LinkedIn Job Scraper v3.0</h2>
        </div>
        <p className="text-muted-foreground">
          Real-time job intelligence powered by OpenWeb Ninja JSearch API
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full rounded-none border-b bg-muted/30 p-0">
          <TabsTrigger value="quick-search" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Quick Search
          </TabsTrigger>
          <TabsTrigger value="advanced-search" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Advanced Search
          </TabsTrigger>
          <TabsTrigger value="salary-intel" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Salary Intelligence
          </TabsTrigger>
        </TabsList>

        {/* Error Message */}
        {error && (
          <div className="m-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive">Error</p>
              <p className="text-sm text-destructive/80">{error}</p>
            </div>
          </div>
        )}

        {/* Quick Search Tab */}
        <TabsContent value="quick-search" className="p-6 space-y-6">
          <div>
            <h3 className="font-semibold mb-4">Pre-built Searches</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filterOptions.preBuiltSearches.map((search) => (
                <Button
                  key={search.id}
                  variant="outline"
                  className="h-auto flex-col items-start justify-start p-4 hover:bg-primary/10"
                  onClick={() =>
                    handleSearch(search.query, search.country)
                  }
                  disabled={loading}
                >
                  <div className="font-semibold text-left">{search.query}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {search.country}
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Custom Quick Search</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., Data Scientist, Full Stack Developer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button
                onClick={() =>
                  handleSearch(
                    searchQuery,
                    selectedCountry,
                    '',
                    '',
                    false,
                    numPages
                  )
                }
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Search
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Advanced Search Tab */}
        <TabsContent value="advanced-search" className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Job Title */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Job Title / Keywords *
              </label>
              <input
                type="text"
                placeholder="e.g., Software Engineer, Product Manager..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Country *
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {filterOptions.countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            {/* Employment Type */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Employment Type
              </label>
              <select
                value={selectedEmploymentType}
                onChange={(e) => setSelectedEmploymentType(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Any</option>
                {filterOptions.employmentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Posted */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Posted Date
              </label>
              <select
                value={selectedDateFilter}
                onChange={(e) => setSelectedDateFilter(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Any Time</option>
                {filterOptions.dateFilters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Number of Pages */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Results Pages (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={numPages}
                onChange={(e) => setNumPages(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Remote Jobs Only */}
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remoteOnly}
                  onChange={(e) => setRemoteOnly(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-semibold">Remote Jobs Only</span>
              </label>
            </div>
          </div>

          <Button
            onClick={() =>
              handleSearch(
                searchQuery,
                selectedCountry,
                selectedEmploymentType,
                selectedDateFilter,
                remoteOnly,
                numPages
              )
            }
            disabled={loading}
            size="lg"
            className="w-full gap-2"
          >
            {loading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Search Jobs
          </Button>
        </TabsContent>

        {/* Salary Intelligence Tab */}
        <TabsContent value="salary-intel" className="p-6 space-y-6">
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              💡 Get estimated salary ranges for any job position and location combination. Compare salaries across companies and experience levels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Job Title */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Job Title *
              </label>
              <input
                type="text"
                placeholder="e.g., Senior Software Engineer..."
                value={salaryQuery}
                onChange={(e) => setSalaryQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Location *
              </label>
              <select
                value={salaryLocation}
                onChange={(e) => setSalaryLocation(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {filterOptions.countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Level */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">
                Experience Level
              </label>
              <select
                value={salaryExperience}
                onChange={(e) => setSalaryExperience(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Any</option>
                {filterOptions.experienceLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button
            onClick={handleSalaryQuery}
            disabled={salaryLoading}
            size="lg"
            className="w-full gap-2"
          >
            {salaryLoading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <DollarSign className="h-4 w-4" />
            )}
            Query Salary Data
          </Button>

          {/* Salary Results */}
          {salaryResults && (
            <div className="bg-green-50 dark:bg-green-950 p-6 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Salary Data for {salaryQuery} in {salaryLocation}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {salaryResults.median && (
                  <div className="bg-white dark:bg-slate-900 p-4 rounded border border-green-200 dark:border-green-800">
                    <div className="text-xs text-muted-foreground mb-1">
                      Median
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {salaryResults.currency}{' '}
                      {salaryResults.median?.toLocaleString() || 'N/A'}
                    </div>
                  </div>
                )}
                {salaryResults.min && (
                  <div className="bg-white dark:bg-slate-900 p-4 rounded border border-green-200 dark:border-green-800">
                    <div className="text-xs text-muted-foreground mb-1">
                      Minimum
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {salaryResults.currency}{' '}
                      {salaryResults.min?.toLocaleString() || 'N/A'}
                    </div>
                  </div>
                )}
                {salaryResults.max && (
                  <div className="bg-white dark:bg-slate-900 p-4 rounded border border-green-200 dark:border-green-800">
                    <div className="text-xs text-muted-foreground mb-1">
                      Maximum
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {salaryResults.currency}{' '}
                      {salaryResults.max?.toLocaleString() || 'N/A'}
                    </div>
                  </div>
                )}
                {salaryResults.source_count && (
                  <div className="bg-white dark:bg-slate-900 p-4 rounded border border-green-200 dark:border-green-800">
                    <div className="text-xs text-muted-foreground mb-1">
                      Data Sources
                    </div>
                    <div className="text-2xl font-bold text-orange-600">
                      {salaryResults.source_count}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="border-t border-border">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Found {resultCount} Jobs
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 space-y-4 md:space-y-0">
              {results.map((job) => (
                <div
                  key={job.job_id}
                  className="bg-background border border-border rounded-lg p-5 hover:shadow-md hover:border-primary/50 transition-all"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold line-clamp-2">
                        {job.job_title}
                      </h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <Briefcase className="h-4 w-4" />
                        {job.company_name}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSaveJob(job)}
                      className="shrink-0"
                    >
                      <BookmarkPlus className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Meta Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </Badge>
                      {job.employment_type && (
                        <Badge variant="secondary" className="text-xs">
                          {job.employment_type}
                        </Badge>
                      )}
                      {job.salary_min && (
                        <Badge variant="secondary" className="text-xs gap-1">
                          <DollarSign className="h-3 w-3" />
                          {job.salary_min?.toLocaleString()}-
                          {job.salary_max?.toLocaleString()}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {job.job_snippet}
                  </p>

                  {/* Footer */}
                  <div className="flex justify-between items-center pt-3 border-t border-border">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Recently posted
                    </div>
                    <a
                      href={job.job_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button size="sm" variant="ghost" className="gap-1">
                        Apply <Send className="h-3 w-3" />
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && activeTab === 'quick-search' && (
        <div className="p-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">
            Search for jobs to get started
          </p>
        </div>
      )}
    </div>
  );
};

export default ScraperComponent;
