import React from "react";
import Title from "./Title";
import { useScrollReveal } from "../../hooks/useScrollReveal";

const illustrations = {
  writing: (
    <svg viewBox="0 0 136 100" fill="none" style={{ width: "100%", height: "auto", display: "block" }}>
      <rect x="10" y="18" width="116" height="64" rx="8" fill="white" stroke="#c7d2fe" strokeWidth="1.5" />
      <rect x="24" y="30" width="50" height="5" rx="2.5" fill="#818cf8" opacity="0.7" />
      <rect x="24" y="40" width="68" height="4" rx="2" fill="#a5b4fc" opacity="0.55" />
      <rect x="24" y="48" width="44" height="4" rx="2" fill="#a5b4fc" opacity="0.55" />
      <rect x="82" y="30" width="36" height="5" rx="2.5" fill="#818cf8" opacity="0.7" />
      <rect x="82" y="40" width="28" height="4" rx="2" fill="#a5b4fc" opacity="0.55" />
      <circle cx="116" cy="66" r="14" fill="#14b8a6" opacity="0.2" />
      <path d="M110 66h12M116 60v12" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  templates: (
    <svg viewBox="0 0 136 100" fill="none" style={{ width: "100%", height: "auto", display: "block" }}>
      <rect x="12" y="14" width="50" height="72" rx="6" fill="white" stroke="#c7d2fe" strokeWidth="1.5" />
      <rect x="20" y="24" width="34" height="4" rx="2" fill="#818cf8" opacity="0.7" />
      <rect x="20" y="32" width="22" height="3" rx="1.5" fill="#a5b4fc" opacity="0.5" />
      <rect x="20" y="39" width="28" height="3" rx="1.5" fill="#a5b4fc" opacity="0.5" />
      <rect x="20" y="50" width="34" height="4" rx="2" fill="#14b8a6" opacity="0.5" />
      <rect x="20" y="58" width="14" height="3" rx="1.5" fill="#14b8a6" opacity="0.35" />
      <rect x="74" y="14" width="50" height="72" rx="6" fill="white" stroke="#ccfbf1" strokeWidth="1.5" />
      <rect x="85" y="24" width="28" height="34" rx="5" fill="#14b8a6" opacity="0.13" />
      <rect x="85" y="64" width="28" height="4" rx="2" fill="#2dd4bf" opacity="0.6" />
      <rect x="85" y="72" width="18" height="3" rx="1.5" fill="#ccfbf1" opacity="0.7" />
    </svg>
  ),
  colors: (
    <svg viewBox="0 0 136 100" fill="none" style={{ width: "100%", height: "auto", display: "block" }}>
      <rect x="10" y="20" width="116" height="60" rx="10" fill="white" stroke="#c7d2fe" strokeWidth="1.5" />
      <circle cx="38" cy="50" r="14" fill="#6366f1" />
      <circle cx="68" cy="50" r="14" fill="#14b8a6" />
      <circle cx="98" cy="50" r="14" fill="#8b5cf6" />
      <circle cx="128" cy="50" r="14" fill="#f59e0b" />
    </svg>
  ),
  import: (
    <svg viewBox="0 0 136 100" fill="none" style={{ width: "100%", height: "auto", display: "block" }}>
      <rect x="22" y="22" width="64" height="56" rx="6" fill="white" stroke="#c7d2fe" strokeWidth="1.5" />
      <rect x="32" y="34" width="44" height="4" rx="2" fill="#a5b4fc" opacity="0.55" />
      <rect x="32" y="42" width="30" height="3" rx="1.5" fill="#a5b4fc" opacity="0.45" />
      <rect x="32" y="50" width="38" height="3" rx="1.5" fill="#a5b4fc" opacity="0.45" />
      <path d="M98 48l14 14m0 0l-14 14m14-14H78" stroke="#0d9488" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="100" y="26" width="24" height="10" rx="3" fill="#14b8a6" opacity="0.2" />
      <text x="104" y="33" fontSize="6" fill="#0d9488" fontWeight="700" fontFamily="sans-serif">PDF</text>
    </svg>
  ),
  download: (
    <svg viewBox="0 0 136 100" fill="none" style={{ width: "100%", height: "auto", display: "block" }}>
      <rect x="10" y="16" width="116" height="68" rx="8" fill="white" stroke="#c7d2fe" strokeWidth="1.5" />
      <rect x="22" y="28" width="92" height="4" rx="2" fill="#a5b4fc" opacity="0.55" />
      <rect x="22" y="37" width="66" height="3" rx="1.5" fill="#a5b4fc" opacity="0.45" />
      <rect x="22" y="45" width="78" height="3" rx="1.5" fill="#a5b4fc" opacity="0.45" />
      <rect x="22" y="53" width="50" height="3" rx="1.5" fill="#a5b4fc" opacity="0.45" />
      <path d="M68 62v-12m0 0l-6 6m6-6l6 6" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="48" y="72" width="40" height="5" rx="2.5" fill="#14b8a6" opacity="0.2" />
    </svg>
  ),
  ats: (
    <svg viewBox="0 0 136 100" fill="none" style={{ width: "100%", height: "auto", display: "block" }}>
      <rect x="10" y="18" width="116" height="64" rx="8" fill="white" stroke="#c7d2fe" strokeWidth="1.5" />
      <circle cx="68" cy="50" r="20" fill="#eef2ff" />
      <circle cx="68" cy="50" r="17" fill="#e0e7ff" opacity="0.5" />
      <path d="M58 50l7 7 13-13" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <text x="62" y="46" fontSize="14" fill="#6366f1" fontWeight="800" fontFamily="monospace">95</text>
      <rect x="22" y="38" width="12" height="28" rx="3" fill="#a5b4fc" opacity="0.6" />
      <rect x="36" y="46" width="12" height="20" rx="3" fill="#818cf8" opacity="0.5" />
      <rect x="92" y="38" width="12" height="28" rx="3" fill="#a5b4fc" opacity="0.6" />
      <rect x="106" y="46" width="12" height="20" rx="3" fill="#818cf8" opacity="0.5" />
    </svg>
  ),
};

const features = [
  {
    illustration: "writing",
    title: "AI-Powered Writing",
    description:
      "Generate polished summaries and bullet points tailored to your role in seconds.",
  },
  {
    illustration: "templates",
    title: "Professional Templates",
    description:
      "Choose from 7 clean, recruiter-friendly layouts designed to make you stand out.",
  },
  {
    illustration: "colors",
    title: "Custom Accent Colors",
    description:
      "Personalize every template with your own accent color to match your style.",
  },
  {
    illustration: "import",
    title: "Import Existing Resume",
    description:
      "Upload a PDF and we'll parse it into an editable resume automatically.",
  },
  {
    illustration: "download",
    title: "One-Click PDF Export",
    description:
      "Download a pixel-perfect, print-ready PDF whenever you're ready to apply.",
  },
  {
    illustration: "ats",
    title: "ATS-Friendly",
    description:
      "Clean, structured formatting that applicant tracking systems can read with ease.",
  },
];

const Features = () => {
  const ref = useScrollReveal();

  return (
    <section
      id="features"
      className="mx-auto flex max-w-6xl scroll-mt-20 flex-col items-center px-6 py-20"
    >
      <div ref={ref} className="reveal flex flex-col items-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
          <svg className="size-4" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v3m0 0l-2-2m2 2l2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M3 8H2m12 0h-1M4 13l1-1m6 1l-1-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          <span>Everything you need</span>
        </div>

        <Title
          title="Build your resume, the smart way"
          description="A streamlined builder packed with intelligent tools to help you create a professional resume in minutes."
        />
      </div>

      <div className="mt-12 grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <div
            key={f.title}
            className="reveal group rounded-2xl border border-line bg-surface p-5 transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-100/50 dark:hover:shadow-black/20"
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            {/* Illustration */}
            <div className="mb-4 w-full overflow-hidden rounded-xl bg-gradient-to-br from-brand-50/80 to-accent-50/80 dark:from-brand-500/5 dark:to-accent-500/5">
              <div className="w-full p-2" style={{ aspectRatio: "3/2" }}>
                {illustrations[f.illustration]}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-ink">{f.title}</h3>
            <p className="mt-2 text-sm text-muted">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
