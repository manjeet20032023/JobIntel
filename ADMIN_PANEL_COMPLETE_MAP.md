# Admin Panel Complete Architecture & Feature Map

## 🎯 Quick Overview

Your JobIntel admin system now has **20 pages** with 3 tiers of capability:

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN PANEL HIERARCHY                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  TIER 1: CORE OPERATIONS (Currently Implemented ✅)             │
│  ─────────────────────────────────────────────────────           │
│  Dashboard | Jobs | Users | Notifications | Referrals          │
│  Crawlers | Analytics | Revenue | Settings                      │
│  Profile Fields | Skills                                        │
│                                                                 │
│  TIER 2: SCRAPING & MATCHING (New Priority 1 ⚡)               │
│  ─────────────────────────────────────────────────────           │
│  Scraper Config | Companies | Job Matching Config               │
│                                                                 │
│  TIER 3: ANALYTICS & INSIGHTS (New Priority 2-3 📊)            │
│  ─────────────────────────────────────────────────────           │
│  Matching Analytics | Resume Analytics | Scraper Logs           │
│  Skills Advanced | User Skills | Company Hiring                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Feature Matrix: What Each Admin Can Do

### 1️⃣ **SCRAPER CONTROL** (Pages: 5 & 12)

| Feature | Control | Where |
|---------|---------|-------|
| Enable/Disable Scraping | Toggle (ON/OFF) | Crawlers + Scraper Config |
| Pages per Scrape | 1, 5, 10, 50, 100 | Scraper Config |
| Schedule Auto-Scrape | Daily/Weekly/Monthly | Scraper Config |
| Cost Management | Set budget & alerts | Scraper Config |
| Rate Limiting | Max requests/hour | Scraper Config |
| Company Blacklist | Exclude companies | Scraper Config |
| Company Whitelist | Prioritize companies | Scraper Config |
| Manual Scrape Trigger | Start now | Crawlers page |
| View Scrape History | All previous runs | Scraper Logs |
| Monitor API Usage | Requests used today | Scraper Status |

**Access:** SCRAPER_ADMIN, SUPER_ADMIN

**API Endpoints:**
```
POST   /api/admin/scraper/toggle
POST   /api/admin/scraper/start
GET    /api/admin/scraper/status
POST   /api/admin/scraper/config
GET    /api/admin/scraper/logs
GET    /api/admin/scraper/cost-analysis
```

---

### 2️⃣ **COMPANY MANAGEMENT** (Page: 13)

| Feature | Control | Capability |
|---------|---------|-----------|
| View Companies | Search & filter | 1000+ company database |
| Add Company | Manual entry | Single or bulk CSV |
| Edit Company | Update details | Name, aliases, type |
| Delete Company | Remove | With cascade cleanup |
| Company Scraping | Enable/disable | Per-company control |
| Scrape Frequency | Daily/Weekly/Monthly | Per company |
| View Metrics | Hiring trends | Jobs posted, apps |
| Import CSV | Bulk load | 100+ companies at once |
| Create Aliases | Name variants | Map "Google" = "Alphabet" |
| Track Hiring | Velocity & trends | Response time, apps |

**Access:** SCRAPER_ADMIN, SUPER_ADMIN

**API Endpoints:**
```
GET    /api/admin/companies
POST   /api/admin/companies
GET    /api/admin/companies/:id
PUT    /api/admin/companies/:id
DELETE /api/admin/companies/:id
POST   /api/admin/companies/import
GET    /api/admin/companies/:id/analytics
```

---

### 3️⃣ **JOB MATCHING CONFIGURATION** (Page: 14)

| Feature | Control | Options |
|---------|---------|---------|
| Algorithm Weights | Adjust percentages | Required (40%), Preferred (15%), Location (15%), Experience (15%), Salary (10%) |
| Match Thresholds | Set score ranges | Perfect (90+), Strong (75+), Good (60+), Moderate (50+) |
| Matching Mode | Choose strategy | STRICT (85+), BALANCED (65+), GROWTH (50+), AGGRESSIVE (40+) |
| Embedding Toggle | Enable/disable | Use semantic similarity |
| Embedding Weight | Set influence | 0-100% |
| Rebuild Matches | Recalculate all | For all users |
| Test Algorithm | Run simulation | See impact of changes |
| Location Fuzzy Match | Enable/disable | City proximity matching |

**Access:** MATCHING_ADMIN, SUPER_ADMIN

**API Endpoints:**
```
GET    /api/admin/matching/config
PUT    /api/admin/matching/config
POST   /api/admin/matching/rebuild
POST   /api/admin/matching/test
GET    /api/admin/matching/user-job-matrix
```

---

### 4️⃣ **ANALYTICS & INSIGHTS**

#### A. **Matching Analytics** (Page: 15)
| Metric | View | Use Case |
|--------|------|----------|
| Match Distribution | Histogram | See score spread |
| Top Matched Jobs | Ranking | Most popular jobs |
| Skill Gap Analysis | By role | Training needs |
| User-Job Heatmap | Matrix | Compatibility visualization |
| Success Rate | % | How many users have matches |
| Trending | Over time | Matching quality trending |

#### B. **Resume Analytics** (Page: 16)
| Metric | View | Use Case |
|--------|------|----------|
| Processing Status | Per user | Success/fail tracking |
| Quality Score | % extracted | Parsing accuracy |
| Skill Distribution | Chart | Most common skills |
| Profile Completeness | % | Data enrichment |
| Failed Parsing | List | Error investigation |
| Bulk Reprocess | Trigger | Fix bad parses |

#### C. **Scraper Logs** (Page: 17)
| Metric | View | Use Case |
|--------|------|----------|
| Scrape History | Paginated list | Audit trail |
| Jobs Per Scrape | Count | Performance tracking |
| Cost Per Scrape | ₹ Amount | Budget monitoring |
| Error Logs | Details | Troubleshooting |
| Duration | Seconds | Performance analysis |
| Export Data | CSV/JSON | External analysis |

#### D. **Skills Advanced** (Page: 18)
| Metric | View | Use Case |
|--------|------|----------|
| Trending Skills | Top 20 | Market demand |
| Skill Aliases | Mapping | Normalization |
| Learning Resources | Links | Support content |
| Demand Score | 0-100 | Popularity |
| Categories | Organization | Grouping |

#### E. **User Skills Analytics** (Page: 19)
| Metric | View | Use Case |
|--------|------|----------|
| Top Skills | By count | Most common |
| Skill Gaps | Missing | Training paths |
| By Experience | Distribution | Level-based |
| Trending | Over time | Adoption |
| By Location | Geographic | Regional patterns |

#### F. **Company Hiring Analytics** (Page: 20)
| Metric | View | Use Case |
|--------|------|----------|
| Most Hiring Companies | Ranking | Top employers |
| Hiring Velocity | Per month | Growth tracking |
| Response Time | Days average | Hiring speed |
| Popular Skills | Per company | Tech stack |
| Salary Trends | Range | Compensation |

**Access:** ANALYTICS_ADMIN, SUPER_ADMIN

**API Endpoints:**
```
GET    /api/admin/analytics/matching
GET    /api/admin/analytics/resumes
GET    /api/admin/analytics/scraper-logs
GET    /api/admin/analytics/skills
GET    /api/admin/analytics/user-skills
GET    /api/admin/analytics/company-hiring
GET    /api/admin/analytics/export
```

---

## 🏗️ Current Admin Pages (11 Implemented)

```
/admin
├── Dashboard (Overview & KPIs)
├── /admin/jobs (Job management)
├── /admin/users (User management)
├── /admin/notifications (System notifications)
├── /admin/referrals (Referral program)
├── /admin/crawlers (Scraper control)
├── /admin/analytics (Analytics dashboard)
├── /admin/revenue (Revenue tracking)
├── /admin/settings (System settings)
├── /admin/profile-fields (Custom fields)
└── /admin/skills (Skill management)
```

---

## 🆕 New Admin Pages to Build (9 New Pages)

```
/admin
├── /admin/scraper-config ⭐ PRIORITY 1
│   └── Global scraping controls, pages, scheduling
│
├── /admin/companies ⭐ PRIORITY 1
│   └── Company database, CSV import, aliases
│
├── /admin/matching ⭐ PRIORITY 1
│   └── Algorithm configuration, weights, rebuild
│
├── /admin/matching-analytics (PRIORITY 2)
│   └── Match distribution, user-job matrix
│
├── /admin/resumes (PRIORITY 2)
│   └── Resume parsing metrics, quality scores
│
├── /admin/scraper-logs (PRIORITY 2)
│   └── Scraping history, costs, errors
│
├── /admin/skills-advanced (PRIORITY 3)
│   └── Advanced skill analytics
│
├── /admin/user-skills (PRIORITY 3)
│   └── User skill distribution analysis
│
└── /admin/company-hiring (PRIORITY 3)
    └── Company hiring patterns & trends
```

---

## 📈 Scraper Pages Configuration Guide

**Recommended Breakdown:**

```
Pages  | Jobs    | Time   | Use Case
─────────────────────────────────────────
1      | 10-15   | 10s    | Quick test/verify
5      | 50-75   | 30s    | Hourly refresh
10     | 100-150 | 1min   | Daily sweep
50     | 500-750 | 5min   | Weekly bulk
100    | 1000+   | 10min  | Monthly full
```

---

## 🎛️ Algorithm Weight Configuration

**Default Setup (Balanced):**
```
Required Skills:  40% ⭐⭐⭐⭐
Preferred Skills: 15% ⭐⭐⭐
Location:         15% ⭐⭐⭐
Experience:       15% ⭐⭐⭐
Salary:           10% ⭐⭐
                 ────────
Total:           100%
```

**Can Be Adjusted By Admin:**
```
Example: STRICT MODE (Quality over Quantity)
Required Skills:  60% ⭐⭐⭐⭐⭐⭐
Preferred Skills: 10% ⭐⭐
Location:         15% ⭐⭐⭐
Experience:       10% ⭐⭐
Salary:            5% ⭐

Example: GROWTH MODE (Opportunity over Fit)
Required Skills:  30% ⭐⭐⭐
Preferred Skills: 20% ⭐⭐⭐⭐
Location:         15% ⭐⭐⭐
Experience:       20% ⭐⭐⭐⭐
Salary:           15% ⭐⭐⭐
```

---

## 🔐 Admin Permission Matrix

```
Feature                    SUPER  SCRAPER MATCHING ANALYTICS
─────────────────────────────────────────────────────────
Dashboard                   ✅     ✅      ✅      ✅
Jobs CRUD                   ✅     ✅      ✅      ❌
Users CRUD                  ✅     ❌      ❌      ❌
Notifications               ✅     ❌      ❌      ❌
Referrals                   ✅     ❌      ❌      ❌
Scraper Toggle              ✅     ✅      ❌      ❌
Scraper Config              ✅     ✅      ❌      ❌
Companies CRUD              ✅     ✅      ❌      ❌
Company Scraping            ✅     ✅      ❌      ❌
Matching Config             ✅     ❌      ✅      ❌
Rebuild Matches             ✅     ❌      ✅      ❌
View All Analytics          ✅     ✅      ✅      ✅
Export Reports              ✅     ✅      ✅      ✅
Revenue Management          ✅     ❌      ❌      ❌
System Settings             ✅     ❌      ❌      ❌
```

---

## 🔄 Data Flow Architecture

```
┌──────────────────────────────────┐
│  Admin Triggers Scrape (pages: 5) │
└────────────┬─────────────────────┘
             ↓
┌──────────────────────────────────┐
│  OpenWeb Ninja API (Fetch Jobs)   │
└────────────┬─────────────────────┘
             ↓
┌──────────────────────────────────────────┐
│  JobIntel Backend Processing              │
│  • Parse job data                        │
│  • Extract skills                        │
│  • Normalize company names               │
│  • Calculate difficulty score            │
└────────────┬──────────────────────────────┘
             ↓
┌──────────────────────────────────────────┐
│  Store in Database                       │
│  • Jobs collection                       │
│  • Log scrape event                      │
│  • Track cost (₹)                        │
└────────────┬──────────────────────────────┘
             ↓
┌──────────────────────────────────────────┐
│  Trigger Job Matching Engine              │
│  • Recalculate matches for all users     │
│  • Update JobMatch collection            │
│  • Send match notifications              │
└────────────┬──────────────────────────────┘
             ↓
┌──────────────────────────────────────────┐
│  Update Admin Dashboard                  │
│  • Show new jobs added                   │
│  • Display cost                          │
│  • Show job count per skill              │
│  • Update analytics                      │
└──────────────────────────────────────────┘
```

---

## 📊 Dashboard Widgets Overview

### Scraper Config Page Widgets
- [ ] Status Badge (Enabled/Disabled)
- [ ] Quick Stats (Jobs today, API usage, cost)
- [ ] Controls (Manual scrape, enable/disable)
- [ ] Presets (Quick templates)
- [ ] Custom Builder (Keyword + filters)
- [ ] History Table (Last 30 scrapes)
- [ ] Configuration Panel (Advanced settings)

### Companies Page Widgets
- [ ] Search Bar (Find companies)
- [ ] Filter Panel (Type, size, status)
- [ ] Company Table (Paginated list)
- [ ] Detail Modal (Company info)
- [ ] Import CSV Upload
- [ ] Quick Actions (Edit, delete, scrape)
- [ ] Analytics (Hiring trends, skills)

### Matching Config Page Widgets
- [ ] Current Config Display
- [ ] Weight Sliders (5 factors)
- [ ] Threshold Inputs
- [ ] Mode Selection (Strict/Balanced/Growth)
- [ ] Test Button
- [ ] Test Results Display
- [ ] Rebuild Button
- [ ] Compatibility Matrix Preview

### Analytics Pages Widgets
- [ ] Charts (Match distribution, trending)
- [ ] Tables (Top jobs, skill gaps)
- [ ] Heatmaps (User-job compatibility)
- [ ] Export Buttons (CSV, JSON, PDF)
- [ ] Date Range Filters
- [ ] Comparison Tools (YoY, Month-over-month)

---

## 🎯 Implementation Priority & Timeline

### Week 1: Scraper Foundation
```
Priority 1 (CRITICAL):
□ Scraper Config Page UI
□ Pages selection (1, 5, 10, 50, 100)
□ Enable/disable toggle
□ Manual scrape trigger
□ Cost display

Estimated: 8 hours
```

### Week 2: Company Management
```
Priority 1 (CRITICAL):
□ Companies page UI
□ Company CRUD
□ CSV import functionality
□ Company-wise scraping
□ Basic analytics

Estimated: 10 hours
```

### Week 3: Job Matching
```
Priority 1 (CRITICAL):
□ Matching config page UI
□ Weight adjustment sliders
□ Threshold configuration
□ Algorithm rebuild
□ User-job matrix view

Estimated: 12 hours
```

### Week 4: Analytics
```
Priority 2 (HIGH):
□ Matching analytics page
□ Resume analytics page
□ Scraper logs page
□ Charts & visualizations
□ Export functionality

Estimated: 10 hours
```

### Week 5+: Polish & Automation
```
Priority 3 (NICE-TO-HAVE):
□ Advanced filtering
□ Bulk operations
□ Automation scheduling
□ Cost monitoring
□ Alerts & notifications

Estimated: 8 hours
```

---

## 🚀 Quick Start: What To Build First

### IMMEDIATE (Today)
1. ✅ Fix scraper results display (DONE)
2. ✅ Create documentation (DONE)
3. 📄 Update AdminSidebar.tsx to add new pages

### THIS WEEK
1. Build `/admin/scraper-config`
2. Build `/admin/companies`
3. Build `/admin/matching`

### NEXT WEEK
1. Build analytics pages
2. Create API endpoints
3. Add cost monitoring

---

## 📝 AdminSidebar Update Needed

```tsx
// Add these to navItems array in AdminSidebar.tsx

// New TIER 2: Scraping & Matching
{ icon: Settings, label: 'Scraper Config', path: '/admin/scraper-config' },
{ icon: Building2, label: 'Companies', path: '/admin/companies' },
{ icon: Zap, label: 'Job Matching', path: '/admin/matching' },

// New TIER 3: Analytics
{ icon: BarChart3, label: 'Match Analytics', path: '/admin/matching-analytics' },
{ icon: FileText, label: 'Resume Analytics', path: '/admin/resumes' },
{ icon: History, label: 'Scraper Logs', path: '/admin/scraper-logs' },
{ icon: Layers, label: 'Skills Advanced', path: '/admin/skills-advanced' },
{ icon: TrendingUp, label: 'User Skills', path: '/admin/user-skills' },
{ icon: Briefcase, label: 'Company Hiring', path: '/admin/company-hiring' },
```

---

## 📚 Complete Feature Checklist

### Scraper Controls
- [x] Enable/Disable globally
- [ ] Pages configuration (1, 5, 10, 50, 100)
- [ ] Rate limiting
- [ ] Cost tracking
- [ ] Auto-scheduling
- [ ] Company blacklist/whitelist
- [ ] Manual trigger
- [ ] History logs
- [ ] Error notifications

### Company Management
- [ ] Add companies
- [ ] Edit companies
- [ ] Delete companies
- [ ] CSV import/export
- [ ] Name aliases
- [ ] Per-company scraping
- [ ] Hiring metrics
- [ ] Analytics dashboard

### Job Matching
- [ ] Weight adjustment
- [ ] Threshold configuration
- [ ] Algorithm rebuild
- [ ] Test functionality
- [ ] User-job matrix
- [ ] Matching modes
- [ ] Embedding toggle

### Analytics
- [ ] Match distribution
- [ ] Resume quality metrics
- [ ] Skill trends
- [ ] Company hiring patterns
- [ ] User skill distribution
- [ ] Export capabilities
- [ ] Custom reports

---

## 🎓 Learning Resources for Implementation

### Frontend Components Needed
- Slider components (weight adjustment)
- Table components (company/job lists)
- Modal components (detail views)
- Chart components (analytics)
- CSV upload component
- Date range picker
- Export/download buttons

### Backend APIs Needed
- `/api/admin/scraper/*` (6 endpoints)
- `/api/admin/companies/*` (7 endpoints)
- `/api/admin/matching/*` (6 endpoints)
- `/api/admin/analytics/*` (6 endpoints)

### Database Operations
- Update Jobs schema (add requiredSkills, preferredSkills)
- Create Companies collection
- Create JobMatches collection
- Create ScrapeLogs collection
- Create MatchingConfigs collection

---

**Status:** 🟢 READY TO BUILD

**Document Version:** 1.0
**Created:** January 17, 2026
**Owner:** JobIntel Development Team
