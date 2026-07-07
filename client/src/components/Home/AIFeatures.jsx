import React from "react";
import { Sparkles, BarChart3, FileText, MessageSquare, Target } from "lucide-react";
import Title from "./Title";
import { useScrollReveal } from "../../hooks/useScrollReveal";

const aiFeatures = [
  {
    icon: BarChart3,
    title: "ATS Score Checker",
    description: "Paste any job description and get an instant compatibility score with matched keywords, skills gaps, and ranked improvement suggestions.",
    color: "brand",
  },
  {
    icon: FileText,
    title: "Cover Letter Generator",
    description: "Generate tailored cover letters in formal, conversational, or enthusiastic tones — complete with company and role context.",
    color: "accent",
  },
  {
    icon: MessageSquare,
    title: "Interview Prep",
    description: "Get 10 role-specific interview questions with suggested answers across behavioural, technical, situational, and role-based categories.",
    color: "brand",
  },
  {
    icon: Target,
    title: "Resume Tailor",
    description: "Auto-tailor your summary, experience, and skills to match any job description with a before/after diff view.",
    color: "accent",
  },
];

const colorMap = {
  brand: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300",
  accent: "bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-300",
};

const AIFeatures = () => {
  const ref = useScrollReveal();

  return (
    <section id="ai-features" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
      <div ref={ref} className="reveal flex flex-col items-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent-50 px-4 py-1.5 text-sm text-accent-700 dark:bg-accent-500/10 dark:text-accent-300">
          <Sparkles className="size-4" />
          <span>AI-powered tools</span>
        </div>

        <Title
          title="Smart tools that give you an edge"
          description="Beyond just building resumes — get AI-powered insights to optimize every application."
        />
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {aiFeatures.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
            className="reveal group flex gap-5 rounded-2xl border border-line bg-surface p-6 transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-100/50 dark:hover:shadow-black/20"
            style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className={`flex size-14 shrink-0 items-center justify-center rounded-xl ${colorMap[f.color]}`}>
                <Icon className="size-7" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted leading-relaxed">{f.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AIFeatures;
