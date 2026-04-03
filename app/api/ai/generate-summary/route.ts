import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Segment = 'fresher' | 'internship' | 'experienced';

interface RequestBody {
  targetRole?: string;
  skills?: string[];
  experience?: string;
  segment?: Segment;
}

// ---------------------------------------------------------------------------
// Template helpers
// ---------------------------------------------------------------------------

function pickTopSkills(skills: string[], count: number): string {
  return skills.slice(0, count).join(', ') || 'relevant technologies';
}

function inferField(targetRole: string): string {
  const lower = targetRole.toLowerCase();
  if (/\b(frontend|front-end|react|angular|vue|ui)\b/.test(lower))
    return 'Frontend Development';
  if (/\b(backend|back-end|node|django|spring|api)\b/.test(lower))
    return 'Backend Development';
  if (/\b(full.?stack|fullstack)\b/.test(lower))
    return 'Full-Stack Development';
  if (/\b(data\s*scien|machine\s*learn|ml|ai|deep\s*learn)\b/.test(lower))
    return 'Data Science & Machine Learning';
  if (/\b(data\s*analy|business\s*analy|bi|analytics)\b/.test(lower))
    return 'Data Analytics';
  if (/\b(devops|sre|infrastructure|cloud)\b/.test(lower))
    return 'DevOps & Cloud Engineering';
  if (/\b(mobile|android|ios|flutter|react\s*native)\b/.test(lower))
    return 'Mobile Development';
  if (/\b(design|ux|ui\/ux|product\s*design)\b/.test(lower))
    return 'Product Design & UX';
  if (/\b(security|cyber|infosec)\b/.test(lower))
    return 'Cybersecurity';
  if (/\b(project\s*manag|program\s*manag|scrum|agile)\b/.test(lower))
    return 'Project Management';
  if (/\b(market|seo|growth|digital)\b/.test(lower))
    return 'Digital Marketing';
  if (/\b(product\s*manag)\b/.test(lower))
    return 'Product Management';
  return 'Technology';
}

function inferDomain(targetRole: string): string {
  const lower = targetRole.toLowerCase();
  if (/\b(web|frontend|backend|full.?stack)\b/.test(lower)) return 'web development';
  if (/\b(data|ml|ai|analytics)\b/.test(lower)) return 'data-driven solutions';
  if (/\b(mobile|android|ios)\b/.test(lower)) return 'mobile applications';
  if (/\b(cloud|devops|infra)\b/.test(lower)) return 'cloud infrastructure';
  if (/\b(security|cyber)\b/.test(lower)) return 'security solutions';
  return 'software engineering';
}

// ---------------------------------------------------------------------------
// ATS Concise variant
// ---------------------------------------------------------------------------

function generateAtsConcise(
  targetRole: string,
  skills: string[],
  experience: string,
  segment: Segment,
): string {
  const field = inferField(targetRole);
  const topSkills = pickTopSkills(skills, 4);
  const techSkills = pickTopSkills(skills, 3);

  switch (segment) {
    case 'fresher':
      return (
        `Motivated ${field} graduate with strong foundation in ${topSkills}. ` +
        `Passionate about ${targetRole} roles with hands-on project experience in ${techSkills}. ` +
        `Seeking to leverage technical expertise to deliver value in ${field}.`
      );
    case 'internship':
      return (
        `Ambitious ${field} student seeking ${targetRole} internship. ` +
        `Proficient in ${topSkills} with academic projects demonstrating practical application. ` +
        `Quick learner eager to contribute to real-world ${inferDomain(targetRole)} challenges.`
      );
    case 'experienced':
      return (
        `Results-driven ${targetRole} professional with ${experience || 'significant experience'}. ` +
        `Proven track record in ${techSkills} delivering measurable outcomes. ` +
        `Skilled in ${topSkills} with a focus on ${inferDomain(targetRole)}.`
      );
  }
}

// ---------------------------------------------------------------------------
// Storytelling variant
// ---------------------------------------------------------------------------

function generateStorytelling(
  targetRole: string,
  skills: string[],
  experience: string,
  segment: Segment,
): string {
  const field = inferField(targetRole);
  const topSkill = skills[0] || 'technology';
  const techSkills = pickTopSkills(skills, 3);
  const domain = inferDomain(targetRole);

  switch (segment) {
    case 'fresher':
      return (
        `From the first line of code I wrote, I knew ${field} was where I belonged. ` +
        `Through academic projects and self-driven learning in ${techSkills}, ` +
        `I have built a strong technical foundation. Now I am ready to bring my enthusiasm ` +
        `for ${topSkill} and problem-solving mindset to a ${targetRole} role where I can grow and make an impact.`
      );
    case 'internship':
      return (
        `What started as curiosity about ${domain} has grown into a genuine passion for building solutions. ` +
        `As a student with hands-on experience in ${techSkills}, ` +
        `I thrive on turning complex problems into clean, working code. ` +
        `I am looking for an internship where I can learn from experienced engineers while contributing fresh ideas.`
      );
    case 'experienced':
      return (
        `Over ${experience || 'my career'}, I have developed a deep expertise in ${techSkills} ` +
        `and a passion for solving complex ${domain} challenges. ` +
        `I bring not just technical skill, but a collaborative spirit and a drive to mentor others. ` +
        `My goal is to join a team where innovation and quality code go hand in hand.`
      );
  }
}

// ---------------------------------------------------------------------------
// Leadership variant
// ---------------------------------------------------------------------------

function generateLeadership(
  targetRole: string,
  skills: string[],
  experience: string,
  segment: Segment,
): string {
  const field = inferField(targetRole);
  const topSkills = pickTopSkills(skills, 3);
  const domain = inferDomain(targetRole);

  switch (segment) {
    case 'fresher':
      return (
        `${field} graduate with a strategic mindset and strong command of ${topSkills}. ` +
        `Demonstrated leadership through academic projects and team collaborations. ` +
        `Poised to drive innovation and deliver high-impact results in ${targetRole} positions.`
      );
    case 'internship':
      return (
        `Proactive ${field} student with leadership experience in academic and extracurricular settings. ` +
        `Skilled in ${topSkills} with a focus on delivering quality outcomes. ` +
        `Seeking a ${targetRole} internship to apply strategic thinking and technical skills to real-world challenges.`
      );
    case 'experienced':
      return (
        `Strategic ${targetRole} leader with ${experience || 'extensive experience'} ` +
        `driving ${domain} initiatives. Expert in ${topSkills} with a proven ability ` +
        `to build high-performing teams, define technical vision, and deliver complex projects on time. ` +
        `Passionate about mentoring talent and scaling engineering excellence.`
      );
  }
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    const { targetRole, skills, experience, segment } = body;

    // Validate required fields
    if (!targetRole || typeof targetRole !== 'string' || !targetRole.trim()) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'targetRole is required and must be a non-empty string' } },
        { status: 400 },
      );
    }

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'skills is required and must be a non-empty array of strings' } },
        { status: 400 },
      );
    }

    const validSegments: Segment[] = ['fresher', 'internship', 'experienced'];
    if (!segment || !validSegments.includes(segment)) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'segment is required and must be one of: fresher, internship, experienced' } },
        { status: 400 },
      );
    }

    const cleanSkills = skills
      .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
      .map((s) => s.trim());

    if (cleanSkills.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'skills array must contain at least one non-empty string' } },
        { status: 400 },
      );
    }

    const expStr = typeof experience === 'string' ? experience.trim() : '';

    return NextResponse.json({
      success: true,
      variants: [
        {
          style: 'ats_concise' as const,
          text: generateAtsConcise(targetRole.trim(), cleanSkills, expStr, segment),
        },
        {
          style: 'storytelling' as const,
          text: generateStorytelling(targetRole.trim(), cleanSkills, expStr, segment),
        },
        {
          style: 'leadership' as const,
          text: generateLeadership(targetRole.trim(), cleanSkills, expStr, segment),
        },
      ],
    });
  } catch (error) {
    const message =
      error instanceof SyntaxError
        ? 'Invalid JSON in request body'
        : 'Internal server error';
    const code = error instanceof SyntaxError ? 'VALIDATION_ERROR' : 'SERVER_ERROR';
    const status = error instanceof SyntaxError ? 400 : 500;
    return NextResponse.json({ success: false, error: { code, message } }, { status });
  }
}
