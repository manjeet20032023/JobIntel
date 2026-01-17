# LinkedIn Job Scraper v3.0 - India Edition

## Overview

The LinkedIn Job Scraper is a real-time job intelligence tool that uses the **OpenWeb Ninja JSearch API** to pull live LinkedIn job data. It's specifically optimized for the Indian job market with preset searches for major Indian cities and tech hubs.

## Features

### 1. 🔍 Job Search Capabilities

- **Real-time LinkedIn Job Search**: Search millions of LinkedIn jobs through OpenWeb Ninja API
- **10 India-Focused Preset Searches**:
  - Software Engineer (All India)
  - Backend Developer (Bangalore)
  - Data Scientist (All India)
  - Frontend Developer (Mumbai)
  - DevOps Engineer (All India)
  - ML/AI Engineer (Hyderabad)
  - Full Stack Developer (Delhi)
  - Cloud Architect (All India)
  - Product Manager (All India)
  - Internship - Tech (All India)

- **12 Indian Locations**:
  - Major metros: Bangalore, Mumbai, Delhi/NCR, Hyderabad, Pune
  - Tech hubs: Gurgaon, Noida, Indore, Kolkata, Chennai
  - Remote positions

- **Advanced Filtering**:
  - Employment Type: Full-time, Part-time, Contractor, Internship
  - Publication Date: Today, Last 3 days, Last week, Last month
  - Experience Level: Entry (0-1yr), Junior (1-3yr), Mid-Level (3-6yr), Senior (6-10yr), Lead (10+yr)
  - Remote work filter
  - Salary range expectations

### 2. 💼 Complete Job Details

- Job title, company, and location
- Full job description and requirements
- Required skills and experience level
- Benefits and compensation info
- Direct application links
- Posted date and freshness

### 3. 💰 Salary Intelligence

- **Real-time Salary Data**: Get estimated salary ranges by position and location
- **Experience-Level Filtering**: Compare salaries by experience level
- **Multi-source Aggregation**: Data from multiple sources for accuracy
- **Location Comparison**: See salary variations across Indian cities
- **Export Salary Reports**: Download salary comparison data

### 4. 📊 Search & Data Management

- **Search History**: Keep track of all your searches
- **Saved Searches**: Save frequently used search criteria
- **Export Functionality**:
  - CSV format (for Excel/Google Sheets)
  - JSON format (for programmatic use)
  - Salary data export with aggregations

### 5. 🛡️ Reliability & Performance

- **Rate Limiting**: 1-second delay between requests to respect API limits
- **Retry Logic**: Automatic retries (up to 3 attempts) for failed requests
- **Timeout Protection**: 30-second timeout on all API calls
- **Complete Logging**: All operations are logged for debugging

## API Endpoints

### Public Endpoints

#### Get Preset Searches
```bash
GET /api/scraper/presets
```
Returns all 10 preset searches optimized for Indian market.

#### Get Available Locations
```bash
GET /api/scraper/locations
```
Returns all 12 supported Indian locations.

#### Get Experience Levels
```bash
GET /api/scraper/experience-levels
```
Returns all experience level categories.

#### Get Employment Types
```bash
GET /api/scraper/employment-types
```
Returns employment type options (Full-time, Part-time, etc).

#### Get Trending Jobs
```bash
GET /api/scraper/trending
```
Returns the 20 most recently posted jobs across India.

#### Get Salary Insights
```bash
GET /api/scraper/salary?position=Software+Engineer&location=Bangalore&experienceLevel=Mid-Level+(3-6yr)
```
Returns salary data for a specific position and location.

### Search Endpoints

#### Run Preset Search
```bash
POST /api/scraper/preset-search
Content-Type: application/json

{
  "presetId": 0,  // Index of preset (0-9)
  "pages": 2      // Number of pages to fetch (1-10)
}
```

#### Advanced Search
```bash
POST /api/scraper/advanced-search
Content-Type: application/json

{
  "keyword": "Python Developer",
  "location": "Mumbai",
  "employmentType": "Full-time",
  "datePosted": "Last week",
  "remote": false,
  "experienceLevel": "Mid-Level (3-6 years)",
  "pages": 2
}
```

#### Search by Company
```bash
POST /api/scraper/company-search
Content-Type: application/json

{
  "company": "Google",
  "location": "India"  // optional
}
```

### Protected Endpoints (Requires Authentication)

#### Get Search History
```bash
GET /api/scraper/history?limit=10&skip=0
Authorization: Bearer <token>
```
Returns user's search history with pagination.

#### Get Search Results
```bash
GET /api/scraper/results/:searchId
Authorization: Bearer <token>
```
Returns detailed results from a specific search.

#### Export Jobs to CSV
```bash
POST /api/scraper/export/:searchId?format=csv
Authorization: Bearer <token>
```
Exports search results as CSV file.

#### Export Jobs to JSON
```bash
POST /api/scraper/export/:searchId?format=json
Authorization: Bearer <token>
```
Exports search results as JSON file.

#### Bulk Export All Searches
```bash
POST /api/scraper/export-all
Content-Type: application/json
Authorization: Bearer <token>

{
  "format": "csv"  // or "json"
}
```

#### Export Salary Data
```bash
POST /api/scraper/export-salary
Content-Type: application/json
Authorization: Bearer <token>

{
  "format": "csv"  // or "json"
}
```

#### Get Salary Comparison Report
```bash
GET /api/scraper/salary-report
```
Returns aggregate salary data grouped by position and location.

## Frontend Integration

### Using the Scraper UI Component

```tsx
import { LinkedInScraperUI } from '@/components/LinkedInScraperUI';

function JobPortalPage() {
  return (
    <div>
      <LinkedInScraperUI />
    </div>
  );
}
```

The component provides:
- Preset search selector
- Advanced search form
- Salary intelligence lookup
- Search history view
- Results display with export options

## Database Models

### ScraperJob
Stores scraped job listings
- jobId, title, company, location
- salary (min, max, currency)
- description, requirements, benefits
- experienceLevel, employmentType, remote
- postedDate, applyUrl

### ScraperSearch
Tracks user search history
- userId, searchQuery, filters
- resultsCount, status, error
- results (array of job IDs)
- executedAt, createdAt

### SalaryData
Caches salary information
- position, location, experienceLevel
- salaryRange (min, max, median, currency)
- dataSource, sampleSize
- lastUpdated

## Configuration

### Environment Variables

```bash
# Required for scraper API
API_KEY=your_openwebninja_api_key
API_HOST=api.openwebninja.com

# Database (for storing jobs, searches, salary data)
MONGODB_URI=mongodb+srv://...

# Optional: Rate limiting config
RATE_LIMIT_DELAY=1000  # milliseconds between requests
```

## Example Workflows

### 1. Find Software Engineering Jobs in Bangalore
```bash
# Use preset search
POST /api/scraper/preset-search
{
  "presetId": 1,  // Backend Developer (Bangalore)
  "pages": 3
}
```

### 2. Get Salary Range for Python Developer in Mumbai
```bash
GET /api/scraper/salary?position=Python+Developer&location=Mumbai&experienceLevel=Mid-Level+(3-6yr)
```

### 3. Find Remote Full-Stack Developer Roles
```bash
POST /api/scraper/advanced-search
{
  "keyword": "Full Stack Developer",
  "location": "Remote",
  "remote": true,
  "employmentType": "Full-time"
}
```

### 4. Search for Internship Opportunities
```bash
POST /api/scraper/preset-search
{
  "presetId": 9,  // Internship - Tech (India)
  "pages": 2
}
```

### 5. Export All Searches as CSV
```bash
POST /api/scraper/export-all
{
  "format": "csv"
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2026-01-17T14:30:00Z"
}
```

Common errors:
- **429**: Rate limited (wait and retry)
- **400**: Invalid parameters
- **401**: Authentication required
- **404**: Resource not found
- **500**: Server error

## Performance Considerations

1. **Rate Limiting**: Automatic 1-second delay between API requests
2. **Caching**: Salary data cached for 7 days
3. **Pagination**: Results returned in batches (1-10 pages)
4. **Indexing**: Database indexes on frequently queried fields
5. **Cleanup**: Old exports automatically deleted after 7 days

## Security

- API key stored in environment variables (never in code)
- Authentication required for protected endpoints
- User-specific search history isolation
- Input validation on all parameters
- Rate limiting to prevent abuse

## Support & Updates

For issues or feature requests related to the scraper:
1. Check the job portal page at `/job-portal`
2. Review API documentation in OpenAPI spec
3. Check logs for detailed error information

## Notes

- This scraper is India-focused for optimal results
- Salary data is aggregated from multiple sources
- Job data updates in real-time as LinkedIn is scraped
- Preset searches are optimized for quick results
- All timestamps are in UTC

---

**LinkedIn Job Scraper v3.0 - Powered by OpenWeb Ninja JSearch API**
