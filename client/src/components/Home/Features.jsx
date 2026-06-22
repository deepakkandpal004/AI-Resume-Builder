import React from "react";
import {
  Sparkles,
  LayoutTemplate,
  Palette,
  Download,
  FileUp,
  ShieldCheck,
} from "lucide-react";
import Title from "./Title";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Writing",
    description:
      "Generate polished summaries and bullet points tailored to your role in seconds.",
    color: "brand",
  },
  {
    icon: LayoutTemplate,
    title: "Professional Templates",
    description:
      "Choose from clean, recruiter-friendly layouts designed to make you stand out.",
    color: "accent",
  },
  {
    icon: Palette,
    title: "Custom Accent Colors",
    description:
      "Personalize every template with your own accent color to match your style.",
    color: "brand",
  },
  {
    icon: FileUp,
    title: "Import Existing Resume",
    description:
      "Upload a PDF and we'll parse it into an editable resume automatically.",
    color: "accent",
  },
  {
    icon: Download,
    title: "One-Click PDF Export",
    description:
      "Download a pixel-perfect, print-ready PDF whenever you're ready to apply.",
    color: "brand",
  },
  {
    icon: ShieldCheck,
    title: "ATS-Friendly",
    description:
      "Clean, structured formatting that applicant tracking systems can read with ease.",
    color: "accent",
  },
];

const colorMap = {
  brand: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300",
  accent: "bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-300",
};

const Features = () => {
  return (
    <section
      id="features"
      className="mx-auto flex max-w-6xl scroll-mt-20 flex-col items-center px-6 py-20"
    >
      <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
        <Sparkles className="size-4" />
        <span>Everything you need</span>
      </div>

      <Title
        title="Build your resume, the smart way"
        description="A streamlined builder packed with intelligent tools to help you create a professional resume in minutes."
      />

      <div className="mt-12 grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="group rounded-2xl border border-line bg-surface p-6 transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-100/50 dark:hover:shadow-black/20"
            >
              <div
                className={`mb-4 inline-flex size-12 items-center justify-center rounded-xl ${colorMap[f.color]}`}
              >
                <Icon className="size-6" />
              </div>
              <h3 className="text-lg font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm text-muted">{f.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Features;
