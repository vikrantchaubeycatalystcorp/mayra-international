import { NextResponse } from 'next/server';
import { scoreResume } from '@/lib/resume/scoring';
import type { ResumeData } from '@/lib/resume/types';

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resume } = body as { resume?: ResumeData };

    // Validate the resume object exists
    if (!resume || typeof resume !== 'object') {
      return NextResponse.json(
        { error: 'resume is required and must be an object' },
        { status: 400 },
      );
    }

    // Validate required top-level fields
    if (!resume.personal || typeof resume.personal !== 'object') {
      return NextResponse.json(
        { error: 'resume.personal is required' },
        { status: 400 },
      );
    }

    if (!Array.isArray(resume.education)) {
      return NextResponse.json(
        { error: 'resume.education must be an array' },
        { status: 400 },
      );
    }

    if (!Array.isArray(resume.experience)) {
      return NextResponse.json(
        { error: 'resume.experience must be an array' },
        { status: 400 },
      );
    }

    if (!Array.isArray(resume.projects)) {
      return NextResponse.json(
        { error: 'resume.projects must be an array' },
        { status: 400 },
      );
    }

    if (!Array.isArray(resume.skills)) {
      return NextResponse.json(
        { error: 'resume.skills must be an array' },
        { status: 400 },
      );
    }

    if (!Array.isArray(resume.sections)) {
      return NextResponse.json(
        { error: 'resume.sections must be an array' },
        { status: 400 },
      );
    }

    if (typeof resume.summary !== 'string') {
      return NextResponse.json(
        { error: 'resume.summary must be a string' },
        { status: 400 },
      );
    }

    // Ensure optional arrays default
    const safeResume: ResumeData = {
      personal: resume.personal,
      summary: resume.summary,
      education: resume.education,
      experience: resume.experience,
      projects: resume.projects,
      skills: resume.skills,
      certifications: Array.isArray(resume.certifications)
        ? resume.certifications
        : [],
      achievements: Array.isArray(resume.achievements)
        ? resume.achievements
        : [],
      sections: resume.sections,
      templateId: resume.templateId || 'classic',
      accentColor: resume.accentColor || '#4f46e5',
    };

    const result = scoreResume(safeResume);

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof SyntaxError
        ? 'Invalid JSON in request body'
        : 'Internal server error';
    const status = error instanceof SyntaxError ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
