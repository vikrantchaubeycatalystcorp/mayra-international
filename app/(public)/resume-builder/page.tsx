"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft, Download, Eye, User, GraduationCap, Briefcase, Wrench, FileText, Check } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { cn } from "../../../lib/utils";

const steps = [
  { id: 1, label: "Personal", icon: User },
  { id: 2, label: "Education", icon: GraduationCap },
  { id: 3, label: "Experience", icon: Briefcase },
  { id: 4, label: "Skills", icon: Wrench },
  { id: 5, label: "Preview", icon: Eye },
];

interface ResumeData {
  personal: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    objective: string;
  };
  education: {
    institution: string;
    degree: string;
    field: string;
    year: string;
    cgpa: string;
  }[];
  experience: {
    company: string;
    role: string;
    duration: string;
    description: string;
  }[];
  skills: string[];
}

const defaultData: ResumeData = {
  personal: {
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    objective: "",
  },
  education: [{ institution: "", degree: "", field: "", year: "", cgpa: "" }],
  experience: [{ company: "", role: "", duration: "", description: "" }],
  skills: [],
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function ResumePreview({ data }: { data: ResumeData }) {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 font-sans text-gray-800">
      {/* Header */}
      <div className="border-b-2 border-primary-600 pb-4 mb-5">
        <h1 className="text-2xl font-black text-gray-900">
          {data.personal.name || "Your Name"}
        </h1>
        <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
          {data.personal.email && <span>{data.personal.email}</span>}
          {data.personal.phone && <span>{data.personal.phone}</span>}
          {data.personal.location && <span>{data.personal.location}</span>}
          {data.personal.linkedin && <span>{data.personal.linkedin}</span>}
        </div>
      </div>

      {/* Objective */}
      {data.personal.objective && (
        <div className="mb-5">
          <h2 className="text-sm font-black text-primary-700 uppercase tracking-wider mb-2">
            Objective
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">{data.personal.objective}</p>
        </div>
      )}

      {/* Education */}
      <div className="mb-5">
        <h2 className="text-sm font-black text-primary-700 uppercase tracking-wider mb-3">
          Education
        </h2>
        {data.education.map((edu, i) => (
          <div key={i} className="mb-3">
            <div className="flex justify-between">
              <div>
                <p className="font-bold text-gray-900 text-sm">{edu.institution || "Institution"}</p>
                <p className="text-sm text-gray-600">{edu.degree} in {edu.field}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">{edu.year}</p>
                {edu.cgpa && <p className="text-sm font-semibold text-primary-600">CGPA: {edu.cgpa}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Experience */}
      {data.experience.some((e) => e.company) && (
        <div className="mb-5">
          <h2 className="text-sm font-black text-primary-700 uppercase tracking-wider mb-3">
            Experience
          </h2>
          {data.experience.map((exp, i) =>
            exp.company ? (
              <div key={i} className="mb-3">
                <div className="flex justify-between">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{exp.role}</p>
                    <p className="text-sm text-gray-600">{exp.company}</p>
                  </div>
                  <p className="text-sm text-gray-500">{exp.duration}</p>
                </div>
                {exp.description && (
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{exp.description}</p>
                )}
              </div>
            ) : null
          )}
        </div>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <div>
          <h2 className="text-sm font-black text-primary-700 uppercase tracking-wider mb-2">
            Skills
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map((skill) => (
              <span key={skill} className="px-2.5 py-0.5 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResumeBuilderPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<ResumeData>(defaultData);
  const [skillInput, setSkillInput] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const updatePersonal = (field: keyof typeof data.personal, value: string) => {
    setData((d) => ({ ...d, personal: { ...d.personal, [field]: value } }));
  };

  const updateEducation = (index: number, field: keyof typeof data.education[0], value: string) => {
    setData((d) => {
      const edu = [...d.education];
      edu[index] = { ...edu[index], [field]: value };
      return { ...d, education: edu };
    });
  };

  const updateExperience = (index: number, field: keyof typeof data.experience[0], value: string) => {
    setData((d) => {
      const exp = [...d.experience];
      exp[index] = { ...exp[index], [field]: value };
      return { ...d, experience: exp };
    });
  };

  const addSkill = () => {
    if (skillInput.trim() && !data.skills.includes(skillInput.trim())) {
      setData((d) => ({ ...d, skills: [...d.skills, skillInput.trim()] }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setData((d) => ({ ...d, skills: d.skills.filter((s) => s !== skill) }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto py-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-6 w-6 text-primary-600" />
            <h1 className="text-3xl font-black text-gray-900">Resume Builder</h1>
          </div>
          <p className="text-gray-500">Create a professional resume in minutes</p>
        </div>
      </div>

      <div className="container mx-auto py-8">
        <div className="max-w-5xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8 bg-white rounded-2xl border border-gray-100 shadow-card p-4">
            {steps.map((s, idx) => (
              <div key={s.id} className="flex items-center flex-1">
                <button suppressHydrationWarning
                  onClick={() => setStep(s.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl transition-all",
                    step === s.id
                      ? "bg-primary-600 text-white"
                      : step > s.id
                      ? "text-green-600"
                      : "text-gray-400"
                  )}
                >
                  {step > s.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <s.icon className="h-5 w-5" />
                  )}
                  <span className="text-sm font-semibold hidden sm:block">{s.label}</span>
                </button>
                {idx < steps.length - 1 && (
                  <div className={cn("flex-1 h-0.5 mx-2", step > s.id ? "bg-green-300" : "bg-gray-200")} />
                )}
              </div>
            ))}
          </div>

          <div className={cn("grid gap-8", step < 5 ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1")}>
            {/* Form */}
            {step < 5 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                {/* Step 1: Personal */}
                {step === 1 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-5">Personal Information</h2>
                    <Field label="Full Name *">
                      <Input value={data.personal.name} onChange={(e) => updatePersonal("name", e.target.value)} placeholder="Rahul Kumar Singh" />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Email *">
                        <Input type="email" value={data.personal.email} onChange={(e) => updatePersonal("email", e.target.value)} placeholder="rahul@email.com" />
                      </Field>
                      <Field label="Phone">
                        <Input value={data.personal.phone} onChange={(e) => updatePersonal("phone", e.target.value)} placeholder="+91 9876543210" />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Location">
                        <Input value={data.personal.location} onChange={(e) => updatePersonal("location", e.target.value)} placeholder="Bangalore, India" />
                      </Field>
                      <Field label="LinkedIn">
                        <Input value={data.personal.linkedin} onChange={(e) => updatePersonal("linkedin", e.target.value)} placeholder="linkedin.com/in/rahul" />
                      </Field>
                    </div>
                    <Field label="Career Objective">
                      <textarea
                        value={data.personal.objective}
                        onChange={(e) => updatePersonal("objective", e.target.value)}
                        placeholder="A passionate computer science student seeking..."
                        className="w-full h-24 rounded-lg border border-input px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                      />
                    </Field>
                  </div>
                )}

                {/* Step 2: Education */}
                {step === 2 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-5">Education</h2>
                    {data.education.map((edu, i) => (
                      <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3">
                        <Field label="Institution *">
                          <Input value={edu.institution} onChange={(e) => updateEducation(i, "institution", e.target.value)} placeholder="IIT Bombay" />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Degree">
                            <Input value={edu.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)} placeholder="B.Tech" />
                          </Field>
                          <Field label="Field of Study">
                            <Input value={edu.field} onChange={(e) => updateEducation(i, "field", e.target.value)} placeholder="Computer Science" />
                          </Field>
                          <Field label="Year">
                            <Input value={edu.year} onChange={(e) => updateEducation(i, "year", e.target.value)} placeholder="2020–2024" />
                          </Field>
                          <Field label="CGPA / Percentage">
                            <Input value={edu.cgpa} onChange={(e) => updateEducation(i, "cgpa", e.target.value)} placeholder="8.5 / 10" />
                          </Field>
                        </div>
                      </div>
                    ))}
                    <button suppressHydrationWarning
                      onClick={() => setData((d) => ({ ...d, education: [...d.education, { institution: "", degree: "", field: "", year: "", cgpa: "" }] }))}
                      className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
                    >
                      + Add Education
                    </button>
                  </div>
                )}

                {/* Step 3: Experience */}
                {step === 3 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-5">Work Experience</h2>
                    {data.experience.map((exp, i) => (
                      <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Company">
                            <Input value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)} placeholder="Google India" />
                          </Field>
                          <Field label="Role">
                            <Input value={exp.role} onChange={(e) => updateExperience(i, "role", e.target.value)} placeholder="Software Engineer Intern" />
                          </Field>
                        </div>
                        <Field label="Duration">
                          <Input value={exp.duration} onChange={(e) => updateExperience(i, "duration", e.target.value)} placeholder="May 2023 – July 2023" />
                        </Field>
                        <Field label="Description">
                          <textarea
                            value={exp.description}
                            onChange={(e) => updateExperience(i, "description", e.target.value)}
                            placeholder="Describe your key responsibilities and achievements..."
                            className="w-full h-20 rounded-lg border border-input px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                          />
                        </Field>
                      </div>
                    ))}
                    <button suppressHydrationWarning
                      onClick={() => setData((d) => ({ ...d, experience: [...d.experience, { company: "", role: "", duration: "", description: "" }] }))}
                      className="text-sm text-primary-600 hover:text-primary-700 font-semibold"
                    >
                      + Add Experience
                    </button>
                  </div>
                )}

                {/* Step 4: Skills */}
                {step === 4 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-5">Skills</h2>
                    <div className="flex gap-2">
                      <Input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addSkill()}
                        placeholder="Type a skill and press Enter..."
                        className="flex-1"
                      />
                      <Button onClick={addSkill} variant="outline">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-16 p-3 border border-gray-100 rounded-xl bg-gray-50">
                      {data.skills.length === 0 && (
                        <p className="text-sm text-gray-400">Your skills will appear here</p>
                      )}
                      {data.skills.map((skill) => (
                        <button suppressHydrationWarning
                          key={skill}
                          onClick={() => removeSkill(skill)}
                          className="flex items-center gap-1.5 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium hover:bg-red-100 hover:text-red-600 transition-colors"
                        >
                          {skill}
                          <span className="text-xs">×</span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-2">Quick add popular skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {["Python", "Java", "React", "Machine Learning", "SQL", "Excel", "Communication", "Leadership", "Problem Solving"].map((s) => (
                          <button suppressHydrationWarning
                            key={s}
                            onClick={() => {
                              if (!data.skills.includes(s)) {
                                setData((d) => ({ ...d, skills: [...d.skills, s] }));
                              }
                            }}
                            className={cn(
                              "px-2.5 py-1 rounded-full text-xs border transition-all",
                              data.skills.includes(s)
                                ? "bg-primary-100 text-primary-700 border-primary-200"
                                : "border-gray-200 text-gray-600 hover:border-primary-200"
                            )}
                          >
                            + {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    onClick={() => setStep(Math.max(1, step - 1))}
                    disabled={step === 1}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="gradient"
                    onClick={() => setStep(Math.min(5, step + 1))}
                    className="gap-1"
                  >
                    {step === 4 ? "Preview Resume" : "Next"}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Live Preview */}
            {step < 5 && (
              <div className="hidden lg:block">
                <div className="sticky top-24">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-700 text-sm">Live Preview</h3>
                    <span className="text-xs text-gray-400">Updates in real-time</span>
                  </div>
                  <div className="transform scale-[0.75] origin-top-left w-[133%]">
                    <ResumePreview data={data} />
                  </div>
                </div>
              </div>
            )}

            {/* Full Preview + Download */}
            {step === 5 && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold text-gray-900">Resume Preview</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep(1)} className="gap-1">
                      <ChevronLeft className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="gradient" className="gap-1">
                      <Download className="h-4 w-4" />
                      Download PDF
                    </Button>
                  </div>
                </div>
                <ResumePreview data={data} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
