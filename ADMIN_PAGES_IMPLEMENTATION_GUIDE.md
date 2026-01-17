# Admin Pages Implementation Guide - UI & Components

## 📋 Table of Contents
1. [Scraper Configuration Page](#scraper-configuration-page)
2. [Companies Management Page](#companies-management-page)
3. [Job Matching Configuration Page](#job-matching-configuration-page)
4. [Analytics Pages](#analytics-pages)
5. [Component Library](#component-library-needed)
6. [API Integration Guide](#api-integration-guide)

---

## Scraper Configuration Page
**Path:** `/admin/scraper-config`
**Priority:** ⚡ CRITICAL (Week 1)
**Time Estimate:** 8 hours

### Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ 🔧 Scraper Configuration                    [Back to Admin] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📊 STATUS OVERVIEW                                      │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Status: ✅ ENABLED              │ Last Scrape: 2h ago    │ │
│ │ API Calls Today: 8/10           │ Jobs Added: 45         │ │
│ │ Monthly Cost: ₹850              │ Budget Alert: ₹4500    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ⚡ QUICK CONTROLS                                        │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Enable Scraping:  [✓ ON]                               │ │
│ │ Manual Scrape Now: [▶ Start Scrape] [⏸ Cancel]        │ │
│ │ View Logs: [📋 Logs]  Export: [⬇ CSV] [⬇ JSON]        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔍 PRESET SCRAPE TEMPLATES                              │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ [React Dev - 5pg] [Node.js - 5pg] [Python - 10pg]      │ │
│ │ [DevOps - 5pg] [Data Science - 10pg]                   │ │
│ │ [+ Custom Scrape] [⚙ Manage Presets]                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ⚙️ GLOBAL SETTINGS                                       │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │                                                         │ │
│ │ RATE LIMITING                                           │ │
│ │ ────────────────────────────────────────────────────   │ │
│ │ Max Scrapes/Hour:    [10          ]                     │ │
│ │ Max Scrapes/Day:     [50          ]                     │ │
│ │ Monthly API Quota:   [1000 calls  ]                     │ │
│ │                                                         │ │
│ │ PAGINATION                                              │ │
│ │ ────────────────────────────────────────────────────   │ │
│ │ Default Pages:       [10 ▼]                             │ │
│ │ Max Allowed Pages:   [100 ▼]                            │ │
│ │                                                         │ │
│ │ DATA QUALITY FILTERS                                    │ │
│ │ ────────────────────────────────────────────────────   │ │
│ │ Min Salary Data Quality:  [75%        ]                 │ │
│ │ Min Description Length:   [500 chars  ]                 │ │
│ │ Filter Duplicates:        [☑] YES                      │ │
│ │                                                         │ │
│ │                                          [Save] [Reset] │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🗓️ AUTO-SCRAPE SCHEDULING                              │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │                                                         │ │
│ │ Enable Auto-Scrape:     [☑] YES                        │ │
│ │ Frequency:              [Daily        ▼]                │ │
│ │ Time (IST):             [02:00 AM     ]                 │ │
│ │ Pages Per Run:          [10 ▼]                          │ │
│ │ Skip Weekends:          [☐] NO                          │ │
│ │ Skip Holidays:          [☑] YES                         │ │
│ │                                                         │ │
│ │ Next Scheduled Run:     Tomorrow at 02:00 AM IST        │ │
│ │                                                         │ │
│ │                                          [Save] [Reset] │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🚫 COMPANY FILTERING                                     │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │                                                         │ │
│ │ EXCLUDE COMPANIES (Blacklist)                           │ │
│ │ [spam-corp.com] [test-company] [x] [+ Add]            │ │
│ │                                                         │ │
│ │ TRUSTED COMPANIES (Whitelist - Priority)                │ │
│ │ [google] [microsoft] [amazon] [x] [+ Add]             │ │
│ │                                                         │ │
│ │                                          [Save] [Reset] │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 💰 COST MANAGEMENT                                       │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │                                                         │ │
│ │ Cost Per API Call:       ₹0.50                          │ │
│ │ Monthly Budget:          [₹5000        ]                │ │
│ │ Alert Threshold:         [₹4500        ]                │ │
│ │                                                         │ │
│ │ Current Month Usage:                                    │ │
│ │ ████████░░ 85% (₹4250 / ₹5000)                          │ │
│ │                                                         │ │
│ │ ⚠️ WARNING: Approaching monthly budget limit            │ │
│ │                                                         │ │
│ │                                          [Save] [Reset] │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📊 RECENT SCRAPES (Last 24 hours)                       │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │                                                         │ │
│ │ Time      Keyword       Pgs Jobs Status  Cost  View    │ │
│ │ ──────────────────────────────────────────────────────  │ │
│ │ 2h ago    React Dev     5   52  ✅ OK   ₹25   [→]     │ │
│ │ 8h ago    Python Eng    10  105 ✅ OK   ₹50   [→]     │ │
│ │ 1d ago    DevOps        5   48  ✅ OK   ₹25   [→]     │ │
│ │ 1d ago    Full Stack    10  98  ✅ OK   ₹50   [→]     │ │
│ │                                                         │ │
│ │ [View All] [Download CSV] [Download JSON]             │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### React Component Structure

```jsx
// AdminScraperConfig.tsx

export const AdminScraperConfig = () => {
  // State
  const [config, setConfig] = useState<ScraperConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentScrapes, setRecentScrapes] = useState<ScrapeLog[]>([]);

  // Fetch current config
  useEffect(() => {
    const fetchConfig = async () => {
      const response = await axios.get('/api/admin/scraper/config');
      setConfig(response.data.data);
    };
    fetchConfig();
  }, []);

  // Save configuration
  const handleSaveConfig = async (updatedConfig: ScraperConfig) => {
    setLoading(true);
    try {
      await axios.post('/api/admin/scraper/config', updatedConfig);
      setConfig(updatedConfig);
      // Show success toast
    } finally {
      setLoading(false);
    }
  };

  // Toggle scraper
  const handleToggleScraper = async () => {
    await axios.post('/api/admin/scraper/toggle', {
      enabled: !config?.enabled,
    });
    setConfig({ ...config, enabled: !config?.enabled });
  };

  // Start manual scrape
  const handleStartScrape = async (params: ScrapeParams) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/admin/scraper/start', params);
      // Show in-progress toast
      // Fetch updated logs
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <StatusOverview config={config} />
      <QuickControls
        enabled={config?.enabled}
        onToggle={handleToggleScraper}
        onScrape={handleStartScrape}
      />
      <PresetTemplates onSelect={handleStartScrape} />
      <GlobalSettings config={config} onSave={handleSaveConfig} />
      <AutoScrapeScheduling config={config} onSave={handleSaveConfig} />
      <CompanyFiltering config={config} onSave={handleSaveConfig} />
      <CostManagement config={config} onSave={handleSaveConfig} />
      <RecentScrapesTable data={recentScrapes} />
    </div>
  );
};
```

### Component Sub-Components

```jsx
// StatusOverview.tsx
interface StatusOverviewProps {
  config: ScraperConfig | null;
}

export const StatusOverview = ({ config }: StatusOverviewProps) => {
  if (!config) return <LoadingSkeleton />;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-card rounded-lg border">
      <StatCard
        icon={<CheckCircle />}
        label="Status"
        value={config.enabled ? '✅ ENABLED' : '❌ DISABLED'}
        color={config.enabled ? 'green' : 'red'}
      />
      <StatCard
        icon={<Clock />}
        label="Last Scrape"
        value={formatTimeAgo(config.lastScrape)}
      />
      <StatCard
        icon={<Briefcase />}
        label="Jobs Today"
        value={config.jobsAddedToday?.toString() || '0'}
      />
      <StatCard
        icon={<DollarSign />}
        label="Monthly Cost"
        value={`₹${config.estimatedMonthlyCost}`}
      />
    </div>
  );
};

// GlobalSettings.tsx
interface GlobalSettingsProps {
  config: ScraperConfig;
  onSave: (config: ScraperConfig) => Promise<void>;
}

export const GlobalSettings = ({ config, onSave }: GlobalSettingsProps) => {
  const [localConfig, setLocalConfig] = useState(config);

  const handleChange = (key: string, value: any) => {
    setLocalConfig({ ...localConfig, [key]: value });
  };

  const handleSave = async () => {
    await onSave(localConfig);
  };

  return (
    <Card title="⚙️ Global Settings">
      <div className="space-y-6">
        <SectionTitle>Rate Limiting</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Max Scrapes/Hour"
            type="number"
            value={localConfig.maxRequestsPerHour}
            onChange={(e) =>
              handleChange('maxRequestsPerHour', parseInt(e.target.value))
            }
          />
          <FormInput
            label="Max Scrapes/Day"
            type="number"
            value={localConfig.maxRequestsPerDay}
            onChange={(e) =>
              handleChange('maxRequestsPerDay', parseInt(e.target.value))
            }
          />
        </div>

        <SectionTitle>Pagination</SectionTitle>
        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            label="Default Pages"
            value={localConfig.defaultPages}
            options={[1, 5, 10, 50, 100]}
            onChange={(e) =>
              handleChange('defaultPages', parseInt(e.target.value))
            }
          />
          <FormSelect
            label="Max Allowed Pages"
            value={localConfig.maxPagesAllowed}
            options={[5, 10, 50, 100]}
            onChange={(e) =>
              handleChange('maxPagesAllowed', parseInt(e.target.value))
            }
          />
        </div>

        <SectionTitle>Data Quality</SectionTitle>
        <div className="space-y-3">
          <FormInput
            label="Min Salary Data Quality (%)"
            type="number"
            min="0"
            max="100"
            value={localConfig.minSalaryDataQuality}
            onChange={(e) =>
              handleChange('minSalaryDataQuality', parseInt(e.target.value))
            }
          />
          <FormCheckbox
            label="Filter Duplicate Jobs"
            checked={localConfig.filterDuplicates}
            onChange={(e) => handleChange('filterDuplicates', e.target.checked)}
          />
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={handleSave} disabled={isLoading}>
            Save Settings
          </Button>
          <Button variant="outline" onClick={() => setLocalConfig(config)}>
            Reset
          </Button>
        </div>
      </div>
    </Card>
  );
};
```

---

## Companies Management Page
**Path:** `/admin/companies`
**Priority:** ⚡ CRITICAL (Week 2)
**Time Estimate:** 10 hours

### Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ 🏢 Company Management                      [Back to Admin]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📊 QUICK STATS                                          │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Total Companies: 1,245 | Active Scraping: 89           │ │
│ │ Jobs Posted: 5,432 | Avg Response Time: 18 days       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔧 TOOLS & ACTIONS                                      │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ [+ Add Company] [📥 Import CSV] [📥 Export All]        │ │
│ │ [🔄 Bulk Scrape] [🔧 Manage Aliases]                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔍 SEARCH & FILTER                                      │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Search:     [Search companies...        ]  [Clear]      │ │
│ │ Type:       [All Types          ▼]                      │ │
│ │ Size:       [All Sizes          ▼]                      │ │
│ │ Scraping:   [All Status         ▼]                      │ │
│ │             [Apply Filters] [Reset]                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📋 COMPANY DATABASE                                     │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │                                                         │ │
│ │ ☐ Company Name    Type      Size    Jobs Scrape Jobs  │ │
│ │ ═══════════════════════════════════════════════════════  │ │
│ │ ☐ Google          FAANG     Huge    145  ✅ 12  [→]   │ │
│ │ ☐ Microsoft       FAANG     Huge    124  ✅ 8   [→]   │ │
│ │ ☐ Amazon          FAANG     Huge    156  ✅ 15  [→]   │ │
│ │ ☐ Meta            FAANG     Huge    98   ✅ 6   [→]   │ │
│ │ ☐ TCS             Service   Huge    89   ✅ 5   [→]   │ │
│ │ ☐ Infosys         Service   Huge    76   ✅ 3   [→]   │ │
│ │ ☐ Wipro           Service   Huge    65   ❌ 0   [→]   │ │
│ │ ☐ Apple           FAANG     Huge    102  ✅ 7   [→]   │ │
│ │ ☐ Swiggy          Startup   Large   23   ❌ 0   [→]   │ │
│ │ ☐ Flipkart        Startup   Large   34   ✅ 2   [→]   │ │
│ │                                                         │ │
│ │ [Previous]  Page 1 of 125  [Next]                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘

                    DETAIL VIEW (Side Panel)
┌──────────────────────────────────────────────────────┐
│ 🏢 Google Inc.                                   [×] │
├──────────────────────────────────────────────────────┤
│                                                      │
│ BASIC INFO                                           │
│ ────────────────────────────────────────────────    │
│ Name:           Google Inc.                          │
│ Type:           FAANG                                │
│ Size:           Enterprise                           │
│ Founded:        1998                                 │
│ HQ:             Mountain View, CA                    │
│ Employees:      190,234                              │
│                                                      │
│ HIRING METRICS                                       │
│ ────────────────────────────────────────────────    │
│ Active Jobs:    145                                  │
│ Applications:   5,432                                │
│ Response Rate:  78%                                  │
│ Avg Hiring:     18 days                              │
│ Glassdoor:      4.5/5 ⭐                             │
│ Salary Score:   92/100                               │
│                                                      │
│ POPULAR ROLES                                        │
│ ────────────────────────────────────────────────    │
│ Software Engineer (43)                               │
│ Data Engineer (21)                                   │
│ DevOps Engineer (15)                                 │
│ Product Manager (12)                                 │
│                                                      │
│ TECH STACK                                           │
│ ────────────────────────────────────────────────    │
│ Python 89% | Go 76% | C++ 65%                        │
│ JavaScript 82% | Java 54%                            │
│                                                      │
│ SCRAPING CONFIG                                      │
│ ────────────────────────────────────────────────    │
│ Scraping:       [✓] Enabled                          │
│ Frequency:      [Daily        ▼]                     │
│ Last Scraped:   2 hours ago                          │
│ New Jobs:       12                                   │
│                                                      │
│ ALIASES                                              │
│ ────────────────────────────────────────────────    │
│ [google.com] [alphabet] [googler] [+]              │
│                                                      │
│         [Edit] [Delete] [Scrape Now]                │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### React Component Structure

```jsx
// AdminCompanies.tsx

export const AdminCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, total: 0 });
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    size: 'all',
    scraping: 'all',
  });

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/admin/companies', {
          params: {
            ...filters,
            page: pagination.page,
          },
        });
        setCompanies(response.data.data);
        setPagination(response.data.meta);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, [filters, pagination.page]);

  const handleImportCSV = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    await axios.post('/api/admin/companies/import', formData);
    // Refresh companies list
  };

  const handleDeleteCompany = async (id: string) => {
    if (confirm('Are you sure?')) {
      await axios.delete(`/api/admin/companies/${id}`);
      setCompanies(companies.filter((c) => c._id !== id));
    }
  };

  const handleScrapeScrape = async (id: string) => {
    await axios.post(`/api/admin/companies/${id}/scrape`);
    // Show toast notification
  };

  return (
    <div className="space-y-6">
      <QuickStats companies={companies} />
      <ToolsBar
        onAddClick={() => setShowAddModal(true)}
        onImportClick={handleImportCSV}
      />
      <SearchAndFilter filters={filters} onFiltersChange={setFilters} />
      <CompaniesTable
        companies={companies}
        loading={loading}
        onSelectCompany={setSelectedCompany}
        onDelete={handleDeleteCompany}
        onScrape={handleScrapeScrape}
      />
      <Pagination
        current={pagination.page}
        total={pagination.pages}
        onChange={(p) => setPagination({ ...pagination, page: p })}
      />

      {selectedCompany && (
        <CompanyDetailPanel
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
          onUpdate={(updated) => {
            setCompanies(
              companies.map((c) => (c._id === updated._id ? updated : c))
            );
          }}
        />
      )}

      {showAddModal && (
        <AddCompanyModal
          onClose={() => setShowAddModal(false)}
          onAdd={(newCompany) => {
            setCompanies([newCompany, ...companies]);
          }}
        />
      )}
    </div>
  );
};

// CompanyDetailPanel.tsx
interface CompanyDetailPanelProps {
  company: Company;
  onClose: () => void;
  onUpdate: (company: Company) => void;
}

export const CompanyDetailPanel = ({
  company,
  onClose,
  onUpdate,
}: CompanyDetailPanelProps) => {
  const [editingAliases, setEditingAliases] = useState(false);
  const [newAlias, setNewAlias] = useState('');
  const [scrapeConfig, setScrapeConfig] = useState({
    enabled: company.scrape_enabled,
    frequency: company.scrape_frequency,
  });

  const handleSaveConfig = async () => {
    const response = await axios.put(`/api/admin/companies/${company._id}`, {
      scrape_enabled: scrapeConfig.enabled,
      scrape_frequency: scrapeConfig.frequency,
    });
    onUpdate(response.data.data);
  };

  const handleAddAlias = async () => {
    if (!newAlias.trim()) return;
    const response = await axios.put(
      `/api/admin/companies/${company._id}/aliases`,
      {
        alias: newAlias,
      }
    );
    onUpdate(response.data.data);
    setNewAlias('');
  };

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-card border-l border-border shadow-lg overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold">{company.display_name}</h2>
          <button onClick={onClose} className="text-2xl">
            ×
          </button>
        </div>

        {/* Basic Info */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm uppercase">Basic Info</h3>
          <div className="text-sm space-y-2">
            <p>
              <span className="text-muted-foreground">Type:</span> {company.type}
            </p>
            <p>
              <span className="text-muted-foreground">Size:</span>{' '}
              {company.company_size}
            </p>
            <p>
              <span className="text-muted-foreground">Founded:</span>{' '}
              {company.founded_year}
            </p>
            <p>
              <span className="text-muted-foreground">HQ:</span>{' '}
              {company.headquarter.city}, {company.headquarter.state}
            </p>
          </div>
        </div>

        {/* Hiring Metrics */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm uppercase">Hiring Metrics</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <MetricCard label="Active Jobs" value={company.active_job_count} />
            <MetricCard label="Applications" value={company.users_applied} />
            <MetricCard
              label="Response Rate"
              value={`${company.avg_response_time_hours}h`}
            />
            <MetricCard label="Glassdoor" value={company.glassdoor_rating} />
          </div>
        </div>

        {/* Tech Stack */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm uppercase">Popular Tech Stack</h3>
          <div className="flex flex-wrap gap-2">
            {company.tech_stack_popular.map((tech) => (
              <Badge key={tech}>{tech}</Badge>
            ))}
          </div>
        </div>

        {/* Scraping Config */}
        <div className="space-y-3 border-t pt-3">
          <h3 className="font-bold text-sm uppercase">Scraping Config</h3>
          <div className="space-y-3">
            <FormCheckbox
              label="Enable Scraping"
              checked={scrapeConfig.enabled}
              onChange={(e) =>
                setScrapeConfig({
                  ...scrapeConfig,
                  enabled: e.target.checked,
                })
              }
            />
            <FormSelect
              label="Frequency"
              value={scrapeConfig.frequency}
              options={['daily', 'weekly', 'monthly']}
              onChange={(e) =>
                setScrapeConfig({
                  ...scrapeConfig,
                  frequency: e.target.value,
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              Last Scraped: {formatTimeAgo(company.last_scraped)}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSaveConfig}
              className="w-full"
            >
              Save Config
            </Button>
          </div>
        </div>

        {/* Aliases */}
        <div className="space-y-3 border-t pt-3">
          <h3 className="font-bold text-sm uppercase">Aliases</h3>
          <div className="space-y-2">
            {company.aliases.map((alias) => (
              <Badge key={alias} variant="secondary">
                {alias}
              </Badge>
            ))}
          </div>
          {editingAliases && (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add alias..."
                value={newAlias}
                onChange={(e) => setNewAlias(e.target.value)}
                className="flex-1 px-2 py-1 text-sm border rounded"
              />
              <Button
                size="sm"
                onClick={handleAddAlias}
                disabled={!newAlias.trim()}
              >
                Add
              </Button>
            </div>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditingAliases(!editingAliases)}
            className="w-full"
          >
            {editingAliases ? 'Done' : 'Edit Aliases'}
          </Button>
        </div>

        {/* Actions */}
        <div className="flex gap-2 border-t pt-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleScrapeScrape(company._id)}
            className="flex-1"
          >
            Scrape Now
          </Button>
          <Button size="sm" variant="destructive" className="flex-1">
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};
```

---

## Job Matching Configuration Page
**Path:** `/admin/matching`
**Priority:** ⚡ CRITICAL (Week 3)
**Time Estimate:** 12 hours

### Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ ⚡ Job Matching Configuration              [Back to Admin]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📊 CURRENT CONFIG                                       │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Mode: BALANCED | Last Rebuild: 2 hours ago             │ │
│ │ Match Score Range: 0-100 | Embedding: ❌ Disabled      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ⚙️ ALGORITHM WEIGHTS                                    │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │                                                         │ │
│ │ Required Skills Match         [■■■■■■■■░░] 40% ✏️    │ │
│ │ Preferred Skills Match        [■■■░░░░░░░] 15% ✏️    │ │
│ │ Location Match                [■■■░░░░░░░] 15% ✏️    │ │
│ │ Experience Level Match        [■■■░░░░░░░] 15% ✏️    │ │
│ │ Salary Match                  [■■░░░░░░░░] 10% ✏️    │ │
│ │                                                         │ │
│ │ Total: 100%                                             │ │
│ │                   [Reset to Default] [Auto-Optimize]    │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📊 MATCH THRESHOLDS                                     │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │                                                         │ │
│ │ Perfect Match        [90] points or above              │ │
│ │ Strong Match         [75] points or above              │ │
│ │ Good Match           [60] points or above              │ │
│ │ Moderate Match       [50] points or above              │ │
│ │ Minimum Threshold    [40] points or above              │ │
│ │                                                         │ │
│ │ Visualization:                                          │ │
│ │ ███ 90-100 PERFECT (Green)  💚                         │ │
│ │ ███ 75-89  STRONG (Blue)    💙                         │ │
│ │ ███ 60-74  GOOD (Yellow)    💛                         │ │
│ │ ███ 50-59  MODERATE (Orange) 🧡                        │ │
│ │ ░░░ <50    POOR (Red)       ❌                         │ │
│ │                                                         │ │
│ │                   [Save Thresholds]                     │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🎯 MATCHING MODE                                        │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │                                                         │ │
│ │ Select Mode:                                            │ │
│ │ ○ STRICT                                                │ │
│ │   Min Match: 85% | Required Skills: 60% weight          │ │
│ │   Best for: Senior, specialized roles                   │ │
│ │   Users matched: ~15% of users                          │ │
│ │                                                         │ │
│ │ ◉ BALANCED (Current)                                    │ │
│ │   Min Match: 65% | Required Skills: 40% weight          │ │
│ │   Best for: Most users, career growth                   │ │
│ │   Users matched: ~78% of users                          │ │
│ │                                                         │ │
│ │ ○ GROWTH                                                │ │
│ │   Min Match: 50% | Required Skills: 30% weight          │ │
│ │   Best for: Learning, career changers                   │ │
│ │   Users matched: ~92% of users                          │ │
│ │                                                         │ │
│ │ ○ AGGRESSIVE                                            │ │
│ │   Min Match: 40% | Required Skills: 20% weight          │ │
│ │   Best for: Any role seekers                            │ │
│ │   Users matched: ~98% of users                          │ │
│ │                                                         │ │
│ │                      [Change Mode]                      │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🤖 EMBEDDING & AI MATCHING                              │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │                                                         │ │
│ │ Enable Semantic Matching:      [☐] Disabled            │ │
│ │ Embedding Weight:              [40%        ]            │ │
│ │ Embedding Provider:            [OpenAI    ▼]            │ │
│ │ Similarity Threshold:          [0.7       ]            │ │
│ │                                                         │ │
│ │ ℹ️ Semantic matching uses embeddings to find            │ │
│ │ contextually similar jobs beyond keyword matching.      │ │
│ │ Slightly increases matching quality but adds latency.   │ │
│ │                                                         │ │
│ │                   [Enable] [Learn More]                 │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ✅ TEST ALGORITHM                                        │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │                                                         │ │
│ │ Test the matching algorithm with sample data:           │ │
│ │                                                         │ │
│ │ Test User:  [Select User...              ▼]            │ │
│ │ Test Job:   [Select Job...               ▼]            │ │
│ │                                                         │ │
│ │             [▶ Run Test] [View Sample Results]          │ │
│ │                                                         │ │
│ │ Last Test Results:                                      │ │
│ │ ──────────────────────────────────────────────────────  │ │
│ │ Match Score: 78/100 (Strong Match)                      │ │
│ │ • Required Skills: 8/10 ✅                              │ │
│ │ • Preferred Skills: 3/6 ✅                              │ │
│ │ • Location: Remote + Willing = 100 ✅                   │ │
│ │ • Experience: 4yr vs 5yr required = 80 ✅              │ │
│ │ • Salary: 27.5L vs 28-40L = 100 ✅                      │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🔄 REBUILD MATCHING ENGINE                              │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │                                                         │ │
│ │ Recalculate matches for ALL users against ALL jobs.     │ │
│ │ Use after changing weights, thresholds, or mode.        │ │
│ │                                                         │ │
│ │ Estimated Time: ~30 minutes (for 1000 users)            │ │
│ │ Last Rebuild: 2 hours ago (completed in 28m 45s)       │ │
│ │ Total Matches Created: 45,320                           │ │
│ │                                                         │ │
│ │                   [▶ Start Rebuild] [View Status]       │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📊 USER-JOB COMPATIBILITY MATRIX                        │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │                                                         │ │
│ │ View a heatmap of user-job compatibility:               │ │
│ │ [View Full Matrix] [Download CSV]                      │ │
│ │                                                         │ │
│ │ Users with Matches:  834 / 1,000 (83%)                 │ │
│ │ Avg Match Score:     72.4 / 100                         │ │
│ │ Perfect Matches:     89 (8.9%)                          │ │
│ │ Jobs Matched:        1,245 / 1,500                      │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ⚠️ ADVANCED OPTIONS                                     │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │                                                         │ │
│ │ Location Fuzzy Matching:  [☑] Enabled                  │ │
│ │   Match nearby cities (e.g., Bangalore ≈ Pune)         │ │
│ │                                                         │ │
│ │ Allow Experience Gap:      [☑] ±1 level                │ │
│ │   Allow 1 year difference from requirement             │ │
│ │                                                         │ │
│ │ Remote Preference:         [Remote-only users]          │ │
│ │   Can only match to remote jobs                        │ │
│ │                                                         │ │
│ │                      [Save Advanced]                    │ │
│ │                                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### React Component Structure

```jsx
// AdminJobMatching.tsx

export const AdminJobMatching = () => {
  const [config, setConfig] = useState<MatchingConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult | null>(null);
  const [rebuildProgress, setRebuildProgress] = useState<RebuildProgress | null>(
    null
  );

  useEffect(() => {
    const fetchConfig = async () => {
      const response = await axios.get('/api/admin/matching/config');
      setConfig(response.data.data);
    };
    fetchConfig();
  }, []);

  const handleWeightChange = (factor: string, value: number) => {
    setConfig({
      ...config,
      weights: {
        ...config.weights,
        [factor]: value,
      },
    });
  };

  const handleSaveWeights = async () => {
    setLoading(true);
    try {
      const response = await axios.put('/api/admin/matching/config', {
        weights: config.weights,
      });
      setConfig(response.data.data);
      showSuccessToast('Weights updated');
    } finally {
      setLoading(false);
    }
  };

  const handleStartRebuild = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/admin/matching/rebuild');
      setRebuildProgress(response.data.data);
      // Poll for progress
      pollRebuildProgress();
    } finally {
      setLoading(false);
    }
  };

  const handleTestAlgorithm = async (userId: string, jobId: string) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/admin/matching/test', {
        userId,
        jobId,
      });
      setTestResults(response.data.data);
    } finally {
      setLoading(false);
    }
  };

  if (!config) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      <CurrentConfig config={config} />
      <AlgorithmWeights
        weights={config.weights}
        onChange={handleWeightChange}
        onSave={handleSaveWeights}
      />
      <MatchThresholds config={config} />
      <MatchingMode config={config} />
      <EmbeddingSettings config={config} />
      <TestAlgorithm onTest={handleTestAlgorithm} results={testResults} />
      <RebuildEngine
        onRebuild={handleStartRebuild}
        progress={rebuildProgress}
      />
      <CompatibilityMatrix config={config} />
      <AdvancedOptions config={config} />
    </div>
  );
};

// AlgorithmWeights.tsx
interface AlgorithmWeightsProps {
  weights: MatchingWeights;
  onChange: (factor: string, value: number) => void;
  onSave: () => Promise<void>;
}

export const AlgorithmWeights = ({
  weights,
  onChange,
  onSave,
}: AlgorithmWeightsProps) => {
  const factors = [
    {
      key: 'requiredSkills',
      label: 'Required Skills Match',
      description: 'How important are required skills',
    },
    {
      key: 'preferredSkills',
      label: 'Preferred Skills Match',
      description: 'How important are nice-to-have skills',
    },
    { key: 'location', label: 'Location Match', description: 'Job location' },
    {
      key: 'experience',
      label: 'Experience Level Match',
      description: 'Experience years requirement',
    },
    { key: 'salary', label: 'Salary Match', description: 'Salary expectation' },
  ];

  const total = Object.values(weights).reduce((a, b) => a + b, 0);

  return (
    <Card title="⚙️ Algorithm Weights">
      <div className="space-y-6">
        {factors.map((factor) => (
          <div key={factor.key}>
            <div className="flex justify-between items-center mb-2">
              <div>
                <h4 className="font-semibold">{factor.label}</h4>
                <p className="text-sm text-muted-foreground">
                  {factor.description}
                </p>
              </div>
              <div className="text-lg font-bold">
                {weights[factor.key as keyof MatchingWeights]}%
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={weights[factor.key as keyof MatchingWeights]}
              onChange={(e) =>
                onChange(factor.key, parseInt(e.target.value))
              }
              className="w-full"
            />
          </div>
        ))}

        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm">
            Total Weight: <span className="font-bold">{total}%</span>
            {total !== 100 && (
              <span className="text-destructive ml-2">
                (Should equal 100%)
              </span>
            )}
          </p>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={onSave} disabled={total !== 100}>
            Save Weights
          </Button>
          <Button variant="outline">Reset to Default</Button>
          <Button variant="ghost">Auto-Optimize</Button>
        </div>
      </div>
    </Card>
  );
};
```

---

## Analytics Pages

### Matching Analytics (`/admin/matching-analytics`)
- Match distribution chart (histogram)
- Top matched jobs
- User-job compatibility heatmap
- Skill gap analysis
- Matching success metrics

### Resume Analytics (`/admin/resumes`)
- Resume processing status
- Parsing quality scores
- Extracted skills distribution
- Profile completion metrics
- Failed parsing logs

### Scraper Logs (`/admin/scraper-logs`)
- Paginated scrape history
- Cost per scrape
- Jobs added tracking
- Error logs
- Export functionality

---

## Component Library Needed

### Basic Form Components
```jsx
<FormInput />      // Text input
<FormSelect />     // Dropdown
<FormCheckbox />   // Checkbox
<FormSlider />     // Range slider
<FormTextarea />   // Large text
```

### Display Components
```jsx
<Card />           // Card container
<Badge />          // Small label
<StatCard />       // Metric display
<Table />          // Data table
<Chart />          // Visualization
<Heatmap />        // Matrix visualization
```

### Dialog Components
```jsx
<Modal />          // Dialog box
<SidePanel />      // Side drawer
<Toast />          // Notification
```

### Progress Components
```jsx
<ProgressBar />    // Linear progress
<Skeleton />       // Loading state
```

---

## API Integration Guide

### Request/Response Pattern

```typescript
// Success Response
{
  success: true,
  data: { /* actual data */ },
  message?: "Operation successful"
}

// Error Response
{
  success: false,
  error: "Descriptive error message",
  code: "ERROR_CODE"
}

// List with Pagination
{
  success: true,
  data: [ /* items */ ],
  meta: {
    total: 1245,
    page: 1,
    pages: 63,
    per_page: 20
  }
}
```

### Error Handling

```typescript
try {
  const response = await axios.post('/api/admin/endpoint', data);
  if (response.data.success) {
    // Handle success
    showSuccessToast(response.data.message);
  } else {
    // Handle business error
    showErrorToast(response.data.error);
  }
} catch (error: any) {
  // Handle network/system error
  showErrorToast(error.response?.data?.error || 'An error occurred');
}
```

---

## Development Checklist

### Phase 1: Foundation (Week 1)
- [x] Create this documentation
- [ ] Create `/admin/scraper-config` page
  - [ ] Status overview component
  - [ ] Quick controls
  - [ ] Preset templates
  - [ ] Global settings form
  - [ ] Auto-scrape scheduling
  - [ ] Company filtering
  - [ ] Cost management
  - [ ] Recent scrapes table
- [ ] Implement API endpoints for scraper

### Phase 2: Companies (Week 2)
- [ ] Create `/admin/companies` page
  - [ ] Quick stats
  - [ ] Search & filter UI
  - [ ] Companies table
  - [ ] Detail panel
  - [ ] Add company modal
  - [ ] Import CSV component
- [ ] Implement company CRUD APIs

### Phase 3: Matching (Week 3)
- [ ] Create `/admin/matching` page
  - [ ] Algorithm weights sliders
  - [ ] Match thresholds input
  - [ ] Matching mode selector
  - [ ] Embedding settings
  - [ ] Test algorithm form
  - [ ] Rebuild engine control
  - [ ] Compatibility matrix viewer
- [ ] Implement matching APIs

### Phase 4: Analytics (Week 4)
- [ ] Create analytics dashboard pages
- [ ] Implement charts & visualizations
- [ ] Export functionality

---

**Document Version:** 1.0
**Created:** January 17, 2026
**Last Updated:** January 17, 2026
