import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Building2,
  Zap,
  TrendingUp,
  Filter,
  Clock,
  BookmarkPlus,
  Download,
  RefreshCw,
  ChevronDown,
  AlertCircle,
  Loader,
} from 'lucide-react';
import { PRESET_SEARCHES, LOCATIONS, EXPERIENCE_LEVELS, EMPLOYMENT_TYPES } from '@/lib/scraperConfig';
import axios from 'axios';

interface Job {
  jobId: string;
  title: string;
  company: string;
  location: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  employmentType: string;
  remote: boolean;
  postedDate: string;
  description: string;
  applyUrl: string;
}

interface SearchResult {
  searchId: string;
  jobs: Job[];
  jobsFound: number;
}

interface SalaryRange {
  min: number;
  max: number;
  median: number;
  currency: string;
}

interface SalaryDataResponse {
  salaryRange?: SalaryRange;
  [key: string]: unknown;
}

export const LinkedInScraperUI = () => {
  const [searchMode, setSearchMode] = useState<'preset' | 'advanced'>('preset');
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'search' | 'salary' | 'history'>('search');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null); // For details modal

  // Advanced search filters
  const [filters, setFilters] = useState({
    keyword: '',
    location: 'India',
    employmentType: '',
    datePosted: '',
    remote: false,
    experienceLevel: '',
    pages: 10,  // Get all available jobs (up to 100)
  });

  // Salary search
  const [salaryQuery, setSalaryQuery] = useState({
    position: '',
    location: 'India',
    experienceLevel: '',
  });

  const [salaryData, setSalaryData] = useState<SalaryDataResponse | null>(null);

  // Company search state
  const [selectedCompany, setSelectedCompany] = useState('');
  
  // Company lists
  const faangCompanies = [
    'Google',
    'Apple',
    'Amazon',
    'Meta',
    'Microsoft',
    'Netflix',
  ];

  const serviceBasedCompanies = [
    'TCS',
    'Infosys',
    'Wipro',
    'HCL Technologies',
    'Tech Mahindra',
    'Cognizant',
    'Accenture',
    'Capgemini',
    'IBM',
    'Deloitte',
  ];

  // Transform backend job data to frontend Job interface
  const transformJob = (job: any): Job => {
    // Handle various possible field names for apply URL
    const applyUrl = job.applyUrl || job.apply_url || job.job_apply_link || '#';
    
    return {
      jobId: job.job_id || job.jobId || '',
      title: job.job_title || job.title || '',
      company: job.employer_name || job.company || '',
      location: job.job_location || job.location || '',
      salary: job.estimated_salary || job.salary,
      employmentType: job.job_employment_type || job.employmentType || 'Full-time',
      remote: job.job_is_remote !== undefined ? job.job_is_remote : job.remote,
      postedDate: job.job_posted_on_linkedin || job.postedDate || new Date().toISOString(),
      description: job.job_description || job.description || '',
      applyUrl: applyUrl,
    };
  };

  // Handle preset search
  const handlePresetSearch = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/scraper/preset-search', {
        presetId: selectedPreset,
        pages: filters.pages,
      });

      if (response.data.success) {
        setResults({
          searchId: response.data.searchId,
          jobs: (response.data.jobs || []).map(transformJob),
          jobsFound: response.data.jobsFound,
        });
      } else {
        setError(response.data.error || 'Search failed');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to perform search');
    } finally {
      setLoading(false);
    }
  };

  // Handle advanced search
  const handleAdvancedSearch = async () => {
    setLoading(true);
    setError('');

    if (!filters.keyword.trim()) {
      setError('Please enter a job title or keyword');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/scraper/advanced-search', filters);

      if (response.data.success) {
        setResults({
          searchId: response.data.searchId,
          jobs: (response.data.jobs || []).map(transformJob),
          jobsFound: response.data.jobsFound,
        });
      } else {
        setError(response.data.error || 'Search failed');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to perform search');
    } finally {
      setLoading(false);
    }
  };

  // Handle salary search
  const handleSalarySearch = async () => {
    setLoading(true);
    setError('');

    if (!salaryQuery.position.trim() || !salaryQuery.location.trim()) {
      setError('Please enter both position and location');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('/api/scraper/salary', {
        params: salaryQuery,
      });

      if (response.data.success) {
        setSalaryData(response.data.data as SalaryDataResponse);
      } else {
        setError(response.data.error || 'Failed to fetch salary data');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to fetch salary data');
    } finally {
      setLoading(false);
    }
  };

  // Handle company search
  const handleCompanySearch = async () => {
    if (!selectedCompany.trim()) {
      setError('Please select a company');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Search with company name as keyword to find all jobs from that company
      const response = await axios.post('/api/scraper/advanced-search', {
        keyword: selectedCompany,
        location: 'India',
        pages: 5,
      });

      if (response.data.success) {
        // Filter results by company name
        const filteredJobs = (response.data.jobs || []).filter(
          (job: any) => 
            job.employer_name?.toLowerCase().includes(selectedCompany.toLowerCase()) ||
            job.company?.toLowerCase().includes(selectedCompany.toLowerCase())
        );

        setResults({
          searchId: response.data.searchId,
          jobs: filteredJobs.map(transformJob),
          jobsFound: filteredJobs.length,
        });

        if (filteredJobs.length === 0) {
          setError(`No jobs found for ${selectedCompany} in India`);
        }
      } else {
        setError(response.data.error || 'Search failed');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to search by company');
      console.error('Company search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPresetTitle = (index: number) => {
    return PRESET_SEARCHES[index]?.title || 'Unknown Preset';
  };

  return (
    <div className="w-full bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="h-8 w-8 text-primary" />
          <h2 className="text-3xl md:text-4xl font-bold">Job Search & Discovery</h2>
        </div>
        <p className="text-muted-foreground text-lg">
          Find opportunities across India with advanced filters and company-wise search.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-border overflow-x-auto">
        {(['search', 'company', 'salary', 'history'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-semibold border-b-2 transition-colors capitalize whitespace-nowrap ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'search' && <Search className="inline h-4 w-4 mr-2" />}
            {tab === 'company' && <Building2 className="inline h-4 w-4 mr-2" />}
            {tab === 'salary' && <DollarSign className="inline h-4 w-4 mr-2" />}
            {tab === 'history' && <Clock className="inline h-4 w-4 mr-2" />}
            {tab}
          </button>
        ))}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-destructive">Error</h4>
            <p className="text-sm text-destructive/80">{error}</p>
          </div>
        </div>
      )}

      {/* SEARCH TAB */}
      {activeTab === 'search' && (
        <div className="space-y-8">
          {/* Mode Selection */}
          <div className="flex gap-4 bg-background p-4 rounded-lg border border-border">
            {(['preset', 'advanced'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setSearchMode(mode)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all capitalize ${
                  searchMode === mode
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                {mode === 'preset' && <Zap className="inline h-4 w-4 mr-2" />}
                {mode === 'advanced' && <Filter className="inline h-4 w-4 mr-2" />}
                {mode} Search
              </button>
            ))}
          </div>

          {/* PRESET SEARCH */}
          {searchMode === 'preset' && (
            <div className="space-y-4 bg-background p-6 rounded-lg border border-border">
              <h3 className="text-lg font-semibold">Quick Preset Searches</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Choose from pre-built searches optimized for Indian job market
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {PRESET_SEARCHES.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPreset(idx)}
                    className={`px-3 py-2 rounded-lg border-2 transition-all text-left text-sm ${
                      selectedPreset === idx
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className="font-semibold text-xs line-clamp-1">{preset.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      <MapPin className="inline h-2.5 w-2.5 mr-0.5" />
                      {preset.location}
                    </div>
                  </button>
                ))}
              </div>

              {/* Pages selector */}
              <div className="flex gap-4 items-center pt-4">
                <label className="text-sm font-semibold">Results pages:</label>
                <select
                  value={filters.pages}
                  onChange={(e) => setFilters({ ...filters, pages: parseInt(e.target.value) })}
                  className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
                >
                  {[1, 2, 3, 5, 10].map((p) => (
                    <option key={p} value={p}>
                      {p} page{p > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                onClick={handlePresetSearch}
                disabled={loading}
                size="lg"
                className="w-full gap-2 mt-6"
              >
                {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {loading ? 'Searching...' : `Search "${getPresetTitle(selectedPreset)}"`}
              </Button>
            </div>
          )}

          {/* ADVANCED SEARCH */}
          {searchMode === 'advanced' && (
            <div className="space-y-4 bg-background p-6 rounded-lg border border-border">
              <h3 className="text-lg font-semibold">Advanced Job Search</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Customize your search with detailed filters
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Keyword */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">Job Title / Keyword *</label>
                  <input
                    type="text"
                    placeholder="e.g., Software Engineer, Data Scientist"
                    value={filters.keyword}
                    onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">Location</label>
                  <select
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Employment Type */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">Employment Type</label>
                  <select
                    value={filters.employmentType}
                    onChange={(e) => setFilters({ ...filters, employmentType: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Any</option>
                    {EMPLOYMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Posted */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">Posted</label>
                  <select
                    value={filters.datePosted}
                    onChange={(e) => setFilters({ ...filters, datePosted: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All time</option>
                    <option value="Today">Today</option>
                    <option value="Last 3 days">Last 3 days</option>
                    <option value="Last week">Last week</option>
                    <option value="Last month">Last month</option>
                  </select>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">Experience Level</label>
                  <select
                    value={filters.experienceLevel}
                    onChange={(e) => setFilters({ ...filters, experienceLevel: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Any</option>
                    {EXPERIENCE_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Remote */}
                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={filters.remote}
                      onChange={(e) => setFilters({ ...filters, remote: e.target.checked })}
                      className="w-4 h-4 rounded cursor-pointer"
                    />
                    <span className="text-sm font-semibold">Remote only</span>
                  </label>
                </div>
              </div>

              <Button
                onClick={handleAdvancedSearch}
                disabled={loading}
                size="lg"
                className="w-full gap-2 mt-6"
              >
                {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {loading ? 'Searching...' : 'Search Jobs'}
              </Button>
            </div>
          )}

          {/* RESULTS */}
          {results && results.jobs.length > 0 && (
            <div className="space-y-6">
              {/* Results Header */}
              <div className="bg-background border border-border rounded-lg p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-3xl font-bold mb-2">{results.jobsFound} Jobs Found</h3>
                    <p className="text-muted-foreground text-sm">
                      {searchMode === 'preset'
                        ? `Results for "${getPresetTitle(selectedPreset)}"`
                        : `Results for "${filters.keyword || 'Search'}" in ${filters.location || 'India'}`}
                    </p>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" size="sm" className="gap-2 flex-1 md:flex-none">
                      <Download className="h-4 w-4" />
                      CSV
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 flex-1 md:flex-none">
                      <Download className="h-4 w-4" />
                      JSON
                    </Button>
                  </div>
                </div>

                {/* Active Filters Display */}
                <div className="flex flex-wrap gap-2">
                  {filters.location && (
                    <Badge variant="secondary" className="gap-1">
                      <MapPin className="h-3 w-3" />
                      {filters.location}
                    </Badge>
                  )}
                  {filters.employmentType && (
                    <Badge variant="secondary" className="gap-1">
                      <Briefcase className="h-3 w-3" />
                      {filters.employmentType}
                    </Badge>
                  )}
                  {filters.remote && (
                    <Badge className="bg-green-500 text-white gap-1">
                      🌍 Remote
                    </Badge>
                  )}
                  {filters.experienceLevel && (
                    <Badge variant="secondary">{filters.experienceLevel}</Badge>
                  )}
                </div>
              </div>

              {/* Job Cards */}
              <div className="space-y-4">
                {results.jobs.map((job, index) => (
                  <div
                    key={job.jobId}
                    className="bg-background border border-border rounded-lg p-6 hover:shadow-lg hover:border-primary/50 transition-all"
                  >
                    {/* Job Header */}
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-foreground hover:text-primary cursor-pointer">
                              {job.title}
                            </h4>
                            <p className="text-primary font-semibold text-sm">
                              {job.company}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <BookmarkPlus className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* Job Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm">
                      {/* Location */}
                      <div>
                        <p className="text-muted-foreground font-semibold mb-1">Location:</p>
                        <p className="flex items-center gap-2 text-foreground">
                          <MapPin className="h-4 w-4 text-primary" />
                          {job.location || 'Not specified'}
                        </p>
                      </div>

                      {/* Salary */}
                      <div>
                        <p className="text-muted-foreground font-semibold mb-1">Salary:</p>
                        {job.salary ? (
                          <p className="flex items-center gap-2 text-foreground font-semibold">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            ₹{job.salary.min.toLocaleString()} - ₹{job.salary.max.toLocaleString()}
                          </p>
                        ) : (
                          <p className="text-muted-foreground">Not specified</p>
                        )}
                      </div>

                      {/* Type */}
                      <div>
                        <p className="text-muted-foreground font-semibold mb-1">Type:</p>
                        <p className="text-foreground">{job.employmentType || 'Full-time'}</p>
                      </div>

                      {/* Work Arrangement */}
                      <div>
                        <p className="text-muted-foreground font-semibold mb-1">Work:</p>
                        <p className="flex items-center gap-2 text-foreground">
                          {job.remote ? (
                            <>
                              <span className="text-lg">🌍</span>
                              <span>Remote</span>
                            </>
                          ) : (
                            <>
                              <span className="text-lg">📍</span>
                              <span>On-site</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Posted Date */}
                    <div className="mb-4 pb-4 border-b border-border">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Posted: {
                          new Date(job.postedDate).getTime() > 0
                            ? new Date(job.postedDate).toLocaleDateString()
                            : 'Recently'
                        }
                      </p>
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {job.description || 'No description available'}
                      </p>
                    </div>

                    {/* Additional Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-xs">
                      <div>
                        <p className="text-muted-foreground font-semibold mb-1">Experience:</p>
                        <p className="text-foreground">Not specified</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground font-semibold mb-1">Education:</p>
                        <p className="text-foreground">Not specified</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-border">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => setSelectedJob(job)}
                      >
                        Details
                      </Button>
                      <a
                        href={job.applyUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button size="sm" className="w-full gap-2">
                          Apply
                        </Button>
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="bg-muted/50 rounded-lg p-4 text-center text-xs text-muted-foreground">
                © 2026 LinkedIn Job Scraper - India Edition | Professional Job Search Powered by OpenWeb Ninja
              </div>
            </div>
          )}
        </div>
      )}

      {/* SALARY TAB */}
      {activeTab === 'salary' && (
        <div className="space-y-6 bg-background p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold">Salary Intelligence</h3>
          <p className="text-sm text-muted-foreground">
            Get estimated salary ranges for any job position in India
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Job Position *</label>
              <input
                type="text"
                placeholder="e.g., Software Engineer"
                value={salaryQuery.position}
                onChange={(e) => setSalaryQuery({ ...salaryQuery, position: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Location</label>
              <select
                value={salaryQuery.location}
                onChange={(e) => setSalaryQuery({ ...salaryQuery, location: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Experience</label>
              <select
                value={salaryQuery.experienceLevel}
                onChange={(e) => setSalaryQuery({ ...salaryQuery, experienceLevel: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Any</option>
                {EXPERIENCE_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button
            onClick={handleSalarySearch}
            disabled={loading}
            size="lg"
            className="w-full gap-2"
          >
            {loading ? <Loader className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
            {loading ? 'Fetching Salary Data...' : 'Get Salary Insights'}
          </Button>

          {salaryData && (
            <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border border-green-200">
              <h4 className="text-xl font-bold mb-4">Salary Range for {salaryQuery.position}</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-green-200">
                  <div className="text-sm text-muted-foreground">Minimum</div>
                  <div className="text-2xl font-bold text-green-600">
                    ₹{salaryData.salaryRange?.min?.toLocaleString() || 'N/A'}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="text-sm text-muted-foreground">Median</div>
                  <div className="text-2xl font-bold text-blue-600">
                    ₹{salaryData.salaryRange?.median?.toLocaleString() || 'N/A'}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-orange-200">
                  <div className="text-sm text-muted-foreground">Maximum</div>
                  <div className="text-2xl font-bold text-orange-600">
                    ₹{salaryData.salaryRange?.max?.toLocaleString() || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* COMPANY TAB */}
      {activeTab === 'company' && (
        <div className="space-y-6 bg-background p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold">Search by Company</h3>
          <p className="text-sm text-muted-foreground">
            Find all job openings from your favorite companies
          </p>

          {/* FAANG Companies */}
          <div>
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Tech Giants (FAANG)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {faangCompanies.map((company) => (
                <button
                  key={company}
                  onClick={() => setSelectedCompany(company)}
                  className={`px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                    selectedCompany === company
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  {company}
                </button>
              ))}
            </div>
          </div>

          {/* Service-Based Companies */}
          <div>
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Service-Based Companies
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {serviceBasedCompanies.map((company) => (
                <button
                  key={company}
                  onClick={() => setSelectedCompany(company)}
                  className={`px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                    selectedCompany === company
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  {company}
                </button>
              ))}
            </div>
          </div>

          {/* Search Button */}
          <Button
            onClick={handleCompanySearch}
            disabled={loading || !selectedCompany}
            size="lg"
            className="w-full gap-2 mt-6"
          >
            {loading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Search {selectedCompany} Jobs
              </>
            )}
          </Button>
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="space-y-4 bg-background p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold">Search History</h3>
          <p className="text-sm text-muted-foreground">View your previous searches and results</p>
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">No search history yet. Start searching to see your history here.</p>
          </div>
        </div>
      )}

      {/* JOB DETAILS MODAL */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-background border-b border-border p-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{selectedJob.title}</h2>
                <p className="text-lg text-primary font-semibold mt-1">{selectedJob.company}</p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-muted-foreground hover:text-foreground text-2xl"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Quick Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold mb-1">LOCATION</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {selectedJob.location}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold mb-1">TYPE</p>
                  <p className="text-sm font-medium">{selectedJob.employmentType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold mb-1">WORK</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    {selectedJob.remote ? '🌍 Remote' : '📍 On-site'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold mb-1">POSTED</p>
                  <p className="text-sm font-medium">
                    {new Date(selectedJob.postedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Salary */}
              {selectedJob.salary && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground font-semibold mb-2">SALARY RANGE</p>
                  <p className="text-xl font-bold text-green-600 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    ₹{selectedJob.salary.min.toLocaleString()} - ₹{selectedJob.salary.max.toLocaleString()}
                  </p>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Job Description</h3>
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedJob.description || 'No description available'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button variant="outline" size="lg" className="flex-1" onClick={() => setSelectedJob(null)}>
                  Close
                </Button>
                <a
                  href={selectedJob.applyUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button size="lg" className="w-full gap-2">
                    <Zap className="h-4 w-4" />
                    Apply Now
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
