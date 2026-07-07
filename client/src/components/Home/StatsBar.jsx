import React, { useEffect, useState, useRef } from "react";
import { FileText, Palette, Sparkles, ShieldCheck } from "lucide-react";

const Counter = ({ target, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasRun = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRun.current) {
          hasRun.current = true;
          const duration = 1500;
          const steps = 30;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="stat-number text-3xl font-bold text-ink tabular-nums">
      {count}{suffix}
    </span>
  );
};

const stats = [
  { icon: FileText, value: 7, suffix: "", label: "Professional Templates", color: "brand" },
  { icon: ShieldCheck, value: 95, suffix: "%", label: "ATS Compatibility", color: "accent" },
  { icon: Sparkles, value: 1000, suffix: "+", label: "Resumes Created", color: "brand" },
  { icon: Palette, value: 100, suffix: "%", label: "Free to Use", color: "accent" },
];

const colorMap = {
  brand: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300",
  accent: "bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-300",
};

const StatsBar = () => {
  return (
    <section className="border-y border-line bg-surface/50">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 md:grid-cols-4 md:py-16">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex flex-col items-center text-center">
              <div className={`mb-3 inline-flex size-12 items-center justify-center rounded-xl ${colorMap[s.color]}`}>
                <Icon className="size-6" />
              </div>
              <Counter target={s.value} suffix={s.suffix} />
              <p className="mt-1 text-sm text-muted">{s.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default StatsBar;
