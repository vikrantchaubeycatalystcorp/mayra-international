"use client";

import { useEffect, useRef, useState } from "react";
import {
  GraduationCap, BookOpen, Users, TrendingUp, Award, Globe,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  GraduationCap, BookOpen, Users, TrendingUp, Award, Globe,
};

type StatData = {
  id: string;
  icon: string;
  value: number;
  suffix: string;
  label: string;
  sublabel: string | null;
  color: string;
  bgColor: string;
  iconColor: string;
};

function useCountUp(end: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

function StatCard({ stat, animate, index }: { stat: StatData; animate: boolean; index: number }) {
  const count = useCountUp(stat.value, 2000, animate);
  const Icon = iconMap[stat.icon] || Award;

  const formatValue = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${Math.floor(n / 1000)}K`;
    return n.toString();
  };

  return (
    <div
      className="group card-premium p-6 flex items-center gap-5"
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className={`relative h-14 w-14 rounded-2xl ${stat.bgColor} flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-110`}>
        <Icon className={`h-6 w-6 ${stat.iconColor} transition-transform duration-300`} />
        {/* Subtle glow ring on hover */}
        <div className={`absolute inset-0 rounded-2xl ${stat.bgColor} opacity-0 group-hover:opacity-50 blur-lg transition-opacity duration-500`} />
      </div>
      <div>
        <div className="flex items-end gap-0.5">
          <span className={`text-3xl sm:text-4xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent tracking-tight`}>
            {animate ? formatValue(count) : "0"}
          </span>
          <span className={`text-xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-0.5`}>
            {stat.suffix}
          </span>
        </div>
        <p className="font-semibold text-gray-900 text-sm mt-0.5">{stat.label}</p>
        {stat.sublabel && <p className="text-xs text-gray-400 mt-0.5">{stat.sublabel}</p>}
      </div>
    </div>
  );
}

type Props = {
  stats: StatData[];
  title: string;
  subtitle: string;
};

export function StatsSectionClient({ stats, title, subtitle }: Props) {
  const [animate, setAnimate] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimate(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const defaultStats: StatData[] = [
    { id: "1", icon: "GraduationCap", value: 25000, suffix: "+", label: "Colleges Listed", sublabel: "Across 28 states", color: "from-indigo-600 to-indigo-400", bgColor: "bg-indigo-50", iconColor: "text-indigo-600" },
    { id: "2", icon: "BookOpen", value: 500, suffix: "+", label: "Entrance Exams", sublabel: "National & State level", color: "from-orange-500 to-amber-400", bgColor: "bg-orange-50", iconColor: "text-orange-500" },
    { id: "3", icon: "Users", value: 1000000, suffix: "+", label: "Students Guided", sublabel: "Made better decisions", color: "from-emerald-600 to-emerald-400", bgColor: "bg-emerald-50", iconColor: "text-emerald-600" },
    { id: "4", icon: "TrendingUp", value: 800, suffix: "+", label: "Courses Available", sublabel: "UG, PG & Diploma", color: "from-purple-600 to-violet-400", bgColor: "bg-purple-50", iconColor: "text-purple-600" },
    { id: "5", icon: "Award", value: 99, suffix: "%", label: "Accuracy Rate", sublabel: "Verified information", color: "from-rose-500 to-pink-400", bgColor: "bg-rose-50", iconColor: "text-rose-500" },
    { id: "6", icon: "Globe", value: 10, suffix: "+", label: "Study Abroad Countries", sublabel: "International admissions", color: "from-cyan-600 to-sky-400", bgColor: "bg-cyan-50", iconColor: "text-cyan-600" },
  ];

  const displayStats = stats.length > 0 ? stats : defaultStats;

  return (
    <section className="py-20 bg-gradient-to-b from-white via-indigo-50/20 to-white relative" ref={ref}>
      {/* Subtle mesh background */}
      <div className="absolute inset-0 mesh-bg pointer-events-none" />
      <div className="container mx-auto relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 tracking-tight">{title}</h2>
          <p className="text-gray-500 text-base max-w-xl mx-auto">{subtitle}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayStats.map((stat, i) => (
            <StatCard key={stat.id} stat={stat} animate={animate} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
