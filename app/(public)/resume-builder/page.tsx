"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  FileText, User, GraduationCap, Briefcase, Wrench, Eye, Download,
  ChevronLeft, ChevronRight, Check, Plus, Trash2, Palette, LayoutTemplate,
  Target, AlertCircle, AlertTriangle, Lightbulb, RotateCcw, FolderKanban,
  Award, Trophy, X, GripVertical, Sparkles, Loader2, FileDown, ClipboardCheck, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useResumeStore } from "@/lib/resume/types";
import type { ResumeData, TemplateId, SectionConfig } from "@/lib/resume/types";
import { ResumeTemplate, TemplateThumbnail, templateOptions } from "@/components/resume/ResumeTemplates";
import { scoreResume, getScoreColor, getScoreLabel } from "@/lib/resume/scoring";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const colorPresets = [
  { name: "Indigo", value: "#4f46e5" },
  { name: "Blue", value: "#2563eb" },
  { name: "Emerald", value: "#059669" },
  { name: "Rose", value: "#e11d48" },
  { name: "Amber", value: "#d97706" },
  { name: "Slate", value: "#475569" },
  { name: "Purple", value: "#7c3aed" },
  { name: "Teal", value: "#0d9488" },
];

const sectionIcons: Record<string, React.ElementType> = {
  personal: User, summary: FileText, education: GraduationCap,
  experience: Briefcase, projects: FolderKanban, skills: Wrench,
  certifications: Award, achievements: Trophy,
};

const quickSkills = [
  "Python", "Java", "React", "TypeScript", "SQL", "Git",
  "Machine Learning", "Docker", "AWS", "Communication",
  "Leadership", "Problem Solving",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-input px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none";

/** Map store shape to what ResumeTemplate expects (template uses different field names) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toTemplateData(store: ReturnType<typeof useResumeStore.getState>): any {
  return {
    personal: store.personal,
    personalInfo: {
      name: store.personal.name,
      email: store.personal.email,
      phone: store.personal.phone,
      location: store.personal.location,
      linkedin: store.personal.linkedin,
      website: store.personal.portfolio || store.personal.github,
    },
    summary: store.summary,
    education: store.education.map(e => ({ ...e, gpa: e.cgpa, description: e.achievements })),
    experience: store.experience.map(e => ({ ...e, title: e.role })),
    projects: store.projects.map(p => ({
      ...p, url: p.link, description: "",
      techStack: p.techStack ? p.techStack.split(",").map(s => s.trim()).filter(Boolean) : [],
    })),
    skills: store.skills.map(g => ({ category: g.category, items: g.skills, skills: g.skills })),
    certifications: store.certifications,
    achievements: store.achievements,
    sections: store.sections,
    templateId: store.templateId,
    accentColor: store.accentColor,
  };
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-pulse space-y-4 w-full max-w-2xl px-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-4 bg-gray-200 rounded w-72" />
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function ResumeBuilderPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <LoadingSkeleton />;
  return <ResumeBuilderContent />;
}

function ResumeBuilderContent() {
  // --- Store selectors ---
  const personal = useResumeStore(s => s.personal);
  const updatePersonal = useResumeStore(s => s.updatePersonal);
  const summary = useResumeStore(s => s.summary);
  const updateSummary = useResumeStore(s => s.updateSummary);
  const education = useResumeStore(s => s.education);
  const addEducation = useResumeStore(s => s.addEducation);
  const updateEducation = useResumeStore(s => s.updateEducation);
  const removeEducation = useResumeStore(s => s.removeEducation);
  const experience = useResumeStore(s => s.experience);
  const addExperience = useResumeStore(s => s.addExperience);
  const updateExperience = useResumeStore(s => s.updateExperience);
  const removeExperience = useResumeStore(s => s.removeExperience);
  const addExperienceBullet = useResumeStore(s => s.addExperienceBullet);
  const updateExperienceBullet = useResumeStore(s => s.updateExperienceBullet);
  const removeExperienceBullet = useResumeStore(s => s.removeExperienceBullet);
  const projects = useResumeStore(s => s.projects);
  const addProject = useResumeStore(s => s.addProject);
  const updateProject = useResumeStore(s => s.updateProject);
  const removeProject = useResumeStore(s => s.removeProject);
  const addProjectBullet = useResumeStore(s => s.addProjectBullet);
  const updateProjectBullet = useResumeStore(s => s.updateProjectBullet);
  const removeProjectBullet = useResumeStore(s => s.removeProjectBullet);
  const skills = useResumeStore(s => s.skills);
  const updateSkillGroup = useResumeStore(s => s.updateSkillGroup);
  const addSkillGroup = useResumeStore(s => s.addSkillGroup);
  const removeSkillGroup = useResumeStore(s => s.removeSkillGroup);
  const certifications = useResumeStore(s => s.certifications);
  const addCertification = useResumeStore(s => s.addCertification);
  const updateCertification = useResumeStore(s => s.updateCertification);
  const removeCertification = useResumeStore(s => s.removeCertification);
  const achievements = useResumeStore(s => s.achievements);
  const addAchievement = useResumeStore(s => s.addAchievement);
  const updateAchievement = useResumeStore(s => s.updateAchievement);
  const removeAchievement = useResumeStore(s => s.removeAchievement);
  const sections = useResumeStore(s => s.sections);
  const toggleSection = useResumeStore(s => s.toggleSection);
  const reorderSections = useResumeStore(s => s.reorderSections);
  const templateId = useResumeStore(s => s.templateId);
  const setTemplate = useResumeStore(s => s.setTemplate);
  const accentColor = useResumeStore(s => s.accentColor);
  const setAccentColor = useResumeStore(s => s.setAccentColor);
  const scoreResult = useResumeStore(s => s.scoreResult);
  const setScore = useResumeStore(s => s.setScore);
  const resetResume = useResumeStore(s => s.resetResume);

  // --- Local state ---
  const [activeSection, setActiveSection] = useState("personal");
  const [showPreview, setShowPreview] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [skillInputs, setSkillInputs] = useState<Record<number, string>>({});

  // --- AI Bullet Improvement state ---
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, any>>({});

  // --- AI Summary Generator state ---
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summarySuggestions, setSummarySuggestions] = useState<any>(null);

  // --- JD Match Panel state ---
  const [showJdMatch, setShowJdMatch] = useState(false);
  const [jdText, setJdText] = useState('');
  const [jdResult, setJdResult] = useState<any>(null);
  const [jdLoading, setJdLoading] = useState(false);

  // --- Upload Resume state ---
  const [showUpload, setShowUpload] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // --- Auto-save indicator ---
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  // --- Score debounce + auto-save indicator ---
  const storeState = useResumeStore.getState;
  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      const s = useResumeStore.getState();
      const data: ResumeData = {
        personal: s.personal, summary: s.summary, education: s.education,
        experience: s.experience, projects: s.projects, skills: s.skills,
        certifications: s.certifications, achievements: s.achievements,
        sections: s.sections, templateId: s.templateId, accentColor: s.accentColor,
      };
      setScore(scoreResume(data));
      setSaveStatus('saved');
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personal, summary, education, experience, projects, skills, certifications, achievements, sections]);

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') { e.preventDefault(); handlePrint(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); /* already auto-saved via zustand persist */ }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const sortedSections = useMemo(
    () => [...sections].sort((a, b) => a.order - b.order),
    [sections],
  );

  const templateData = useMemo(() => toTemplateData(useResumeStore.getState()), [
    personal, summary, education, experience, projects, skills, certifications, achievements, sections, templateId, accentColor,
  ]);

  const overallScore = scoreResult?.overall ?? 0;

  // --- Move section helpers ---
  const moveSection = useCallback((id: string, dir: -1 | 1) => {
    const sorted = [...sections].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex(s => s.id === id);
    if ((dir === -1 && idx <= 0) || (dir === 1 && idx >= sorted.length - 1)) return;
    const swapIdx = idx + dir;
    const updated = sorted.map((s, i) => {
      if (i === idx) return { ...s, order: swapIdx };
      if (i === swapIdx) return { ...s, order: idx };
      return { ...s, order: i };
    });
    reorderSections(updated);
  }, [sections, reorderSections]);

  const handlePrint = useCallback(() => window.print(), []);

  // --- AI Bullet Improvement ---
  async function improveBullet(text: string, key: string) {
    if (!text.trim()) return;
    setAiLoading(key);
    try {
      const res = await fetch('/api/ai/improve-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bullet: text, targetRole: personal.name ? `${personal.name}'s target role` : undefined }),
      });
      const data = await res.json();
      setAiSuggestions(prev => ({ ...prev, [key]: data }));
    } catch {}
    finally { setAiLoading(null); }
  }

  // --- AI Summary Generator ---
  async function generateSummary() {
    setSummaryLoading(true);
    try {
      const allSkills = skills.flatMap(g => g.skills);
      const expSummary = experience.map(e => `${e.role} at ${e.company}`).join(', ');
      const res = await fetch('/api/ai/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: personal.name || 'Professional',
          skills: allSkills,
          experienceSummary: expSummary,
          segment: 'experienced',
        }),
      });
      const data = await res.json();
      setSummarySuggestions(data);
    } catch {}
    finally { setSummaryLoading(false); }
  }

  // --- JD Match Analysis ---
  async function analyzeJd() {
    if (!jdText.trim()) return;
    setJdLoading(true);
    try {
      const parseRes = await fetch('/api/ai/parse-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jdText }),
      });
      const parsed = await parseRes.json();

      // Client-side matching against resume data
      const allSkills = skills.flatMap(g => g.skills).map(s => s.toLowerCase());
      const jdSkills: string[] = (parsed.skills || parsed.required_skills || []).map((s: string) => s.toLowerCase());
      const matchedSkills = jdSkills.filter(s => allSkills.some(rs => rs.includes(s) || s.includes(rs)));
      const missingSkills = jdSkills.filter(s => !allSkills.some(rs => rs.includes(s) || s.includes(rs)));

      const skillScore = jdSkills.length > 0 ? Math.round((matchedSkills.length / jdSkills.length) * 100) : 50;
      const hasRelevantExp = experience.some(e =>
        (parsed.title || '').toLowerCase().split(' ').some((w: string) => e.role.toLowerCase().includes(w))
      );
      const expScore = hasRelevantExp ? 80 : 40;
      const eduScore = education.length > 0 ? 70 : 30;
      const overallMatch = Math.round(skillScore * 0.5 + expScore * 0.3 + eduScore * 0.2);

      const recommendations: { text: string; priority: 'high' | 'medium' | 'low' }[] = [];
      if (missingSkills.length > 0) {
        recommendations.push({ text: `Add missing skills: ${missingSkills.slice(0, 5).join(', ')}`, priority: 'high' });
      }
      if (!hasRelevantExp) {
        recommendations.push({ text: 'Tailor your experience bullets to match the job title and responsibilities', priority: 'high' });
      }
      if (summary.length < 50) {
        recommendations.push({ text: 'Write a targeted summary mentioning key requirements from the JD', priority: 'medium' });
      }
      recommendations.push({ text: 'Use keywords from the job description in your bullet points', priority: 'medium' });

      setJdResult({
        parsed,
        matchScore: overallMatch,
        breakdown: { skills: skillScore, experience: expScore, education: eduScore },
        matchedSkills: matchedSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
        missingSkills: missingSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
        recommendations: recommendations.sort((a, b) => {
          const order = { high: 0, medium: 1, low: 2 };
          return order[a.priority] - order[b.priority];
        }),
      });
    } catch {}
    finally { setJdLoading(false); }
  }

  // --- DOCX Export ---
  async function handleDocxExport() {
    try {
      const { generateDocx } = await import('@/lib/resume/docx-export');
      const s = useResumeStore.getState();
      const blob = await generateDocx({
        personal: s.personal, summary: s.summary, education: s.education,
        experience: s.experience, projects: s.projects, skills: s.skills,
        certifications: s.certifications, achievements: s.achievements,
        sections: s.sections, templateId: s.templateId, accentColor: s.accentColor,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${personal.name || 'Resume'}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('DOCX export is not available yet. Please use PDF download instead.');
    }
  }

  // --- Resume Upload Handler ---
  async function handleResumeUpload(file: File) {
    setUploadError('');
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/ai/parse-resume', { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to parse resume');
      }
      const json = await res.json();
      const parsed = json.data || json;

      console.log('=== Parsed resume data ===', JSON.stringify(parsed.personal, null, 2));
      console.log('=== Sections found ===', Object.keys(parsed).filter(k => {
        const v = parsed[k];
        return v && (typeof v === 'string' ? v.length > 0 : Array.isArray(v) ? v.length > 0 : Object.keys(v).some(kk => v[kk]));
      }));

      // Apply parsed data to store
      const store = useResumeStore.getState();

      // Personal info
      if (parsed.personal) {
        const p = parsed.personal;
        if (p.name) store.updatePersonal('name', p.name);
        if (p.email) store.updatePersonal('email', p.email);
        if (p.phone) store.updatePersonal('phone', p.phone);
        if (p.location) store.updatePersonal('location', p.location);
        if (p.linkedin) store.updatePersonal('linkedin', p.linkedin);
        if (p.github) store.updatePersonal('github', p.github);
        if (p.portfolio) store.updatePersonal('portfolio', p.portfolio);
        if (p.objective) store.updatePersonal('objective', p.objective);
      }

      // Summary
      if (parsed.summary) store.updateSummary(parsed.summary);

      // For arrays, we need to use set directly on the store
      const state = useResumeStore.getState();

      // Education - clear existing and add parsed ones
      if (parsed.education?.length > 0) {
        state.education.forEach(e => store.removeEducation(e.id));
        parsed.education.forEach((edu: any) => {
          store.addEducation();
          const newEdu = useResumeStore.getState().education;
          const last = newEdu[newEdu.length - 1];
          if (edu.institution) store.updateEducation(last.id, 'institution', edu.institution);
          if (edu.degree) store.updateEducation(last.id, 'degree', edu.degree);
          if (edu.field) store.updateEducation(last.id, 'field', edu.field);
          if (edu.startDate) store.updateEducation(last.id, 'startDate', edu.startDate);
          if (edu.endDate) store.updateEducation(last.id, 'endDate', edu.endDate);
          if (edu.cgpa) store.updateEducation(last.id, 'cgpa', edu.cgpa);
          if (edu.achievements) store.updateEducation(last.id, 'achievements', edu.achievements);
        });
      }

      // Experience
      if (parsed.experience?.length > 0) {
        state.experience.forEach(e => store.removeExperience(e.id));
        parsed.experience.forEach((exp: any) => {
          store.addExperience();
          const newExp = useResumeStore.getState().experience;
          const last = newExp[newExp.length - 1];
          if (exp.company) store.updateExperience(last.id, 'company', exp.company);
          if (exp.role) store.updateExperience(last.id, 'role', exp.role);
          if (exp.startDate) store.updateExperience(last.id, 'startDate', exp.startDate);
          if (exp.endDate) store.updateExperience(last.id, 'endDate', exp.endDate);
          if (exp.current) store.updateExperience(last.id, 'current', true);
          if (exp.bullets?.length > 0) {
            store.removeExperienceBullet(last.id, 0);
            exp.bullets.forEach((bullet: string) => {
              store.addExperienceBullet(last.id);
              const updatedExp = useResumeStore.getState().experience.find(e => e.id === last.id);
              if (updatedExp) store.updateExperienceBullet(last.id, updatedExp.bullets.length - 1, bullet);
            });
          }
        });
      }

      // Projects
      if (parsed.projects?.length > 0) {
        state.projects.forEach(p => store.removeProject(p.id));
        parsed.projects.forEach((proj: any) => {
          store.addProject();
          const newProj = useResumeStore.getState().projects;
          const last = newProj[newProj.length - 1];
          if (proj.name) store.updateProject(last.id, 'name', proj.name);
          if (proj.techStack) store.updateProject(last.id, 'techStack', Array.isArray(proj.techStack) ? proj.techStack.join(', ') : proj.techStack);
          if (proj.link) store.updateProject(last.id, 'link', proj.link);
          if (proj.bullets?.length > 0) {
            store.removeProjectBullet(last.id, 0);
            proj.bullets.forEach((bullet: string) => {
              store.addProjectBullet(last.id);
              const updatedProj = useResumeStore.getState().projects.find(p => p.id === last.id);
              if (updatedProj) store.updateProjectBullet(last.id, updatedProj.bullets.length - 1, bullet);
            });
          }
        });
      }

      // Skills
      if (parsed.skills?.length > 0) {
        while (useResumeStore.getState().skills.length > 0) {
          store.removeSkillGroup(0);
        }
        parsed.skills.forEach((group: any) => {
          store.addSkillGroup(group.category || 'General');
          const idx = useResumeStore.getState().skills.length - 1;
          if (group.skills?.length > 0) store.updateSkillGroup(idx, group.skills);
        });
      }

      // Certifications
      if (parsed.certifications?.length > 0) {
        parsed.certifications.forEach((cert: any) => {
          store.addCertification();
          const newCerts = useResumeStore.getState().certifications;
          const last = newCerts[newCerts.length - 1];
          if (cert.name) store.updateCertification(last.id, 'name', cert.name);
          if (cert.issuer) store.updateCertification(last.id, 'issuer', cert.issuer);
          if (cert.date) store.updateCertification(last.id, 'date', cert.date);
          if (cert.link) store.updateCertification(last.id, 'link', cert.link);
        });
      }

      // Achievements
      if (parsed.achievements?.length > 0) {
        parsed.achievements.forEach((ach: any) => {
          store.addAchievement();
          const newAch = useResumeStore.getState().achievements;
          const last = newAch[newAch.length - 1];
          if (ach.title) store.updateAchievement(last.id, 'title', ach.title);
          if (ach.description) store.updateAchievement(last.id, 'description', ach.description);
        });
      }

      setShowUpload(false);
      setActiveSection('personal');
    } catch (err: any) {
      setUploadError(err.message || 'Failed to parse resume');
    } finally {
      setUploadLoading(false);
    }
  }

  // --- All nav items ---
  const navItems = useMemo(() => {
    const items: { id: string; label: string; icon: React.ElementType }[] = [
      { id: "personal", label: "Personal Info", icon: User },
    ];
    for (const sec of sortedSections) {
      items.push({ id: sec.id, label: sec.label, icon: sectionIcons[sec.id] || FileText });
    }
    return items;
  }, [sortedSections]);

  // --- Severity icons/colors ---
  const severityIcon = (sev: string) => {
    if (sev === "critical") return <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />;
    if (sev === "warning") return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />;
    return <Lightbulb className="h-4 w-4 text-blue-500 shrink-0" />;
  };

  // --- Render editor per active section ---
  const renderEditor = () => {
    switch (activeSection) {
      case "personal":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
            <Field label="Full Name" required>
              <Input value={personal.name} onChange={e => updatePersonal("name", e.target.value)} placeholder="Rahul Kumar Singh" />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Email" required><Input type="email" value={personal.email} onChange={e => updatePersonal("email", e.target.value)} placeholder="rahul@email.com" /></Field>
              <Field label="Phone"><Input value={personal.phone} onChange={e => updatePersonal("phone", e.target.value)} placeholder="+91 9876543210" /></Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Location"><Input value={personal.location} onChange={e => updatePersonal("location", e.target.value)} placeholder="Bangalore, India" /></Field>
              <Field label="LinkedIn"><Input value={personal.linkedin} onChange={e => updatePersonal("linkedin", e.target.value)} placeholder="linkedin.com/in/rahul" /></Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="GitHub"><Input value={personal.github} onChange={e => updatePersonal("github", e.target.value)} placeholder="github.com/rahul" /></Field>
              <Field label="Portfolio"><Input value={personal.portfolio} onChange={e => updatePersonal("portfolio", e.target.value)} placeholder="rahul.dev" /></Field>
            </div>
            <Field label="Career Objective">
              <textarea value={personal.objective} onChange={e => updatePersonal("objective", e.target.value)} placeholder="A passionate engineer seeking opportunities in..." className={cn(inputCls, "h-24")} />
            </Field>
          </div>
        );

      case "summary":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Professional Summary</h2>
              <button
                onClick={generateSummary}
                disabled={summaryLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50"
                suppressHydrationWarning
              >
                {summaryLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                Generate Summary
              </button>
            </div>
            <Field label="Summary">
              <textarea value={summary} onChange={e => updateSummary(e.target.value)} placeholder="Results-driven software engineer with 3+ years of experience in full-stack development. Proficient in React, Node.js, and cloud technologies with a track record of delivering scalable solutions..." className={cn(inputCls, "h-36")} />
            </Field>
            <p className="text-xs text-gray-400">{summary.length} characters</p>
            {summarySuggestions && summarySuggestions.variants && (
              <div className="bg-indigo-50 rounded-xl p-4 space-y-3 border border-indigo-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-indigo-700">AI-Generated Summaries</span>
                  <button onClick={() => setSummarySuggestions(null)} className="text-gray-400 hover:text-gray-600" suppressHydrationWarning><X className="h-4 w-4" /></button>
                </div>
                {summarySuggestions.variants.map((v: any, vi: number) => (
                  <button key={vi} onClick={() => { updateSummary(v.text); setSummarySuggestions(null); }} className="w-full text-left p-3 rounded-lg hover:bg-white text-sm transition-colors border border-transparent hover:border-indigo-200">
                    <span className="text-xs font-medium text-indigo-500 uppercase">{v.style || v.tone || `Option ${vi + 1}`}</span>
                    <p className="text-gray-700 mt-1">{v.text}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case "education":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Education</h2>
            {education.map((edu) => (
              <div key={edu.id} className="border border-gray-100 rounded-xl p-4 space-y-3 relative">
                {education.length > 1 && (
                  <button onClick={() => removeEducation(edu.id)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500" suppressHydrationWarning><Trash2 className="h-4 w-4" /></button>
                )}
                <Field label="Institution"><Input value={edu.institution} onChange={e => updateEducation(edu.id, "institution", e.target.value)} placeholder="IIT Bombay" /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Degree"><Input value={edu.degree} onChange={e => updateEducation(edu.id, "degree", e.target.value)} placeholder="B.Tech" /></Field>
                  <Field label="Field of Study"><Input value={edu.field} onChange={e => updateEducation(edu.id, "field", e.target.value)} placeholder="Computer Science" /></Field>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Start Date"><Input value={edu.startDate} onChange={e => updateEducation(edu.id, "startDate", e.target.value)} placeholder="Aug 2020" /></Field>
                  <Field label="End Date"><Input value={edu.endDate} onChange={e => updateEducation(edu.id, "endDate", e.target.value)} placeholder="May 2024" /></Field>
                  <Field label="CGPA / %"><Input value={edu.cgpa} onChange={e => updateEducation(edu.id, "cgpa", e.target.value)} placeholder="8.5/10" /></Field>
                </div>
                <Field label="Achievements"><textarea value={edu.achievements} onChange={e => updateEducation(edu.id, "achievements", e.target.value)} placeholder="Dean's list, relevant coursework..." className={cn(inputCls, "h-16")} /></Field>
              </div>
            ))}
            <button onClick={addEducation} className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-semibold" suppressHydrationWarning><Plus className="h-4 w-4" /> Add Education</button>
          </div>
        );

      case "experience":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Work Experience</h2>
            {experience.map((exp) => (
              <div key={exp.id} className="border border-gray-100 rounded-xl p-4 space-y-3 relative">
                {experience.length > 1 && (
                  <button onClick={() => removeExperience(exp.id)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500" suppressHydrationWarning><Trash2 className="h-4 w-4" /></button>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Company"><Input value={exp.company} onChange={e => updateExperience(exp.id, "company", e.target.value)} placeholder="Google India" /></Field>
                  <Field label="Role"><Input value={exp.role} onChange={e => updateExperience(exp.id, "role", e.target.value)} placeholder="Software Engineer" /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3 items-end">
                  <Field label="Start Date"><Input value={exp.startDate} onChange={e => updateExperience(exp.id, "startDate", e.target.value)} placeholder="Jan 2022" /></Field>
                  <div>
                    {!exp.current && <Field label="End Date"><Input value={exp.endDate} onChange={e => updateExperience(exp.id, "endDate", e.target.value)} placeholder="Dec 2023" /></Field>}
                    <label className="flex items-center gap-2 mt-1.5 text-sm text-gray-600 cursor-pointer">
                      <input type="checkbox" checked={exp.current} onChange={e => updateExperience(exp.id, "current", e.target.checked)} className="rounded border-gray-300" />
                      Currently working here
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Key Achievements / Bullets</label>
                  {exp.bullets.map((b, bi) => {
                    const bulletKey = `exp-${exp.id}-${bi}`;
                    return (
                      <div key={bi} className="mb-2">
                        <div className="flex gap-2">
                          <span className="text-gray-400 mt-2.5 text-xs">{bi + 1}.</span>
                          <Input value={b} onChange={e => updateExperienceBullet(exp.id, bi, e.target.value)} placeholder="Led a team of 5 to build..." className="flex-1" />
                          <button
                            onClick={() => improveBullet(b, bulletKey)}
                            disabled={aiLoading === bulletKey}
                            className="px-2 py-1 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                            title="AI Improve"
                            suppressHydrationWarning
                          >
                            {aiLoading === bulletKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                          </button>
                          {exp.bullets.length > 1 && (
                            <button onClick={() => removeExperienceBullet(exp.id, bi)} className="text-gray-400 hover:text-red-500" suppressHydrationWarning><X className="h-4 w-4" /></button>
                          )}
                        </div>
                        {aiSuggestions[bulletKey] && (
                          <div className="ml-6 mt-2 bg-indigo-50 rounded-lg p-3 space-y-2 border border-indigo-100">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-indigo-700">AI Suggestions</span>
                              <button onClick={() => setAiSuggestions(prev => { const n = {...prev}; delete n[bulletKey]; return n; })} className="text-gray-400 hover:text-gray-600" suppressHydrationWarning><X className="h-3 w-3" /></button>
                            </div>
                            {aiSuggestions[bulletKey].variants?.map((v: any, vi: number) => (
                              <button key={vi} onClick={() => { updateExperienceBullet(exp.id, bi, v.text); setAiSuggestions(prev => { const n = {...prev}; delete n[bulletKey]; return n; }); }} className="w-full text-left p-2 rounded-lg hover:bg-white text-sm transition-colors">
                                <span className="text-xs font-medium text-indigo-500 uppercase">{v.style}</span>
                                <p className="text-gray-700 mt-0.5">{v.text}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{v.changes}</p>
                              </button>
                            ))}
                            {aiSuggestions[bulletKey].metrics_prompt && (
                              <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">{aiSuggestions[bulletKey].metrics_prompt}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <button onClick={() => addExperienceBullet(exp.id)} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium" suppressHydrationWarning><Plus className="h-3 w-3 inline mr-1" />Add bullet</button>
                </div>
              </div>
            ))}
            <button onClick={addExperience} className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-semibold" suppressHydrationWarning><Plus className="h-4 w-4" /> Add Experience</button>
          </div>
        );

      case "projects":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Projects</h2>
            {projects.map((proj) => (
              <div key={proj.id} className="border border-gray-100 rounded-xl p-4 space-y-3 relative">
                {projects.length > 1 && (
                  <button onClick={() => removeProject(proj.id)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500" suppressHydrationWarning><Trash2 className="h-4 w-4" /></button>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Project Name"><Input value={proj.name} onChange={e => updateProject(proj.id, "name", e.target.value)} placeholder="E-commerce Platform" /></Field>
                  <Field label="Link"><Input value={proj.link} onChange={e => updateProject(proj.id, "link", e.target.value)} placeholder="github.com/user/project" /></Field>
                </div>
                <Field label="Tech Stack (comma-separated)"><Input value={proj.techStack} onChange={e => updateProject(proj.id, "techStack", e.target.value)} placeholder="React, Node.js, PostgreSQL" /></Field>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description Bullets</label>
                  {proj.bullets.map((b, bi) => {
                    const bulletKey = `proj-${proj.id}-${bi}`;
                    return (
                      <div key={bi} className="mb-2">
                        <div className="flex gap-2">
                          <span className="text-gray-400 mt-2.5 text-xs">{bi + 1}.</span>
                          <Input value={b} onChange={e => updateProjectBullet(proj.id, bi, e.target.value)} placeholder="Built a responsive UI..." className="flex-1" />
                          <button
                            onClick={() => improveBullet(b, bulletKey)}
                            disabled={aiLoading === bulletKey}
                            className="px-2 py-1 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                            title="AI Improve"
                            suppressHydrationWarning
                          >
                            {aiLoading === bulletKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                          </button>
                          {proj.bullets.length > 1 && (
                            <button onClick={() => removeProjectBullet(proj.id, bi)} className="text-gray-400 hover:text-red-500" suppressHydrationWarning><X className="h-4 w-4" /></button>
                          )}
                        </div>
                        {aiSuggestions[bulletKey] && (
                          <div className="ml-6 mt-2 bg-indigo-50 rounded-lg p-3 space-y-2 border border-indigo-100">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-indigo-700">AI Suggestions</span>
                              <button onClick={() => setAiSuggestions(prev => { const n = {...prev}; delete n[bulletKey]; return n; })} className="text-gray-400 hover:text-gray-600" suppressHydrationWarning><X className="h-3 w-3" /></button>
                            </div>
                            {aiSuggestions[bulletKey].variants?.map((v: any, vi: number) => (
                              <button key={vi} onClick={() => { updateProjectBullet(proj.id, bi, v.text); setAiSuggestions(prev => { const n = {...prev}; delete n[bulletKey]; return n; }); }} className="w-full text-left p-2 rounded-lg hover:bg-white text-sm transition-colors">
                                <span className="text-xs font-medium text-indigo-500 uppercase">{v.style}</span>
                                <p className="text-gray-700 mt-0.5">{v.text}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{v.changes}</p>
                              </button>
                            ))}
                            {aiSuggestions[bulletKey].metrics_prompt && (
                              <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">{aiSuggestions[bulletKey].metrics_prompt}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <button onClick={() => addProjectBullet(proj.id)} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium" suppressHydrationWarning><Plus className="h-3 w-3 inline mr-1" />Add bullet</button>
                </div>
              </div>
            ))}
            <button onClick={addProject} className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-semibold" suppressHydrationWarning><Plus className="h-4 w-4" /> Add Project</button>
          </div>
        );

      case "skills":
        return (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-gray-900">Skills</h2>
            {skills.map((group, gi) => (
              <div key={gi} className="border border-gray-100 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800 text-sm">{group.category}</h3>
                  {skills.length > 1 && (
                    <button onClick={() => removeSkillGroup(gi)} className="text-gray-400 hover:text-red-500" suppressHydrationWarning><Trash2 className="h-4 w-4" /></button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input value={skillInputs[gi] || ""} onChange={e => setSkillInputs(p => ({ ...p, [gi]: e.target.value }))} onKeyDown={e => {
                    if (e.key === "Enter" && (skillInputs[gi] || "").trim()) {
                      const val = (skillInputs[gi] || "").trim();
                      if (!group.skills.includes(val)) updateSkillGroup(gi, [...group.skills, val]);
                      setSkillInputs(p => ({ ...p, [gi]: "" }));
                    }
                  }} placeholder="Type a skill and press Enter..." className="flex-1" />
                  <Button variant="outline" onClick={() => {
                    const val = (skillInputs[gi] || "").trim();
                    if (val && !group.skills.includes(val)) updateSkillGroup(gi, [...group.skills, val]);
                    setSkillInputs(p => ({ ...p, [gi]: "" }));
                  }}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
                  {group.skills.length === 0 && <p className="text-xs text-gray-400">No skills added yet</p>}
                  {group.skills.map(skill => (
                    <button key={skill} onClick={() => updateSkillGroup(gi, group.skills.filter(s => s !== skill))} className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium hover:bg-red-50 hover:text-red-600 transition-colors" suppressHydrationWarning>
                      {skill}<X className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <Input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="New category name..." className="flex-1" />
              <Button variant="outline" onClick={() => { if (newCategory.trim()) { addSkillGroup(newCategory.trim()); setNewCategory(""); } }}>Add Category</Button>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">Quick add popular skills:</p>
              <div className="flex flex-wrap gap-2">
                {quickSkills.map(s => {
                  const exists = skills.some(g => g.skills.includes(s));
                  return (
                    <button key={s} onClick={() => { if (!exists && skills.length > 0) updateSkillGroup(0, [...skills[0].skills, s]); }}
                      className={cn("px-2.5 py-1 rounded-full text-xs border transition-all", exists ? "bg-indigo-100 text-indigo-700 border-indigo-200" : "border-gray-200 text-gray-600 hover:border-indigo-200")} suppressHydrationWarning>
                      + {s}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case "certifications":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Certifications</h2>
            {certifications.length === 0 && <p className="text-sm text-gray-400">No certifications added yet.</p>}
            {certifications.map(cert => (
              <div key={cert.id} className="border border-gray-100 rounded-xl p-4 space-y-3 relative">
                <button onClick={() => removeCertification(cert.id)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500" suppressHydrationWarning><Trash2 className="h-4 w-4" /></button>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Certification Name"><Input value={cert.name} onChange={e => updateCertification(cert.id, "name", e.target.value)} placeholder="AWS Solutions Architect" /></Field>
                  <Field label="Issuer"><Input value={cert.issuer} onChange={e => updateCertification(cert.id, "issuer", e.target.value)} placeholder="Amazon" /></Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Date"><Input value={cert.date} onChange={e => updateCertification(cert.id, "date", e.target.value)} placeholder="Mar 2024" /></Field>
                  <Field label="Link"><Input value={cert.link} onChange={e => updateCertification(cert.id, "link", e.target.value)} placeholder="credential URL" /></Field>
                </div>
              </div>
            ))}
            <button onClick={addCertification} className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-semibold" suppressHydrationWarning><Plus className="h-4 w-4" /> Add Certification</button>
          </div>
        );

      case "achievements":
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Achievements</h2>
            {achievements.length === 0 && <p className="text-sm text-gray-400">No achievements added yet.</p>}
            {achievements.map(ach => (
              <div key={ach.id} className="border border-gray-100 rounded-xl p-4 space-y-3 relative">
                <button onClick={() => removeAchievement(ach.id)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500" suppressHydrationWarning><Trash2 className="h-4 w-4" /></button>
                <Field label="Title"><Input value={ach.title} onChange={e => updateAchievement(ach.id, "title", e.target.value)} placeholder="Hackathon Winner" /></Field>
                <Field label="Description"><textarea value={ach.description} onChange={e => updateAchievement(ach.id, "description", e.target.value)} placeholder="Won first place at..." className={cn(inputCls, "h-16")} /></Field>
              </div>
            ))}
            <button onClick={addAchievement} className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-semibold" suppressHydrationWarning><Plus className="h-4 w-4" /> Add Achievement</button>
          </div>
        );

      default:
        return null;
    }
  };

  // --- Score chip SVG ---
  const ScoreChip = () => {
    const r = 16, c = 2 * Math.PI * r, offset = c - (overallScore / 100) * c;
    const color = overallScore <= 40 ? "#ef4444" : overallScore <= 60 ? "#f97316" : overallScore <= 80 ? "#eab308" : "#22c55e";
    return (
      <button onClick={() => setShowScore(v => !v)} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors" suppressHydrationWarning>
        <svg width="36" height="36" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r={r} fill="none" stroke="#e5e7eb" strokeWidth="3" />
          <circle cx="20" cy="20" r={r} fill="none" stroke={color} strokeWidth="3" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 20 20)" className="transition-all duration-700" />
          <text x="20" y="20" textAnchor="middle" dominantBaseline="central" className="text-[10px] font-bold" fill={color}>{overallScore}</text>
        </svg>
        <span className="text-xs font-semibold text-gray-700 hidden sm:block">Score</span>
      </button>
    );
  };

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #resume-print-area, #resume-print-area * { visibility: visible !important; }
          #resume-print-area { position: absolute; left: 0; top: 0; width: 210mm; }
          @page { size: A4; margin: 0; }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900">Resume Builder</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Create a professional, ATS-ready resume in minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("text-xs font-medium transition-colors", saveStatus === 'saving' ? "text-amber-500" : "text-green-500")}>
                {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
              </span>
              <Button variant="outline" onClick={() => setShowUpload(true)} className="gap-1.5 hidden sm:flex">
                <Upload className="h-4 w-4" />
                Import
              </Button>
              <ScoreChip />
              <button onClick={() => setShowJdMatch(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-xs font-semibold text-gray-700 hidden sm:flex" suppressHydrationWarning>
                <ClipboardCheck className="h-4 w-4 text-indigo-500" />JD Match
              </button>
              <Button variant="outline" onClick={() => setShowFullPreview(true)} className="gap-1.5 hidden sm:flex"><LayoutTemplate className="h-4 w-4" />Templates</Button>
              <Button variant="outline" onClick={handleDocxExport} className="gap-1.5 hidden sm:flex"><FileDown className="h-4 w-4" />DOCX</Button>
              <Button variant="gradient" onClick={handlePrint} className="gap-1.5"><Download className="h-4 w-4" /><span className="hidden sm:inline">Download PDF</span></Button>
              <Button variant="ghost" onClick={() => { if (confirm("Reset all resume data?")) resetResume(); }} className="text-gray-400 hover:text-red-500" title="Reset"><RotateCcw className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>

        {!personal.name && !personal.email && (
          <div className="container mx-auto px-4 mb-4 mt-4">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white shadow-sm">
                  <Upload className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Already have a resume?</p>
                  <p className="text-xs text-gray-500">Upload your PDF or DOCX and we'll fill everything in automatically</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setShowUpload(true)} className="gap-1.5 shrink-0">
                <Upload className="h-4 w-4" />
                Import Resume
              </Button>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Left Sidebar - Section Nav (desktop) */}
            <div className="hidden lg:block w-52 shrink-0">
              <div className="sticky top-24 space-y-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Sections</p>
                {/* Personal (always first, non-configurable) */}
                <button onClick={() => setActiveSection("personal")} className={cn("w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all", activeSection === "personal" ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-100")} suppressHydrationWarning>
                  <User className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">Personal Info</span>
                </button>
                {/* Configurable sections */}
                {sortedSections.map((sec, idx) => {
                  const Icon = sectionIcons[sec.id] || FileText;
                  return (
                    <div key={sec.id} className="flex items-center group">
                      <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity mr-0.5">
                        <button onClick={() => moveSection(sec.id, -1)} className="text-gray-400 hover:text-gray-600 p-0.5" suppressHydrationWarning><ChevronLeft className="h-3 w-3 rotate-90" /></button>
                        <button onClick={() => moveSection(sec.id, 1)} className="text-gray-400 hover:text-gray-600 p-0.5" suppressHydrationWarning><ChevronLeft className="h-3 w-3 -rotate-90" /></button>
                      </div>
                      <button onClick={() => setActiveSection(sec.id)} className={cn("flex-1 flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all", activeSection === sec.id ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-100", !sec.visible && "opacity-50")} suppressHydrationWarning>
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1 text-left">{sec.label}</span>
                      </button>
                      <button onClick={() => toggleSection(sec.id)} className={cn("p-1 rounded transition-colors", sec.visible ? "text-gray-400 hover:text-gray-600" : "text-gray-300 hover:text-gray-500")} title={sec.visible ? "Hide section" : "Show section"} suppressHydrationWarning>
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile section tabs */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 px-2 py-2 flex gap-1 overflow-x-auto">
              {navItems.slice(0, 5).map(item => {
                const Icon = item.icon;
                return (
                  <button key={item.id} onClick={() => { setActiveSection(item.id); setShowPreview(false); }} className={cn("flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0", activeSection === item.id && !showPreview ? "bg-indigo-50 text-indigo-700" : "text-gray-500")} suppressHydrationWarning>
                    <Icon className="h-4 w-4" />
                    {item.label.split(" ")[0]}
                  </button>
                );
              })}
              <button onClick={() => setShowPreview(true)} className={cn("flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0", showPreview ? "bg-indigo-50 text-indigo-700" : "text-gray-500")} suppressHydrationWarning>
                <Eye className="h-4 w-4" />Preview
              </button>
            </div>

            {/* Center - Editor */}
            <div className={cn("flex-1 min-w-0", showPreview && "hidden lg:block")}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4 lg:mb-0">
                {renderEditor()}
              </div>
              {/* AI Toolbar (desktop) */}
              <div className="hidden lg:flex items-center gap-2 mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 mb-20 lg:mb-0">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <span className="text-xs font-medium text-indigo-700">AI Actions:</span>
                <button onClick={() => { if (activeSection !== 'experience' && activeSection !== 'projects') setActiveSection('experience'); }} className="px-3 py-1.5 text-xs font-medium bg-white rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors" suppressHydrationWarning>Improve Bullet</button>
                <button onClick={() => { if (activeSection !== 'experience') setActiveSection('experience'); }} className="px-3 py-1.5 text-xs font-medium bg-white rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors" suppressHydrationWarning>Add Metrics</button>
                <button onClick={() => setShowJdMatch(true)} className="px-3 py-1.5 text-xs font-medium bg-white rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors" suppressHydrationWarning>Match to JD</button>
                <button onClick={() => setShowScore(true)} className="px-3 py-1.5 text-xs font-medium bg-white rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors" suppressHydrationWarning>ATS Check</button>
              </div>
            </div>

            {/* Right Panel - Preview (desktop) */}
            <div className={cn("hidden lg:block w-[400px] shrink-0")}>
              <div className="sticky top-24 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-700 text-sm">Live Preview</h3>
                  <button onClick={() => setShowFullPreview(true)} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium" suppressHydrationWarning>Expand</button>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="max-h-[60vh] overflow-y-auto">
                    <ResumeTemplate data={templateData} scale={0.45} />
                  </div>
                </div>
                {/* Template & Color Selector */}
                <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Template</p>
                  <div className="grid grid-cols-2 gap-2">
                    {templateOptions.map(t => (
                      <TemplateThumbnail key={t.id} templateId={t.id} selected={templateId === t.id} onClick={() => setTemplate(t.id)} />
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider pt-2">Accent Color</p>
                  <div className="flex flex-wrap gap-2">
                    {colorPresets.map(c => (
                      <button key={c.value} onClick={() => setAccentColor(c.value)} className={cn("w-7 h-7 rounded-full border-2 transition-all", accentColor === c.value ? "border-gray-900 scale-110" : "border-transparent hover:scale-105")} style={{ backgroundColor: c.value }} title={c.name} suppressHydrationWarning />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile preview */}
            {showPreview && (
              <div className="lg:hidden flex-1 min-w-0 mb-20">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-4">
                  <ResumeTemplate data={templateData} scale={0.5} />
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Template</p>
                  <div className="grid grid-cols-2 gap-2">
                    {templateOptions.map(t => (
                      <TemplateThumbnail key={t.id} templateId={t.id} selected={templateId === t.id} onClick={() => setTemplate(t.id)} />
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider pt-2">Accent Color</p>
                  <div className="flex flex-wrap gap-2">
                    {colorPresets.map(c => (
                      <button key={c.value} onClick={() => setAccentColor(c.value)} className={cn("w-7 h-7 rounded-full border-2 transition-all", accentColor === c.value ? "border-gray-900 scale-110" : "border-transparent hover:scale-105")} style={{ backgroundColor: c.value }} title={c.name} suppressHydrationWarning />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* JD Match Panel (slide-in) */}
        {showJdMatch && (
          <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setShowJdMatch(false)}>
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative w-full max-w-md bg-white shadow-2xl h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-indigo-600" /> JD Match</h2>
                  <button onClick={() => setShowJdMatch(false)} className="text-gray-400 hover:text-gray-600" suppressHydrationWarning><X className="h-5 w-5" /></button>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Paste Job Description</label>
                  <textarea
                    value={jdText}
                    onChange={e => setJdText(e.target.value)}
                    placeholder="Paste the full job description here..."
                    className={cn(inputCls, "h-40")}
                  />
                </div>
                <button
                  onClick={analyzeJd}
                  disabled={jdLoading || !jdText.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium text-sm hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50"
                  suppressHydrationWarning
                >
                  {jdLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Analyze Match
                </button>

                {jdResult && (
                  <>
                    {/* Overall Match Score Circle */}
                    <div className="flex flex-col items-center py-4">
                      <svg width="120" height="120" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                        <circle cx="60" cy="60" r="50" fill="none" stroke={jdResult.matchScore <= 40 ? "#ef4444" : jdResult.matchScore <= 60 ? "#f97316" : jdResult.matchScore <= 80 ? "#eab308" : "#22c55e"} strokeWidth="8" strokeDasharray={2 * Math.PI * 50} strokeDashoffset={2 * Math.PI * 50 - (jdResult.matchScore / 100) * 2 * Math.PI * 50} strokeLinecap="round" transform="rotate(-90 60 60)" className="transition-all duration-1000" />
                        <text x="60" y="55" textAnchor="middle" className="text-2xl font-bold" fill="#1f2937">{jdResult.matchScore}</text>
                        <text x="60" y="72" textAnchor="middle" className="text-xs" fill="#6b7280">Match %</text>
                      </svg>
                    </div>

                    {/* Breakdown bars */}
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-gray-700">Match Breakdown</p>
                      {Object.entries(jdResult.breakdown).map(([key, val]) => (
                        <div key={key}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600 capitalize">{key}</span>
                            <span className="font-semibold text-gray-800">{val as number}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${val as number}%`, backgroundColor: (val as number) <= 40 ? "#ef4444" : (val as number) <= 60 ? "#f97316" : (val as number) <= 80 ? "#eab308" : "#22c55e" }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Matched / Missing Skills */}
                    {jdResult.matchedSkills?.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Matched Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {jdResult.matchedSkills.map((s: string) => (
                            <span key={s} className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {jdResult.missingSkills?.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Missing Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {jdResult.missingSkills.map((s: string) => (
                            <span key={s} className="px-2 py-0.5 bg-red-50 text-red-700 text-xs rounded-full border border-red-200">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {jdResult.recommendations?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-700">Recommendations</p>
                        {jdResult.recommendations.map((rec: any, i: number) => (
                          <div key={i} className={cn("flex gap-2.5 p-3 rounded-lg text-xs", rec.priority === 'high' ? "bg-red-50" : rec.priority === 'medium' ? "bg-amber-50" : "bg-blue-50")}>
                            {rec.priority === 'high' ? <AlertCircle className="h-4 w-4 text-red-500 shrink-0" /> : rec.priority === 'medium' ? <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" /> : <Lightbulb className="h-4 w-4 text-blue-500 shrink-0" />}
                            <p className="font-medium text-gray-800">{rec.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Score Panel (slide-in) */}
        {showScore && (
          <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setShowScore(false)}>
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative w-full max-w-md bg-white shadow-2xl h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Target className="h-5 w-5 text-indigo-600" /> Resume Score</h2>
                  <button onClick={() => setShowScore(false)} className="text-gray-400 hover:text-gray-600" suppressHydrationWarning><X className="h-5 w-5" /></button>
                </div>
                {/* Overall score circle */}
                <div className="flex flex-col items-center py-4">
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                    <circle cx="60" cy="60" r="50" fill="none" stroke={overallScore <= 40 ? "#ef4444" : overallScore <= 60 ? "#f97316" : overallScore <= 80 ? "#eab308" : "#22c55e"} strokeWidth="8" strokeDasharray={2 * Math.PI * 50} strokeDashoffset={2 * Math.PI * 50 - (overallScore / 100) * 2 * Math.PI * 50} strokeLinecap="round" transform="rotate(-90 60 60)" className="transition-all duration-1000" />
                    <text x="60" y="55" textAnchor="middle" className="text-2xl font-bold" fill="#1f2937">{overallScore}</text>
                    <text x="60" y="72" textAnchor="middle" className="text-xs" fill="#6b7280">{getScoreLabel(overallScore)}</text>
                  </svg>
                </div>
                {/* Breakdown */}
                {scoreResult && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-700">Score Breakdown</p>
                    {Object.entries(scoreResult.breakdown).map(([key, val]) => {
                      const labels: Record<string, string> = { atsStructure: "ATS Structure", completeness: "Completeness", impactLanguage: "Impact Language", quantification: "Quantification", readability: "Readability", consistency: "Consistency" };
                      return (
                        <div key={key}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">{labels[key] || key}</span>
                            <span className="font-semibold text-gray-800">{val}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${val}%`, backgroundColor: val <= 40 ? "#ef4444" : val <= 60 ? "#f97316" : val <= 80 ? "#eab308" : "#22c55e" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {/* Issues */}
                {scoreResult && scoreResult.issues.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-700">Issues & Suggestions</p>
                    <div className="space-y-2">
                      {scoreResult.issues.slice(0, 15).map((issue, i) => (
                        <div key={i} className={cn("flex gap-2.5 p-3 rounded-lg text-xs", issue.severity === "critical" ? "bg-red-50" : issue.severity === "warning" ? "bg-amber-50" : "bg-blue-50")}>
                          {severityIcon(issue.severity)}
                          <div>
                            <p className="font-medium text-gray-800">{issue.message}</p>
                            {issue.fix && <p className="text-gray-500 mt-0.5">{issue.fix}</p>}
                            <span className="text-gray-400 mt-1 inline-block capitalize">{issue.section}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Upload Resume Modal */}
        {showUpload && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => !uploadLoading && setShowUpload(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Import Existing Resume</h2>
                    <p className="text-sm text-gray-500 mt-1">Upload your PDF or DOCX resume and we'll extract all the data</p>
                  </div>
                  <button onClick={() => !uploadLoading && setShowUpload(false)} className="text-gray-400 hover:text-gray-600" suppressHydrationWarning>
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {uploadError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {uploadError}
                  </div>
                )}

                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-indigo-300 transition-colors">
                  {uploadLoading ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                      <p className="text-sm font-medium text-gray-700">Parsing your resume...</p>
                      <p className="text-xs text-gray-400">Extracting data and mapping to sections</p>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-3">
                      <div className="p-4 rounded-full bg-indigo-50">
                        <Upload className="h-8 w-8 text-indigo-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Drop your resume here or click to browse</p>
                        <p className="text-xs text-gray-400 mt-1">Supports PDF and DOCX files up to 5MB</p>
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleResumeUpload(file);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  )}
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">What gets imported:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['Personal Info', 'Education', 'Experience', 'Projects', 'Skills', 'Summary', 'Certifications', 'Achievements'].map(item => (
                      <div key={item} className="flex items-center gap-2 text-xs text-gray-600">
                        <Check className="h-3 w-3 text-green-500 shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-700">
                    <strong>Note:</strong> Importing will replace your current data. The parser works best with well-structured resumes. You can edit any extracted data after import.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full-screen preview modal */}
        {showFullPreview && (
          <div className="fixed inset-0 z-50 bg-gray-900/50 flex items-start justify-center overflow-y-auto p-8">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-[900px] w-full">
              <div className="sticky top-0 z-10 bg-white rounded-t-2xl border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <h2 className="font-bold text-gray-900">Resume Preview</h2>
                <div className="flex items-center gap-2">
                  <Button variant="gradient" onClick={handlePrint} className="gap-1.5"><Download className="h-4 w-4" />Download PDF</Button>
                  <button onClick={() => setShowFullPreview(false)} className="text-gray-400 hover:text-gray-600 p-2" suppressHydrationWarning><X className="h-5 w-5" /></button>
                </div>
              </div>
              <div className="p-6">
                <ResumeTemplate data={templateData} scale={1} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
