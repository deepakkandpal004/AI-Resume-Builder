import { FileText, Palette, Sparkles, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import Title from "./Title";

const steps = [
  {
    icon: FileText,
    title: "Choose a Template",
    desc: "Pick from 6 ATS-friendly templates and preview the layout before you start.",
    gradient: ["rgba(16,185,129,0.95)", "rgba(20,184,166,0.95)"],
  },
  {
    icon: Palette,
    title: "Add Your Information",
    desc: "Fill in your experience, education, and skills or import an existing PDF.",
    gradient: ["rgba(20,184,166,0.95)", "rgba(34,211,238,0.95)"],
  },
  {
    icon: Sparkles,
    title: "Optimize With AI",
    desc: "Improve bullets, check ATS compatibility, and tailor the resume for the role.",
    gradient: ["rgba(16,185,129,0.95)", "rgba(34,197,94,0.95)"],
  },
  {
    icon: Share2,
    title: "Download or Share",
    desc: "Export a PDF, copy a link, or print the final resume when it is ready.",
    gradient: ["rgba(20,184,166,0.95)", "rgba(16,185,129,0.95)"],
  },
];

const HowItWorks = () => {
  void motion;
  const ref = useScrollReveal();

  return (
    <section id="how-it-works" className="relative overflow-hidden px-6 py-28 md:px-10">
      <div className="pointer-events-none absolute inset-0 gradient-glow" />
      <div className="pointer-events-none absolute inset-0 dot-grid" />
      <div className="section-line absolute top-0 inset-x-0" />

      <div ref={ref} className="mx-auto max-w-7xl reveal">
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-brand-400">
            <FileText className="size-4" />
            How it works
          </div>
          <Title
            title="From blank page to polished resume in four steps"
            description="Choose a layout, add your content, improve with AI, then export or share."
          />
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="glass-card rounded-3xl p-8 md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
              Guided workflow
            </p>
            <h3 className="mt-4 text-3xl font-bold tracking-tight text-ink md:text-4xl">
              A focused flow that keeps you moving
            </h3>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-body">
              Fast setup, AI help when you need it, and instant export when you are done.
            </p>

            <div className="mt-8 space-y-3">
              {[
                "Fast setup with a guided flow",
                "AI help at the moment you need it",
                "Instant export or share when ready",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-line bg-surface/30 px-4 py-3 text-sm text-body"
                >
                  <span className="size-2 rounded-full bg-emerald-400" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-6 top-0 hidden h-full w-px bg-linear-to-b from-emerald-500/35 via-teal-500/20 to-transparent lg:block" />

            <div className="space-y-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.45, delay: index * 0.08 }}
                    className="relative rounded-3xl border border-line bg-surface/20 p-5 md:p-6"
                  >
                    <div className="flex items-start gap-4 md:gap-5">
                      <div
                        className="flex size-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${step.gradient[0]}, ${step.gradient[1]})`,
                        }}
                      >
                        <Icon className="size-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold tracking-[0.2em] text-emerald-400/70">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <h3 className="text-lg font-bold text-ink">{step.title}</h3>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-body md:max-w-xl">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="section-line absolute bottom-0 inset-x-0" />
    </section>
  );
};

export default HowItWorks;
