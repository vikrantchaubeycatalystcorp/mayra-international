import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

const genId = (): string => crypto.randomUUID();

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  objective: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  cgpa: string;
  achievements: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface Project {
  id: string;
  name: string;
  techStack: string;
  link: string;
  bullets: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
}

export interface SkillGroup {
  category: string;
  skills: string[];
}

export interface SectionConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

export type TemplateId = 'classic' | 'modern' | 'minimal' | 'professional';

export interface ResumeData {
  personal: PersonalInfo;
  summary: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: SkillGroup[];
  certifications: Certification[];
  achievements: Achievement[];
  sections: SectionConfig[];
  templateId: TemplateId;
  accentColor: string;
}

// ---------------------------------------------------------------------------
// Scoring types
// ---------------------------------------------------------------------------

export interface ScoreResult {
  overall: number;
  breakdown: {
    atsStructure: number;
    completeness: number;
    impactLanguage: number;
    quantification: number;
    readability: number;
    consistency: number;
  };
  issues: ScoreIssue[];
}

export interface ScoreIssue {
  severity: 'critical' | 'warning' | 'suggestion';
  section: string;
  message: string;
  fix?: string;
}

// ---------------------------------------------------------------------------
// Default data
// ---------------------------------------------------------------------------

const blankPersonal: PersonalInfo = {
  name: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  github: '',
  portfolio: '',
  objective: '',
};

const createBlankEducation = (): Education => ({
  id: genId(),
  institution: '',
  degree: '',
  field: '',
  startDate: '',
  endDate: '',
  cgpa: '',
  achievements: '',
});

const createBlankExperience = (): Experience => ({
  id: genId(),
  company: '',
  role: '',
  startDate: '',
  endDate: '',
  current: false,
  bullets: [''],
});

const createBlankProject = (): Project => ({
  id: genId(),
  name: '',
  techStack: '',
  link: '',
  bullets: [''],
});

const createBlankCertification = (): Certification => ({
  id: genId(),
  name: '',
  issuer: '',
  date: '',
  link: '',
});

const createBlankAchievement = (): Achievement => ({
  id: genId(),
  title: '',
  description: '',
});

const defaultSections: SectionConfig[] = [
  { id: 'summary', label: 'Summary', visible: true, order: 0 },
  { id: 'education', label: 'Education', visible: true, order: 1 },
  { id: 'experience', label: 'Experience', visible: true, order: 2 },
  { id: 'projects', label: 'Projects', visible: true, order: 3 },
  { id: 'skills', label: 'Skills', visible: true, order: 4 },
  { id: 'certifications', label: 'Certifications', visible: true, order: 5 },
  { id: 'achievements', label: 'Achievements', visible: true, order: 6 },
];

export const defaultResumeData: ResumeData = {
  personal: { ...blankPersonal },
  summary: '',
  education: [createBlankEducation()],
  experience: [createBlankExperience()],
  projects: [createBlankProject()],
  skills: [
    { category: 'Technical', skills: [] },
    { category: 'Tools & Frameworks', skills: [] },
    { category: 'Soft Skills', skills: [] },
  ],
  certifications: [],
  achievements: [],
  sections: defaultSections,
  templateId: 'classic',
  accentColor: '#4f46e5',
};

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

interface ResumeStore extends ResumeData {
  scoreResult: ScoreResult | null;

  // Personal
  updatePersonal: (field: keyof PersonalInfo, value: string) => void;

  // Summary
  updateSummary: (summary: string) => void;

  // Education
  addEducation: () => void;
  updateEducation: (id: string, field: keyof Education, value: string) => void;
  removeEducation: (id: string) => void;

  // Experience
  addExperience: () => void;
  updateExperience: (
    id: string,
    field: keyof Experience,
    value: string | boolean,
  ) => void;
  addExperienceBullet: (expId: string) => void;
  updateExperienceBullet: (
    expId: string,
    bulletIndex: number,
    value: string,
  ) => void;
  removeExperienceBullet: (expId: string, bulletIndex: number) => void;
  removeExperience: (id: string) => void;

  // Projects
  addProject: () => void;
  updateProject: (
    id: string,
    field: keyof Project,
    value: string,
  ) => void;
  addProjectBullet: (projId: string) => void;
  updateProjectBullet: (
    projId: string,
    bulletIndex: number,
    value: string,
  ) => void;
  removeProjectBullet: (projId: string, bulletIndex: number) => void;
  removeProject: (id: string) => void;

  // Certifications
  addCertification: () => void;
  updateCertification: (
    id: string,
    field: keyof Certification,
    value: string,
  ) => void;
  removeCertification: (id: string) => void;

  // Achievements
  addAchievement: () => void;
  updateAchievement: (
    id: string,
    field: keyof Achievement,
    value: string,
  ) => void;
  removeAchievement: (id: string) => void;

  // Skills
  updateSkillGroup: (index: number, skills: string[]) => void;
  addSkillGroup: (category: string) => void;
  removeSkillGroup: (index: number) => void;

  // Template & accent
  setTemplate: (templateId: TemplateId) => void;
  setAccentColor: (color: string) => void;

  // Sections
  toggleSection: (sectionId: string) => void;
  reorderSections: (sections: SectionConfig[]) => void;

  // Score
  setScore: (score: ScoreResult) => void;

  // Reset
  resetResume: () => void;
}

// ---------------------------------------------------------------------------
// Store implementation
// ---------------------------------------------------------------------------

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      // --- Initial state ---
      ...defaultResumeData,
      scoreResult: null,

      // --- Personal ---
      updatePersonal: (field, value) =>
        set((s) => ({ personal: { ...s.personal, [field]: value } })),

      // --- Summary ---
      updateSummary: (summary) => set({ summary }),

      // --- Education ---
      addEducation: () =>
        set((s) => ({
          education: [...s.education, createBlankEducation()],
        })),

      updateEducation: (id, field, value) =>
        set((s) => ({
          education: s.education.map((e) =>
            e.id === id ? { ...e, [field]: value } : e,
          ),
        })),

      removeEducation: (id) =>
        set((s) => ({
          education: s.education.filter((e) => e.id !== id),
        })),

      // --- Experience ---
      addExperience: () =>
        set((s) => ({
          experience: [...s.experience, createBlankExperience()],
        })),

      updateExperience: (id, field, value) =>
        set((s) => ({
          experience: s.experience.map((e) =>
            e.id === id ? { ...e, [field]: value } : e,
          ),
        })),

      addExperienceBullet: (expId) =>
        set((s) => ({
          experience: s.experience.map((e) =>
            e.id === expId ? { ...e, bullets: [...e.bullets, ''] } : e,
          ),
        })),

      updateExperienceBullet: (expId, bulletIndex, value) =>
        set((s) => ({
          experience: s.experience.map((e) =>
            e.id === expId
              ? {
                  ...e,
                  bullets: e.bullets.map((b, i) =>
                    i === bulletIndex ? value : b,
                  ),
                }
              : e,
          ),
        })),

      removeExperienceBullet: (expId, bulletIndex) =>
        set((s) => ({
          experience: s.experience.map((e) =>
            e.id === expId
              ? { ...e, bullets: e.bullets.filter((_, i) => i !== bulletIndex) }
              : e,
          ),
        })),

      removeExperience: (id) =>
        set((s) => ({
          experience: s.experience.filter((e) => e.id !== id),
        })),

      // --- Projects ---
      addProject: () =>
        set((s) => ({
          projects: [...s.projects, createBlankProject()],
        })),

      updateProject: (id, field, value) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, [field]: value } : p,
          ),
        })),

      addProjectBullet: (projId) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projId ? { ...p, bullets: [...p.bullets, ''] } : p,
          ),
        })),

      updateProjectBullet: (projId, bulletIndex, value) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projId
              ? {
                  ...p,
                  bullets: p.bullets.map((b, i) =>
                    i === bulletIndex ? value : b,
                  ),
                }
              : p,
          ),
        })),

      removeProjectBullet: (projId, bulletIndex) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projId
              ? { ...p, bullets: p.bullets.filter((_, i) => i !== bulletIndex) }
              : p,
          ),
        })),

      removeProject: (id) =>
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
        })),

      // --- Certifications ---
      addCertification: () =>
        set((s) => ({
          certifications: [...s.certifications, createBlankCertification()],
        })),

      updateCertification: (id, field, value) =>
        set((s) => ({
          certifications: s.certifications.map((c) =>
            c.id === id ? { ...c, [field]: value } : c,
          ),
        })),

      removeCertification: (id) =>
        set((s) => ({
          certifications: s.certifications.filter((c) => c.id !== id),
        })),

      // --- Achievements ---
      addAchievement: () =>
        set((s) => ({
          achievements: [...s.achievements, createBlankAchievement()],
        })),

      updateAchievement: (id, field, value) =>
        set((s) => ({
          achievements: s.achievements.map((a) =>
            a.id === id ? { ...a, [field]: value } : a,
          ),
        })),

      removeAchievement: (id) =>
        set((s) => ({
          achievements: s.achievements.filter((a) => a.id !== id),
        })),

      // --- Skills ---
      updateSkillGroup: (index, skills) =>
        set((s) => ({
          skills: s.skills.map((g, i) =>
            i === index ? { ...g, skills } : g,
          ),
        })),

      addSkillGroup: (category) =>
        set((s) => ({
          skills: [...s.skills, { category, skills: [] }],
        })),

      removeSkillGroup: (index) =>
        set((s) => ({
          skills: s.skills.filter((_, i) => i !== index),
        })),

      // --- Template & accent ---
      setTemplate: (templateId) => set({ templateId }),
      setAccentColor: (color) => set({ accentColor: color }),

      // --- Sections ---
      toggleSection: (sectionId) =>
        set((s) => ({
          sections: s.sections.map((sec) =>
            sec.id === sectionId ? { ...sec, visible: !sec.visible } : sec,
          ),
        })),

      reorderSections: (sections) => set({ sections }),

      // --- Score ---
      setScore: (score) => set({ scoreResult: score }),

      // --- Reset ---
      resetResume: () =>
        set({
          ...defaultResumeData,
          // Regenerate IDs so they are fresh
          education: [createBlankEducation()],
          experience: [createBlankExperience()],
          projects: [createBlankProject()],
          skills: [
            { category: 'Technical', skills: [] },
            { category: 'Tools & Frameworks', skills: [] },
            { category: 'Soft Skills', skills: [] },
          ],
          sections: defaultSections.map((s) => ({ ...s })),
          scoreResult: null,
        }),
    }),
    {
      name: 'resume-builder-store',
    },
  ),
);
