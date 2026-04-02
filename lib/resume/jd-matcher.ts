import type { ResumeData } from './types';

// ---------------------------------------------------------------------------
// Public interfaces
// ---------------------------------------------------------------------------

export interface JdParseResult {
  requiredSkills: string[];
  preferredSkills: string[];
  experienceKeywords: string[];
  educationRequirements: string;
  roleKeywords: string[];
  yearsRequired: number | null;
}

export interface JdMatchResult {
  overallMatch: number; // 0-100
  breakdown: {
    skills: { score: number; matched: string[]; missing: string[] };
    experience: {
      score: number;
      matchedKeywords: string[];
      missingKeywords: string[];
    };
    education: { score: number; notes: string };
    language: { score: number; weakVerbs: string[]; genericPhrases: string[] };
  };
  recommendations: JdRecommendation[];
}

export interface JdRecommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  section: string;
  action: string;
}

// ---------------------------------------------------------------------------
// Skills dictionary (200+ entries, Set for O(1) lookup)
// ---------------------------------------------------------------------------

const SKILLS_DICTIONARY = new Set<string>([
  // Programming languages
  'javascript', 'typescript', 'python', 'java', 'c', 'c++', 'c#', 'go',
  'rust', 'swift', 'kotlin', 'php', 'ruby', 'scala', 'r', 'matlab',
  'perl', 'haskell', 'elixir', 'clojure', 'dart', 'lua', 'groovy',
  'objective-c', 'shell', 'bash', 'powershell', 'sql', 'plsql',
  'assembly', 'fortran', 'cobol', 'vba', 'solidity',

  // Frontend frameworks & libraries
  'react', 'angular', 'vue', 'vue.js', 'next.js', 'nextjs', 'nuxt',
  'nuxt.js', 'svelte', 'sveltekit', 'gatsby', 'remix', 'ember',
  'backbone', 'jquery', 'alpine.js', 'lit', 'solid.js', 'astro',

  // CSS & styling
  'html', 'css', 'tailwind css', 'tailwindcss', 'sass', 'scss', 'less',
  'bootstrap', 'material ui', 'mui', 'chakra ui', 'ant design',
  'styled-components', 'emotion', 'css modules', 'postcss',

  // State management
  'redux', 'mobx', 'zustand', 'recoil', 'jotai', 'xstate', 'vuex',
  'pinia', 'ngrx',

  // Backend frameworks
  'node.js', 'nodejs', 'express', 'express.js', 'fastify', 'nest.js',
  'nestjs', 'koa', 'hapi', 'django', 'flask', 'fastapi', 'spring',
  'spring boot', '.net', 'asp.net', 'rails', 'ruby on rails', 'laravel',
  'symfony', 'gin', 'echo', 'fiber', 'actix', 'rocket', 'phoenix',

  // Databases
  'postgresql', 'postgres', 'mysql', 'mariadb', 'sqlite', 'oracle',
  'sql server', 'mongodb', 'redis', 'elasticsearch', 'cassandra',
  'dynamodb', 'couchdb', 'neo4j', 'firebase', 'firestore', 'supabase',
  'prisma', 'sequelize', 'typeorm', 'drizzle', 'mongoose', 'knex',
  'influxdb', 'cockroachdb', 'planetscale',

  // Cloud & infrastructure
  'aws', 'amazon web services', 'azure', 'gcp', 'google cloud',
  'google cloud platform', 'heroku', 'vercel', 'netlify', 'digital ocean',
  'cloudflare', 'linode', 'oracle cloud',

  // DevOps & CI/CD
  'docker', 'kubernetes', 'k8s', 'terraform', 'ansible', 'puppet',
  'chef', 'vagrant', 'jenkins', 'github actions', 'gitlab ci',
  'circleci', 'travis ci', 'argo cd', 'helm', 'istio', 'envoy',
  'nginx', 'apache', 'caddy', 'prometheus', 'grafana', 'datadog',
  'new relic', 'splunk', 'elk', 'logstash', 'kibana',

  // Version control
  'git', 'github', 'gitlab', 'bitbucket', 'svn', 'mercurial',

  // Testing
  'jest', 'mocha', 'chai', 'cypress', 'playwright', 'selenium',
  'puppeteer', 'testing library', 'react testing library', 'vitest',
  'junit', 'pytest', 'rspec', 'jasmine', 'karma', 'storybook',
  'enzyme', 'supertest', 'msw',

  // API & communication
  'rest', 'restful', 'graphql', 'grpc', 'soap', 'websocket',
  'websockets', 'socket.io', 'apollo', 'trpc', 'swagger', 'openapi',
  'postman',

  // Data & ML / AI
  'machine learning', 'deep learning', 'artificial intelligence', 'ai',
  'ml', 'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'pandas',
  'numpy', 'scipy', 'opencv', 'nlp', 'natural language processing',
  'computer vision', 'data science', 'data engineering', 'data analysis',
  'data visualization', 'tableau', 'power bi', 'looker', 'excel',
  'jupyter', 'spark', 'hadoop', 'kafka', 'airflow', 'dbt',
  'snowflake', 'redshift', 'bigquery', 'databricks', 'mlflow',
  'hugging face', 'langchain', 'openai', 'llm', 'rag',

  // Mobile
  'react native', 'flutter', 'ios', 'android', 'swiftui',
  'jetpack compose', 'xamarin', 'ionic', 'cordova', 'capacitor',
  'expo',

  // Design tools
  'figma', 'sketch', 'adobe xd', 'invision', 'zeplin', 'photoshop',
  'illustrator', 'canva', 'framer',

  // Project management & methodology
  'agile', 'scrum', 'kanban', 'jira', 'confluence', 'trello',
  'asana', 'monday.com', 'notion', 'linear', 'waterfall', 'lean',
  'six sigma', 'safe',

  // Security
  'oauth', 'oauth2', 'jwt', 'saml', 'sso', 'owasp', 'penetration testing',
  'encryption', 'ssl', 'tls', 'https', 'cors', 'csp', 'xss', 'csrf',
  'soc2', 'gdpr', 'hipaa', 'pci dss',

  // Messaging & queues
  'rabbitmq', 'sqs', 'sns', 'pub/sub', 'nats', 'zeromq', 'celery',

  // Architecture & patterns
  'microservices', 'monolith', 'serverless', 'event-driven',
  'domain-driven design', 'ddd', 'cqrs', 'event sourcing', 'clean architecture',
  'hexagonal architecture', 'soa', 'api gateway', 'load balancing',

  // Blockchain & web3
  'blockchain', 'ethereum', 'web3', 'smart contracts', 'defi', 'nft',

  // Soft skills
  'leadership', 'communication', 'teamwork', 'problem solving',
  'critical thinking', 'time management', 'project management',
  'mentoring', 'collaboration', 'presentation', 'negotiation',
  'strategic planning', 'decision making', 'conflict resolution',
  'stakeholder management', 'cross-functional', 'customer facing',

  // Business skills
  'product management', 'business analysis', 'requirements gathering',
  'user research', 'ux', 'ui', 'ux/ui', 'a/b testing', 'analytics',
  'seo', 'sem', 'marketing', 'sales', 'crm', 'salesforce', 'hubspot',
  'erp', 'sap', 'supply chain', 'finance', 'accounting', 'budgeting',
]);

// ---------------------------------------------------------------------------
// Weak verbs & generic phrases for language scoring
// ---------------------------------------------------------------------------

const WEAK_VERBS = new Set([
  'helped', 'assisted', 'worked on', 'was responsible for',
  'participated in', 'involved in', 'did', 'handled', 'used',
  'supported', 'contributed to', 'dealt with', 'tasked with',
  'was part of', 'aided',
]);

const GENERIC_PHRASES = new Set([
  'team player', 'hard worker', 'fast learner', 'go-getter',
  'self-starter', 'detail-oriented', 'results-driven',
  'think outside the box', 'synergy', 'dynamic', 'passionate',
  'references available', 'responsible for', 'duties included',
  'various tasks', 'day-to-day', 'etc',
]);

// ---------------------------------------------------------------------------
// Section header patterns for splitting JD
// ---------------------------------------------------------------------------

const REQUIRED_SECTION_PATTERNS = [
  /\b(?:requirements?|required|qualifications?|must[\s-]have|minimum)\b/i,
  /\bwhat\s+(?:you(?:'ll)?\s+need|we(?:'re)?\s+looking\s+for)\b/i,
  /\b(?:essential|mandatory)\b/i,
];

const PREFERRED_SECTION_PATTERNS = [
  /\b(?:nice[\s-]to[\s-]have|preferred|bonus|plus|desired|optional)\b/i,
  /\b(?:additional|ideal)\s+(?:qualifications?|skills?|experience)\b/i,
];

const RESPONSIBILITY_PATTERNS = [
  /\b(?:responsibilities|what\s+you(?:'ll)?\s+do|role|duties|tasks)\b/i,
  /\b(?:day[\s-]to[\s-]day|scope)\b/i,
];

// ---------------------------------------------------------------------------
// Regex helpers
// ---------------------------------------------------------------------------

const YEARS_REGEX =
  /(\d+)\+?\s*(?:[-–]?\s*\d+\s*)?(?:\+\s*)?(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp)?/gi;

const EDUCATION_PATTERNS = [
  /\b(?:bachelor'?s?|b\.?s\.?|b\.?a\.?|b\.?tech|b\.?e\.?)\b/i,
  /\b(?:master'?s?|m\.?s\.?|m\.?a\.?|m\.?tech|m\.?e\.?|mba)\b/i,
  /\b(?:ph\.?d\.?|doctorate)\b/i,
  /\b(?:associate'?s?|a\.?s\.?|a\.?a\.?)\b/i,
  /\b(?:degree|diploma|certification|certified)\b/i,
  /\b(?:computer\s+science|engineering|mathematics|information\s+technology)\b/i,
];

// ---------------------------------------------------------------------------
// parseJobDescription
// ---------------------------------------------------------------------------

export function parseJobDescription(jdText: string): JdParseResult {
  const text = jdText.trim();
  const textLower = text.toLowerCase();

  // --- Split JD into rough sections ---
  const lines = text.split(/\n/);
  let currentSectionType: 'required' | 'preferred' | 'responsibility' | 'other' = 'other';
  type SectionType = 'required' | 'preferred' | 'responsibility' | 'other';
  const sectionBuckets: Record<SectionType, string[]> = {
    required: [],
    preferred: [],
    responsibility: [],
    other: [],
  };

  for (const line of lines) {
    // Detect section header changes
    if (REQUIRED_SECTION_PATTERNS.some((p) => p.test(line))) {
      currentSectionType = 'required';
    } else if (PREFERRED_SECTION_PATTERNS.some((p) => p.test(line))) {
      currentSectionType = 'preferred';
    } else if (RESPONSIBILITY_PATTERNS.some((p) => p.test(line))) {
      currentSectionType = 'responsibility';
    }
    sectionBuckets[currentSectionType].push(line);
  }

  // --- Extract skills ---
  const requiredSkills: string[] = [];
  const preferredSkills: string[] = [];

  const extractSkillsFromText = (block: string): string[] => {
    const blockLower = block.toLowerCase();
    const found: string[] = [];
    for (const skill of SKILLS_DICTIONARY) {
      // Use word-boundary-aware matching for short skill names
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?:^|[\\s,;/|(])${escaped}(?:[\\s,;/|)]|$)`, 'i');
      if (regex.test(blockLower)) {
        found.push(skill);
      }
    }
    return found;
  };

  const requiredText = sectionBuckets.required.join('\n');
  const preferredText = sectionBuckets.preferred.join('\n');
  const otherText = sectionBuckets.other.join('\n') + '\n' + sectionBuckets.responsibility.join('\n');

  if (requiredText.length > 0) {
    requiredSkills.push(...extractSkillsFromText(requiredText));
  }
  if (preferredText.length > 0) {
    preferredSkills.push(...extractSkillsFromText(preferredText));
  }

  // Skills found in other/responsibility sections that are not yet captured
  // go into required by default
  const alreadyCaptured = new Set([...requiredSkills, ...preferredSkills]);
  const otherSkills = extractSkillsFromText(otherText).filter(
    (s) => !alreadyCaptured.has(s),
  );
  requiredSkills.push(...otherSkills);

  // Deduplicate
  const uniqueRequired = [...new Set(requiredSkills)];
  const uniquePreferred = [...new Set(preferredSkills)].filter(
    (s) => !uniqueRequired.includes(s),
  );

  // --- Years of experience ---
  let yearsRequired: number | null = null;
  const yearsMatches = [...textLower.matchAll(YEARS_REGEX)];
  if (yearsMatches.length > 0) {
    const years = yearsMatches.map((m) => parseInt(m[1], 10)).filter(Boolean);
    yearsRequired = years.length > 0 ? Math.max(...years) : null;
  }

  // --- Education requirements ---
  let educationRequirements = '';
  for (const line of lines) {
    if (EDUCATION_PATTERNS.some((p) => p.test(line))) {
      educationRequirements = line.trim();
      break;
    }
  }

  // --- Experience keywords (action-oriented words from responsibilities) ---
  const experienceKeywords = extractActionKeywords(
    sectionBuckets.responsibility.join('\n') + '\n' + requiredText,
  );

  // --- Role keywords (from title area and general text) ---
  const roleKeywords = extractRoleKeywords(text);

  return {
    requiredSkills: uniqueRequired,
    preferredSkills: uniquePreferred,
    experienceKeywords,
    educationRequirements,
    roleKeywords,
    yearsRequired,
  };
}

// ---------------------------------------------------------------------------
// Helper: extract action / experience keywords
// ---------------------------------------------------------------------------

const ACTION_VERBS = new Set([
  'design', 'develop', 'build', 'implement', 'create', 'architect',
  'optimize', 'scale', 'deploy', 'maintain', 'manage', 'lead',
  'mentor', 'review', 'test', 'debug', 'analyze', 'automate',
  'integrate', 'migrate', 'monitor', 'configure', 'collaborate',
  'coordinate', 'deliver', 'drive', 'establish', 'evaluate',
  'improve', 'launch', 'own', 'plan', 'prioritize', 'research',
  'resolve', 'ship', 'support', 'transform', 'troubleshoot',
  'write', 'refactor', 'document', 'communicate', 'present',
  'negotiate', 'facilitate', 'orchestrate', 'streamline',
]);

function extractActionKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const keywords = new Set<string>();
  for (const word of words) {
    if (ACTION_VERBS.has(word)) {
      keywords.add(word);
    }
  }

  // Also extract multi-word domain phrases
  const domainPhrases = [
    'full stack', 'front end', 'back end', 'cross functional',
    'ci/cd', 'unit test', 'code review', 'system design',
    'api design', 'database design', 'technical debt',
    'performance optimization', 'security audit', 'data pipeline',
    'etl', 'real time', 'high availability', 'scalability',
    'distributed systems', 'version control', 'pair programming',
  ];

  const textLower = text.toLowerCase();
  for (const phrase of domainPhrases) {
    if (textLower.includes(phrase)) {
      keywords.add(phrase);
    }
  }

  return [...keywords];
}

function extractRoleKeywords(text: string): string[] {
  const rolePhrases = [
    'software engineer', 'senior engineer', 'staff engineer',
    'principal engineer', 'tech lead', 'team lead', 'engineering manager',
    'frontend developer', 'backend developer', 'full stack developer',
    'fullstack developer', 'devops engineer', 'sre', 'site reliability',
    'data engineer', 'data scientist', 'machine learning engineer',
    'ml engineer', 'product manager', 'project manager', 'designer',
    'ux designer', 'ui designer', 'qa engineer', 'test engineer',
    'security engineer', 'cloud engineer', 'solutions architect',
    'technical architect', 'mobile developer', 'ios developer',
    'android developer', 'platform engineer', 'infrastructure engineer',
  ];

  const textLower = text.toLowerCase();
  return rolePhrases.filter((phrase) => textLower.includes(phrase));
}

// ---------------------------------------------------------------------------
// matchResumeToJd
// ---------------------------------------------------------------------------

export function matchResumeToJd(
  resumeData: ResumeData,
  jdResult: JdParseResult,
): JdMatchResult {
  const skillsResult = scoreSkills(resumeData, jdResult);
  const experienceResult = scoreExperience(resumeData, jdResult);
  const educationResult = scoreEducation(resumeData, jdResult);
  const languageResult = scoreLanguage(resumeData);

  // Weighted overall: skills 40%, experience 30%, education 15%, language 15%
  const overallMatch = Math.round(
    skillsResult.score * 0.4 +
      experienceResult.score * 0.3 +
      educationResult.score * 0.15 +
      languageResult.score * 0.15,
  );

  const recommendations = buildRecommendations(
    skillsResult,
    experienceResult,
    educationResult,
    languageResult,
    jdResult,
  );

  return {
    overallMatch,
    breakdown: {
      skills: skillsResult,
      experience: experienceResult,
      education: educationResult,
      language: languageResult,
    },
    recommendations,
  };
}

// ---------------------------------------------------------------------------
// Skills scoring (40% weight)
// ---------------------------------------------------------------------------

function scoreSkills(
  resume: ResumeData,
  jd: JdParseResult,
): { score: number; matched: string[]; missing: string[] } {
  // Collect all resume skills into a single lowercase set
  const resumeSkillsLower = new Set<string>();
  for (const group of resume.skills) {
    for (const skill of group.skills) {
      resumeSkillsLower.add(skill.toLowerCase().trim());
    }
  }

  // Also scan experience bullets, project tech stacks, and summary for skills
  const textSources = [
    resume.summary,
    ...resume.experience.flatMap((e) => [e.role, ...e.bullets]),
    ...resume.projects.flatMap((p) => [p.techStack, ...p.bullets]),
  ].join(' ').toLowerCase();

  const allJdSkills = [...jd.requiredSkills, ...jd.preferredSkills];
  const matched: string[] = [];
  const missing: string[] = [];

  for (const skill of allJdSkills) {
    const skillLower = skill.toLowerCase();
    if (resumeSkillsLower.has(skillLower) || textSources.includes(skillLower)) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  }

  const total = allJdSkills.length;
  const score = total > 0 ? Math.round((matched.length / total) * 100) : 100;

  return { score, matched, missing };
}

// ---------------------------------------------------------------------------
// Experience scoring (30% weight)
// ---------------------------------------------------------------------------

function scoreExperience(
  resume: ResumeData,
  jd: JdParseResult,
): {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
} {
  const allBullets = [
    ...resume.experience.flatMap((e) => e.bullets),
    ...resume.projects.flatMap((p) => p.bullets),
    resume.summary,
  ]
    .join(' ')
    .toLowerCase();

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const keyword of jd.experienceKeywords) {
    if (allBullets.includes(keyword.toLowerCase())) {
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  }

  const total = jd.experienceKeywords.length;
  const score =
    total > 0 ? Math.round((matchedKeywords.length / total) * 100) : 100;

  return { score, matchedKeywords, missingKeywords };
}

// ---------------------------------------------------------------------------
// Education scoring (15% weight)
// ---------------------------------------------------------------------------

function scoreEducation(
  resume: ResumeData,
  jd: JdParseResult,
): { score: number; notes: string } {
  if (!jd.educationRequirements) {
    return { score: 100, notes: 'No specific education requirement in JD.' };
  }

  const reqLower = jd.educationRequirements.toLowerCase();
  const resumeEduText = resume.education
    .map((e) => `${e.degree} ${e.field} ${e.institution}`)
    .join(' ')
    .toLowerCase();

  // Check degree level hierarchy
  const degreeLevels: Array<{ pattern: RegExp; level: number }> = [
    { pattern: /\b(?:ph\.?d|doctorate)\b/, level: 4 },
    { pattern: /\b(?:master|m\.?s\.?|m\.?a\.?|m\.?tech|mba)\b/, level: 3 },
    { pattern: /\b(?:bachelor|b\.?s\.?|b\.?a\.?|b\.?tech|b\.?e\.?)\b/, level: 2 },
    { pattern: /\b(?:associate|a\.?s\.?|a\.?a\.?|diploma)\b/, level: 1 },
  ];

  let jdLevel = 0;
  for (const { pattern, level } of degreeLevels) {
    if (pattern.test(reqLower)) {
      jdLevel = Math.max(jdLevel, level);
    }
  }

  let resumeLevel = 0;
  for (const { pattern, level } of degreeLevels) {
    if (pattern.test(resumeEduText)) {
      resumeLevel = Math.max(resumeLevel, level);
    }
  }

  if (jdLevel === 0) {
    // JD mentions education but no specific degree level detected
    return {
      score: 80,
      notes: 'Education requirement detected but level unclear.',
    };
  }

  if (resumeLevel >= jdLevel) {
    return {
      score: 100,
      notes: 'Education level meets or exceeds JD requirement.',
    };
  }

  if (resumeLevel === jdLevel - 1) {
    return {
      score: 60,
      notes: 'Education level is one tier below JD requirement.',
    };
  }

  return {
    score: 30,
    notes: 'Education level does not meet JD requirement.',
  };
}

// ---------------------------------------------------------------------------
// Language scoring (15% weight)
// ---------------------------------------------------------------------------

function scoreLanguage(
  resume: ResumeData,
): { score: number; weakVerbs: string[]; genericPhrases: string[] } {
  const allBullets = [
    ...resume.experience.flatMap((e) => e.bullets),
    ...resume.projects.flatMap((p) => p.bullets),
    resume.summary,
  ].filter((b) => b.trim().length > 0);

  if (allBullets.length === 0) {
    return { score: 50, weakVerbs: [], genericPhrases: [] };
  }

  const foundWeakVerbs = new Set<string>();
  const foundGenericPhrases = new Set<string>();

  for (const bullet of allBullets) {
    const bulletLower = bullet.toLowerCase();

    for (const verb of WEAK_VERBS) {
      if (bulletLower.includes(verb)) {
        foundWeakVerbs.add(verb);
      }
    }

    for (const phrase of GENERIC_PHRASES) {
      if (bulletLower.includes(phrase)) {
        foundGenericPhrases.add(phrase);
      }
    }
  }

  // Deduct points: each weak verb -5, each generic phrase -5, min 0
  const deductions =
    foundWeakVerbs.size * 5 + foundGenericPhrases.size * 5;
  const score = Math.max(0, 100 - deductions);

  return {
    score,
    weakVerbs: [...foundWeakVerbs],
    genericPhrases: [...foundGenericPhrases],
  };
}

// ---------------------------------------------------------------------------
// Recommendations builder
// ---------------------------------------------------------------------------

function buildRecommendations(
  skills: { score: number; matched: string[]; missing: string[] },
  experience: {
    score: number;
    matchedKeywords: string[];
    missingKeywords: string[];
  },
  education: { score: number; notes: string },
  language: { score: number; weakVerbs: string[]; genericPhrases: string[] },
  jd: JdParseResult,
): JdRecommendation[] {
  const recs: JdRecommendation[] = [];

  // Critical: missing required skills
  const missingRequired = skills.missing.filter((s) =>
    jd.requiredSkills.includes(s),
  );
  if (missingRequired.length > 0) {
    recs.push({
      priority: 'critical',
      section: 'Skills',
      action: `Add missing required skills: ${missingRequired.slice(0, 10).join(', ')}`,
    });
  }

  // High: missing experience keywords
  if (experience.missingKeywords.length > 0) {
    recs.push({
      priority: 'high',
      section: 'Experience',
      action: `Include these keywords in your bullet points: ${experience.missingKeywords.slice(0, 8).join(', ')}`,
    });
  }

  // High: education gap
  if (education.score < 60) {
    recs.push({
      priority: 'high',
      section: 'Education',
      action: education.notes,
    });
  }

  // Medium: weak verbs
  if (language.weakVerbs.length > 0) {
    recs.push({
      priority: 'medium',
      section: 'Language',
      action: `Replace weak verbs with strong action verbs. Weak verbs found: ${language.weakVerbs.join(', ')}`,
    });
  }

  // Medium: generic phrases
  if (language.genericPhrases.length > 0) {
    recs.push({
      priority: 'medium',
      section: 'Language',
      action: `Remove generic phrases and replace with specific achievements: ${language.genericPhrases.join(', ')}`,
    });
  }

  // Low: missing preferred skills
  const missingPreferred = skills.missing.filter((s) =>
    jd.preferredSkills.includes(s),
  );
  if (missingPreferred.length > 0) {
    recs.push({
      priority: 'low',
      section: 'Skills',
      action: `Consider adding nice-to-have skills: ${missingPreferred.slice(0, 8).join(', ')}`,
    });
  }

  // Sort by priority
  const priorityOrder: Record<JdRecommendation['priority'], number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };
  recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recs;
}
