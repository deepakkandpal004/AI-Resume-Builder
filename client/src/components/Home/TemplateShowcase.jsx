import React from "react";
import { Sparkles, LayoutTemplate } from "lucide-react";
import Title from "./Title";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import ClassicTemplate from "../templates/ClassicTemplate";
import ModernTemplate from "../templates/ModernTemplate";
import MinimalTemplate from "../templates/MinimalTemplate";
import ExecutiveTemplate from "../templates/ExecutiveTemplate";
import CreativeTemplate from "../templates/CreativeTemplate";
import CompactTemplate from "../templates/CompactTemplate";
import { dummyResumeData } from "../../assets/assets";

const templates = [
  { id: "classic", name: "Classic", desc: "Traditional single-column", component: ClassicTemplate, accent: "#4F46E5" },
  { id: "modern", name: "Modern", desc: "Colored header banner", component: ModernTemplate, accent: "#0D9488" },
  { id: "minimal", name: "Minimal", desc: "Ultra-clean layout", component: MinimalTemplate, accent: "#7C3AED" },
  { id: "executive", name: "Executive", desc: "Bold gradient for seniors", component: ExecutiveTemplate, accent: "#2563EB" },
  { id: "creative", name: "Creative", desc: "Two-column vibrant", component: CreativeTemplate, accent: "#E11D48" },
  { id: "compact", name: "Compact", desc: "Space-efficient dense", component: CompactTemplate, accent: "#D97706" },
];

const TemplateShowcase = () => {
  const ref = useScrollReveal();
  const data = dummyResumeData[0];

  return (
    <section id="templates" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
      <div ref={ref} className="reveal flex flex-col items-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
          <LayoutTemplate className="size-4" />
          <span>Choose your style</span>
        </div>

        <Title
          title="Professional templates, fully customizable"
          description="Six distinct layouts designed to pass ATS scans and impress recruiters."
        />
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t, i) => {
          const Template = t.component;
          return (
            <div
              key={t.id}
            className="reveal group rounded-2xl border border-line bg-surface p-4 transition-all hover:-translate-y-1 hover:shadow-lg"
            style={{ transitionDelay: `${i * 100}ms` }}
            >
              {/* Mini preview */}
              <div className="overflow-hidden rounded-lg border border-line/50" style={{ maxHeight: "220px" }}>
                <div className="origin-top" style={{ transform: "scale(0.38)", width: "calc(100% / 0.38)", transformOrigin: "top left" }}>
                  <Template data={data} accentColor={t.accent} styleOptions={{ fontSize: 11, lineSpacing: 1.3, pageSize: "letter" }} />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-ink">{t.name}</h3>
                  <p className="text-xs text-muted">{t.desc}</p>
                </div>
                <span className="flex size-6 rounded-full" style={{ backgroundColor: t.accent }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TemplateShowcase;
