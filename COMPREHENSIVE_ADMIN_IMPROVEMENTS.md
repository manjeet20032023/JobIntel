# Comprehensive Admin Improvements & Feature Documentation
**Updated: January 2026**

---

## Table of Contents
1. [Executive Overview](#executive-overview)
2. [LinkedIn Scraping System](#linkedin-scraping-system)
3. [Job Matching & Embedding Logic](#job-matching--embedding-logic)
4. [AI Job Matching Intelligence](#ai-job-matching-intelligence)
5. [Admin Role & Permissions](#admin-role--permissions)
6. [Admin Dashboard Pages](#admin-dashboard-pages)
7. [New Admin Features Required](#new-admin-features-required)
8. [Database & API Architecture](#database--api-architecture)
9. [Implementation Roadmap](#implementation-roadmap)

---

## Executive Overview

JobIntel's admin panel is the command center for:
- **LinkedIn Job Scraping** - Intelligent data collection with configurable parameters
- **Job Matching** - Multi-factor algorithm connecting users to opportunities
- **Resume Processing** - AI-powered parsing and skill extraction
- **Company Management** - Curated company database with search optimization
- **Analytics** - Real-time insights and performance metrics

### Current Admin Pages (from AdminSidebar.tsx)
```
✅ Dashboard         - Overview & KPIs
✅ Jobs              - Job management & analytics
✅ Users             - User management
✅ Notifications     - System notifications
✅ Referrals         - Referral program management
✅ Crawlers          - Scraper configuration
✅ Analytics         - Advanced analytics
✅ Revenue           - Revenue tracking
✅ Settings          - System settings
✅ Profile Fields    - Custom user profile fields
✅ Skills            - Skill inventory management
```

---

## LinkedIn Scraping System

### 1. **How LinkedIn Scraping Works**

#### Data Flow
```
┌─────────────────────────────────────────────────────┐
│ Admin triggers scrape with parameters                │
├─────────────────────────────────────────────────────┤
│ • Keyword (skill/role: "React Developer")            │
│ • Location (India, Bangalore, Mumbai, etc.)          │
│ • Pages to scrape (1, 5, 10, 50, 100)                │
│ • Filters (remote, entry-level, salary range)        │
│ • Company name (optional - company-wise search)       │
│ • Schedule (one-time, daily, weekly)                 │
└─────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────┐
│ OpenWeb Ninja API / LinkedIn Data Extraction         │
├─────────────────────────────────────────────────────┤
│ Fetches job postings from LinkedIn based on params   │
│ Extracts: title, company, location, salary, desc    │
│ Rate limiting: 50 jobs/request, max 100 pages       │
└─────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────┐
│ JobIntel Backend Processing                          │
├─────────────────────────────────────────────────────┤
│ • Normalize company names                            │
│ • Extract location data                              │
│ • Parse salary ranges                                │
│ • Detect required/preferred skills                   │
│ • Calculate job difficulty score                     │
│ • Store with metadata (source, timestamp, quality)   │
└─────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────┐
│ Job Matching Engine Triggers                         │
├─────────────────────────────────────────────────────┤
│ Recalculates matches for ALL users against new jobs  │
│ Updates JobMatch collection in real-time             │
│ Sends notifications for matching jobs to users       │
└─────────────────────────────────────────────────────┘
```

### 2. **Scraping Configuration Options**

#### Pages Control
```typescript
// Admin can set scraping depth
enum ScrapePages {
  QUICK = 1,          // ~10-15 jobs (test/verify)
  SMALL = 5,          // ~50-75 jobs (quick refresh)
  MEDIUM = 10,        // ~100-150 jobs (standard)
  LARGE = 50,         // ~500-750 jobs (bulk import)
  MASSIVE = 100,      // ~1000-1500 jobs (full sync)
}

// Time taken estimates
// 1 page   = ~10 seconds
// 5 pages  = ~30 seconds
// 10 pages = ~1 minute
// 50 pages = ~5 minutes
// 100 pages = ~10 minutes (rate limited)
```

#### Global Scraping Settings
```typescript
ScraperConfig {
  // Enable/Disable scraping globally
  enabled: boolean;                    // Turn scraping on/off
  
  // Rate Limiting
  maxRequestsPerHour: number;          // Default: 10
  maxRequestsPerDay: number;           // Default: 100
  requestsUsedToday: number;           // Current usage
  
  // Default Pagination
  defaultPages: ScrapePages;           // Default: MEDIUM (10)
  maxPagesAllowed: ScrapePages;        // Limit per request
  
  // Data Quality
  minSalaryDataQuality: number;        // 0-100 (min %age to accept)
  minDescriptionLength: number;        // Chars (filter out stubs)
  filterDuplicates: boolean;           // Deduplicate across days
  
  // Company Filtering
  excludedCompanies: string[];         // Blacklist
  trustedCompanies: string[];          // Whitelist (priority)
  
  // Schedule
  autoScrapeEnabled: boolean;          // Run on schedule
  autoScrapeFrequency: 'daily' | 'weekly' | 'hourly';
  autoScrapeTime: string;              // "02:00 AM IST"
  autoScrapePages: ScrapePages;        // Pages per auto-run
  
  // Notifications
  notifyOnError: boolean;              // Alert on failures
  notifyOnComplete: boolean;           // Alert when done
  
  // Cost Tracking
  apiCallsPerMonth: number;            // Usage quota
  estimatedMonthlyCost: number;        // INR
  costThresholdAlert: number;          // Alert at ₹X
}
```

### 3. **Admin Controls for Scraping**

#### In Crawlers Page (`/admin/crawlers`)

**Scraper Status Dashboard:**
```
┌─ Scraper Status ─────────────────────────────────────┐
│ Status: ✅ ENABLED                                    │
│ Last Scrape: 2 hours ago                              │
│ Jobs Added Today: 45                                  │
│ API Calls Used Today: 8/10                            │
│ Estimated Cost This Month: ₹850                       │
└─────────────────────────────────────────────────────────┘
```

**Quick Controls:**
```
[✓ Enable/Disable Scraping] [Manual Scrape Now] [View Logs]
```

**Preset Scrape Templates:**
```
┌─ Quick Scrape Presets ──────────────────────────────┐
│ [React Developer - 5 pages]                           │
│ [Full Stack - 10 pages]                               │
│ [Python Engineer - 10 pages]                          │
│ [DevOps - 5 pages]                                    │
│ [Data Science - 10 pages]                             │
│ [+ Add Custom Preset]                                 │
└─────────────────────────────────────────────────────────┘
```

**Custom Scrape Builder:**
```
┌─ Launch Custom Scrape ──────────────────────────────┐
│ Job Title/Keyword:    [React Developer              ]│
│ Location:            [Bangalore          ▼]          │
│ Experience Level:    [All Levels         ▼]          │
│ Pages to Scrape:     [5 ▼] (Est: ~30 sec, 50 jobs)   │
│ Remote Only:         [☐]                             │
│ Salary Range (₹):    Min [Blank] Max [Blank]         │
│ Employment Type:     [All Types           ▼]         │
│                                                      │
│ [⚡ Estimate Cost] [Cancel] [▶ Start Scrape]         │
└─────────────────────────────────────────────────────────┘
```

**Scrape History & Results:**
```
┌─ Recent Scrapes (Last 30 days) ─────────────────────┐
│ Date      Keyword          Pages  Jobs  Status  Cost  │
├─────────────────────────────────────────────────────┤
│ Jan 17    React Dev        5      52    ✅OK    ₹25   │
│ Jan 16    Python Eng       10     105   ✅OK    ₹50   │
│ Jan 15    DevOps           5      48    ✅OK    ₹25   │
│ Jan 14    Full Stack       10     98    ✅OK    ₹50   │
│ [View All Scrapes]   [Export CSV]   [Download JSON]   │
└─────────────────────────────────────────────────────────┘
```

**Configuration Panel:**
```
┌─ Scraper Configuration ─────────────────────────────┐
│ Global Settings                                      │
│ ─────────────────────────────────────────────────   │
│ Enable Auto Scraping:          [☑] ON               │
│ Auto Scrape Frequency:         [Daily        ▼]      │
│ Auto Scrape Time (IST):        [02:00 AM            ]│
│ Pages Per Auto Scrape:         [10          ▼]      │
│ Skip Weekends:                 [☐]                  │
│                                                      │
│ Rate Limits                                          │
│ ────────────────────────────────────────────        │
│ Max Scrapes Per Hour:          [10          ]        │
│ Max Scrapes Per Day:           [50          ]        │
│ Monthly Budget (₹):            [5000        ]        │
│ Alert at ₹:                    [4500        ]        │
│                                                      │
│ Data Quality Filters                                │
│ ────────────────────────────────────────────        │
│ Min Salary Data Quality:       [75%         ]        │
│ Min Job Description Length:    [500 chars   ]        │
│ Filter Duplicate Jobs:         [☑]                  │
│ Exclude Companies:             [Add...   ▼]          │
│                                                      │
│                          [Save Settings] [Reset]     │
└─────────────────────────────────────────────────────────┘
```

---

## Company Management System

### 1. **Company Database Architecture**

```typescript
CompanyProfile {
  // Basic Info
  _id: ObjectId;
  name: string;                        // "Google", "TCS", etc.
  display_name: string;                // "Google Inc."
  aliases: string[];                   // ["Google LLC", "Alphabet"]
  
  // Company Type
  type: 'FAANG' | 'startup' | 'service_based' | 'other';
  industry: string[];                  // ["Technology", "SaaS"]
  
  // Location Info
  headquarter: {
    city: string;
    state: string;
    country: string;
  };
  office_locations: {
    city: string;
    state: string;
    employees: number;
  }[];
  
  // Company Metrics
  company_size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  founded_year: number;
  employee_count: number;
  
  // Hiring Info
  active_job_count: number;            // Total open positions
  hiring_trend: 'increasing' | 'stable' | 'decreasing';
  avg_hiring_per_month: number;        // 5-year average
  popular_roles: string[];             // ['React Dev', 'DevOps']
  tech_stack_popular: string[];        // ['React', 'Node.js']
  
  // Scraping Info
  scrape_enabled: boolean;             // Allow automated scraping
  scrape_frequency: 'daily' | 'weekly' | 'monthly';
  last_scraped: Date;
  job_count_scraped: number;           // In current cycle
  
  // User Engagement
  users_applied: number;               // Total applications
  users_interviewed: number;
  avg_response_time_hours: number;
  hiring_speed_score: 0-100;           // Fast to slow
  
  // Company Reputation
  glassdoor_rating?: number;           // 1-5
  salary_competitiveness: 0-100;       // vs industry average
  popularity_score: 0-100;             // Among users
  
  // Metadata
  created_at: Date;
  updated_at: Date;
  admin_notes?: string;
}
```

### 2. **Company Search & Filters (User-Facing)**

```
┌─ Company Search ─────────────────────────────────────┐
│ Search Company:      [Type company name...  ▼]       │
│                                                      │
│ FAANG Companies                                       │
│ ─────────────────────────────────────────────────   │
│ [Google] [Apple] [Amazon] [Meta] [Microsoft]        │
│ [Netflix] [Tesla] [Nvidia] [IBM] [Adobe]            │
│                                                      │
│ Service-Based Companies                              │
│ ─────────────────────────────────────────────────   │
│ [TCS] [Infosys] [Wipro] [HCL] [Tech Mahindra]       │
│ [Cognizant] [Accenture] [Capgemini] [IBM] [Dell]    │
│                                                      │
│ Startup Scene                                        │
│ ─────────────────────────────────────────────────   │
│ [Swiggy] [Flipkart] [PharmEasy] [OYO] [Zerodha]     │
│ [Delhivery] [Nykaa] [Razorpay] [Dream11] [Dailyhunt]│
│                                                      │
│ Filter by:                                           │
│ Location: [All    ▼]  Size: [All ▼]  Type: [All ▼] │
│ [Apply Filters]                                      │
└─────────────────────────────────────────────────────────┘
```

### 3. **Admin Company Management Panel** (`/admin/companies`)

**Company List & Management:**
```
┌─ Company Database Management ─────────────────────────┐
│ Total Companies: 1,245 | Active Scraping: 89         │
│ [+ Add Company] [Import CSV] [Export All]             │
│                                                      │
│ Search: [Search companies...            ] [Clear]    │
│ Filter: Type [All ▼] | Size [All ▼] | Status [All ▼]│
│                                                      │
│ Company Name      Type        Size      Jobs  Scrape  │
│ ────────────────────────────────────────────────────│
│ Google           FAANG       Huge      145   ✅ Daily│
│ TCS              Service     Huge      89    ✅ Weekly│
│ Infosys          Service     Huge      76    ✅ Weekly│
│ Microsoft        FAANG       Huge      124   ✅ Daily│
│ Amazon           FAANG       Huge      156   ✅ Daily│
│ Swiggy           Startup     Large     23    ❌ Off   │
│ [... 1239 more companies]                           │
│ [View Detailed Analytics] [Download Report]          │
└─────────────────────────────────────────────────────────┘
```

**Company Detail Page:**
```
┌─ Google Inc. ──────────────────────────────────────┐
│ Type: FAANG | Founded: 1998 | HQ: Mountain View, CA │
│ Employees: 190,234 | Size: Enterprise               │
│ Glassdoor Rating: 4.5/5 | Salary Score: 92/100      │
│ User Popularity: 85/100                             │
│                                                      │
│ Active Jobs: 145 | Total Applications: 5,432        │
│ Avg Hiring Speed: 18 days | Response Rate: 78%      │
│                                                      │
│ Tech Stack (Top 5):                                  │
│ [Python 89%] [Go 76%] [C++ 65%] [JavaScript 82%]    │
│ [Java 54%]                                           │
│                                                      │
│ Popular Roles:                                       │
│ Software Engineer (43), Data Engineer (21),          │
│ DevOps Engineer (15), Product Manager (12)           │
│                                                      │
│ Scraping Configuration                              │
│ ────────────────────────────────────────────────   │
│ Enable Scraping:     [☑]  Frequency: [Daily ▼]     │
│ Last Scraped:        2 hours ago                     │
│ Jobs Found:          12 new                          │
│                                                      │
│ Aliases:  [google.com] [alphabet] [googler]         │
│ [Edit] [Add Alias] [View All Jobs] [Scrape Now]     │
└─────────────────────────────────────────────────────────┘
```

---

## Job Matching & Embedding Logic

### 1. **Job Matching Algorithm**

#### Multi-Factor Matching Score (0-100)

```
┌─────────────────────────────────────────────────────┐
│           JOB MATCHING ALGORITHM                     │
├─────────────────────────────────────────────────────┤
│ Final Score = Weighted Sum of 5 Factors              │
│                                                     │
│ 1. Required Skills Match (Weight: 40%)               │
│    Score = (Matched Required / Total Required) × 100 │
│    Example: User has 7/10 required = 70 points      │
│                                                     │
│ 2. Preferred Skills Match (Weight: 15%)              │
│    Score = (Matched Preferred / Total Preferred)×100│
│    Example: User has 4/8 preferred = 50 points      │
│                                                     │
│ 3. Location Match (Weight: 15%)                      │
│    • Remote jobs: 100 (if user considers remote)     │
│    • Same city: 100                                  │
│    • Same state: 70                                  │
│    • Different state: 40                             │
│    • Willing to relocate: +20                        │
│                                                     │
│ 4. Experience Level Match (Weight: 15%)              │
│    • Exact match: 100                                │
│    • ±1 level difference: 80                         │
│    • ±2+ levels: 40                                  │
│    Levels: Entry (0-2yr), Mid (2-5yr), Senior (5+yr)│
│                                                     │
│ 5. Salary Match (Weight: 10%)                        │
│    Score = (User's Expected - Min Offered) / Range   │
│    • Within range: 100                               │
│    • 10% below: 80                                   │
│    • 20% below: 60                                   │
│    • 30%+ below: 40                                  │
│                                                     │
├─────────────────────────────────────────────────────┤
│ FINAL SCORE = (40% × Skills) +                       │
│               (15% × Preferred) +                    │
│               (15% × Location) +                     │
│               (15% × Experience) +                   │
│               (10% × Salary)                         │
│                                                     │
│ Score Interpretation:                                │
│ 90-100: Perfect Match (Highly Recommended)           │
│ 75-89:  Strong Match (Recommended)                   │
│ 60-74:  Good Match (Possible)                        │
│ 50-59:  Moderate Match (Consider)                    │
│ <50:    Weak Match (Poor fit)                        │
└─────────────────────────────────────────────────────┘
```

#### Example Calculation

```
User Profile:
- Skills: [React, Node.js, TypeScript, AWS, Docker]
- Location: Bangalore
- Experience: 4 years (Mid-level)
- Expected Salary: ₹25-30 LPA
- Willing to Relocate: Yes

Job: "Senior React Developer @ Google"
- Required Skills: [React, TypeScript, System Design, AWS]
- Preferred Skills: [Go, K8s, Python]
- Location: Mountain View, CA (Remote: Yes)
- Experience Required: 5+ years (Senior)
- Salary: ₹28-40 LPA

MATCHING CALCULATION:
────────────────────────────────────────────────────

1. Required Skills (40%):
   Matched: React ✅, TypeScript ✅, AWS ✅
   Missing: System Design ❌
   Score: 3/4 = 75%
   Points: 75 × 0.40 = 30 points

2. Preferred Skills (15%):
   Matched: None ❌
   Score: 0/3 = 0%
   Points: 0 × 0.15 = 0 points

3. Location (15%):
   Job: Remote + Mountain View
   User: Bangalore, Willing to Relocate
   Score: 100 (remote + willing to relocate)
   Points: 100 × 0.15 = 15 points

4. Experience (15%):
   User: Mid-level (4 yrs)
   Job: Senior (5+ yrs)
   Difference: -1 level = 80%
   Points: 80 × 0.15 = 12 points

5. Salary (10%):
   User Expected: ₹25-30 LPA (mid: 27.5)
   Job Offered: ₹28-40 LPA
   User in range: ✅ 100%
   Points: 100 × 0.10 = 10 points

────────────────────────────────────────────────────
TOTAL SCORE: 30 + 0 + 15 + 12 + 10 = 67/100

RECOMMENDATION: Good Match (60-74 range)
Match Reason: "Great location fit & salary, missing system design skills"
```

### 2. **Embedding-Based Similarity**

For enhanced matching, we use semantic embeddings:

```typescript
// Skills Embedding
// Convert skills/job descriptions to vectors using:
// - OpenAI Embeddings API
// - or Hugging Face sentence-transformers
// Dimension: 1536 (OpenAI) or 384 (Hugging Face)

// Example:
userEmbedding = embed("React Developer with 4 years experience in AWS")
jobEmbedding = embed("Senior React Engineer for Google Cloud Platform")

// Cosine Similarity (0-1)
similarity = cosineSimilarity(userEmbedding, jobEmbedding)
// 0.87 = High semantic match

// Combined Score = (Traditional Match × 0.6) + (Embedding × 0.4)
finalScore = (67 × 0.6) + (87 × 0.4) = 76.2
```

---

## AI Job Matching Intelligence

### 1. **AI-Powered Features**

```
┌─────────────────────────────────────────────────────┐
│          AI JOB MATCHING SYSTEM                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ✨ Smart Features:                                   │
│                                                     │
│ 1. Auto-Resume Parsing                              │
│    • Extract text from PDF/DOCX                     │
│    • Parse structured data (name, email, phone)     │
│    • Identify key skills (60+ recognized)           │
│    • Calculate profile completeness %               │
│                                                     │
│ 2. Skill Gap Analysis                               │
│    • Identify missing skills per job                │
│    • Suggest learning resources                     │
│    • Recommend upskilling path                      │
│    • Track skill progress                           │
│                                                     │
│ 3. Smart Job Recommendations                        │
│    • ML-based filtering (not just rule-based)       │
│    • Contextual matching (semantic similarity)      │
│    • Trend-aware suggestions                        │
│    • Personalized ranking per user                  │
│                                                     │
│ 4. Match Explanation                                │
│    • "Perfect for your React + Node.js stack"       │
│    • "Location is remote - matches preference"      │
│    • "Salary ₹28L within your range"                │
│    • "Missing: K8s (learn in 3-6 months)"           │
│                                                     │
│ 5. Predictive Analytics                             │
│    • Likelihood of offer (ML model)                 │
│    • Time to decision estimate                      │
│    • Company response probability                   │
│    • Salary negotiation insights                    │
│                                                     │
│ 6. Market Intelligence                              │
│    • Trending skills in market                      │
│    • Salary trends by role/location                 │
│    • Company hiring velocity                        │
│    • Competitive job market analysis                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 2. **Advanced Matching Modes**

```typescript
enum MatchingMode {
  // 1. STRICT - Only show jobs user is very qualified for
  // Filters: Match Score >= 85, All required skills present
  // Use Case: Senior developers, specialized roles
  STRICT = "strict",
  
  // 2. BALANCED (Default) - Good mix of current & stretch roles
  // Filters: Match Score >= 65, 70% required skills match
  // Use Case: Most users, career growth balance
  BALANCED = "balanced",
  
  // 3. GROWTH - Show stretch opportunities for learning
  // Filters: Match Score >= 50, Suggests learning paths
  // Use Case: Career changers, skill developers
  GROWTH = "growth",
  
  // 4. AGGRESSIVE - Find any possible opportunity
  // Filters: Match Score >= 40, Extensive gap analysis
  // Use Case: Job-hungry users, any role seekers
  AGGRESSIVE = "aggressive",
}
```

### 3. **Skill Gap Learning Paths**

```
Example for User wanting Google SWE role:

Current Skills: React, Node.js, AWS, Docker
Job Requires: Go, K8s, Protobuf, GCP

Missing Skills Analysis:
┌────────────────────────────────────────────────┐
│ Skill       Level    Time      Resources        │
├────────────────────────────────────────────────┤
│ Go          NEW      3-4 wks   [Udemy] [Docs]  │
│ K8s         NEW      4-6 wks   [Linux Academy] │
│ Protobuf    NEW      2-3 wks   [YouTube]       │
│ GCP         NEW      3-4 wks   [Coursera]      │
├────────────────────────────────────────────────┤
│ Total Effort: 12-17 weeks (3-4 months)        │
│ Difficulty: Medium                             │
│ Success Likelihood: 72% (with effort)          │
└────────────────────────────────────────────────┘

Recommended Learning Path:
1. Start with Go (foundation)
2. Learn GCP basics (parallel with Go)
3. Master K8s (after Go)
4. Learn Protobuf (2-week sprint)
5. Build project combining all
```

---

## Admin Role & Permissions

### 1. **Admin Hierarchy**

```typescript
enum AdminRole {
  // Super Admin - Full system access
  SUPER_ADMIN = "super_admin",
  
  // Scraper Admin - Manage scraping & company data
  SCRAPER_ADMIN = "scraper_admin",
  
  // Matching Admin - Configure job matching system
  MATCHING_ADMIN = "matching_admin",
  
  // Support Admin - User support & troubleshooting
  SUPPORT_ADMIN = "support_admin",
  
  // Analytics Admin - View & export analytics
  ANALYTICS_ADMIN = "analytics_admin",
  
  // Finance Admin - Manage revenue, payments, costs
  FINANCE_ADMIN = "finance_admin",
}

// Permission mapping
const PERMISSIONS = {
  SUPER_ADMIN: ['all'],
  SCRAPER_ADMIN: [
    'scraper.enable',
    'scraper.configure',
    'scraper.run',
    'company.create',
    'company.edit',
    'company.delete',
    'company.import',
  ],
  MATCHING_ADMIN: [
    'matching.configure',
    'matching.weights',
    'matching.rebuild',
    'skill.manage',
  ],
  SUPPORT_ADMIN: [
    'user.view',
    'user.message',
    'application.view',
    'issue.resolve',
  ],
  ANALYTICS_ADMIN: [
    'analytics.view',
    'analytics.export',
    'reports.generate',
  ],
  FINANCE_ADMIN: [
    'revenue.view',
    'costs.view',
    'billing.manage',
    'payments.view',
  ],
};
```

### 2. **Admin Access Control**

```typescript
// Admin Panel Access
interface AdminAccess {
  // Dashboard visibility
  dashboard: {
    mainMetrics: boolean;
    costAnalysis: boolean;
    userMetrics: boolean;
  };
  
  // Feature Access
  scraping: {
    view: boolean;
    configure: boolean;
    run: boolean;
    automate: boolean;
  };
  
  matching: {
    viewMatches: boolean;
    configureAlgorithm: boolean;
    rebuildMatches: boolean;
  };
  
  companies: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    configure_scraping: boolean;
  };
  
  users: {
    view: boolean;
    edit: boolean;
    message: boolean;
    remove: boolean;
  };
  
  analytics: {
    view: boolean;
    export: boolean;
    customReports: boolean;
  };
  
  billing: {
    view: boolean;
    manage: boolean;
  };
}
```

---

## Admin Dashboard Pages

### Current Pages (✅ Implemented)

#### 1. **Dashboard** (`/admin`)
- System KPIs (users, jobs, applications)
- Revenue overview
- Recent activities
- System health status

#### 2. **Jobs** (`/admin/jobs`)
- Job listing & search
- Job analytics (views, applications)
- Bulk edit
- Delete jobs

#### 3. **Users** (`/admin/users`)
- User listing & search
- User profile view
- Ban/suspend users
- Message users

#### 4. **Notifications** (`/admin/notifications`)
- System notification management
- Scheduled notifications
- Push notification templates

#### 5. **Referrals** (`/admin/referrals`)
- Referral program management
- Referral tracking
- Commission settings

#### 6. **Crawlers** (`/admin/crawlers`)
- Scraper status
- Manual trigger scrapes
- Configuration

#### 7. **Analytics** (`/admin/analytics`)
- Advanced analytics views
- Custom reports
- Data export

#### 8. **Revenue** (`/admin/revenue`)
- Revenue tracking
- Payment processing
- Financial reports

#### 9. **Settings** (`/admin/settings`)
- System settings
- Configuration
- Email templates

#### 10. **Profile Fields** (`/admin/profile-fields`)
- Custom profile field management
- Field ordering
- Field settings

#### 11. **Skills** (`/admin/skills`)
- Skill inventory
- Skill categories
- Trending skills

### 🆕 New Pages Needed

#### 12. **Scraper Configuration** (`/admin/scraper-config`) - PRIORITY 1
```
Purpose: Detailed scraping controls
Features:
- Global enable/disable toggle
- Pages configuration (1, 5, 10, 50, 100)
- Rate limiting settings
- Cost management
- Auto-scrape scheduling
- Blacklist/whitelist companies
- Success metrics & logs
```

#### 13. **Company Management** (`/admin/companies`) - PRIORITY 1
```
Purpose: Curate company database
Features:
- Company database (CRUD)
- Import CSV with aliases
- Scraping configuration per company
- Company metrics & analytics
- Popular skills per company
- Hiring trends
```

#### 14. **Job Matching Settings** (`/admin/matching`) - PRIORITY 1
```
Purpose: Configure matching algorithm
Features:
- Adjust match weight percentages
- Set minimum match thresholds
- Configure matching modes
- Test matching algorithm
- View user-job compatibility matrix
- Rebuild all matches
- Match analytics
```

#### 15. **Job Matching Analytics** (`/admin/matching-analytics`) - PRIORITY 2
```
Purpose: Deep insights into matching performance
Features:
- Match distribution (histogram)
- Top matched jobs
- Skill gap analysis
- User-job heatmap
- Matching success rate
- Trend analysis
```

#### 16. **Resume Analytics** (`/admin/resumes`) - PRIORITY 2
```
Purpose: Monitor resume parsing system
Features:
- Resume processing status
- Parsing quality metrics
- Extracted skills distribution
- Profile completion tracking
- Failed parsing analysis
- Bulk reprocess resumes
```

#### 17. **Scraping History & Logs** (`/admin/scraper-logs`) - PRIORITY 2
```
Purpose: Audit & troubleshoot scraping
Features:
- Scrape job history (paginated)
- Error logs
- Cost per scrape
- Jobs added per day
- Export scrape data
```

#### 18. **Skill Management** (`/admin/skills-advanced`) - PRIORITY 3
```
Purpose: Advanced skill inventory
Features:
- Skill demand trending
- Skill mapping (aliases)
- Learning resources
- Skill categories
- Add/edit/delete skills
- Bulk operations
```

#### 19. **User Skill Analytics** (`/admin/user-skills`) - PRIORITY 3
```
Purpose: Skill distribution across users
Features:
- Top skills by user count
- Skill gaps analysis
- Skills per experience level
- Popular skills trending
- Skills by location
```

#### 20. **Company Hiring Analytics** (`/admin/company-hiring`) - PRIORITY 3
```
Purpose: Monitor company hiring patterns
Features:
- Companies with most job postings
- Hiring velocity per company
- Response time tracking
- Popular skills per company
- Salary analysis by company
```

---

## New Admin Features Required

### 1. **Scraper Control Features**

```typescript
// API Endpoints Needed
POST   /api/admin/scraper/toggle           // Enable/disable globally
POST   /api/admin/scraper/start            // Trigger manual scrape
GET    /api/admin/scraper/status           // Current status
GET    /api/admin/scraper/logs             // Scraping history
POST   /api/admin/scraper/config           // Update config
GET    /api/admin/scraper/cost-analysis    // Cost breakdown
POST   /api/admin/scraper/cancel           // Stop active scrape
POST   /api/admin/scraper/schedule         // Set auto-scrape schedule
```

### 2. **Company Management Features**

```typescript
POST   /api/admin/companies                // Create company
GET    /api/admin/companies                // List companies
GET    /api/admin/companies/:id            // Company details
PUT    /api/admin/companies/:id            // Update company
DELETE /api/admin/companies/:id            // Delete company
POST   /api/admin/companies/import         // Bulk import from CSV
POST   /api/admin/companies/:id/scrape     // Scrape specific company
GET    /api/admin/companies/:id/analytics  // Company hiring data
PUT    /api/admin/companies/:id/aliases    // Manage name aliases
```

### 3. **Matching Configuration Features**

```typescript
GET    /api/admin/matching/config          // Current config
PUT    /api/admin/matching/config          // Update weights/thresholds
POST   /api/admin/matching/rebuild         // Rebuild all matches
POST   /api/admin/matching/test            // Test algorithm
GET    /api/admin/matching/test-results    // Test output
GET    /api/admin/matching/user-job-matrix // Compatibility matrix
GET    /api/admin/matching/analytics       // Match analytics
POST   /api/admin/matching/mode/:mode      // Set matching mode
```

### 4. **Resume Management Features**

```typescript
GET    /api/admin/resumes                  // List all resumes
GET    /api/admin/resumes/:userId          // User's resume
GET    /api/admin/resumes/stats            // Parsing stats
POST   /api/admin/resumes/reprocess        // Reprocess resumes
DELETE /api/admin/resumes/:id              // Delete resume
PUT    /api/admin/resumes/settings         // Update parser settings
GET    /api/admin/resumes/quality-report   // Quality metrics
```

### 5. **Analytics & Reporting Features**

```typescript
GET    /api/admin/analytics/jobs           // Job analytics
GET    /api/admin/analytics/users          // User analytics
GET    /api/admin/analytics/skills         // Skill analytics
GET    /api/admin/analytics/matching       // Matching performance
GET    /api/admin/analytics/companies      // Company hiring
GET    /api/admin/analytics/export         // Export CSV/JSON
POST   /api/admin/analytics/report         // Generate PDF report
```

---

## Database & API Architecture

### Database Collections

```typescript
// ===== NEW COLLECTIONS =====

// Scraper Configuration
scraperConfigs: {
  _id: ObjectId;
  enabled: boolean;
  maxRequestsPerHour: number;
  maxRequestsPerDay: number;
  defaultPages: number;
  maxPagesAllowed: number;
  autoScrapeEnabled: boolean;
  autoScrapeFrequency: string;
  autoScrapeTime: string;
  excludedCompanies: string[];
  trustedCompanies: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Company Database
companies: {
  _id: ObjectId;
  name: string;
  display_name: string;
  aliases: string[];
  type: string;
  industry: string[];
  headquarter: object;
  office_locations: object[];
  company_size: string;
  founded_year: number;
  employee_count: number;
  active_job_count: number;
  hiring_trend: string;
  avg_hiring_per_month: number;
  popular_roles: string[];
  tech_stack_popular: string[];
  scrape_enabled: boolean;
  scrape_frequency: string;
  last_scraped: Date;
  job_count_scraped: number;
  users_applied: number;
  glassdoor_rating: number;
  salary_competitiveness: number;
  popularity_score: number;
  created_at: Date;
  updated_at: Date;
}

// Job Matches
jobMatches: {
  _id: ObjectId;
  userId: ObjectId;
  jobId: ObjectId;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  matchReasons: string[];
  matchingMode: string;
  createdAt: Date;
  viewedAt?: Date;
  appliedAt?: Date;
  status: string;
}

// Scrape Logs
scrapeLogs: {
  _id: ObjectId;
  keyword: string;
  location: string;
  pages: number;
  jobsFound: number;
  jobsAdded: number;
  status: 'success' | 'partial' | 'failed';
  duration_seconds: number;
  cost: number;
  error?: string;
  timestamp: Date;
}

// Skill Mappings (Aliases)
skillMappings: {
  _id: ObjectId;
  canonical_name: string;
  aliases: string[];
  category: string;
  demand_score: number;
  learning_resources: object[];
  created_at: Date;
}

// Matching Configuration
matchingConfigs: {
  _id: ObjectId;
  weights: {
    requiredSkills: number;
    preferredSkills: number;
    location: number;
    experience: number;
    salary: number;
  };
  thresholds: {
    perfect_match: number;
    strong_match: number;
    good_match: number;
    moderate_match: number;
  };
  matching_mode: string;
  embedding_enabled: boolean;
  embedding_weight: number;
  last_rebuild: Date;
  updated_at: Date;
}

// Admin Activity Log
adminLogs: {
  _id: ObjectId;
  admin_id: ObjectId;
  action: string;
  resource_type: string;
  resource_id: string;
  changes: object;
  timestamp: Date;
  ip_address: string;
}
```

### API Response Format

```typescript
// Success Response
{
  success: true,
  data: { /* actual data */ },
  message?: string,
  meta?: { total, page, pages }
}

// Error Response
{
  success: false,
  error: "Descriptive error message",
  code: "ERROR_CODE",
  details?: { /* additional info */ }
}

// Pagination
{
  success: true,
  data: [ /* array of items */ ],
  meta: {
    total: 245,
    page: 1,
    pages: 13,
    per_page: 20
  }
}
```

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
**Priority: Critical** ✅

- [ ] Create `/admin/scraper-config` page
- [ ] Create `/admin/companies` page
- [ ] Create `/admin/matching` page
- [ ] Implement scraper enable/disable toggle
- [ ] Implement pages configuration (1, 5, 10, 50, 100)
- [ ] Build company import from CSV
- [ ] Implement company-wise scraping

### Phase 2: Job Matching (Weeks 3-4)
**Priority: High** ✅

- [ ] Configure matching algorithm weights
- [ ] Implement algorithm rebuilding
- [ ] Create user-job compatibility matrix
- [ ] Build match analytics page
- [ ] Add embedding-based matching (optional)

### Phase 3: Analytics (Week 5)
**Priority: Medium** ⏳

- [ ] Create resume analytics page
- [ ] Build scraper logs page
- [ ] Implement job matching analytics
- [ ] Add company hiring analytics
- [ ] Create skill analytics advanced

### Phase 4: Automation & Polish (Week 6)
**Priority: Nice-to-have** ⏳

- [ ] Auto-scrape scheduling
- [ ] Bulk operations
- [ ] Export/import features
- [ ] Admin activity logging
- [ ] Advanced filtering & search

### Phase 5: Monitoring (Week 7)
**Priority: Maintenance** ⏳

- [ ] Cost monitoring & alerts
- [ ] System health dashboard
- [ ] Error tracking & alerts
- [ ] Performance monitoring

---

## Key Configuration Examples

### Example: Scraper Configuration JSON

```json
{
  "enabled": true,
  "maxRequestsPerHour": 10,
  "maxRequestsPerDay": 50,
  "defaultPages": 10,
  "maxPagesAllowed": 100,
  "minSalaryDataQuality": 75,
  "minDescriptionLength": 500,
  "filterDuplicates": true,
  "excludedCompanies": ["spam-corp.com", "test-company"],
  "trustedCompanies": ["google", "microsoft", "amazon"],
  "autoScrapeEnabled": true,
  "autoScrapeFrequency": "daily",
  "autoScrapeTime": "02:00 AM IST",
  "autoScrapePages": 10,
  "notifyOnError": true,
  "notifyOnComplete": false,
  "apiCallsPerMonth": 1000,
  "estimatedMonthlyCost": 5000,
  "costThresholdAlert": 4500
}
```

### Example: Matching Configuration JSON

```json
{
  "weights": {
    "requiredSkills": 40,
    "preferredSkills": 15,
    "location": 15,
    "experience": 15,
    "salary": 10
  },
  "thresholds": {
    "perfect_match": 90,
    "strong_match": 75,
    "good_match": 60,
    "moderate_match": 50
  },
  "matching_mode": "balanced",
  "embedding_enabled": false,
  "embedding_weight": 0.4,
  "location_fuzzy_match": true,
  "allow_experience_gap": 1
}
```

### Example: Company Profile JSON

```json
{
  "name": "Google",
  "display_name": "Google Inc.",
  "aliases": ["google.com", "alphabet", "googler"],
  "type": "FAANG",
  "industry": ["Technology", "Cloud", "AI/ML"],
  "headquarter": {
    "city": "Mountain View",
    "state": "California",
    "country": "USA"
  },
  "company_size": "enterprise",
  "founded_year": 1998,
  "employee_count": 190234,
  "active_job_count": 145,
  "hiring_trend": "increasing",
  "avg_hiring_per_month": 35,
  "popular_roles": [
    "Software Engineer",
    "Data Engineer",
    "Product Manager"
  ],
  "tech_stack_popular": ["Python", "Go", "C++", "JavaScript"],
  "scrape_enabled": true,
  "scrape_frequency": "daily",
  "last_scraped": "2026-01-17T18:00:00Z",
  "job_count_scraped": 12,
  "glassdoor_rating": 4.5,
  "salary_competitiveness": 92,
  "popularity_score": 95
}
```

---

## Summary: What Admins Can Now Do

✅ **Scraping Management**
- Toggle scraping on/off globally
- Configure pages per scrape (1, 5, 10, 50, 100)
- Set rate limits & costs
- Schedule auto-scraping
- Manage company blacklist/whitelist
- View scraping history & costs

✅ **Company Management**
- Add/edit/delete companies
- Set company scraping frequency
- Import companies from CSV
- Track hiring trends per company
- View company-specific metrics

✅ **Job Matching Configuration**
- Adjust algorithm weights
- Set match thresholds
- Switch matching modes
- Rebuild all matches
- View user-job compatibility matrix
- Analyze matching performance

✅ **Analytics & Insights**
- Resume parsing metrics
- Skill distribution
- Company hiring trends
- Match success rates
- Cost analysis
- Export reports

✅ **User Management for Scraping**
- View which users have matched jobs
- Track applications from matches
- Monitor skill development
- Generate user insights reports

---

## Next Steps

1. **Immediate (This Week):**
   - Create `/admin/scraper-config` page
   - Create `/admin/companies` page
   - Update AdminSidebar to include new pages

2. **Short Term (Next Week):**
   - Implement API endpoints
   - Build matching configuration UI
   - Create analytics pages

3. **Medium Term (2 Weeks):**
   - Add automation features
   - Implement cost monitoring
   - Create advanced reports

---

**Document Version:** 2.0
**Last Updated:** January 17, 2026
**Owner:** JobIntel Admin Team
