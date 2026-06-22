import React from "react";
import Title from "./Title";
import { Workflow, FilePlus2, Palette, Download } from "lucide-react";

const steps = [
  {
    icon: FilePlus2,
    step: "01",
    title: "Add your details",
    description:
      "Fill in your experience, education and skills — or upload an existing PDF and we'll parse it for you.",
  },
  {
    icon: Palette,
    step: "02",
    title: "Pick a template & color",
    description:
      "Choose a professional template and personalize it with your own accent color in real time.",
  },
  {
    icon: Download,
    step: "03",
    title: "Download & apply",
    description:
      "Export a clean, print-ready PDF and start applying to your next role with confidence.",
  },
];

const HowItWorks = () => {
  return (
    <section
      id="how"
      className="mx-auto flex max-w-6xl scroll-mt-20 flex-col items-center px-6 py-20"
    >
      <div className="inline-flex items-center gap-2 rounded-full bg-accent-50 px-4 py-1.5 text-sm text-accent-700 dark:bg-accent-500/10 dark:text-accent-300">
        <Workflow className="size-4" />
        <span>How it works</span>
      </div>

      <Title
        title="From blank page to polished resume"
        description="Three simple steps to a professional resume that's ready to send."
      />

      <div className="mt-12 grid w-full gap-5 md:grid-cols-3">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              className="relative rounded-2xl border border-line bg-surface p-7 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-100/50 dark:hover:shadow-black/20"
            >
              <span className="absolute right-6 top-6 font-display text-4xl font-bold text-brand-50 dark:text-brand-500/15">
                {s.step}
              </span>
              <div className="mb-5 inline-flex size-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                <Icon className="size-6" />
              </div>
              <h3 className="text-lg font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HowItWorks;
