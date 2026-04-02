import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Resume Builder for Students — Create Professional CV Online",
  description:
    "Build a professional resume for free. Choose from multiple templates, add education, experience, skills, and projects. Download as PDF. Perfect for freshers and students.",
  keywords: [
    "free resume builder",
    "student resume builder",
    "fresher resume template",
    "online cv maker",
    "professional resume for students",
    "resume download pdf",
  ],
  openGraph: {
    title: "Free Resume Builder — Create Professional CV",
    description:
      "Build and download a professional resume for free. Multiple templates for students and freshers.",
    url: "https://mayra.in/resume-builder",
    type: "website",
  },
  alternates: {
    canonical: "https://mayra.in/resume-builder",
  },
};

export default function ResumeBuilderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
