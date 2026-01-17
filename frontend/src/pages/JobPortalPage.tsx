import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Building2,
  Users,
  ArrowRight,
  Clock,
  CheckCircle2,
  Star,
  TrendingUp,
  Filter,
  Calendar,
  BookmarkPlus,
  Zap,
} from 'lucide-react';
import { mockJobs, mockCompanies } from '@/data/mockData';
import { LinkedInScraperUI } from '@/components/LinkedInScraperUI';
import { useState } from 'react';

const JobPortalPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'engineering', label: 'Engineering', count: 1250 },
    { id: 'product', label: 'Product Management', count: 580 },
    { id: 'design', label: 'Design', count: 420 },
    { id: 'data', label: 'Data & Analytics', count: 750 },
    { id: 'marketing', label: 'Marketing', count: 340 },
    { id: 'sales', label: 'Sales', count: 890 },
  ];

  const locations = [
    { id: 'remote', label: 'Remote', count: 2500 },
    { id: 'bangalore', label: 'Bangalore', count: 1800 },
    { id: 'delhi', label: 'Delhi NCR', count: 1200 },
    { id: 'mumbai', label: 'Mumbai', count: 950 },
    { id: 'pune', label: 'Pune', count: 620 },
    { id: 'hyderabad', label: 'Hyderabad', count: 890 },
  ];

  const featuredCompanies = mockCompanies.slice(0, 6);
  const displayedJobs = mockJobs.slice(0, 12);

  const stats = [
    { icon: Briefcase, value: '50K+', label: 'Active Jobs', color: 'text-blue-500' },
    { icon: Building2, value: '10K+', label: 'Companies', color: 'text-purple-500' },
    { icon: Users, value: '100K+', label: 'Job Seekers', color: 'text-green-500' },
    { icon: TrendingUp, value: '95%', label: 'Match Rate', color: 'text-orange-500' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-primary/5 to-accent/5 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Job Portal</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Explore thousands of job opportunities from top companies. Find your perfect match with our advanced filtering and AI-powered recommendations.
            </p>

            {/* Search Bar */}
            <div className="flex gap-2 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search jobs, companies, skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button size="lg" className="gap-2">
                <Search className="h-5 w-5" />
                Search
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-background rounded-lg p-4 border border-border">
                  <stat.icon className={`h-6 w-6 mb-2 ${stat.color}`} />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LinkedIn Job Scraper Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <LinkedInScraperUI />
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              {/* Filter Header */}
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Filters</h3>
              </div>

              {/* Category Filter */}
              <div>
                <h4 className="font-semibold text-sm mb-3">Job Category</h4>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex justify-between items-center ${
                        selectedCategory === cat.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80 text-foreground'
                      }`}
                    >
                      <span className="text-sm">{cat.label}</span>
                      <span className="text-xs opacity-70">{cat.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Filter */}
              <div>
                <h4 className="font-semibold text-sm mb-3">Location</h4>
                <div className="space-y-2">
                  {locations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => setSelectedLocation(selectedLocation === loc.id ? null : loc.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex justify-between items-center ${
                        selectedLocation === loc.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80 text-foreground'
                      }`}
                    >
                      <span className="text-sm flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {loc.label}
                      </span>
                      <span className="text-xs opacity-70">{loc.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Filter */}
              <div>
                <h4 className="font-semibold text-sm mb-3">Experience Level</h4>
                <div className="space-y-2">
                  {['Entry Level', 'Mid Level', 'Senior', 'Lead'].map((level) => (
                    <label key={level} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded" />
                      <span className="text-sm">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Job Type Filter */}
              <div>
                <h4 className="font-semibold text-sm mb-3">Job Type</h4>
                <div className="space-y-2">
                  {['Full-time', 'Part-time', 'Contract', 'Internship'].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded" />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Salary Filter */}
              <div>
                <h4 className="font-semibold text-sm mb-3">Salary Range</h4>
                <div className="space-y-2">
                  {['0-10 LPA', '10-20 LPA', '20-40 LPA', '40+ LPA'].map((range) => (
                    <label key={range} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded" />
                      <span className="text-sm">{range}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Jobs Grid */}
          <div className="lg:col-span-3 space-y-6">
            {/* Results Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Jobs for You</h2>
              <div className="flex gap-2">
                <select className="px-4 py-2 rounded-lg border border-border bg-background text-sm">
                  <option>Most Recent</option>
                  <option>Most Relevant</option>
                  <option>Salary: High to Low</option>
                  <option>Salary: Low to High</option>
                </select>
              </div>
            </div>

            {/* Job Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedJobs.map((job) => (
                <Link key={job.id} to={`/jobs/${job.id}`}>
                  <div className="h-full bg-background border border-border rounded-lg p-5 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1 line-clamp-2">{job.title}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {job.company}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <BookmarkPlus className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* Meta Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex gap-2 flex-wrap">
                        {job.location && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </Badge>
                        )}
                        {job.salary && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <DollarSign className="h-3 w-3" />
                            {job.salary}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {job.description}
                    </p>

                    {/* Skills */}
                    <div className="flex gap-1 flex-wrap mb-4">
                      {job.skills?.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {job.skills && job.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.skills.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-3 border-t border-border">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Posted {Math.floor(Math.random() * 30)} days ago
                      </div>
                      <Button size="sm" variant="ghost" className="gap-1">
                        View <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Load More */}
            <div className="flex justify-center pt-8">
              <Button variant="outline" size="lg" className="gap-2">
                Load More Jobs
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Companies Section */}
      <section className="bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-2">Featured Companies</h2>
          <p className="text-muted-foreground mb-8">Explore jobs from top companies</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCompanies.map((company) => (
              <div key={company.id} className="bg-background rounded-lg border border-border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    {company.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{company.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {company.location}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{company.description}</p>
                <div className="flex justify-between items-center">
                  <Badge variant="secondary">{Math.floor(Math.random() * 500) + 50} Open Positions</Badge>
                  <Button variant="ghost" size="sm" className="gap-1">
                    View <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <Button size="lg" variant="outline">
              View All Companies
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-accent py-12">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get Smarter Job Recommendations
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Upload your resume and let our AI match you with the perfect jobs. Get instant notifications for opportunities that match your profile.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 gap-2">
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default JobPortalPage;
