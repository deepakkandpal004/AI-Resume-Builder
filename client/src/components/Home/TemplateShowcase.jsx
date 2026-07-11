import { motion, useReducedMotion } from "framer-motion";
import { LayoutTemplate, ArrowRight, Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import ClassicTemplate from "../templates/ClassicTemplate";
import ModernTemplate from "../templates/ModernTemplate";
import MinimalTemplate from "../templates/MinimalTemplate";
import ExecutiveTemplate from "../templates/ExecutiveTemplate";
import CreativeTemplate from "../templates/CreativeTemplate";
import CompactTemplate from "../templates/CompactTemplate";
import { dummyResumeData } from "../../assets/assets";
import { useScrollReveal } from "../../hooks/useScrollReveal";

const templates = [
  {
    id: "modern",
    name: "Modern",
    tag: "Most Popular",
    accent: "#10b981",
    desc: "Perfect for software engineers",
    ats: "98% ATS Compatible",
    component: ModernTemplate,
  },
  {
    id: "classic",
    name: "Classic",
    tag: "Recruiter Favorite",
    accent: "#6366f1",
    desc: "Traditional corporate resume",
    ats: "✓ ATS Friendly",
    component: ClassicTemplate,
  },
  {
    id: "minimal",
    name: "Minimal",
    tag: "Minimal",
    accent: "#2dd4bf",
    desc: "Clean ATS-friendly layout",
    ats: "✓ ATS Friendly",
    component: MinimalTemplate,
  },
  {
    id: "executive",
    name: "Executive",
    tag: "Leadership",
    accent: "#2563EB",
    desc: "Ideal for management roles",
    ats: "✓ ATS Friendly",
    component: ExecutiveTemplate,
  },
  {
    id: "creative",
    name: "Creative",
    tag: "Best for Tech",
    accent: "#E11D48",
    desc: "Designed for designers",
    ats: "98% ATS Compatible",
    component: CreativeTemplate,
  },
  {
    id: "compact",
    name: "Compact",
    tag: "One Page",
    accent: "#D97706",
    desc: "One-page professional layout",
    ats: "98% ATS Compatible",
    component: CompactTemplate,
  },
];

const TemplateShowcase = () => {
  const scrollRef = useScrollReveal();
  const data = dummyResumeData[0];
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <section id="templates" className="relative overflow-hidden px-6 py-24 md:px-10">
      {/* Background radial gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.03),transparent_50%),radial-gradient(circle_at_70%_70%,rgba(16,185,129,0.02),transparent_50%)] blur-3xl" />
      <div className="pointer-events-none absolute inset-0 dot-grid" />
      <div className="section-line absolute top-0 inset-x-0" />

      <div ref={scrollRef} className="mx-auto max-w-7xl reveal">
        {/* Header Block */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent-200 bg-accent-50 px-4 py-1.5 text-xs font-bold text-accent-700 dark:border-teal-500/20 dark:bg-teal-500/10 dark:text-accent-400">
            <LayoutTemplate className="size-4 text-brand-500" />
            <span>Templates</span>
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl leading-[1.15] max-w-3xl mx-auto">
            Professional templates that pass ATS scans
          </h2>
        </div>

        {/* Quick Stats Trust Indicators */}
        <div className="mt-8 flex flex-wrap justify-center gap-2.5 max-w-4xl mx-auto">
          {[
            "7 Premium Layouts",
            "ATS Optimized",
            "HR Approved",
            "Instant Preview",
          ].map((stat) => (
            <div
              key={stat}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/35 backdrop-blur-md px-3.5 py-1 text-xs font-semibold text-body select-none shadow-xs transition duration-250 cursor-default"
            >
              <Check className="size-3 text-brand-500" />
              <span>{stat}</span>
            </div>
          ))}
        </div>

        {/* Grid Container */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch"
        >
          {templates.map((t) => {
            const Template = t.component;
            const isFeatured = t.id === "modern";

            return (
              <motion.div
                variants={cardVariants}
                key={t.id}
                className="h-full"
              >
                <Link
                  to={`/app?template=${t.id}`}
                  aria-label={`Use ${t.name} Template`}
                  className={`group relative flex flex-col h-full overflow-hidden rounded-[24px] border bg-gradient-to-b transition-all duration-250 ease-out transform-gpu cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:-translate-y-2 focus-visible:scale-[1.01] focus-visible:shadow-2xl ${
                    isFeatured
                      ? "border-brand-500 bg-gradient-to-b from-brand-500/[0.04] to-surface/20 shadow-md shadow-brand-500/[0.02] hover:border-brand-500 hover:shadow-brand-500/[0.08] hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.18)] hover:-translate-y-2 hover:scale-[1.015]"
                      : "border-line/60 bg-gradient-to-b from-surface/40 to-surface/15 shadow-xs hover:border-brand-500/30 hover:shadow-brand-500/[0.04] hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.12)] hover:-translate-y-2 hover:scale-[1.005]"
                  }`}
                >
                  {/* Top Color Line */}
                  <div
                    className="absolute top-0 inset-x-0 h-1 z-10 opacity-60 group-hover:opacity-100 transition-opacity duration-250 ease-out"
                    style={{ backgroundColor: t.accent }}
                  />

                  {/* Glass Accent Badge */}
                  <div
                    className="absolute top-4 right-4 z-20 rounded-full px-3.5 py-1 text-[10.5px] font-bold shadow-sm backdrop-blur-md border transition-all duration-250 ease-out transform-gpu group-hover:scale-105 group-hover:-translate-y-0.5"
                    style={{
                      backgroundColor: `${t.accent}15`,
                      borderColor: `${t.accent}35`,
                      color: t.accent,
                    }}
                  >
                    <span className="flex items-center gap-1">
                      {isFeatured && <Sparkles className="size-3 text-brand-500 animate-pulse-soft" />}
                      {t.tag}
                    </span>
                  </div>

                  {/* Document Preview Area */}
                  <div className="relative h-[310px] w-full overflow-hidden bg-canvas/20 flex items-center justify-center p-5 border-b border-line/45">
                    
                    {/* Inner Shadow vignette */}
                    <div className="pointer-events-none absolute inset-0 rounded-2xl border border-black/[0.03] shadow-[inset_0_2px_8px_rgba(0,0,0,0.05)] z-10" />

                    <div className="resume-preview relative w-full h-full bg-white dark:bg-neutral-900 shadow-md rounded-2xl overflow-hidden border border-line/10 text-slate-900 dark:text-neutral-100 transition-all duration-250 ease-out transform-gpu group-hover:scale-[1.02]">
                      <div
                        className="origin-top"
                        style={{
                          transform: "scale(0.32)",
                          width: "calc(100% / 0.32)",
                          transformOrigin: "top left",
                        }}
                      >
                        <Template
                          data={data}
                          accentColor={t.accent}
                          styleOptions={{ fontSize: 11, lineSpacing: 1.3, pageSize: "letter" }}
                        />
                      </div>
                      
                      {/* Gradient Fade out */}
                      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white dark:from-neutral-900 via-white/80 dark:via-neutral-900/80 to-transparent z-10" />
                    </div>

                    {/* Use Template Overlay Button */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/[0.02] dark:bg-black/[0.08] md:bg-transparent md:group-hover:bg-black/10 transition-all duration-250 ease-out z-20">
                      <div className="rounded-xl border border-emerald-500/20 bg-emerald-600 text-white px-5 py-2.5 text-xs font-extrabold shadow-lg shadow-emerald-600/10 backdrop-blur-xs transition-all duration-250 ease-out transform-gpu opacity-100 translate-y-0 md:opacity-0 md:translate-y-3 md:group-hover:opacity-100 md:group-hover:translate-y-0 hover:scale-105 active:scale-95">
                        Use Template
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Info */}
                  <div className="flex flex-col gap-1.5 p-5 bg-surface/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: t.accent }}
                        />
                        <h3 className="font-bold text-ink text-sm sm:text-base">{t.name}</h3>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                        t.ats.includes("98%") 
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                          : "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                      }`}>
                        {t.ats}
                      </span>
                    </div>
                    <p className="text-xs text-muted leading-relaxed font-semibold mt-0.5">
                      {t.desc}
                    </p>
                  </div>

                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Global CTA Bottom */}
        <div className="mt-14 flex flex-col items-center gap-3 reveal" style={{ transitionDelay: "0.3s" }}>
          <Link
            to="/app"
            className="group inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-600/10 hover:bg-emerald-600 text-brand-600 hover:text-white px-8 py-3.5 text-sm font-bold shadow-md shadow-brand-500/5 hover:shadow-emerald-500/20 hover:-translate-y-0.5 transition-all duration-250 ease-out transform-gpu outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <span>Explore all templates</span>
            <ArrowRight className="size-4 transition-transform duration-250 ease-out transform-gpu group-hover:translate-x-1" />
          </Link>
          <div className="flex items-center gap-2 text-[11px] font-bold text-muted mt-1 select-none">
            <span>✓ Free forever</span>
            <span className="size-1 rounded-full bg-line" />
            <span>✓ No credit card required</span>
          </div>
        </div>
      </div>

      <div className="section-line absolute bottom-0 inset-x-0" />
    </section>
  );
};

export default TemplateShowcase;
