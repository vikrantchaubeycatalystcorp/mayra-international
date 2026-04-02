import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Strong action verbs to replace weak openings
// ---------------------------------------------------------------------------

const STRONG_VERBS = [
  'Led', 'Built', 'Designed', 'Developed', 'Implemented', 'Created',
  'Automated', 'Optimized', 'Spearheaded', 'Architected', 'Streamlined',
  'Delivered', 'Reduced', 'Increased', 'Launched', 'Engineered',
  'Orchestrated', 'Transformed',
];

const WEAK_OPENERS: Record<string, string> = {
  'responsible for': 'Led',
  'worked on': 'Built',
  'helped with': 'Delivered',
  'assisted in': 'Supported',
  'participated in': 'Contributed to',
  'was responsible for': 'Led',
  'was involved in': 'Drove',
  'tasked with': 'Executed',
  'in charge of': 'Managed',
  'handled': 'Managed',
};

const FILLER_WORDS = [
  'various', 'multiple', 'several', 'different', 'successfully',
  'effectively', 'basically', 'actually', 'really', 'very',
  'just', 'simply',
];

const QUANTIFICATION_RE =
  /\d+%|\$[\d,]+|[\d,]+\s+(users|customers|projects|teams|hours|days|months|clients|requests|endpoints)/;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function replaceWeakOpener(bullet: string): { text: string; replaced: boolean } {
  const lower = bullet.toLowerCase();
  for (const [weak, strong] of Object.entries(WEAK_OPENERS)) {
    if (lower.startsWith(weak)) {
      const rest = bullet.slice(weak.length).trimStart();
      return { text: `${strong} ${rest}`, replaced: true };
    }
  }
  return { text: bullet, replaced: false };
}

function removeFiller(text: string): string {
  let result = text;
  for (const word of FILLER_WORDS) {
    const re = new RegExp(`\\b${word}\\b\\s*`, 'gi');
    result = result.replace(re, '');
  }
  // Clean up double spaces
  return result.replace(/\s{2,}/g, ' ').trim();
}

function startsWithStrongVerb(text: string): boolean {
  const firstWord = text.split(/\s+/)[0]?.replace(/[^a-zA-Z]/g, '');
  return STRONG_VERBS.some(
    (v) => v.toLowerCase() === firstWord?.toLowerCase(),
  );
}

function ensureStrongVerbStart(text: string): string {
  if (startsWithStrongVerb(text)) return text;
  // Pick a contextually reasonable verb
  const lower = text.toLowerCase();
  if (lower.includes('build') || lower.includes('creat') || lower.includes('develop'))
    return `Built ${lowercaseFirst(text)}`;
  if (lower.includes('design'))
    return `Designed ${lowercaseFirst(text)}`;
  if (lower.includes('improv') || lower.includes('optimiz') || lower.includes('enhanc'))
    return `Optimized ${lowercaseFirst(text)}`;
  if (lower.includes('manag') || lower.includes('lead') || lower.includes('team'))
    return `Led ${lowercaseFirst(text)}`;
  if (lower.includes('automat'))
    return `Automated ${lowercaseFirst(text)}`;
  if (lower.includes('launch') || lower.includes('deploy') || lower.includes('releas'))
    return `Launched ${lowercaseFirst(text)}`;
  if (lower.includes('reduc') || lower.includes('cut') || lower.includes('decreas'))
    return `Reduced ${lowercaseFirst(text)}`;
  if (lower.includes('increas') || lower.includes('grew') || lower.includes('boost'))
    return `Increased ${lowercaseFirst(text)}`;
  // Default: pick a random strong verb
  const verb = STRONG_VERBS[Math.floor(Math.random() * 6)];
  return `${verb} ${lowercaseFirst(text)}`;
}

function lowercaseFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function trimToWordRange(text: string, min: number, max: number): string {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length > max) {
    return words.slice(0, max).join(' ');
  }
  return words.join(' ');
}

function hasMetrics(text: string): boolean {
  return QUANTIFICATION_RE.test(text);
}

function addMetricPlaceholders(text: string): string {
  let result = text;
  // Add placeholders based on context
  if (/\b(performance|speed|faster|efficiency)\b/i.test(text) && !hasMetrics(text)) {
    result = result.replace(
      /\b(performance|speed|efficiency)\b/i,
      '$1 by [X%]',
    );
  } else if (/\b(users|customers|clients)\b/i.test(text) && !hasMetrics(text)) {
    result = result.replace(
      /\b(users|customers|clients)\b/i,
      '[N] $1',
    );
  } else if (/\b(time|hours|days)\b/i.test(text) && !hasMetrics(text)) {
    result = result.replace(
      /\b(time|hours|days)\b/i,
      '$1 by [X hours]',
    );
  } else if (!hasMetrics(text)) {
    // Append generic metric suggestion
    result += ', resulting in [X%] improvement';
  }
  return result;
}

// ---------------------------------------------------------------------------
// Variant generators
// ---------------------------------------------------------------------------

function generateConcise(bullet: string): { text: string; changes: string } {
  let text = bullet;
  const changes: string[] = [];

  // Replace weak opener
  const { text: afterWeak, replaced } = replaceWeakOpener(text);
  if (replaced) {
    text = afterWeak;
    changes.push('Replaced weak opener with strong action verb');
  }

  // Remove filler
  const afterFiller = removeFiller(text);
  if (afterFiller.length < text.length) {
    text = afterFiller;
    changes.push('Removed filler words');
  }

  // Ensure strong verb start
  if (!startsWithStrongVerb(text)) {
    text = ensureStrongVerbStart(text);
    changes.push('Added strong action verb');
  }

  // Trim to concise length (12-18 words)
  text = trimToWordRange(text, 10, 18);
  text = capitalize(text.trim());

  if (changes.length === 0) changes.push('Shortened for conciseness');

  return { text, changes: changes.join('; ') };
}

function generateBalanced(bullet: string): { text: string; changes: string } {
  let text = bullet;
  const changes: string[] = [];

  // Replace weak opener
  const { text: afterWeak, replaced } = replaceWeakOpener(text);
  if (replaced) {
    text = afterWeak;
    changes.push('Replaced weak opener with action verb');
  }

  // Remove filler
  const afterFiller = removeFiller(text);
  if (afterFiller.length < text.length) {
    text = afterFiller;
    changes.push('Removed filler words');
  }

  // Ensure strong verb start
  if (!startsWithStrongVerb(text)) {
    text = ensureStrongVerbStart(text);
    changes.push('Added strong action verb');
  }

  // Ensure "action -> what -> result" structure
  // If no result clause, hint at one
  if (!/\b(resulting in|leading to|enabling|achieving|improving|reducing|increasing|saving)\b/i.test(text)) {
    if (!hasMetrics(text)) {
      text += ', improving overall efficiency';
      changes.push('Added result clause for action-what-result structure');
    }
  }

  text = trimToWordRange(text, 15, 25);
  text = capitalize(text.trim());

  if (changes.length === 0) changes.push('Restructured to action-what-result format');

  return { text, changes: changes.join('; ') };
}

function generateImpactHeavy(bullet: string): { text: string; changes: string } {
  let text = bullet;
  const changes: string[] = [];

  // Replace weak opener
  const { text: afterWeak, replaced } = replaceWeakOpener(text);
  if (replaced) {
    text = afterWeak;
    changes.push('Replaced weak opener with strong action verb');
  }

  // Remove filler
  const afterFiller = removeFiller(text);
  if (afterFiller.length < text.length) {
    text = afterFiller;
    changes.push('Removed filler words');
  }

  // Ensure strong verb start
  if (!startsWithStrongVerb(text)) {
    text = ensureStrongVerbStart(text);
    changes.push('Added strong action verb');
  }

  // Add metric placeholders if missing
  if (!hasMetrics(text)) {
    text = addMetricPlaceholders(text);
    changes.push('Added metric placeholders for quantifiable impact');
  }

  text = trimToWordRange(text, 15, 25);
  text = capitalize(text.trim());

  if (changes.length === 0) changes.push('Emphasized outcomes and metrics');

  return { text, changes: changes.join('; ') };
}

// ---------------------------------------------------------------------------
// Metrics prompt generator
// ---------------------------------------------------------------------------

function generateMetricsPrompt(bullet: string): string | null {
  if (hasMetrics(bullet)) return null;

  const lower = bullet.toLowerCase();
  if (/\b(team|managed|led|supervised)\b/.test(lower))
    return 'How many team members did you manage or lead?';
  if (/\b(users|customers|clients|traffic)\b/.test(lower))
    return 'How many users/customers were impacted?';
  if (/\b(revenue|sales|cost|budget|save)\b/.test(lower))
    return 'What was the dollar amount or percentage of revenue/cost impact?';
  if (/\b(performance|speed|faster|latency|response)\b/.test(lower))
    return 'By what percentage did performance improve?';
  if (/\b(time|hours|days|process|workflow|automat)\b/.test(lower))
    return 'How much time was saved (hours per week/month)?';
  if (/\b(build|built|develop|creat|design|implement)\b/.test(lower))
    return 'How many features, components, or systems did you build? What was the scale?';
  return 'Can you add a specific number, percentage, or metric to quantify your impact?';
}

// ---------------------------------------------------------------------------
// Confidence calculator
// ---------------------------------------------------------------------------

function calculateConfidence(bullet: string): 'high' | 'medium' | 'low' {
  const wc = wordCount(bullet);
  let score = 0;

  if (wc >= 8) score++;
  if (wc <= 40) score++;
  if (hasMetrics(bullet)) score++;
  if (startsWithStrongVerb(bullet)) score++;
  if (!/^(responsible|worked|helped|assisted|participated)/i.test(bullet)) score++;

  if (score >= 4) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bullet, targetRole, context } = body as {
      bullet?: string;
      targetRole?: string;
      context?: string;
    };

    // Validate
    if (!bullet || typeof bullet !== 'string' || !bullet.trim()) {
      return NextResponse.json(
        { error: 'Bullet text is required and must be a non-empty string' },
        { status: 400 },
      );
    }

    const trimmedBullet = bullet.trim();

    if (trimmedBullet.length < 5) {
      return NextResponse.json(
        { error: 'Bullet text is too short. Provide at least 5 characters.' },
        { status: 400 },
      );
    }

    if (trimmedBullet.length > 1000) {
      return NextResponse.json(
        { error: 'Bullet text is too long. Maximum 1000 characters.' },
        { status: 400 },
      );
    }

    // Generate variants
    const concise = generateConcise(trimmedBullet);
    const balanced = generateBalanced(trimmedBullet);
    const impactHeavy = generateImpactHeavy(trimmedBullet);

    const metricsPrompt = generateMetricsPrompt(trimmedBullet);
    const confidence = calculateConfidence(trimmedBullet);

    return NextResponse.json({
      variants: [
        { style: 'concise' as const, text: concise.text, changes: concise.changes },
        { style: 'balanced' as const, text: balanced.text, changes: balanced.changes },
        { style: 'impact_heavy' as const, text: impactHeavy.text, changes: impactHeavy.changes },
      ],
      metrics_prompt: metricsPrompt,
      confidence,
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
