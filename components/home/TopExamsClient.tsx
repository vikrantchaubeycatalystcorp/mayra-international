"use client";

import Link from "next/link";
import { formatDate } from "../../lib/utils";

type ExamData = {
  id: string;
  name: string;
  slug: string;
  fullName: string;
  conductingBody: string;
  streams: string[];
  level: string;
  registrationStart: string | null;
  registrationEnd: string | null;
  examDate: string | null;
  resultDate: string | null;
  mode: string;
  frequency: string;
  participatingColleges: number | null;
  isFeatured: boolean;
};

type Status = { label: string; cls: string };

function statusFor(exam: ExamData): Status {
  const today = new Date();
  const regStart = exam.registrationStart ? new Date(exam.registrationStart) : null;
  const regEnd = exam.registrationEnd ? new Date(exam.registrationEnd) : null;
  const examDate = exam.examDate ? new Date(exam.examDate) : null;
  const resultDate = exam.resultDate ? new Date(exam.resultDate) : null;

  if (regStart && regEnd && regStart <= today && regEnd >= today)
    return { label: "Registration Open", cls: "badge-open" };
  if (regStart && regStart > today) return { label: "Upcoming", cls: "badge-upcoming" };
  if (resultDate && resultDate <= today) return { label: "Result Out", cls: "badge-result" };
  if (examDate && examDate > today) return { label: "Upcoming", cls: "badge-upcoming" };
  return { label: "Concluded", cls: "badge-closed" };
}

function nextDate(exam: ExamData): { label: string; value: string } {
  const today = new Date();
  const regStart = exam.registrationStart ? new Date(exam.registrationStart) : null;
  const regEnd = exam.registrationEnd ? new Date(exam.registrationEnd) : null;
  const examDate = exam.examDate ? new Date(exam.examDate) : null;
  if (regStart && regStart > today) return { label: "Registration opens", value: formatDate(exam.registrationStart!) };
  if (regEnd && regEnd >= today) return { label: "Registration ends", value: formatDate(exam.registrationEnd!) };
  if (examDate) return { label: "Exam date", value: formatDate(exam.examDate!) };
  if (exam.resultDate) return { label: "Result date", value: formatDate(exam.resultDate) };
  return { label: "Frequency", value: exam.frequency || "—" };
}

function ExamCard({ exam }: { exam: ExamData }) {
  const st = statusFor(exam);
  const next = nextDate(exam);
  return (
    <Link className="card card-hover exam-card" href={`/exams/${exam.slug}`}>
      <div className="ec-top">
        <span className={`badge ${st.cls}`}>
          <span className="dot" />
          {st.label}
        </span>
        <span className="chip" style={{ fontSize: "11.5px", padding: "3px 9px" }}>{exam.level}</span>
      </div>
      <h3 className="ec-name">{exam.name}</h3>
      <div className="ec-full">{exam.fullName || exam.conductingBody}</div>
      <div className="ec-meta">
        <div className="kv">
          <span className="k">Mode</span>
          <span className="v" style={{ fontSize: 14 }}>{exam.mode}</span>
        </div>
        <div className="kv">
          <span className="k">{exam.participatingColleges ? "Accepting colleges" : "Frequency"}</span>
          <span className="v" style={{ fontSize: 14 }}>
            {exam.participatingColleges ? `${exam.participatingColleges.toLocaleString("en-IN")}+` : exam.frequency}
          </span>
        </div>
      </div>
      <div className="ec-date">
        <span className="ec-date-k">{next.label}</span>
        <span className="ec-date-v">{next.value}</span>
      </div>
    </Link>
  );
}

type Props = {
  exams: ExamData[];
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaLink: string;
};

export function TopExamsClient({ exams, title, subtitle, ctaLink }: Props) {
  return (
    <section className="section" style={{ background: "var(--surface-2)", borderBlock: "1px solid var(--line)" }}>
      <div className="container">
        <div className="section-head">
          <div>
            <span className="kicker">Dates that matter</span>
            <h2 className="h-2" style={{ marginTop: 12 }}>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <Link className="link-arrow" href={ctaLink}>
            All exams <span className="ar">→</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" style={{ marginTop: 24 }}>
          {exams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      </div>
    </section>
  );
}
