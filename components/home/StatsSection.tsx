"use client";

import { useEffect, useRef, useState } from "react";
import { GraduationCap, BookOpen, Users, TrendingUp, Award, Globe } from "lucide-react";

const stats = [
  {
    icon: GraduationCap,
    value: 25000,
    suffix: "+",
    label: "Colleges Listed",
    sublabel: "Across 28 states",
    color: "from-blue-600 to-blue-400",
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: BookOpen,
    value: 500,
    suffix: "+",
    label: "Entrance Exams",
    sublabel: "National & State level",
    color: "from-orange-500 to-amber-400",
    bg: "bg-orange-50",
    iconColor: "text-orange-500",
  },
  {
    icon: Users,
    value: 1000000,
    suffix: "+",
    label: "Students Guided",
    sublabel: "Made better decisions",
    color: "from-green-600 to-emerald-400",
    bg: "bg-green-50",
    iconColor: "text-green-600",
  },
  {
    icon: TrendingUp,
    value: 800,
    suffix: "+",
    label: "Courses Available",
    sublabel: "UG, PG & Diploma",
    color: "from-purple-600 to-violet-400",
    bg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    icon: Award,
    value: 99,
    suffix: "%",
    label: "Accuracy Rate",
    sublabel: "Verified information",
    color: "from-red-500 to-rose-400",
    bg: "bg-red-50",
    iconColor: "text-red-500",
  },
  {
    icon: Globe,
    value: 10,
    suffix: "+",
    label: "Study Abroad Countries",
    sublabel: "International admissions",
    color: "from-cyan-600 to-sky-400",
    bg: "bg-cyan-50",
    iconColor: "text-cyan-600",
  },
];

function useCountUp(end: number, duration: number = 1500, start: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);

  return count;
}

function StatCard({ stat, animate }: { stat: typeof stats[0]; animate: boolean }) {
  const count = useCountUp(stat.value, 1800, animate);

  const formatValue = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${Math.floor(n / 1000)}K`;
    return n.toString();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 p-6 flex items-center gap-4">
      <div className={`h-14 w-14 rounded-2xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
        <stat.icon className={`h-7 w-7 ${stat.iconColor}`} />
      </div>
      <div>
        <div className="flex items-end gap-0.5">
          <span className={`text-2xl sm:text-3xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
            {animate ? formatValue(count) : "0"}
          </span>
          <span className={`text-xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
            {stat.suffix}
          </span>
        </div>
        <p className="font-bold text-gray-900 text-sm leading-tight">{stat.label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{stat.sublabel}</p>
      </div>
    </div>
  );
}

export function StatsSection() {
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
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50" ref={ref}>
      <div className="container mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
            Trusted by Millions of Students
          </h2>
          <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
            India&apos;s most comprehensive education portal with verified data and expert guidance
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} animate={animate} />
          ))}
        </div>
      </div>
    </section>
  );
}
