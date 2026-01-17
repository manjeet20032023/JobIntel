/**
 * Migration script to add requiredSkills and preferredSkills to existing jobs
 * Run with: npx ts-node scripts/migrate-job-skills.ts
 */

import mongoose from 'mongoose';
import { Job } from '../src/models/Job';
import dotenv from 'dotenv';

dotenv.config();

// Map common role titles to required skills
const jobTitleToSkills: Record<string, { required: string[], preferred: string[] }> = {
  'software engineer': {
    required: ['JavaScript', 'React', 'Node.js', 'SQL'],
    preferred: ['TypeScript', 'Docker', 'AWS', 'Git']
  },
  'sde intern': {
    required: ['JavaScript', 'Python', 'SQL'],
    preferred: ['React', 'Node.js', 'Git']
  },
  'graduate software engineer': {
    required: ['JavaScript', 'Python', 'SQL'],
    preferred: ['React', 'Java', 'AWS']
  },
  'associate software engineer': {
    required: ['Java', 'Python', 'SQL'],
    preferred: ['JavaScript', 'React', 'AWS', 'Docker']
  },
  'software tester': {
    required: ['Python', 'SQL', 'UI/UX'],
    preferred: ['JavaScript', 'Selenium', 'Test Automation']
  },
  'associate analyst': {
    required: ['SQL', 'Excel', 'Data Analysis'],
    preferred: ['Python', 'Tableau', 'Power BI']
  },
  'data analyst': {
    required: ['SQL', 'Excel', 'Data Analysis'],
    preferred: ['Python', 'Tableau', 'Power BI', 'Analytics']
  },
  'machine learning': {
    required: ['Python', 'Machine Learning', 'Data Analysis'],
    preferred: ['Deep Learning', 'NLP', 'TensorFlow', 'PyTorch']
  },
  'ai': {
    required: ['Python', 'Machine Learning', 'AI'],
    preferred: ['Deep Learning', 'NLP', 'Data Analysis']
  },
  'cloud engineer': {
    required: ['AWS', 'Cloud', 'Linux'],
    preferred: ['Docker', 'Kubernetes', 'Azure', 'GCP']
  },
  'devops': {
    required: ['Docker', 'Linux', 'CI/CD'],
    preferred: ['Kubernetes', 'AWS', 'Jenkins', 'Git']
  },
  'frontend': {
    required: ['React', 'JavaScript', 'CSS', 'HTML'],
    preferred: ['TypeScript', 'Vue.js', 'UI/UX', 'Responsive Design']
  },
  'backend': {
    required: ['Node.js', 'Python', 'SQL', 'API'],
    preferred: ['Java', 'MongoDB', 'Docker', 'AWS']
  },
  'full stack': {
    required: ['React', 'Node.js', 'JavaScript', 'SQL'],
    preferred: ['TypeScript', 'Docker', 'AWS', 'Git']
  },
  'qa': {
    required: ['Python', 'UI/UX', 'Test Automation'],
    preferred: ['Selenium', 'SQL', 'Analytics']
  },
};

async function migrateJobSkills() {
  try {
    const mongoUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/jobscout';
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');

    // Get all jobs
    const jobs = await Job.find({});
    console.log(`Found ${jobs.length} jobs to migrate`);

    let updated = 0;

    for (const job of jobs) {
      const titleLower = (job.title || '').toLowerCase();
      
      // Find matching skill set based on job title
      let skillSet = null;
      for (const [keyword, skills] of Object.entries(jobTitleToSkills)) {
        if (titleLower.includes(keyword)) {
          skillSet = skills;
          break;
        }
      }

      if (!skillSet) {
        // Default skills for unmatched roles
        skillSet = {
          required: ['JavaScript', 'Python', 'SQL'],
          preferred: ['React', 'Node.js', 'Docker', 'AWS']
        };
      }

      // Update job with skills
      await Job.findByIdAndUpdate(job._id, {
        requiredSkills: skillSet.required,
        preferredSkills: skillSet.preferred,
      });

      console.log(`✓ Updated job: "${job.title}" with ${skillSet.required.length} required + ${skillSet.preferred.length} preferred skills`);
      updated++;
    }

    console.log(`\n✓ Successfully migrated ${updated} jobs with required and preferred skills`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateJobSkills();
