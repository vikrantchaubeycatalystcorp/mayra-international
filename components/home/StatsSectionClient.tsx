"use client";

import { useEffect, useRef, useState } from "react";

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

function formatValue(n: number) {
  if (n >= 10000000) return `${(n / 10000000).toFixed(n % 10000000 ? 1 : 0)}Cr`;
  if (n >= 100000) return `${(n / 100000).toFixed(n % 100000 ? 1 : 0)}L`;
  return Math.round(n).toLocaleString("en-IN");
}

function useCountUp(end: number, duration = 1600, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(eased * end);
      if (progress < 1) requestAnimationFrame(step);
      else setCount(end);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
}

function StatCell({ stat, animate }: { stat: StatData; animate: boolean }) {
  const count = useCountUp(stat.value, 1500, animate);
  return (
    <div className="stat-cell">
      <div className="stat-num">
        <span>{animate ? formatValue(count) : formatValue(stat.value)}</span>
        <span className="u">{stat.suffix}</span>
      </div>
      <div className="stat-lbl">{stat.label}</div>
      {stat.sublabel && <div className="stat-sub">{stat.sublabel}</div>}
    </div>
  );
}

type Props = {
  stats: StatData[];
  title: string;
  subtitle: string;
};

export function StatsSectionClient({ stats }: Props) {
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
    { id: "1", icon: "", value: 25000, suffix: "+", label: "Colleges listed", sublabel: "Across all 28 states", color: "", bgColor: "", iconColor: "" },
    { id: "2", icon: "", value: 500, suffix: "+", label: "Entrance exams", sublabel: "National & state level", color: "", bgColor: "", iconColor: "" },
    { id: "3", icon: "", value: 1000000, suffix: "+", label: "Students guided", sublabel: "Better decisions made", color: "", bgColor: "", iconColor: "" },
    { id: "4", icon: "", value: 800, suffix: "+", label: "Courses mapped", sublabel: "UG, PG & diploma", color: "", bgColor: "", iconColor: "" },
    { id: "5", icon: "", value: 99, suffix: "%", label: "Data accuracy", sublabel: "Verified each cycle", color: "", bgColor: "", iconColor: "" },
    { id: "6", icon: "", value: 10, suffix: "+", label: "Study-abroad countries", sublabel: "Costed honestly", color: "", bgColor: "", iconColor: "" },
  ];

  const displayStats = stats.length > 0 ? stats.slice(0, 6) : defaultStats;

  return (
    <section className="statstrip" ref={ref}>
      <div className="container">
        <div className="stat-grid">
          {displayStats.map((stat) => (
            <StatCell key={stat.id} stat={stat} animate={animate} />
          ))}
        </div>
      </div>
    </section>
  );
}
