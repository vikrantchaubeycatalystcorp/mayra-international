import type { ResumeData, ScoreResult, ScoreIssue } from './types';

// ---------------------------------------------------------------------------
// Action verbs for impact language analysis
// ---------------------------------------------------------------------------

const ACTION_VERBS = new Set([
  'led', 'built', 'designed', 'developed', 'implemented', 'created',
  'managed', 'achieved', 'improved', 'reduced', 'increased', 'launched',
  'delivered', 'automated', 'optimized', 'spearheaded', 'architected',
  'streamlined', 'mentored', 'coordinated', 'established', 'engineered',
  'executed', 'facilitated', 'generated', 'initiated', 'maintained',
  'negotiated', 'orchestrated', 'pioneered', 'restructured', 'revamped',
  'scaled', 'secured', 'simplified', 'supervised', 'transformed',
  'unified', 'upgraded', 'analyzed', 'configured', 'consolidated',
  'customized', 'debugged', 'deployed', 'diagnosed', 'documented',
  'enhanced', 'integrated', 'migrated', 'monitored', 'overhauled',
  'refactored', 'resolved', 'tested', 'trained', 'triaged',
]);

const QUANTIFICATION_RE =
  /\d+%?|\$[\d,]+|[\d,]+\s+(users|customers|projects|teams|hours|days|months)/;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function collectAllBullets(data: ResumeData): string[] {
  const bullets: string[] = [];
  for (const exp of data.experience) {
    for (const b of exp.bullets) {
      if (b.trim()) bullets.push(b.trim());
    }
  }
  for (const proj of data.projects) {
    for (const b of proj.bullets) {
      if (b.trim()) bullets.push(b.trim());
    }
  }
  return bullets;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function isSectionVisible(data: ResumeData, sectionId: string): boolean {
  const sec = data.sections.find((s) => s.id === sectionId);
  return sec ? sec.visible : true;
}

function isSectionEmpty(data: ResumeData, sectionId: string): boolean {
  switch (sectionId) {
    case 'summary':
      return !data.summary.trim();
    case 'education':
      return data.education.every((e) => !e.institution.trim() && !e.degree.trim());
    case 'experience':
      return data.experience.every((e) => !e.company.trim() && !e.role.trim());
    case 'projects':
      return data.projects.every((p) => !p.name.trim());
    case 'skills':
      return data.skills.every((g) => g.skills.length === 0);
    case 'certifications':
      return data.certifications.length === 0 ||
        data.certifications.every((c) => !c.name.trim());
    case 'achievements':
      return data.achievements.length === 0 ||
        data.achievements.every((a) => !a.title.trim());
    default:
      return false;
  }
}

function startsWithActionVerb(bullet: string): boolean {
  const firstWord = bullet.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
  return ACTION_VERBS.has(firstWord);
}

function hasAllCaps(text: string): boolean {
  // Detect sequences of 3+ uppercase letters that are not common acronyms
  return /\b[A-Z]{3,}\b/.test(text);
}

function hasExcessivePunctuation(text: string): boolean {
  return /[!]{2,}|[.]{4,}|[?]{2,}/.test(text);
}

// ---------------------------------------------------------------------------
// Dimension scorers
// ---------------------------------------------------------------------------

function scoreAtsStructure(data: ResumeData, issues: ScoreIssue[]): number {
  let score = 0;

  // Standard section names & single column: auto-pass (built-in)

  if (data.personal.email.trim()) {
    score += 15;
  } else {
    issues.push({
      severity: 'critical',
      section: 'personal',
      message: 'Missing email address',
      fix: 'Add your email address in the personal information section',
    });
  }

  if (data.personal.phone.trim()) {
    score += 10;
  } else {
    issues.push({
      severity: 'warning',
      section: 'personal',
      message: 'Missing phone number',
      fix: 'Add a phone number to improve recruiter contact options',
    });
  }

  if (data.personal.name.trim()) {
    score += 15;
  } else {
    issues.push({
      severity: 'critical',
      section: 'personal',
      message: 'Missing name',
      fix: 'Add your full name in the personal information section',
    });
  }

  // Deduct for empty visible sections
  const sectionIds = ['summary', 'education', 'experience', 'projects', 'skills', 'certifications', 'achievements'];
  for (const id of sectionIds) {
    if (isSectionVisible(data, id) && isSectionEmpty(data, id)) {
      score -= 10;
      issues.push({
        severity: 'warning',
        section: id,
        message: `Section "${id}" is visible but empty`,
        fix: `Either fill in the ${id} section or hide it from the section settings`,
      });
    }
  }

  // Education has institution and degree filled
  const hasCompleteEdu = data.education.some(
    (e) => e.institution.trim() && e.degree.trim(),
  );
  if (hasCompleteEdu) {
    score += 15;
  } else {
    issues.push({
      severity: 'critical',
      section: 'education',
      message: 'No education entry with both institution and degree',
      fix: 'Add at least one complete education entry',
    });
  }

  // Experience entries have company and role
  const hasCompleteExp = data.experience.some(
    (e) => e.company.trim() && e.role.trim(),
  );
  if (hasCompleteExp) {
    score += 15;
  }

  // Has at least one skill
  const totalSkills = data.skills.reduce((sum, g) => sum + g.skills.length, 0);
  if (totalSkills >= 1) {
    score += 15;
  }

  return Math.max(0, Math.min(100, score));
}

function scoreCompleteness(data: ResumeData, issues: ScoreIssue[]): number {
  let earned = 0;
  const maxPossible = 100;

  // Personal: name, email, phone, location (each +5 = 20 max)
  if (data.personal.name.trim()) earned += 5;
  if (data.personal.email.trim()) earned += 5;
  if (data.personal.phone.trim()) earned += 5;
  if (data.personal.location.trim()) earned += 5;

  // Summary filled and > 50 chars
  if (data.summary.trim().length > 50) {
    earned += 15;
  } else if (data.summary.trim()) {
    issues.push({
      severity: 'warning',
      section: 'summary',
      message: 'Summary is too short (under 50 characters)',
      fix: 'Expand your summary to at least 2-3 sentences describing your professional profile',
    });
  } else {
    issues.push({
      severity: 'warning',
      section: 'summary',
      message: 'Summary is missing',
      fix: 'Add a professional summary highlighting your key skills and experience',
    });
  }

  // At least 1 complete education entry
  const hasCompleteEdu = data.education.some(
    (e) => e.institution.trim() && e.degree.trim(),
  );
  if (hasCompleteEdu) earned += 15;

  // At least 1 experience entry with bullets
  const hasExpWithBullets = data.experience.some(
    (e) => e.company.trim() && e.role.trim() && e.bullets.some((b) => b.trim()),
  );
  if (hasExpWithBullets) earned += 15;

  // At least 1 project
  const hasProject = data.projects.some((p) => p.name.trim());
  if (hasProject) {
    earned += 10;
  } else {
    issues.push({
      severity: 'suggestion',
      section: 'projects',
      message: 'No projects listed',
      fix: 'Add at least one project to showcase your practical skills',
    });
  }

  // At least 3 skills total
  const totalSkills = data.skills.reduce((sum, g) => sum + g.skills.length, 0);
  if (totalSkills >= 3) earned += 10;

  // Has certifications
  const hasCerts = data.certifications.some((c) => c.name.trim());
  if (hasCerts) {
    earned += 5;
  } else {
    issues.push({
      severity: 'suggestion',
      section: 'certifications',
      message: 'No certifications listed',
      fix: 'Add relevant certifications to strengthen your profile',
    });
  }

  // Has achievements
  const hasAchievements = data.achievements.some((a) => a.title.trim());
  if (hasAchievements) earned += 10;

  return Math.round((earned / maxPossible) * 100);
}

function scoreImpactLanguage(data: ResumeData, issues: ScoreIssue[]): number {
  const bullets = collectAllBullets(data);
  if (bullets.length === 0) return 0;

  let actionVerbCount = 0;

  for (const bullet of bullets) {
    if (startsWithActionVerb(bullet)) {
      actionVerbCount++;
    } else {
      issues.push({
        severity: 'warning',
        section: 'experience',
        message: `Bullet does not start with a strong action verb: "${bullet.slice(0, 60)}${bullet.length > 60 ? '...' : ''}"`,
        fix: 'Start with a verb like Led, Built, Designed, Implemented, or Achieved',
      });
    }
  }

  return Math.round((actionVerbCount / bullets.length) * 100);
}

function scoreQuantification(data: ResumeData, issues: ScoreIssue[]): number {
  const bullets = collectAllBullets(data);
  if (bullets.length === 0) return 0;

  let quantifiedCount = 0;

  for (const bullet of bullets) {
    if (QUANTIFICATION_RE.test(bullet)) {
      quantifiedCount++;
    } else {
      issues.push({
        severity: 'suggestion',
        section: 'experience',
        message: `Bullet lacks quantification: "${bullet.slice(0, 60)}${bullet.length > 60 ? '...' : ''}"`,
        fix: 'Add numbers, percentages, or metrics to demonstrate measurable impact',
      });
    }
  }

  return Math.min(100, Math.round((quantifiedCount / bullets.length) * 150));
}

function scoreReadability(data: ResumeData, issues: ScoreIssue[]): number {
  const bullets = collectAllBullets(data);
  let totalChecks = 0;
  let passedChecks = 0;

  // Check each bullet word count
  for (const bullet of bullets) {
    const wc = wordCount(bullet);
    totalChecks++;

    if (wc >= 10 && wc <= 25) {
      passedChecks++;
    } else if (wc > 40) {
      issues.push({
        severity: 'suggestion',
        section: 'experience',
        message: `Bullet is too long (${wc} words): "${bullet.slice(0, 50)}..."`,
        fix: 'Keep bullet points between 10-25 words for optimal readability',
      });
    }
  }

  // Summary word count
  if (data.summary.trim()) {
    totalChecks++;
    const summaryWc = wordCount(data.summary);
    if (summaryWc >= 30 && summaryWc <= 80) {
      passedChecks++;
    }
  }

  // No ALL CAPS in bullets
  for (const bullet of bullets) {
    totalChecks++;
    if (!hasAllCaps(bullet)) {
      passedChecks++;
    }
  }

  // No excessive punctuation in bullets
  for (const bullet of bullets) {
    totalChecks++;
    if (!hasExcessivePunctuation(bullet)) {
      passedChecks++;
    }
  }

  if (totalChecks === 0) return 0;
  return Math.round((passedChecks / totalChecks) * 100);
}

function scoreConsistency(data: ResumeData, issues: ScoreIssue[]): number {
  let score = 0;

  // All experience entries have dates
  const filledExperiences = data.experience.filter(
    (e) => e.company.trim() || e.role.trim(),
  );
  if (filledExperiences.length > 0) {
    const allHaveDates = filledExperiences.every(
      (e) => e.startDate.trim() && (e.endDate.trim() || e.current),
    );
    if (allHaveDates) score += 20;
  } else {
    score += 20;
  }

  // Date formats consistent (check if all use same format pattern)
  const expDates = filledExperiences
    .flatMap((e) => [e.startDate, e.endDate])
    .filter((d) => d.trim());
  if (expDates.length >= 2) {
    const hasSlash = expDates.some((d) => d.includes('/'));
    const hasDash = expDates.some((d) => d.includes('-'));
    const hasSpace = expDates.some((d) => /[A-Za-z]/.test(d));
    const formatCount = [hasSlash, hasDash, hasSpace].filter(Boolean).length;
    if (formatCount <= 1) {
      score += 20;
    } else {
      issues.push({
        severity: 'warning',
        section: 'experience',
        message: 'Date formats are inconsistent across experience entries',
        fix: 'Use a consistent date format (e.g., "Jan 2023" or "2023-01") across all entries',
      });
    }
  } else {
    score += 20;
  }

  // All education entries have years
  const filledEducation = data.education.filter(
    (e) => e.institution.trim() || e.degree.trim(),
  );
  if (filledEducation.length > 0) {
    const allHaveYears = filledEducation.every(
      (e) => e.startDate.trim() || e.endDate.trim(),
    );
    if (allHaveYears) score += 20;
  } else {
    score += 20;
  }

  // Skills have at least 2 groups
  const nonEmptyGroups = data.skills.filter((g) => g.skills.length > 0);
  if (nonEmptyGroups.length >= 2) {
    score += 20;
  }

  // No duplicate skills across groups
  const allSkills = data.skills.flatMap((g) =>
    g.skills.map((s) => s.toLowerCase().trim()),
  );
  const uniqueSkills = new Set(allSkills);
  if (allSkills.length === uniqueSkills.size) {
    score += 20;
  } else {
    issues.push({
      severity: 'warning',
      section: 'skills',
      message: 'Duplicate skills found across skill groups',
      fix: 'Remove duplicate skills so each skill appears in only one group',
    });
  }

  return score;
}

// ---------------------------------------------------------------------------
// Suggestion generators (non-dimensional)
// ---------------------------------------------------------------------------

function addGeneralSuggestions(data: ResumeData, issues: ScoreIssue[]): void {
  if (!data.personal.linkedin.trim() && !data.personal.github.trim()) {
    issues.push({
      severity: 'suggestion',
      section: 'personal',
      message: 'No GitHub or LinkedIn links provided',
      fix: 'Add your GitHub and/or LinkedIn profile links for recruiters',
    });
  }

  const allSectionsEmpty =
    !data.summary.trim() &&
    data.education.every((e) => !e.institution.trim()) &&
    data.experience.every((e) => !e.company.trim()) &&
    data.projects.every((p) => !p.name.trim()) &&
    data.skills.every((g) => g.skills.length === 0);

  if (allSectionsEmpty) {
    issues.push({
      severity: 'critical',
      section: 'general',
      message: 'All sections are empty',
      fix: 'Start filling in your resume sections to get a meaningful score',
    });
  }
}

// ---------------------------------------------------------------------------
// Main scoring function
// ---------------------------------------------------------------------------

export function scoreResume(data: ResumeData): ScoreResult {
  const issues: ScoreIssue[] = [];

  const atsStructure = scoreAtsStructure(data, issues);
  const completeness = scoreCompleteness(data, issues);
  const impactLanguage = scoreImpactLanguage(data, issues);
  const quantification = scoreQuantification(data, issues);
  const readability = scoreReadability(data, issues);
  const consistency = scoreConsistency(data, issues);

  addGeneralSuggestions(data, issues);

  // Sort: critical first, then warnings, then suggestions
  const severityOrder: Record<string, number> = {
    critical: 0,
    warning: 1,
    suggestion: 2,
  };
  issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const overall = Math.round(
    atsStructure * 0.2 +
    completeness * 0.25 +
    impactLanguage * 0.2 +
    quantification * 0.15 +
    readability * 0.1 +
    consistency * 0.1,
  );

  return {
    overall,
    breakdown: {
      atsStructure,
      completeness,
      impactLanguage,
      quantification,
      readability,
      consistency,
    },
    issues,
  };
}

// ---------------------------------------------------------------------------
// Utility exports
// ---------------------------------------------------------------------------

export function getScoreColor(score: number): string {
  if (score <= 40) return 'text-red-500';
  if (score <= 60) return 'text-orange-500';
  if (score <= 80) return 'text-yellow-500';
  return 'text-green-500';
}

export function getScoreLabel(score: number): string {
  if (score <= 40) return 'Needs Work';
  if (score <= 60) return 'Fair';
  if (score <= 80) return 'Good';
  return 'Excellent';
}
