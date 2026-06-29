import type { MockExam, ExamCategory } from "../types";
import { jeeExams } from "./jee";
import { neetExams } from "./neet";
import { gateExams } from "./gate";
import { catExams, upscExams, sscExams, bankingExams, cuetExams, ndaExams } from "./others";

export const allExams: MockExam[] = [
  ...jeeExams,
  ...neetExams,
  ...gateExams,
  ...catExams,
  ...upscExams,
  ...sscExams,
  ...bankingExams,
  ...cuetExams,
  ...ndaExams,
];

export const examCategories: { id: ExamCategory; label: string; icon: string; color: string; count: number }[] = [
  { id: "JEE", label: "JEE Main & Advanced", icon: "Atom", color: "bg-blue-100 text-blue-700", count: jeeExams.length },
  { id: "NEET", label: "NEET UG", icon: "Heart", color: "bg-green-100 text-green-700", count: neetExams.length },
  { id: "GATE", label: "GATE", icon: "Cpu", color: "bg-purple-100 text-purple-700", count: gateExams.length },
  { id: "CAT", label: "CAT / MBA", icon: "Calculator", color: "bg-amber-100 text-amber-700", count: catExams.length },
  { id: "UPSC", label: "UPSC Civil Services", icon: "Landmark", color: "bg-red-100 text-red-700", count: upscExams.length },
  { id: "SSC", label: "SSC CGL / CHSL", icon: "Brain", color: "bg-teal-100 text-teal-700", count: sscExams.length },
  { id: "Banking", label: "Banking PO / Clerk", icon: "IndianRupee", color: "bg-sky-100 text-sky-700", count: bankingExams.length },
  { id: "CUET", label: "CUET UG", icon: "GraduationCap", color: "bg-emerald-100 text-emerald-700", count: cuetExams.length },
  { id: "NDA", label: "NDA / CDS", icon: "Shield", color: "bg-slate-100 text-slate-700", count: ndaExams.length },
];

export function getExamBySlug(slug: string): MockExam | undefined {
  return allExams.find((e) => e.slug === slug);
}

export function getExamsByCategory(category: ExamCategory): MockExam[] {
  return allExams.filter((e) => e.category === category);
}

export function getTotalQuestionCount(): number {
  return allExams.reduce((sum, e) => sum + e.questions.length, 0);
}

export function getTotalExamCount(): number {
  return allExams.length;
}
