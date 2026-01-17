import { LinkedInScraperUI } from '@/components/LinkedInScraperUI';
import { Zap } from 'lucide-react';

const JobPortalPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Section - Clean and Professional */}
      <section className="bg-gradient-to-br from-primary/10 to-accent/10 py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Job Search</h1>
          </div>
          <p className="text-muted-foreground">
            Find the best job opportunities in India with our real-time job scraper
          </p>
        </div>
      </section>

      {/* LinkedIn Job Scraper Section - Main Content */}
      <section className="flex-1 py-8 bg-background">
        <div className="container mx-auto px-4">
          <LinkedInScraperUI />
        </div>
      </section>
    </div>
  );
};

export default JobPortalPage;
