"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Monitor, Users, Clock, Zap } from "lucide-react";
import { Badge } from "../ui/badge";
import { cn, formatDate } from "../../lib/utils";

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

function ExamCard({ exam, index }: { exam: ExamData; index: number }) {
  const today = new Date();
  const regEnd = exam.registrationEnd ? new Date(exam.registrationEnd) : null;
  const examDate = exam.examDate ? new Date(exam.examDate) : null;
  const registrationOpen =
    regEnd && regEnd >= today && exam.registrationStart
      ? new Date(exam.registrationStart) <= today
      : false;
  const registrationUpcoming =
    exam.registrationStart ? new Date(exam.registrationStart) > today : false;

  // Days until deadline
  const daysUntilDeadline = regEnd ? Math.ceil((regEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const isUrgent = daysUntilDeadline !== null && daysUntilDeadline > 0 && daysUntilDeadline <= 14;

  return (
    <article className="card-premium p-5 flex flex-col gap-3.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-gray-900 text-base tracking-tight">{exam.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{exam.conductingBody}</p>
        </div>
        <div className="flex-shrink-0">
          {registrationOpen && (
            <Badge variant="success" className="text-xs flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Open
            </Badge>
          )}
          {registrationUpcoming && <Badge variant="warning" className="text-xs">Opens Soon</Badge>}
          {!registrationOpen && !registrationUpcoming && (
            <Badge variant="secondary" className="text-xs">
              {examDate && examDate > today ? "Upcoming" : "Completed"}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {exam.streams.slice(0, 2).map((s) => (
          <Badge key={s} variant="blue" className="text-xs">{s}</Badge>
        ))}
        <Badge variant="secondary" className="text-xs">{exam.level}</Badge>
      </div>

      {/* Date Cards */}
      <div className="grid grid-cols-2 gap-2">
        {exam.registrationEnd && (
          <div className={cn(
            "p-2.5 rounded-xl border transition-colors",
            isUrgent ? "bg-red-50 border-red-100" : "bg-orange-50/50 border-orange-100/50"
          )}>
            <div className="flex items-center gap-1 mb-1">
              <Clock className={cn("h-3 w-3", isUrgent ? "text-red-500" : "text-orange-500")} />
              <p className={cn("text-[10px] font-semibold uppercase tracking-wider", isUrgent ? "text-red-600" : "text-orange-600")}>
                {isUrgent ? `${daysUntilDeadline}d left` : "Deadline"}
              </p>
            </div>
            <p className="text-xs font-bold text-gray-800">{formatDate(exam.registrationEnd)}</p>
          </div>
        )}
        {exam.examDate && (
          <div className="p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
            <div className="flex items-center gap-1 mb-1">
              <Calendar className="h-3 w-3 text-indigo-500" />
              <p className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wider">Exam</p>
            </div>
            <p className="text-xs font-bold text-gray-800">{formatDate(exam.examDate)}</p>
          </div>
        )}
      </div>

      {/* Meta Info */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1"><Monitor className="h-3.5 w-3.5 text-gray-400" />{exam.mode}</span>
        {exam.participatingColleges && (
          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-gray-400" />{exam.participatingColleges}+ colleges</span>
        )}
        <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-gray-400" />{exam.frequency.split(" ")[0]}</span>
      </div>

      {/* CTA Button */}
      <Link
        href={`/exams/${exam.slug}`}
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 text-sm font-semibold shadow-md shadow-indigo-500/15 hover:shadow-lg hover:shadow-indigo-500/20 group"
      >
        <span>View Details</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </article>
  );
}

type Props = {
  exams: ExamData[];
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaLink: string;
};

export function TopExamsClient({ exams, title, subtitle, ctaLabel, ctaLink }: Props) {
  const [revealed, setRevealed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="section-padding bg-white relative" ref={ref}>
      <div className="container mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">{title}</h2>
            <p className="text-gray-500 mt-2 text-base max-w-lg">{subtitle}</p>
          </div>
          <Link
            href={ctaLink}
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/50 transition-all duration-300 whitespace-nowrap group"
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children", revealed && "revealed")}>
          {exams.map((exam, i) => (
            <ExamCard key={exam.id} exam={exam} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
