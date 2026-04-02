import type {
  ResumeData,
  PersonalInfo,
  Education,
  Experience,
  Project,
  SkillGroup,
  Certification,
  Achievement,
} from './types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SECTION_KEYWORDS: Record<string, string[]> = {
  education: ['education', 'academic', 'qualification', 'qualifications'],
  experience: [
    'experience',
    'work experience',
    'professional experience',
    'employment',
    'work history',
    'employment history',
  ],
  projects: [
    'projects',
    'personal projects',
    'academic projects',
    'key projects',
    'side projects',
  ],
  skills: [
    'skills',
    'technical skills',
    'core competencies',
    'technologies',
    'tools',
    'tech stack',
    'competencies',
  ],
  summary: [
    'summary',
    'objective',
    'professional summary',
    'career objective',
    'profile',
    'about me',
    'about',
    'career summary',
  ],
  certifications: [
    'certifications',
    'certificates',
    'licenses',
    'certification',
    'professional certifications',
  ],
  achievements: [
    'achievements',
    'awards',
    'honors',
    'accomplishments',
    'recognition',
    'key highlights',
    'highlights',
    'what i bring',
    'what i bring to your team',
    'what i offer',
    'value proposition',
  ],
  extracurricular: [
    'extracurricular',
    'activities',
    'volunteer',
    'leadership',
    'volunteering',
    'extra-curricular',
  ],
};

const INSTITUTION_KEYWORDS = [
  'university',
  'institute',
  'college',
  'school',
  'academy',
  'iit',
  'nit',
  'iim',
  'bits',
  'vit',
  'iiit',
  'iisc',
  'polytechnic',
];

const DEGREE_PATTERNS = [
  /\b(B\.?Tech|B\.?E\.?|M\.?Tech|M\.?E\.?)\b/i,
  /\b(B\.?Sc|M\.?Sc|B\.?S|M\.?S)\b/i,
  /\b(MBA|BBA|BCA|MCA)\b/i,
  /\b(Ph\.?D|Doctorate)\b/i,
  /\b(B\.?Com|M\.?Com)\b/i,
  /\b(B\.?A\.?|M\.?A\.?)\b/i,
  /\b(B\.?Arch|M\.?Arch)\b/i,
  /\b(Bachelor|Master|Associate|Diploma)\b/i,
  /\b(B\.?Des|M\.?Des)\b/i,
  /\b(MBBS|BDS|BPharm|MPharm)\b/i,
];

const ROLE_KEYWORDS = [
  'engineer',
  'developer',
  'intern',
  'analyst',
  'manager',
  'lead',
  'associate',
  'architect',
  'consultant',
  'designer',
  'specialist',
  'coordinator',
  'director',
  'officer',
  'executive',
  'administrator',
  'scientist',
  'researcher',
  'trainee',
  'fellow',
];

const SKILL_DICTIONARY: Record<string, string[]> = {
  'Programming Languages': [
    'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'go', 'golang',
    'rust', 'ruby', 'php', 'swift', 'kotlin', 'r', 'matlab', 'scala', 'perl',
    'dart', 'lua', 'haskell', 'elixir', 'clojure', 'c', 'objective-c',
    'assembly', 'fortran', 'cobol', 'visual basic', 'vb.net',
  ],
  Frameworks: [
    'react', 'angular', 'vue', 'next.js', 'nextjs', 'node.js', 'nodejs',
    'express', 'django', 'flask', 'spring', '.net', 'rails', 'laravel',
    'fastapi', 'svelte', 'nuxt', 'gatsby', 'remix', 'nestjs', 'flutter',
    'react native', 'electron', 'tailwind', 'bootstrap', 'material-ui',
    'chakra', 'pytorch', 'tensorflow', 'keras', 'scikit-learn', 'pandas',
    'numpy', 'spring boot', 'hibernate', 'asp.net',
  ],
  'Tools & Platforms': [
    'docker', 'kubernetes', 'git', 'aws', 'azure', 'gcp', 'jenkins',
    'terraform', 'linux', 'bash', 'jira', 'figma', 'postman', 'nginx',
    'apache', 'github', 'gitlab', 'bitbucket', 'ci/cd', 'grafana',
    'prometheus', 'ansible', 'puppet', 'chef', 'vagrant', 'heroku',
    'vercel', 'netlify', 'firebase', 'supabase', 'docker-compose',
    'github actions', 'circleci', 'travis', 'webpack', 'vite', 'babel',
    'eslint', 'prettier',
  ],
  Databases: [
    'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'cassandra',
    'dynamodb', 'firebase', 'sqlite', 'oracle', 'mariadb', 'elasticsearch',
    'neo4j', 'couchdb', 'influxdb', 'mssql', 'sql server', 'supabase',
    'prisma', 'sequelize', 'mongoose',
  ],
};

// ---------------------------------------------------------------------------
// Regex helpers
// ---------------------------------------------------------------------------

const EMAIL_RE = /[\w.-]+@[\w.-]+\.\w{2,}/;
const PHONE_RE =
  /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/;
const LINKEDIN_RE = /(?:linkedin\.com\/in\/|linkedin:\s*)([\w-]+)/i;
const GITHUB_RE = /(?:github\.com\/|github:\s*)([\w-]+)/i;
const URL_RE = /https?:\/\/[^\s,)]+/gi;
const DATE_RANGE_RE =
  /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*)?(?:\d{4})\s*[-–—to]+\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*)?(?:\d{4}|[Pp]resent|[Cc]urrent|[Oo]ngoing|[Nn]ow)/i;
const SINGLE_DATE_RE =
  /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?\d{4}/i;
const GPA_RE =
  /(?:(?:CGPA|GPA|C\.G\.P\.A|cumulative)\s*[:\s]*(\d+(?:\.\d+)?)\s*(?:\/\s*\d+)?)|(?:(\d{1,3}(?:\.\d+)?)\s*%)|(?:(\d+(?:\.\d+)?)\s*\/\s*(?:10|4)(?:\.\d+)?)/i;
const BULLET_RE = /^\s*[•\-\*\>▪▸◦∙⁃■□●○►▶✦✧★☆→⇒»]\s*/;
const DECORATIVE_RE = /^[-=_*~#]{3,}$/;
const LOCATION_RE =
  /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*),\s*([A-Z][a-z]+(?:\s[A-Z][a-z]+)*|[A-Z]{2})\b/;

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

function stripDecorative(line: string): string {
  return line.replace(/^[\s|:*#=\->]+|[\s|:*#=\-<]+$/g, '').trim();
}

function isSectionHeader(line: string): string | null {
  const cleaned = stripDecorative(line).toLowerCase();
  if (cleaned.length === 0 || cleaned.length > 60) return null;

  for (const [section, keywords] of Object.entries(SECTION_KEYWORDS)) {
    for (const keyword of keywords) {
      // Exact match or the cleaned line starts with the keyword
      if (cleaned === keyword || cleaned.startsWith(keyword + ' ') || cleaned.startsWith(keyword + ':')) {
        return section;
      }
    }
  }
  return null;
}

function splitIntoSections(
  lines: string[],
): { header: string[]; sections: Record<string, string[]> } {
  const sections: Record<string, string[]> = {};
  const header: string[] = [];
  let currentSection: string | null = null;

  for (const line of lines) {
    if (DECORATIVE_RE.test(line.trim())) continue;

    const sectionName = isSectionHeader(line);
    if (sectionName) {
      currentSection = sectionName;
      if (!sections[currentSection]) {
        sections[currentSection] = [];
      }
      continue;
    }

    if (currentSection) {
      sections[currentSection].push(line);
    } else {
      header.push(line);
    }
  }

  return { header, sections };
}

function extractBullets(lines: string[]): string[] {
  const bullets: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const cleaned = trimmed.replace(BULLET_RE, '').trim();
    if (cleaned) bullets.push(cleaned);
  }
  return bullets;
}

function extractDateRange(text: string): { start: string; end: string } {
  const match = text.match(DATE_RANGE_RE);
  if (match) {
    const parts = match[0].split(/\s*[-–—]\s*|\s+to\s+/i);
    return {
      start: parts[0]?.trim() || '',
      end: parts[1]?.trim() || '',
    };
  }
  return { start: '', end: '' };
}

function extractAllUrls(text: string): string[] {
  return text.match(URL_RE) || [];
}

// ---------------------------------------------------------------------------
// Section parsers
// ---------------------------------------------------------------------------

function parsePersonalInfo(
  headerLines: string[],
  fullText: string,
  allLines: string[],
): PersonalInfo {
  const info: PersonalInfo = {
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
    objective: '',
  };

  // Email
  const emailMatch = fullText.match(EMAIL_RE);
  if (emailMatch) info.email = emailMatch[0];

  // Phone
  const phoneMatch = fullText.match(PHONE_RE);
  if (phoneMatch) info.phone = phoneMatch[0].trim();

  // LinkedIn
  const linkedinMatch = fullText.match(LINKEDIN_RE);
  if (linkedinMatch) {
    info.linkedin = linkedinMatch[0].includes('linkedin.com')
      ? linkedinMatch[0]
      : `linkedin.com/in/${linkedinMatch[1]}`;
  }

  // GitHub
  const githubMatch = fullText.match(GITHUB_RE);
  if (githubMatch) {
    info.github = githubMatch[0].includes('github.com')
      ? githubMatch[0]
      : `github.com/${githubMatch[1]}`;
  }

  // Portfolio - a URL that is not LinkedIn or GitHub
  const allUrls = extractAllUrls(fullText);
  for (const url of allUrls) {
    if (
      !url.includes('linkedin.com') &&
      !url.includes('github.com') &&
      !info.portfolio
    ) {
      info.portfolio = url;
      break;
    }
  }

  // Name - find the line that most looks like a person's name
  // Strategy: score candidate lines and pick the best one
  // PDF extraction doesn't guarantee visual order, so scan all lines (header first, then all)
  const linesToScan = [...headerLines, ...allLines.slice(0, 20)];
  const nameCandidates: { text: string; score: number }[] = [];
  const seen = new Set<string>();

  for (const line of linesToScan) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (DECORATIVE_RE.test(trimmed)) continue;

    // Strip out contact info, bullets, and symbols from the line
    let candidate = trimmed
      .replace(EMAIL_RE, '')
      .replace(PHONE_RE, '')
      .replace(URL_RE, '')
      .replace(/linkedin|github/gi, '')
      .replace(/[|•·,\-–—■□●○►▶✦✧★☆→⇒»▪▸◦∙⁃]+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    candidate = stripDecorative(candidate);

    if (!candidate || candidate.length < 2) continue;
    if (seen.has(candidate)) continue;
    seen.add(candidate);
    // Skip section headers
    if (isSectionHeader(candidate)) continue;
    // Skip purely numeric
    if (/^[\d\s.+()-]+$/.test(candidate)) continue;

    // Score the candidate as a name
    let score = 0;
    const words = candidate.split(/\s+/);

    // Names are typically 2-4 words
    if (words.length >= 2 && words.length <= 4) score += 30;
    else if (words.length === 1) score += 5;
    else if (words.length > 4) score -= 10;

    // Names are short (under 40 chars)
    if (candidate.length <= 30) score += 20;
    else if (candidate.length <= 40) score += 10;
    else score -= 15;

    // All words capitalized (title case or ALL CAPS) is very name-like
    const allCapitalized = words.every((w) => /^[A-Z]/.test(w));
    if (allCapitalized) score += 25;

    // ALL CAPS is common for names in resumes
    if (candidate === candidate.toUpperCase() && /[A-Z]/.test(candidate)) score += 15;

    // Names shouldn't contain common non-name words
    const nonNameWords = /\b(the|and|with|for|from|this|that|your|team|bring|what|how|why|consultant|engineer|developer|manager|analyst|intern|designer|summary|objective|experience|education|skills|profile|career|present|january|february|march|april|may|june|july|august|september|october|november|december)\b/i;
    if (nonNameWords.test(candidate)) score -= 40;

    // Penalize institution/college names
    const institutionWords = /\b(university|institute|college|school|academy|iit|nit|iim|bits|vit|iiit|iisc|polytechnic|sies|siescoms?|nmims|kjsce|djsce|vesit|sakec)\b/i;
    if (institutionWords.test(candidate)) score -= 50;

    // Penalize degree abbreviations (MCA, BCA, MBA, B.Tech, etc.)
    const degreeWords = /\b(MCA|BCA|MBA|BBA|B\.?Tech|M\.?Tech|B\.?E|M\.?E|B\.?Sc|M\.?Sc|Ph\.?D|BBI|BMS|BAF|B\.?Com|M\.?Com|B\.?A|M\.?A|HSC|SSC|CBSE|ICSE|Diploma|Bachelor|Master|Certificate)\b/i;
    if (degreeWords.test(candidate)) score -= 50;

    // Penalize role/title-like lines
    const roleWords = /\b(software|technical|senior|junior|lead|full.?stack|front.?end|back.?end|data|cloud|devops|project|product|business|marketing|human|resource|finance|accounting|operations|research|associate)\b/i;
    if (roleWords.test(candidate)) score -= 25;

    // Names are mostly alphabetic
    const alphaRatio = (candidate.match(/[a-zA-Z]/g) || []).length / candidate.length;
    if (alphaRatio > 0.85) score += 15;
    else if (alphaRatio < 0.5) score -= 20;

    // Each word in a name should be all-alpha (no numbers)
    const allWordsAlpha = words.every((w) => /^[a-zA-Z.']+$/.test(w));
    if (allWordsAlpha) score += 15;

    if (score > 0) {
      nameCandidates.push({ text: candidate, score });
    }
  }

  // Use email as a hint to boost matching candidates
  // e.g. vikrantchaubey33@gmail.com → "vikrant", "chaubey"
  const emailNameHints: string[] = [];
  if (info.email) {
    const localPart = info.email.split('@')[0].replace(/[._\d]+/g, ' ').trim().toLowerCase();
    emailNameHints.push(...localPart.split(/\s+/).filter((w) => w.length >= 3));
  }

  if (emailNameHints.length > 0) {
    for (const c of nameCandidates) {
      const lower = c.text.toLowerCase();
      const matches = emailNameHints.filter((h) => lower.includes(h));
      if (matches.length > 0) {
        c.score += 40 * matches.length; // Strong boost for email name match
      }
    }
  }

  // Pick the highest scoring candidate
  if (nameCandidates.length > 0) {
    nameCandidates.sort((a, b) => b.score - a.score);
    info.name = nameCandidates[0].text;
  }

  // Location - look in first 8 lines for city/state patterns
  const topLines = headerLines.slice(0, 8).join('\n');
  const locationMatch = topLines.match(LOCATION_RE);
  if (locationMatch) {
    info.location = locationMatch[0];
  }

  return info;
}

function parseEducation(lines: string[]): Education[] {
  const entries: Education[] = [];
  let current: Partial<Education> | null = null;

  const flushCurrent = () => {
    if (current && (current.institution || current.degree)) {
      entries.push({
        id: crypto.randomUUID(),
        institution: current.institution || '',
        degree: current.degree || '',
        field: current.field || '',
        startDate: current.startDate || '',
        endDate: current.endDate || '',
        cgpa: current.cgpa || '',
        achievements: current.achievements || '',
      });
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const lower = trimmed.toLowerCase();

    // Check if this line mentions an institution
    const isInstitution = INSTITUTION_KEYWORDS.some((kw) =>
      lower.includes(kw),
    );

    if (isInstitution) {
      flushCurrent();
      current = { institution: stripDecorative(trimmed) };
      // Check for dates on the same line
      const dates = extractDateRange(trimmed);
      if (dates.start) {
        current.startDate = dates.start;
        current.endDate = dates.end;
      }
      continue;
    }

    if (!current) {
      // Check if this looks like a degree line starting a new entry
      const hasDegree = DEGREE_PATTERNS.some((p) => p.test(trimmed));
      if (hasDegree) {
        flushCurrent();
        current = {};
      } else {
        continue;
      }
    }

    // Try to extract degree
    if (!current.degree) {
      for (const pattern of DEGREE_PATTERNS) {
        const degreeMatch = trimmed.match(pattern);
        if (degreeMatch) {
          current.degree = degreeMatch[0];
          // The rest might be field of study
          const rest = trimmed
            .replace(pattern, '')
            .replace(/^[\s,.\-–—:in]+|[\s,.\-–—:]+$/gi, '')
            .trim();
          if (rest && !current.field) {
            current.field = rest.replace(DATE_RANGE_RE, '').replace(GPA_RE, '').trim();
          }
          break;
        }
      }
    }

    // Try to extract dates
    if (!current.startDate) {
      const dates = extractDateRange(trimmed);
      if (dates.start) {
        current.startDate = dates.start;
        current.endDate = dates.end;
      }
    }

    // Try to extract GPA
    if (!current.cgpa) {
      const gpaMatch = trimmed.match(GPA_RE);
      if (gpaMatch) {
        current.cgpa = gpaMatch[0];
      }
    }

    // Remaining bullets go to achievements
    if (BULLET_RE.test(trimmed)) {
      const bullet = trimmed.replace(BULLET_RE, '').trim();
      if (bullet) {
        current.achievements = current.achievements
          ? `${current.achievements}; ${bullet}`
          : bullet;
      }
    }
  }

  flushCurrent();
  return entries.filter((e) => e.institution || e.degree);
}

function parseExperience(lines: string[]): Experience[] {
  const entries: Experience[] = [];
  let current: Partial<Experience & { bulletLines: string[] }> | null = null;

  const flushCurrent = () => {
    if (current && (current.company || current.role)) {
      entries.push({
        id: crypto.randomUUID(),
        company: current.company || '',
        role: current.role || '',
        startDate: current.startDate || '',
        endDate: current.endDate || '',
        current: /present|current|ongoing|now/i.test(current.endDate || ''),
        bullets: (current.bulletLines || []).filter((b) => b.trim()),
      });
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const hasDate = DATE_RANGE_RE.test(trimmed);
    const hasRole = ROLE_KEYWORDS.some((kw) =>
      trimmed.toLowerCase().includes(kw),
    );
    const isBullet = BULLET_RE.test(trimmed);

    // Detect a new experience entry: has a date range and/or role keyword, and is not a bullet
    if (!isBullet && (hasDate || hasRole) && trimmed.length < 200) {
      // Determine if this is a company line or role line
      const dates = extractDateRange(trimmed);

      if (hasRole && current && !current.role) {
        // This is a role line for the current company
        current.role = trimmed
          .replace(DATE_RANGE_RE, '')
          .replace(/[|,]\s*$/, '')
          .trim();
        if (dates.start) {
          current.startDate = dates.start;
          current.endDate = dates.end;
        }
        continue;
      }

      if (hasDate && hasRole) {
        // Single line with both company/role and dates
        flushCurrent();
        const textWithoutDate = trimmed.replace(DATE_RANGE_RE, '').trim();
        // Try to split by common separators: |, -, at, @
        const parts = textWithoutDate.split(/\s*[|@]\s*|\s+at\s+/i);
        if (parts.length >= 2) {
          current = {
            role: parts[0].replace(/[,\s]+$/, '').trim(),
            company: parts[1].replace(/[,\s]+$/, '').trim(),
            startDate: dates.start,
            endDate: dates.end,
            bulletLines: [],
          };
        } else {
          current = {
            company: textWithoutDate.replace(/[,\s]+$/, '').trim(),
            startDate: dates.start,
            endDate: dates.end,
            bulletLines: [],
          };
        }
        continue;
      }

      if (hasDate && !hasRole) {
        // Likely a company or role line with dates
        flushCurrent();
        current = {
          company: trimmed.replace(DATE_RANGE_RE, '').replace(/[|,\s]+$/, '').trim(),
          startDate: dates.start,
          endDate: dates.end,
          bulletLines: [],
        };
        continue;
      }

      if (hasRole && !current) {
        flushCurrent();
        current = {
          role: trimmed.replace(/[|,\s]+$/, '').trim(),
          bulletLines: [],
        };
        continue;
      }
    }

    // Bullet point - add to current entry
    if (isBullet && current) {
      const bullet = trimmed.replace(BULLET_RE, '').trim();
      if (bullet) {
        if (!current.bulletLines) current.bulletLines = [];
        current.bulletLines.push(bullet);
      }
      continue;
    }

    // Non-bullet text under a current entry
    if (current) {
      // Could be a role line if we don't have one yet
      if (!current.role && hasRole) {
        current.role = trimmed.replace(DATE_RANGE_RE, '').replace(/[|,\s]+$/, '').trim();
      } else if (!current.company && !isBullet && trimmed.length < 80) {
        // Could be a company name
        current.company = trimmed.replace(DATE_RANGE_RE, '').replace(/[|,\s]+$/, '').trim();
      } else if (!isBullet && trimmed.length > 20) {
        // Treat as a bullet if it looks descriptive
        if (!current.bulletLines) current.bulletLines = [];
        current.bulletLines.push(trimmed);
      }
    }
  }

  flushCurrent();
  return entries.filter((e) => e.company || e.role);
}

function parseProjects(lines: string[]): Project[] {
  const entries: Project[] = [];
  let current: Partial<Project & { bulletLines: string[] }> | null = null;

  const flushCurrent = () => {
    if (current && current.name) {
      entries.push({
        id: crypto.randomUUID(),
        name: current.name || '',
        techStack: current.techStack || '',
        link: current.link || '',
        bullets: (current.bulletLines || []).filter((b) => b.trim()),
      });
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const isBullet = BULLET_RE.test(trimmed);

    // Tech stack patterns
    const techMatch = trimmed.match(
      /(?:Tech(?:nolog(?:y|ies))?|Stack|Built\s+with|Tools)\s*[:\-]\s*(.+)/i,
    );

    // A project name line: not a bullet, relatively short, may have a link
    if (!isBullet && trimmed.length < 120 && !techMatch) {
      const urls = extractAllUrls(trimmed);
      const textWithoutUrl = trimmed.replace(URL_RE, '').trim();

      // Check if it looks like a new project heading
      if (
        textWithoutUrl.length > 0 &&
        textWithoutUrl.length < 80 &&
        !BULLET_RE.test(textWithoutUrl) &&
        !/^\d+\.?\s*$/.test(textWithoutUrl)
      ) {
        // Check for parenthesized tech stack
        const parenMatch = textWithoutUrl.match(/\(([^)]+)\)\s*$/);
        const name = parenMatch
          ? textWithoutUrl.replace(/\([^)]+\)\s*$/, '').trim()
          : textWithoutUrl.replace(/[:\-|]+\s*$/, '').trim();

        // Only start a new project if the line doesn't look like a description
        if (name && (name.length < 60 || !current)) {
          flushCurrent();
          current = {
            name,
            techStack: parenMatch ? parenMatch[1].trim() : '',
            link: urls[0] || '',
            bulletLines: [],
          };
          continue;
        }
      }
    }

    if (!current) continue;

    // Tech stack line
    if (techMatch) {
      current.techStack = techMatch[1].trim();
      continue;
    }

    // Link line
    if (/^https?:\/\//i.test(trimmed) && !current.link) {
      current.link = trimmed;
      continue;
    }

    // Bullet / description
    if (isBullet) {
      const bullet = trimmed.replace(BULLET_RE, '').trim();
      if (bullet) {
        if (!current.bulletLines) current.bulletLines = [];
        current.bulletLines.push(bullet);
      }
    } else if (trimmed.length > 20) {
      // Treat long non-bullet text as a description bullet
      if (!current.bulletLines) current.bulletLines = [];
      current.bulletLines.push(trimmed);
    }
  }

  flushCurrent();
  return entries.filter((e) => e.name);
}

function parseSkills(lines: string[]): SkillGroup[] {
  const groups: SkillGroup[] = [];
  let currentCategory = '';
  let currentSkills: string[] = [];

  const flushGroup = () => {
    if (currentSkills.length > 0) {
      groups.push({
        category: currentCategory || 'General',
        skills: currentSkills,
      });
    }
  };

  for (const line of lines) {
    const trimmed = line.replace(BULLET_RE, '').trim();
    if (!trimmed) continue;

    // Check for category:skills pattern
    const colonSplit = trimmed.match(/^([^:]+):\s*(.+)$/);
    if (colonSplit) {
      flushGroup();
      currentCategory = colonSplit[1].trim();
      currentSkills = colonSplit[2]
        .split(/[,;|]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      flushGroup();
      currentCategory = '';
      currentSkills = [];
      continue;
    }

    // Comma-separated skills on a line
    const skills = trimmed
      .split(/[,;|]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.length < 50);

    if (skills.length > 1) {
      // Multiple skills on one line
      flushGroup();
      currentCategory = '';
      currentSkills = skills;
      flushGroup();
      currentSkills = [];
    } else if (skills.length === 1) {
      // Single skill or category label
      currentSkills.push(skills[0]);
    }
  }

  flushGroup();

  // If we only got a flat list with no categories, auto-categorize
  if (groups.length <= 1 && groups[0]?.category === 'General') {
    return autoCategorizeSkills(groups[0].skills);
  }

  return groups;
}

function autoCategorizeSkills(skills: string[]): SkillGroup[] {
  const categorized: Record<string, string[]> = {};
  const uncategorized: string[] = [];

  for (const skill of skills) {
    const lower = skill.toLowerCase();
    let found = false;
    for (const [category, keywords] of Object.entries(SKILL_DICTIONARY)) {
      if (keywords.some((kw) => lower === kw || lower.includes(kw))) {
        if (!categorized[category]) categorized[category] = [];
        categorized[category].push(skill);
        found = true;
        break;
      }
    }
    if (!found) uncategorized.push(skill);
  }

  const groups: SkillGroup[] = [];
  for (const [category, items] of Object.entries(categorized)) {
    if (items.length > 0) {
      groups.push({ category, skills: items });
    }
  }
  if (uncategorized.length > 0) {
    groups.push({ category: 'Other', skills: uncategorized });
  }

  return groups.length > 0 ? groups : [{ category: 'General', skills }];
}

function parseSummary(lines: string[]): string {
  return lines
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .join(' ')
    .trim();
}

function parseCertifications(lines: string[]): Certification[] {
  const entries: Certification[] = [];

  for (const line of lines) {
    const trimmed = line.replace(BULLET_RE, '').trim();
    if (!trimmed) continue;

    const urls = extractAllUrls(trimmed);
    const textWithoutUrl = trimmed.replace(URL_RE, '').trim();

    // Try to split by common delimiters: " - ", ", ", " | ", or parenthesized issuer
    let name = '';
    let issuer = '';
    let date = '';

    const parenMatch = textWithoutUrl.match(/^(.+?)\s*\(([^)]+)\)\s*(.*)$/);
    if (parenMatch) {
      name = parenMatch[1].trim();
      issuer = parenMatch[2].trim();
      date = parenMatch[3].trim();
    } else {
      const parts = textWithoutUrl.split(/\s*[-–—|]\s*|\s*,\s*/);
      if (parts.length >= 2) {
        name = parts[0].trim();
        issuer = parts[1].trim();
        date = parts.slice(2).join(' ').trim();
      } else {
        name = textWithoutUrl;
      }
    }

    // Try to extract date from the remaining text
    if (!date) {
      const dateMatch = textWithoutUrl.match(SINGLE_DATE_RE);
      if (dateMatch) date = dateMatch[0];
    }

    if (name) {
      entries.push({
        id: crypto.randomUUID(),
        name,
        issuer,
        date,
        link: urls[0] || '',
      });
    }
  }

  return entries;
}

function parseAchievements(lines: string[]): Achievement[] {
  const entries: Achievement[] = [];

  for (const line of lines) {
    const trimmed = line.replace(BULLET_RE, '').trim();
    if (!trimmed) continue;

    // Split on first period or dash for title/description
    const splitMatch = trimmed.match(/^([^.–—-]{5,80})[.–—-]\s*(.+)$/);
    if (splitMatch) {
      entries.push({
        id: crypto.randomUUID(),
        title: splitMatch[1].trim(),
        description: splitMatch[2].trim(),
      });
    } else {
      entries.push({
        id: crypto.randomUUID(),
        title: trimmed,
        description: '',
      });
    }
  }

  return entries;
}

// ---------------------------------------------------------------------------
// Main parser
// ---------------------------------------------------------------------------

export function parseResumeText(rawText: string): Partial<ResumeData> {
  if (!rawText || !rawText.trim()) {
    return {
      personal: {
        name: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        github: '',
        portfolio: '',
        objective: '',
      },
      summary: '',
      education: [],
      experience: [],
      projects: [],
      skills: [],
      certifications: [],
      achievements: [],
    };
  }

  const lines = rawText.split(/\r?\n/);
  const { header, sections } = splitIntoSections(lines);

  const personal = parsePersonalInfo(header, rawText, lines);

  const summary = sections.summary
    ? parseSummary(sections.summary)
    : '';

  // Use objective from summary if personal.objective is empty
  if (summary && !personal.objective) {
    personal.objective = summary;
  }

  const education = sections.education
    ? parseEducation(sections.education)
    : [];

  const experience = sections.experience
    ? parseExperience(sections.experience)
    : [];

  const projects = sections.projects
    ? parseProjects(sections.projects)
    : [];

  const skills = sections.skills ? parseSkills(sections.skills) : [];

  const certifications = sections.certifications
    ? parseCertifications(sections.certifications)
    : [];

  const achievements = sections.achievements
    ? parseAchievements(sections.achievements)
    : [];

  // Also check extracurricular for achievements
  const extraAchievements = sections.extracurricular
    ? parseAchievements(sections.extracurricular)
    : [];

  return {
    personal,
    summary,
    education,
    experience,
    projects,
    skills,
    certifications,
    achievements: [...achievements, ...extraAchievements],
  };
}
