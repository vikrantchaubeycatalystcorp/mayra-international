import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Skill dictionary (150+ skills across tech, business, design, data)
// ---------------------------------------------------------------------------

const SKILL_DICTIONARY: string[] = [
  // Programming languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'C',
  'Go', 'Golang', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Scala',
  'R', 'MATLAB', 'Perl', 'Lua', 'Haskell', 'Elixir', 'Erlang',
  'Dart', 'Objective-C', 'Assembly', 'COBOL', 'Fortran', 'Julia',
  'Clojure', 'F#', 'Groovy', 'Shell', 'Bash', 'PowerShell',
  'Visual Basic', 'VB.NET',

  // Frontend frameworks & libraries
  'React', 'React.js', 'Angular', 'AngularJS', 'Vue', 'Vue.js',
  'Next.js', 'Nuxt.js', 'Svelte', 'SvelteKit', 'Gatsby', 'Remix',
  'jQuery', 'Ember.js', 'Backbone.js', 'Alpine.js', 'Solid.js',
  'Astro', 'Qwik',

  // CSS & styling
  'HTML', 'CSS', 'Sass', 'SCSS', 'Less', 'Tailwind', 'Tailwind CSS',
  'Bootstrap', 'Material UI', 'MUI', 'Chakra UI', 'Ant Design',
  'Styled Components', 'CSS Modules', 'PostCSS',

  // State management
  'Redux', 'MobX', 'Zustand', 'Recoil', 'Jotai', 'Vuex', 'Pinia',
  'NgRx', 'XState',

  // Backend frameworks
  'Node.js', 'Express', 'Express.js', 'NestJS', 'Fastify', 'Koa',
  'Django', 'Flask', 'FastAPI', 'Spring', 'Spring Boot',
  '.NET', 'ASP.NET', 'Rails', 'Ruby on Rails', 'Laravel', 'Symfony',
  'Gin', 'Fiber', 'Echo', 'Phoenix', 'Actix',

  // Databases
  'SQL', 'PostgreSQL', 'MySQL', 'MariaDB', 'SQLite', 'Oracle',
  'SQL Server', 'MongoDB', 'Redis', 'Cassandra', 'DynamoDB',
  'CouchDB', 'Neo4j', 'Elasticsearch', 'Firebase', 'Firestore',
  'Supabase', 'PlanetScale', 'CockroachDB', 'InfluxDB', 'TimescaleDB',

  // ORM & query
  'Prisma', 'Sequelize', 'TypeORM', 'Mongoose', 'Drizzle', 'Knex',
  'SQLAlchemy', 'Hibernate',

  // APIs
  'GraphQL', 'REST', 'REST API', 'RESTful', 'gRPC', 'WebSocket',
  'WebSockets', 'Apollo', 'tRPC', 'Swagger', 'OpenAPI', 'Postman',

  // Cloud & infrastructure
  'AWS', 'Amazon Web Services', 'Azure', 'Microsoft Azure', 'GCP',
  'Google Cloud', 'Google Cloud Platform', 'Heroku', 'Vercel',
  'Netlify', 'DigitalOcean', 'Cloudflare', 'Linode',

  // AWS services
  'S3', 'EC2', 'Lambda', 'CloudFormation', 'ECS', 'EKS', 'RDS',
  'SQS', 'SNS', 'API Gateway', 'CloudWatch', 'IAM',

  // DevOps & CI/CD
  'Docker', 'Kubernetes', 'K8s', 'Terraform', 'Ansible', 'Puppet',
  'Chef', 'Vagrant', 'CI/CD', 'Jenkins', 'GitHub Actions',
  'GitLab CI', 'CircleCI', 'Travis CI', 'ArgoCD', 'Helm',
  'Prometheus', 'Grafana', 'Datadog', 'New Relic', 'PagerDuty',
  'Nginx', 'Apache', 'Caddy',

  // Version control
  'Git', 'GitHub', 'GitLab', 'Bitbucket', 'SVN',

  // Testing
  'Jest', 'Mocha', 'Chai', 'Cypress', 'Playwright', 'Selenium',
  'Puppeteer', 'Testing Library', 'React Testing Library', 'Vitest',
  'JUnit', 'pytest', 'RSpec', 'Jasmine', 'Karma', 'Storybook',
  'Enzyme', 'Supertest', 'k6', 'Artillery', 'LoadRunner',

  // Mobile
  'React Native', 'Flutter', 'SwiftUI', 'Jetpack Compose',
  'Xamarin', 'Ionic', 'Capacitor', 'Cordova', 'Expo',

  // AI/ML/Data Science
  'Machine Learning', 'Deep Learning', 'NLP',
  'Natural Language Processing', 'Computer Vision', 'TensorFlow',
  'PyTorch', 'Keras', 'scikit-learn', 'sklearn', 'OpenCV',
  'Hugging Face', 'LangChain', 'OpenAI', 'GPT', 'LLM',
  'Pandas', 'NumPy', 'SciPy', 'Matplotlib', 'Seaborn',
  'Jupyter', 'Jupyter Notebook', 'Apache Spark', 'PySpark',
  'Hadoop', 'Airflow', 'dbt', 'Snowflake', 'BigQuery',
  'Databricks', 'Kafka', 'RabbitMQ',

  // Data & analytics
  'Data Science', 'Data Engineering', 'Data Analytics', 'ETL',
  'Data Pipeline', 'Data Warehouse', 'Data Modeling',
  'Excel', 'Tableau', 'Power BI', 'Looker', 'Metabase',
  'Google Analytics', 'Mixpanel', 'Amplitude', 'Segment',

  // Design
  'Figma', 'Sketch', 'Adobe XD', 'InVision', 'Zeplin',
  'Adobe Photoshop', 'Adobe Illustrator', 'Canva',
  'Framer', 'Principle',

  // Project management & collaboration
  'Agile', 'Scrum', 'Kanban', 'Lean', 'Waterfall',
  'Jira', 'Confluence', 'Trello', 'Asana', 'Monday.com',
  'Linear', 'Notion', 'Slack', 'Microsoft Teams',

  // CRM & enterprise
  'SAP', 'Salesforce', 'HubSpot', 'Zendesk', 'ServiceNow',
  'Oracle ERP', 'Dynamics 365', 'SharePoint',

  // Security
  'OAuth', 'JWT', 'SAML', 'SSO', 'OWASP', 'Penetration Testing',
  'Vulnerability Assessment', 'SOC 2', 'ISO 27001',

  // Architecture & methodology
  'Microservices', 'Monolith', 'Serverless', 'Event-Driven',
  'Domain-Driven Design', 'DDD', 'TDD', 'BDD',
  'SOLID', 'Design Patterns', 'System Design',
  'Clean Architecture', 'CQRS', 'Event Sourcing',

  // OS & platforms
  'Linux', 'Ubuntu', 'CentOS', 'Windows Server', 'macOS',
  'Raspberry Pi', 'Arduino', 'IoT',

  // Misc
  'Webpack', 'Vite', 'Rollup', 'esbuild', 'Babel', 'SWC',
  'ESLint', 'Prettier', 'Husky', 'Lerna', 'Nx', 'Turborepo',
  'Monorepo', 'npm', 'yarn', 'pnpm',
  'WebRTC', 'PWA', 'Service Workers', 'Web Workers',
  'Accessibility', 'WCAG', 'SEO',
  'Blockchain', 'Solidity', 'Ethereum', 'Web3',
  'Unity', 'Unreal Engine',
];

// Build a case-insensitive lookup map
const SKILL_MAP = new Map<string, string>();
for (const skill of SKILL_DICTIONARY) {
  SKILL_MAP.set(skill.toLowerCase(), skill);
}

// ---------------------------------------------------------------------------
// Section header patterns
// ---------------------------------------------------------------------------

const SECTION_PATTERNS: Record<string, RegExp> = {
  required: /\b(requirements?|required|must\s+have|qualifications?|minimum\s+qualifications?|what\s+you('ll)?\s+need|what\s+we('re)?\s+looking\s+for|key\s+requirements?)\b/i,
  preferred: /\b(preferred|nice\s+to\s+have|bonus|plus|desired|additional|good\s+to\s+have|ideally|optional)\b/i,
  responsibilities: /\b(responsibilities|what\s+you('ll)?\s+do|role|duties|job\s+description|about\s+the\s+role|the\s+role|you\s+will)\b/i,
  education: /\b(education|degree|academic|qualification)\b/i,
};

// ---------------------------------------------------------------------------
// Extraction helpers
// ---------------------------------------------------------------------------

function extractYears(text: string): number | null {
  const matches = text.match(/(\d+)\+?\s*(?:years?|yrs?)/gi);
  if (!matches) return null;

  let maxYears = 0;
  for (const match of matches) {
    const num = parseInt(match.match(/\d+/)?.[0] || '0', 10);
    if (num > maxYears && num <= 30) maxYears = num;
  }
  return maxYears > 0 ? maxYears : null;
}

function extractEducation(text: string): string {
  const degreePatterns = [
    /(?:bachelor'?s?|master'?s?|phd|doctorate|b\.?tech|m\.?tech|mba|b\.?sc|m\.?sc|b\.?e\.?|m\.?e\.?|b\.?a\.?|m\.?a\.?|b\.?com|m\.?com|b\.?s\.?|m\.?s\.?)\s*(?:degree)?\s*(?:in\s+[a-z\s,&]+)?/gi,
  ];

  const results: string[] = [];
  for (const pattern of degreePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        const cleaned = match.trim().replace(/\s+/g, ' ');
        if (cleaned.length > 2 && !results.includes(cleaned)) {
          results.push(cleaned);
        }
      }
    }
  }

  if (results.length > 0) return results.join(' or ');

  // Fallback: check for generic mentions
  if (/\b(degree|diploma|graduate|undergraduate|postgraduate)\b/i.test(text)) {
    return 'Degree required (see job description for specifics)';
  }

  return '';
}

function extractSkillsFromText(text: string): string[] {
  const found = new Set<string>();

  // Try to match each skill in the dictionary against the text
  for (const [lowerSkill, originalSkill] of SKILL_MAP) {
    // Build a regex that matches the skill as a whole word/phrase
    // Escape special regex characters in the skill name
    const escaped = lowerSkill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`\\b${escaped}\\b`, 'i');

    if (pattern.test(text)) {
      found.add(originalSkill);
    }
  }

  // Also handle common compound patterns that may not be in dictionary
  const compoundPatterns = [
    { pattern: /\bCI\s*\/?\s*CD\b/i, skill: 'CI/CD' },
    { pattern: /\bREST\s*(?:ful)?\s*API/i, skill: 'REST API' },
    { pattern: /\bUI\s*\/?\s*UX\b/i, skill: 'UI/UX' },
    { pattern: /\bReact\s*\.?\s*js\b/i, skill: 'React.js' },
    { pattern: /\bNode\s*\.?\s*js\b/i, skill: 'Node.js' },
    { pattern: /\bVue\s*\.?\s*js\b/i, skill: 'Vue.js' },
    { pattern: /\bNext\s*\.?\s*js\b/i, skill: 'Next.js' },
    { pattern: /\bExpress\s*\.?\s*js\b/i, skill: 'Express.js' },
    { pattern: /\bReact\s+Native\b/i, skill: 'React Native' },
    { pattern: /\bMachine\s+Learning\b/i, skill: 'Machine Learning' },
    { pattern: /\bDeep\s+Learning\b/i, skill: 'Deep Learning' },
    { pattern: /\bNatural\s+Language\s+Processing\b/i, skill: 'NLP' },
    { pattern: /\bComputer\s+Vision\b/i, skill: 'Computer Vision' },
    { pattern: /\bData\s+Science\b/i, skill: 'Data Science' },
    { pattern: /\bPower\s+BI\b/i, skill: 'Power BI' },
    { pattern: /\bAdobe\s+XD\b/i, skill: 'Adobe XD' },
    { pattern: /\bGitHub\s+Actions\b/i, skill: 'GitHub Actions' },
    { pattern: /\bGitLab\s+CI\b/i, skill: 'GitLab CI' },
    { pattern: /\bSpring\s+Boot\b/i, skill: 'Spring Boot' },
    { pattern: /\bRuby\s+on\s+Rails\b/i, skill: 'Ruby on Rails' },
    { pattern: /\bGoogle\s+Cloud\b/i, skill: 'GCP' },
    { pattern: /\bAmazon\s+Web\s+Services\b/i, skill: 'AWS' },
    { pattern: /\bMicrosoft\s+Azure\b/i, skill: 'Azure' },
  ];

  for (const { pattern, skill } of compoundPatterns) {
    if (pattern.test(text)) {
      found.add(skill);
    }
  }

  return Array.from(found);
}

function extractExperienceKeywords(text: string): string[] {
  const actionWords = [
    'build', 'scale', 'optimize', 'design', 'develop', 'implement',
    'architect', 'lead', 'manage', 'mentor', 'collaborate', 'deliver',
    'deploy', 'maintain', 'integrate', 'automate', 'analyze', 'improve',
    'debug', 'troubleshoot', 'test', 'monitor', 'migrate', 'refactor',
    'review', 'document', 'communicate', 'coordinate', 'prioritize',
    'ship', 'iterate', 'prototype', 'research', 'evaluate',
    'configure', 'provision', 'secure', 'audit', 'validate',
  ];

  const found = new Set<string>();
  const lower = text.toLowerCase();

  for (const word of actionWords) {
    const pattern = new RegExp(`\\b${word}(?:s|ing|ed|e)?\\b`, 'i');
    if (pattern.test(lower)) {
      found.add(word);
    }
  }

  return Array.from(found);
}

function extractRoleKeywords(text: string): string[] {
  const roleTerms = [
    'frontend', 'front-end', 'backend', 'back-end', 'full-stack',
    'full stack', 'fullstack', 'devops', 'sre', 'platform',
    'infrastructure', 'data', 'machine learning', 'ml', 'ai',
    'mobile', 'ios', 'android', 'embedded', 'firmware',
    'security', 'cloud', 'distributed', 'systems', 'site reliability',
    'quality assurance', 'qa', 'test automation',
    'solutions architect', 'technical lead', 'tech lead',
    'engineering manager', 'staff engineer', 'principal engineer',
    'senior', 'junior', 'mid-level', 'intern',
    'product', 'growth', 'performance', 'reliability',
  ];

  const found = new Set<string>();
  const lower = text.toLowerCase();

  for (const term of roleTerms) {
    if (lower.includes(term)) {
      found.add(term);
    }
  }

  return Array.from(found);
}

// ---------------------------------------------------------------------------
// Section splitter
// ---------------------------------------------------------------------------

interface Sections {
  required: string;
  preferred: string;
  responsibilities: string;
  full: string;
}

function splitIntoSections(jdText: string): Sections {
  const lines = jdText.split('\n');
  const sections: Sections = {
    required: '',
    preferred: '',
    responsibilities: '',
    full: jdText,
  };

  let currentSection: keyof Omit<Sections, 'full'> | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Check if this line is a section header
    if (SECTION_PATTERNS.preferred.test(trimmed) && trimmed.length < 80) {
      currentSection = 'preferred';
      continue;
    }
    if (SECTION_PATTERNS.required.test(trimmed) && trimmed.length < 80) {
      currentSection = 'required';
      continue;
    }
    if (SECTION_PATTERNS.responsibilities.test(trimmed) && trimmed.length < 80) {
      currentSection = 'responsibilities';
      continue;
    }

    if (currentSection) {
      sections[currentSection] += trimmed + '\n';
    }
  }

  return sections;
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { jdText } = body as { jdText?: string };

    // Validate
    if (!jdText || typeof jdText !== 'string' || !jdText.trim()) {
      return NextResponse.json(
        { error: 'jdText is required and must be a non-empty string' },
        { status: 400 },
      );
    }

    if (jdText.length > 20000) {
      return NextResponse.json(
        { error: 'jdText is too long. Maximum 20,000 characters.' },
        { status: 400 },
      );
    }

    const trimmed = jdText.trim();
    const sections = splitIntoSections(trimmed);

    // Extract skills from different sections
    const requiredSource = sections.required || sections.full;
    const preferredSource = sections.preferred;

    const allSkills = extractSkillsFromText(sections.full);
    const requiredSkills = sections.required
      ? extractSkillsFromText(requiredSource)
      : allSkills;
    const preferredSkills = preferredSource
      ? extractSkillsFromText(preferredSource).filter(
          (s) => !requiredSkills.includes(s),
        )
      : [];

    // If no section distinction was found, put all skills as required
    const finalRequired = requiredSkills.length > 0 ? requiredSkills : allSkills;
    const finalPreferred = preferredSkills;

    const experienceKeywords = extractExperienceKeywords(sections.full);
    const educationRequirements = extractEducation(sections.full);
    const roleKeywords = extractRoleKeywords(sections.full);
    const yearsRequired = extractYears(sections.full);

    return NextResponse.json({
      requiredSkills: finalRequired,
      preferredSkills: finalPreferred,
      experienceKeywords,
      educationRequirements: educationRequirements || null,
      roleKeywords,
      yearsRequired: yearsRequired ?? null,
    });
  } catch (error) {
    const message =
      error instanceof SyntaxError
        ? 'Invalid JSON in request body'
        : 'Internal server error';
    const status = error instanceof SyntaxError ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
