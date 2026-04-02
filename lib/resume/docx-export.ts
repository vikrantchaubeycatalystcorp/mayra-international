import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  TabStopPosition,
  TabStopType,
  ExternalHyperlink,
  convertInchesToTwip,
} from 'docx';
import type { ResumeData, SectionConfig } from './types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FONT = 'Calibri';
const BODY_SIZE = 22; // half-points (11pt)
const NAME_SIZE = 28; // half-points (14pt)
const HEADING_SIZE = 24; // half-points (12pt)
const SMALL_SIZE = 18; // half-points (9pt)
const MARGIN = convertInchesToTwip(1);

// Tab stop for right-aligned dates (6.5 inches from left at 1-inch margins)
const DATE_TAB = convertInchesToTwip(6.5);

// ---------------------------------------------------------------------------
// Public export function
// ---------------------------------------------------------------------------

export async function generateDocx(data: ResumeData): Promise<Blob> {
  const sections = getVisibleSections(data);
  const children: Paragraph[] = [];

  // --- Header: Name ---
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: data.personal.name || 'Your Name',
          bold: true,
          size: NAME_SIZE,
          font: FONT,
        }),
      ],
    }),
  );

  // --- Contact line ---
  const contactParts = buildContactParts(data);
  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: contactParts,
      }),
    );
  }

  // --- Sections ---
  for (const section of sections) {
    const sectionParagraphs = renderSection(section.id, data);
    if (sectionParagraphs.length > 0) {
      children.push(...sectionParagraphs);
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: MARGIN,
              right: MARGIN,
              bottom: MARGIN,
              left: MARGIN,
            },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}

// ---------------------------------------------------------------------------
// Contact line builder
// ---------------------------------------------------------------------------

function buildContactParts(data: ResumeData): Array<TextRun | ExternalHyperlink> {
  const parts: Array<TextRun | ExternalHyperlink> = [];
  const separator = () =>
    new TextRun({ text: '  |  ', size: SMALL_SIZE, font: FONT });

  const { email, phone, location, linkedin, github, portfolio } =
    data.personal;

  if (email) {
    if (parts.length > 0) parts.push(separator());
    parts.push(
      new ExternalHyperlink({
        link: `mailto:${email}`,
        children: [
          new TextRun({
            text: email,
            size: SMALL_SIZE,
            font: FONT,
            style: 'Hyperlink',
          }),
        ],
      }),
    );
  }

  if (phone) {
    if (parts.length > 0) parts.push(separator());
    parts.push(new TextRun({ text: phone, size: SMALL_SIZE, font: FONT }));
  }

  if (location) {
    if (parts.length > 0) parts.push(separator());
    parts.push(new TextRun({ text: location, size: SMALL_SIZE, font: FONT }));
  }

  if (linkedin) {
    if (parts.length > 0) parts.push(separator());
    const url = linkedin.startsWith('http') ? linkedin : `https://${linkedin}`;
    parts.push(
      new ExternalHyperlink({
        link: url,
        children: [
          new TextRun({
            text: linkedin.replace(/^https?:\/\//, ''),
            size: SMALL_SIZE,
            font: FONT,
            style: 'Hyperlink',
          }),
        ],
      }),
    );
  }

  if (github) {
    if (parts.length > 0) parts.push(separator());
    const url = github.startsWith('http') ? github : `https://${github}`;
    parts.push(
      new ExternalHyperlink({
        link: url,
        children: [
          new TextRun({
            text: github.replace(/^https?:\/\//, ''),
            size: SMALL_SIZE,
            font: FONT,
            style: 'Hyperlink',
          }),
        ],
      }),
    );
  }

  if (portfolio) {
    if (parts.length > 0) parts.push(separator());
    const url = portfolio.startsWith('http')
      ? portfolio
      : `https://${portfolio}`;
    parts.push(
      new ExternalHyperlink({
        link: url,
        children: [
          new TextRun({
            text: portfolio.replace(/^https?:\/\//, ''),
            size: SMALL_SIZE,
            font: FONT,
            style: 'Hyperlink',
          }),
        ],
      }),
    );
  }

  return parts;
}

// ---------------------------------------------------------------------------
// Visible sections helper
// ---------------------------------------------------------------------------

function getVisibleSections(data: ResumeData): SectionConfig[] {
  return [...data.sections]
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);
}

// ---------------------------------------------------------------------------
// Section heading with bottom border
// ---------------------------------------------------------------------------

function sectionHeading(title: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 80 },
    border: {
      bottom: {
        color: '000000',
        space: 1,
        style: BorderStyle.SINGLE,
        size: 6,
      },
    },
    children: [
      new TextRun({
        text: title.toUpperCase(),
        bold: true,
        size: HEADING_SIZE,
        font: FONT,
      }),
    ],
  });
}

// ---------------------------------------------------------------------------
// Section renderer dispatch
// ---------------------------------------------------------------------------

function renderSection(sectionId: string, data: ResumeData): Paragraph[] {
  switch (sectionId) {
    case 'summary':
      return renderSummary(data);
    case 'education':
      return renderEducation(data);
    case 'experience':
      return renderExperience(data);
    case 'projects':
      return renderProjects(data);
    case 'skills':
      return renderSkills(data);
    case 'certifications':
      return renderCertifications(data);
    case 'achievements':
      return renderAchievements(data);
    default:
      return [];
  }
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

function renderSummary(data: ResumeData): Paragraph[] {
  const text = data.summary.trim();
  if (!text) return [];

  return [
    sectionHeading('Summary'),
    new Paragraph({
      spacing: { after: 80 },
      children: [new TextRun({ text, size: BODY_SIZE, font: FONT })],
    }),
  ];
}

// ---------------------------------------------------------------------------
// Education
// ---------------------------------------------------------------------------

function renderEducation(data: ResumeData): Paragraph[] {
  const entries = data.education.filter(
    (e) => e.institution.trim() || e.degree.trim(),
  );
  if (entries.length === 0) return [];

  const paragraphs: Paragraph[] = [sectionHeading('Education')];

  for (const edu of entries) {
    const dateStr = formatDateRange(edu.startDate, edu.endDate);

    // Line 1: Institution (left) — Dates (right-aligned tab)
    paragraphs.push(
      new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: DATE_TAB }],
        spacing: { after: 20 },
        children: [
          new TextRun({
            text: edu.institution,
            bold: true,
            size: BODY_SIZE,
            font: FONT,
          }),
          ...(dateStr
            ? [
                new TextRun({ text: '\t', size: BODY_SIZE, font: FONT }),
                new TextRun({
                  text: dateStr,
                  italics: true,
                  size: BODY_SIZE,
                  font: FONT,
                }),
              ]
            : []),
        ],
      }),
    );

    // Line 2: Degree + Field + GPA
    const degreeParts: string[] = [];
    if (edu.degree) degreeParts.push(edu.degree);
    if (edu.field) degreeParts.push(`in ${edu.field}`);
    if (edu.cgpa) degreeParts.push(`| GPA: ${edu.cgpa}`);

    if (degreeParts.length > 0) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: degreeParts.join(' '),
              italics: true,
              size: BODY_SIZE,
              font: FONT,
            }),
          ],
        }),
      );
    }
  }

  return paragraphs;
}

// ---------------------------------------------------------------------------
// Experience
// ---------------------------------------------------------------------------

function renderExperience(data: ResumeData): Paragraph[] {
  const entries = data.experience.filter(
    (e) => e.company.trim() || e.role.trim(),
  );
  if (entries.length === 0) return [];

  const paragraphs: Paragraph[] = [sectionHeading('Experience')];

  for (const exp of entries) {
    const endDate = exp.current ? 'Present' : exp.endDate;
    const dateStr = formatDateRange(exp.startDate, endDate);

    // Line 1: Company — Dates
    paragraphs.push(
      new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: DATE_TAB }],
        spacing: { after: 20 },
        children: [
          new TextRun({
            text: exp.company,
            bold: true,
            size: BODY_SIZE,
            font: FONT,
          }),
          ...(dateStr
            ? [
                new TextRun({ text: '\t', size: BODY_SIZE, font: FONT }),
                new TextRun({
                  text: dateStr,
                  italics: true,
                  size: BODY_SIZE,
                  font: FONT,
                }),
              ]
            : []),
        ],
      }),
    );

    // Line 2: Role
    if (exp.role) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: exp.role,
              italics: true,
              size: BODY_SIZE,
              font: FONT,
            }),
          ],
        }),
      );
    }

    // Bullet points
    const bullets = exp.bullets.filter((b) => b.trim().length > 0);
    for (const bullet of bullets) {
      paragraphs.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 20 },
          children: [
            new TextRun({ text: bullet, size: BODY_SIZE, font: FONT }),
          ],
        }),
      );
    }
  }

  return paragraphs;
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

function renderProjects(data: ResumeData): Paragraph[] {
  const entries = data.projects.filter((p) => p.name.trim());
  if (entries.length === 0) return [];

  const paragraphs: Paragraph[] = [sectionHeading('Projects')];

  for (const proj of entries) {
    // Line 1: Name + Tech Stack
    const titleParts: Array<TextRun | ExternalHyperlink> = [
      new TextRun({
        text: proj.name,
        bold: true,
        size: BODY_SIZE,
        font: FONT,
      }),
    ];

    if (proj.techStack) {
      titleParts.push(
        new TextRun({
          text: `  |  ${proj.techStack}`,
          italics: true,
          size: BODY_SIZE,
          font: FONT,
        }),
      );
    }

    if (proj.link) {
      const url = proj.link.startsWith('http')
        ? proj.link
        : `https://${proj.link}`;
      titleParts.push(
        new TextRun({ text: '  |  ', size: BODY_SIZE, font: FONT }),
      );
      titleParts.push(
        new ExternalHyperlink({
          link: url,
          children: [
            new TextRun({
              text: proj.link.replace(/^https?:\/\//, ''),
              size: BODY_SIZE,
              font: FONT,
              style: 'Hyperlink',
            }),
          ],
        }),
      );
    }

    paragraphs.push(
      new Paragraph({
        spacing: { after: 40 },
        children: titleParts,
      }),
    );

    // Bullet points
    const bullets = proj.bullets.filter((b) => b.trim().length > 0);
    for (const bullet of bullets) {
      paragraphs.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 20 },
          children: [
            new TextRun({ text: bullet, size: BODY_SIZE, font: FONT }),
          ],
        }),
      );
    }
  }

  return paragraphs;
}

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

function renderSkills(data: ResumeData): Paragraph[] {
  const groups = data.skills.filter((g) => g.skills.length > 0);
  if (groups.length === 0) return [];

  const paragraphs: Paragraph[] = [sectionHeading('Skills')];

  for (const group of groups) {
    paragraphs.push(
      new Paragraph({
        spacing: { after: 40 },
        children: [
          new TextRun({
            text: `${group.category}: `,
            bold: true,
            size: BODY_SIZE,
            font: FONT,
          }),
          new TextRun({
            text: group.skills.join(', '),
            size: BODY_SIZE,
            font: FONT,
          }),
        ],
      }),
    );
  }

  return paragraphs;
}

// ---------------------------------------------------------------------------
// Certifications
// ---------------------------------------------------------------------------

function renderCertifications(data: ResumeData): Paragraph[] {
  const entries = data.certifications.filter((c) => c.name.trim());
  if (entries.length === 0) return [];

  const paragraphs: Paragraph[] = [sectionHeading('Certifications')];

  for (const cert of entries) {
    const parts: string[] = [cert.name];
    if (cert.issuer) parts.push(`- ${cert.issuer}`);
    if (cert.date) parts.push(`(${cert.date})`);

    paragraphs.push(
      new Paragraph({
        bullet: { level: 0 },
        spacing: { after: 20 },
        children: [
          new TextRun({
            text: parts.join(' '),
            size: BODY_SIZE,
            font: FONT,
          }),
        ],
      }),
    );
  }

  return paragraphs;
}

// ---------------------------------------------------------------------------
// Achievements
// ---------------------------------------------------------------------------

function renderAchievements(data: ResumeData): Paragraph[] {
  const entries = data.achievements.filter((a) => a.title.trim());
  if (entries.length === 0) return [];

  const paragraphs: Paragraph[] = [sectionHeading('Achievements')];

  for (const ach of entries) {
    const children: TextRun[] = [
      new TextRun({
        text: ach.title,
        bold: true,
        size: BODY_SIZE,
        font: FONT,
      }),
    ];

    if (ach.description) {
      children.push(
        new TextRun({
          text: ` - ${ach.description}`,
          size: BODY_SIZE,
          font: FONT,
        }),
      );
    }

    paragraphs.push(
      new Paragraph({
        bullet: { level: 0 },
        spacing: { after: 20 },
        children,
      }),
    );
  }

  return paragraphs;
}

// ---------------------------------------------------------------------------
// Date formatting helper
// ---------------------------------------------------------------------------

function formatDateRange(start: string, end: string): string {
  const parts: string[] = [];
  if (start) parts.push(start);
  if (end) parts.push(end);
  return parts.join(' - ');
}
