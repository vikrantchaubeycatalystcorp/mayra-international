// @ts-nocheck — template renders transformed data with flexible field names
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { TemplateId, SectionConfig } from '@/lib/resume/types';

/* eslint-disable @typescript-eslint/no-explicit-any */
/** The template receives a transformed data object with extra convenience fields.
 *  We use a permissive interface to avoid coupling to the store's exact shape. */
interface ResumeData {
  personalInfo?: { name?: string; email?: string; phone?: string; location?: string; linkedin?: string; website?: string };
  personal?: any;
  summary?: string;
  education?: any[];
  experience?: any[];
  projects?: any[];
  skills?: any[];
  certifications?: any[];
  achievements?: any[];
  sections?: SectionConfig[];
  templateId?: TemplateId;
  accentColor?: string;
  [key: string]: any;
}

/* ------------------------------------------------------------------ */
/*  Template metadata                                                  */
/* ------------------------------------------------------------------ */

export const templateOptions: {
  id: TemplateId;
  name: string;
  description: string;
}[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional single-column layout with clean lines and bold headings.',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Accent-colored borders and badge-style skills for a fresh look.',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Ultra-clean design with maximum whitespace and subtle typography.',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Corporate two-tone header with structured grid layout.',
  },
];

/* ------------------------------------------------------------------ */
/*  Shared section-rendering helpers                                   */
/* ------------------------------------------------------------------ */

function SummarySection({ data }: { data: ResumeData }) {
  if (!data.summary?.trim()) return null;
  return <p className="text-sm leading-relaxed text-gray-700">{data.summary}</p>;
}

function EducationSection({
  data,
  dateClass,
}: {
  data: ResumeData;
  dateClass?: string;
}) {
  if (!data.education?.length) return null;
  return (
    <div className="space-y-3">
      {data.education.map((edu, i) => (
        <div key={i}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-sm text-gray-900">
                {edu.institution}
              </p>
              <p className="text-sm text-gray-700">
                {edu.degree}
                {edu.field ? `, ${edu.field}` : ''}
                {edu.gpa ? ` | GPA: ${edu.gpa}` : ''}
              </p>
            </div>
            {(edu.startDate || edu.endDate) && (
              <span
                className={cn(
                  'shrink-0 text-xs text-gray-500 whitespace-nowrap',
                  dateClass,
                )}
              >
                {edu.startDate}
                {edu.endDate ? ` - ${edu.endDate}` : ''}
              </span>
            )}
          </div>
          {edu.description && (
            <p className="mt-1 text-xs text-gray-600">{edu.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function ExperienceSection({
  data,
  dateClass,
}: {
  data: ResumeData;
  dateClass?: string;
}) {
  if (!data.experience?.length) return null;
  return (
    <div className="space-y-4">
      {data.experience.map((exp, i) => (
        <div key={i}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-sm text-gray-900">
                {exp.role || exp.title}
              </p>
              <p className="text-sm text-gray-600">{exp.company}</p>
            </div>
            {(exp.startDate || exp.endDate) && (
              <span
                className={cn(
                  'shrink-0 text-xs text-gray-500 whitespace-nowrap',
                  dateClass,
                )}
              >
                {exp.startDate}
                {exp.endDate ? ` - ${exp.endDate}` : ' - Present'}
              </span>
            )}
          </div>
          {exp.bullets?.length ? (
            <ul className="mt-1.5 list-disc list-outside pl-4 space-y-0.5">
              {exp.bullets.map((b, j) => (
                <li key={j} className="text-xs text-gray-700 leading-relaxed">
                  {b}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function ProjectsSection({ data }: { data: ResumeData }) {
  if (!data.projects?.length) return null;
  return (
    <div className="space-y-3">
      {data.projects.map((proj, i) => (
        <div key={i}>
          <p className="font-semibold text-sm text-gray-900">
            {proj.name}
            {proj.url && (
              <span className="font-normal text-xs text-gray-500 ml-2">
                {proj.url}
              </span>
            )}
          </p>
          {proj.description && (
            <p className="text-xs text-gray-600 mt-0.5">{proj.description}</p>
          )}
          {proj.bullets?.length ? (
            <ul className="mt-1 list-disc list-outside pl-4 space-y-0.5">
              {proj.bullets.map((b, j) => (
                <li key={j} className="text-xs text-gray-700 leading-relaxed">
                  {b}
                </li>
              ))}
            </ul>
          ) : null}
          {proj.techStack?.length ? (
            <p className="mt-1 text-xs text-gray-500">
              <span className="font-medium">Tech:</span>{' '}
              {proj.techStack.join(', ')}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function SkillsSectionClassic({ data }: { data: ResumeData }) {
  if (!data.skills?.length) return null;
  return (
    <div className="space-y-1">
      {data.skills.map((group, i) => (
        <p key={i} className="text-xs text-gray-700">
          <span className="font-semibold">{group.category}: </span>
          {group.items.join(', ')}
        </p>
      ))}
    </div>
  );
}

function SkillsSectionBadges({
  data,
  accentColor,
}: {
  data: ResumeData;
  accentColor: string;
}) {
  if (!data.skills?.length) return null;
  return (
    <div className="space-y-2">
      {data.skills.map((group, i) => (
        <div key={i}>
          <p className="text-xs font-semibold text-gray-700 mb-1">
            {group.category}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {group.items.map((skill, j) => (
              <span
                key={j}
                className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: `${accentColor}15`,
                  color: accentColor,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SkillsSectionGrid({ data }: { data: ResumeData }) {
  if (!data.skills?.length) return null;
  return (
    <div className="space-y-1.5">
      {data.skills.map((group, i) => (
        <div key={i} className="flex gap-2 text-xs">
          <span className="font-semibold text-gray-800 min-w-[100px]">
            {group.category}
          </span>
          <span className="text-gray-600">{group.items.join(' / ')}</span>
        </div>
      ))}
    </div>
  );
}

function CertificationsSection({ data }: { data: ResumeData }) {
  if (!data.certifications?.length) return null;
  return (
    <div className="space-y-1.5">
      {data.certifications.map((cert, i) => (
        <div key={i} className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900">{cert.name}</p>
            {cert.issuer && (
              <p className="text-xs text-gray-500">{cert.issuer}</p>
            )}
          </div>
          {cert.date && (
            <span className="shrink-0 text-xs text-gray-500">
              {cert.date}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function AchievementsSection({ data }: { data: ResumeData }) {
  if (!data.achievements?.length) return null;
  return (
    <ul className="list-disc list-outside pl-4 space-y-1">
      {data.achievements.map((a, i) => (
        <li key={i} className="text-xs text-gray-700 leading-relaxed">
          {typeof a === 'string' ? a : a.description ?? a.title}
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/*  Section dispatcher                                                 */
/* ------------------------------------------------------------------ */

function renderSection(
  sectionId: string,
  data: ResumeData,
  variant: 'classic' | 'modern' | 'minimal' | 'professional',
) {
  switch (sectionId) {
    case 'summary':
      return <SummarySection data={data} />;
    case 'education':
      return <EducationSection data={data} />;
    case 'experience':
      return <ExperienceSection data={data} />;
    case 'projects':
      return <ProjectsSection data={data} />;
    case 'skills':
      if (variant === 'modern')
        return (
          <SkillsSectionBadges
            data={data}
            accentColor={data.accentColor ?? '#2563eb'}
          />
        );
      if (variant === 'professional')
        return <SkillsSectionGrid data={data} />;
      return <SkillsSectionClassic data={data} />;
    case 'certifications':
      return <CertificationsSection data={data} />;
    case 'achievements':
      return <AchievementsSection data={data} />;
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Visible sections helper                                            */
/* ------------------------------------------------------------------ */

function getVisibleSections(sections?: SectionConfig[]): SectionConfig[] {
  if (!sections?.length) return [];
  return [...sections]
    .filter((s) => s.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

const SECTION_LABELS: Record<string, string> = {
  summary: 'Summary',
  education: 'Education',
  experience: 'Work Experience',
  projects: 'Projects',
  skills: 'Skills',
  certifications: 'Certifications',
  achievements: 'Achievements',
};

/* ------------------------------------------------------------------ */
/*  Template 1: Classic                                                */
/* ------------------------------------------------------------------ */

function ClassicTemplate({
  data,
  sections,
}: {
  data: ResumeData;
  sections: SectionConfig[];
}) {
  const accent = data.accentColor ?? '#1f2937';

  return (
    <div id="resume-print-area" className="bg-white p-10 font-sans">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          {data.personalInfo?.name}
        </h1>
        {data.personalInfo && (
          <p className="mt-1 text-xs text-gray-600">
            {[
              data.personalInfo.email,
              data.personalInfo.phone,
              data.personalInfo.location,
              data.personalInfo.linkedin,
              data.personalInfo.website,
            ]
              .filter(Boolean)
              .join('  |  ')}
          </p>
        )}
      </div>

      {/* Sections */}
      <div className="space-y-5">
        {sections.map((section) => {
          const content = renderSection(section.id, data, 'classic');
          if (!content) return null;
          return (
            <div key={section.id}>
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-800 mb-1">
                {SECTION_LABELS[section.id] ?? section.id}
              </h2>
              <div
                className="mb-3"
                style={{
                  height: 1,
                  backgroundColor: accent,
                  opacity: 0.4,
                }}
              />
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Template 2: Modern                                                 */
/* ------------------------------------------------------------------ */

function ModernTemplate({
  data,
  sections,
}: {
  data: ResumeData;
  sections: SectionConfig[];
}) {
  const accent = data.accentColor ?? '#2563eb';

  return (
    <div id="resume-print-area" className="bg-white p-10 font-sans">
      {/* Header */}
      <div
        className="rounded-md px-6 py-4 mb-6"
        style={{ backgroundColor: `${accent}08` }}
      >
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: accent }}
        >
          {data.personalInfo?.name}
        </h1>
        {data.personalInfo && (
          <p className="mt-1 text-xs text-gray-600">
            {[
              data.personalInfo.email,
              data.personalInfo.phone,
              data.personalInfo.location,
              data.personalInfo.linkedin,
              data.personalInfo.website,
            ]
              .filter(Boolean)
              .join('  |  ')}
          </p>
        )}
      </div>

      {/* Sections */}
      <div className="space-y-5">
        {sections.map((section) => {
          const content = renderSection(section.id, data, 'modern');
          if (!content) return null;
          return (
            <div key={section.id}>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-1 self-stretch rounded-full"
                  style={{ backgroundColor: accent }}
                />
                <h2 className="text-sm font-bold text-gray-800">
                  {SECTION_LABELS[section.id] ?? section.id}
                </h2>
              </div>
              <div className="pl-4">{content}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Template 3: Minimal                                                */
/* ------------------------------------------------------------------ */

function MinimalTemplate({
  data,
  sections,
}: {
  data: ResumeData;
  sections: SectionConfig[];
}) {
  return (
    <div id="resume-print-area" className="bg-white p-12 font-sans">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-xl font-semibold text-gray-800 tracking-wide">
          {data.personalInfo?.name}
        </h1>
        {data.personalInfo && (
          <p className="mt-1.5 text-[11px] text-gray-400">
            {[
              data.personalInfo.email,
              data.personalInfo.phone,
              data.personalInfo.location,
              data.personalInfo.linkedin,
              data.personalInfo.website,
            ]
              .filter(Boolean)
              .join('   |   ')}
          </p>
        )}
      </div>

      {/* Sections */}
      <div className="space-y-5">
        {sections.map((section, idx) => {
          const content = renderSection(section.id, data, 'minimal');
          if (!content) return null;
          return (
            <div key={section.id}>
              {idx > 0 && (
                <div className="border-t border-gray-100 mb-4" />
              )}
              <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400 mb-2">
                {SECTION_LABELS[section.id] ?? section.id}
              </h2>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Template 4: Professional                                           */
/* ------------------------------------------------------------------ */

function ProfessionalTemplate({
  data,
  sections,
}: {
  data: ResumeData;
  sections: SectionConfig[];
}) {
  const accent = data.accentColor ?? '#1e40af';

  return (
    <div id="resume-print-area" className="bg-white font-sans">
      {/* Two-tone header */}
      <div
        className="px-10 py-6 flex items-center justify-between"
        style={{ backgroundColor: accent }}
      >
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {data.personalInfo?.name}
        </h1>
        {data.personalInfo && (
          <div className="text-right text-[11px] text-white/90 space-y-0.5">
            {data.personalInfo.email && <p>{data.personalInfo.email}</p>}
            {data.personalInfo.phone && <p>{data.personalInfo.phone}</p>}
            {data.personalInfo.location && (
              <p>{data.personalInfo.location}</p>
            )}
            {data.personalInfo.linkedin && (
              <p>{data.personalInfo.linkedin}</p>
            )}
            {data.personalInfo.website && (
              <p>{data.personalInfo.website}</p>
            )}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-10 py-8 space-y-5">
        {sections.map((section) => {
          const content = renderSection(section.id, data, 'professional');
          if (!content) return null;
          return (
            <div key={section.id}>
              <h2
                className="text-sm font-bold mb-2"
                style={{ color: accent }}
              >
                {SECTION_LABELS[section.id] ?? section.id}
              </h2>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main export: ResumeTemplate                                        */
/* ------------------------------------------------------------------ */

export function ResumeTemplate({
  data,
  scale = 1,
}: {
  data: ResumeData;
  scale?: number;
}) {
  const visibleSections = getVisibleSections(data.sections);

  const templateMap: Record<
    TemplateId,
    React.FC<{ data: ResumeData; sections: SectionConfig[] }>
  > = {
    classic: ClassicTemplate,
    modern: ModernTemplate,
    minimal: MinimalTemplate,
    professional: ProfessionalTemplate,
  };

  const Template = templateMap[data.templateId] ?? ClassicTemplate;

  return (
    <div
      className="origin-top-left"
      style={{
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        width: scale !== 1 ? `${100 / scale}%` : undefined,
      }}
    >
      <Template data={data} sections={visibleSections} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Template thumbnail / selector card                                 */
/* ------------------------------------------------------------------ */

export function TemplateThumbnail({
  templateId,
  selected,
  onClick,
}: {
  templateId: TemplateId;
  selected: boolean;
  onClick: () => void;
}) {
  const meta = templateOptions.find((t) => t.id === templateId);
  if (!meta) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex flex-col rounded-lg border-2 p-3 text-left transition-all',
        'hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600',
        selected
          ? 'border-primary-600 ring-2 ring-primary-600/30 bg-primary-50'
          : 'border-gray-200 bg-white hover:border-gray-300',
      )}
    >
      {/* Mini preview skeleton */}
      <div className="mb-2.5 w-full aspect-[210/297] rounded bg-gray-50 border border-gray-100 overflow-hidden p-2">
        <TemplateMiniPreview templateId={templateId} />
      </div>

      <p
        className={cn(
          'text-sm font-semibold',
          selected ? 'text-primary-700' : 'text-gray-800',
        )}
      >
        {meta.name}
      </p>
      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
        {meta.description}
      </p>

      {selected && (
        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary-600 flex items-center justify-center">
          <svg
            className="h-3 w-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Tiny skeleton preview inside thumbnail                             */
/* ------------------------------------------------------------------ */

function TemplateMiniPreview({ templateId }: { templateId: TemplateId }) {
  const bar = 'rounded-full bg-gray-300';
  const barAccent = 'rounded-full bg-primary-300';
  const line = 'rounded-full bg-gray-200';

  if (templateId === 'classic') {
    return (
      <div className="flex flex-col items-center gap-1.5 pt-2">
        <div className={cn(bar, 'h-1.5 w-14')} />
        <div className={cn(line, 'h-0.5 w-20')} />
        <div className="w-full mt-2 space-y-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="space-y-0.5">
              <div className={cn(bar, 'h-1 w-12')} />
              <div className="border-t border-gray-200" />
              <div className={cn(line, 'h-0.5 w-full')} />
              <div className={cn(line, 'h-0.5 w-4/5')} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (templateId === 'modern') {
    return (
      <div className="flex flex-col gap-1.5 pt-1">
        <div className="bg-primary-50 rounded px-1.5 py-1">
          <div className={cn(barAccent, 'h-1.5 w-14')} />
          <div className={cn(line, 'h-0.5 w-20 mt-0.5')} />
        </div>
        <div className="space-y-2 mt-1">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex gap-1">
              <div className="w-0.5 rounded-full bg-primary-400 self-stretch" />
              <div className="flex-1 space-y-0.5">
                <div className={cn(bar, 'h-1 w-10')} />
                <div className={cn(line, 'h-0.5 w-full')} />
                <div className={cn(line, 'h-0.5 w-3/4')} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (templateId === 'minimal') {
    return (
      <div className="flex flex-col items-center gap-1.5 pt-3">
        <div className={cn(bar, 'h-1 w-12')} />
        <div className={cn(line, 'h-0.5 w-16')} />
        <div className="w-full mt-3 space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="space-y-0.5">
              <div className={cn('h-0.5 w-8 rounded-full bg-gray-200')} />
              <div className={cn(line, 'h-0.5 w-full')} />
              <div className={cn(line, 'h-0.5 w-5/6')} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // professional
  return (
    <div className="flex flex-col gap-1.5">
      <div className="bg-primary-600 rounded px-1.5 py-1.5 flex items-center justify-between">
        <div className="h-1.5 w-10 rounded-full bg-white/80" />
        <div className="space-y-0.5">
          <div className="h-0.5 w-8 rounded-full bg-white/50" />
          <div className="h-0.5 w-6 rounded-full bg-white/50" />
        </div>
      </div>
      <div className="space-y-2 mt-0.5 px-0.5">
        {[1, 2, 3].map((n) => (
          <div key={n} className="space-y-0.5">
            <div className={cn(barAccent, 'h-1 w-10')} />
            <div className={cn(line, 'h-0.5 w-full')} />
            <div className={cn(line, 'h-0.5 w-4/5')} />
          </div>
        ))}
      </div>
    </div>
  );
}
