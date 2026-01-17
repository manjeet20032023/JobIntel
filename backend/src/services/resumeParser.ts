import * as pdfParse from 'pdf-parse';

export interface ParsedResumeData {
  skills: string[];
  email?: string;
  phone?: string;
  location?: string;
  name?: string;
  batch?: string;
  experience?: string;
  education?: string;
  summary?: string;
}

export class ResumeParser {
  /**
   * Extract text from PDF buffer
   */
  static async extractTextFromPDF(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);
      return data.text;
    } catch (err) {
      throw new Error('Failed to parse PDF');
    }
  }

  /**
   * Parse resume text and extract structured data
   */
  static parseResumeText(text: string): ParsedResumeData {
    const lowerText = text.toLowerCase();
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);

    // Extract email
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const emailMatch = text.match(emailRegex);
    const email = emailMatch?.[0];

    // Extract phone
    const phoneRegex = /(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/;
    const phoneMatch = text.match(phoneRegex);
    const phone = phoneMatch?.[0];

    // Extract name (usually first line or before contact info)
    let name: string | undefined;
    const nameLines = lines.slice(0, 5);
    for (const line of nameLines) {
      if (!line.includes('@') && !line.includes('(') && line.length < 50 && line.split(' ').length <= 4) {
        name = line;
        break;
      }
    }

    // Extract location (look for city, state patterns)
    let location: string | undefined;
    const locationRegex = /(?:located in|based in|location:?\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?(?:,\s*[A-Z]{2})?)/;
    const locationMatch = text.match(locationRegex);
    if (locationMatch) {
      location = locationMatch[1];
    }

    // Extract batch/year (graduation year, degree year)
    let batch: string | undefined;
    const yearRegex = /(?:20\d{2}|19\d{2})(?:\s*-\s*(?:present|current))?/i;
    const yearMatches = text.match(new RegExp(yearRegex, 'g'));
    if (yearMatches && yearMatches.length > 0) {
      const lastYear = yearMatches[yearMatches.length - 1];
      if (lastYear.includes('present') || lastYear.includes('current')) {
        batch = lastYear;
      } else {
        batch = yearMatches[0];
      }
    }

    // Extract skills (look for common skill patterns)
    const skills = this.extractSkills(text);

    // Extract summary (first few lines of meaningful content)
    let summary: string | undefined;
    const summaryStart = lines.findIndex(line => 
      !line.includes('@') && !line.includes('phone') && line.length > 20
    );
    if (summaryStart !== -1) {
      summary = lines.slice(summaryStart, summaryStart + 3).join(' ');
    }

    return {
      skills,
      email,
      phone,
      location,
      name,
      batch,
      summary,
    };
  }

  /**
   * Extract skills from resume text
   */
  static extractSkills(text: string): string[] {
    const commonSkills = [
      // Programming Languages
      'javascript', 'typescript', 'python', 'java', 'csharp', 'c\\+\\+', 'cpp', 'ruby', 'php', 'go', 'rust', 'kotlin', 'scala', 'r',
      // Frontend
      'react', 'vue', 'angular', 'html', 'css', 'tailwind', 'bootstrap', 'next.js', 'nextjs', 'nuxt', 'svelte',
      // Backend
      'nodejs', 'node.js', 'express', 'django', 'flask', 'fastapi', 'spring', 'spring boot', 'rails', 'laravel', 'asp.net',
      // Databases
      'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'sql', 'firestore', 'dynamodb',
      // Tools & Platforms
      'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'git', 'gitlab', 'github', 'jenkins', 'ci/cd',
      // Others
      'rest', 'graphql', 'microservices', 'api', 'agile', 'scrum', 'testing', 'jest', 'mocha', 'webpack',
      'machine learning', 'ml', 'ai', 'deep learning', 'nlp', 'computer vision',
      'aws lambda', 'serverless', 'firebase', 'realtime database',
      'linux', 'unix', 'bash', 'shell', 'powershell',
      'figma', 'adobe', 'ui/ux', 'design', 'wireframing',
      'data analysis', 'analytics', 'tableau', 'powerbi', 'excel'
    ];

    const lowerText = text.toLowerCase();
    const foundSkills = new Set<string>();

    for (const skill of commonSkills) {
      const skillRegex = new RegExp(`\\b${skill}\\b`, 'gi');
      if (skillRegex.test(lowerText)) {
        // Normalize skill name
        const normalized = this.normalizeSkillName(skill);
        foundSkills.add(normalized);
      }
    }

    return Array.from(foundSkills);
  }

  /**
   * Normalize skill names to standard format
   */
  private static normalizeSkillName(skill: string): string {
    const skillMap: Record<string, string> = {
      'c\\+\\+': 'C++',
      'cpp': 'C++',
      'csharp': 'C#',
      'nodejs': 'Node.js',
      'node.js': 'Node.js',
      'nextjs': 'Next.js',
      'next.js': 'Next.js',
      'spring boot': 'Spring Boot',
      'asp.net': 'ASP.NET',
      'ci/cd': 'CI/CD',
      'graphql': 'GraphQL',
      'rest': 'REST',
      'aws lambda': 'AWS Lambda',
      'ui/ux': 'UI/UX',
    };

    const normalized = skillMap[skill.toLowerCase()] || 
      skill.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    return normalized;
  }

  /**
   * Store parsed data mapping for deletion tracking
   */
  static createParsedDataMapping(parsed: ParsedResumeData): {
    parsedSkills: string[];
    parsedProfile: Record<string, any>;
  } {
    return {
      parsedSkills: parsed.skills,
      parsedProfile: {
        email: parsed.email,
        phone: parsed.phone,
        location: parsed.location,
        name: parsed.name,
        batch: parsed.batch,
      },
    };
  }
}
