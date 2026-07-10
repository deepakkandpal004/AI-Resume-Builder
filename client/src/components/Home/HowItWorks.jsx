import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, Palette, Sparkles, Share2, ArrowRight, Clock, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import Title from "./Title";

const steps = [
  {
    icon: FileText,
    title: "Choose a Template",
    time: "30 sec",
    desc: "Choose from professionally designed ATS-friendly templates and preview them before you start.",
    gradient: ["rgba(16,185,129,0.95)", "rgba(20,184,166,0.95)"],
  },
  {
    icon: Palette,
    title: "Add Your Information",
    time: "5 min",
    desc: "Fill in your experience, education, and skills or import an existing resume to parse details.",
    gradient: ["rgba(20,184,166,0.95)", "rgba(34,211,238,0.95)"],
  },
  {
    icon: Sparkles,
    title: "Optimize With AI",
    time: "20 sec",
    desc: "Rewrite bullet points, improve ATS compatibility, strengthen action verbs, and tailor your resume to the job description.",
    gradient: ["rgba(16,185,129,0.95)", "rgba(34,197,94,0.95)"],
  },
  {
    icon: Share2,
    title: "Download or Share",
    time: "Instant",
    desc: "Export a print-ready PDF, copy a custom hosting link, or publish details instantly.",
    gradient: ["rgba(20,184,166,0.95)", "rgba(16,185,129,0.95)"],
  },
];

const HowItWorks = () => {
  const scrollRef = useScrollReveal();

  // Interactive Demonstration loop states
  const [demoProgress, setDemoProgress] = useState(0);
  const [atsScore, setAtsScore] = useState(82);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    // 1. Stagger active step highlight
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 4500);

    // 2. Loop stats demo
    const progressInterval = setInterval(() => {
      setDemoProgress((p) => (p === 0 ? 76 : 0));
      setAtsScore((s) => (s === 82 ? 96 : 82));
    }, 9000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <section id="how-it-works" className="relative overflow-hidden px-6 py-28 md:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.06),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 dot-grid" />
      <div className="section-line absolute top-0 inset-x-0" />

      <div ref={scrollRef} className="mx-auto max-w-7xl reveal">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-brand-400">
            <FileText className="size-4 text-brand-500 animate-pulse" />
            <span>Interactive Guide</span>
          </div>
          <Title
            title="Create your winning resume in minutes"
            description="Our structured flow takes the friction out of building, formatting, and optimization."
          />
        </div>

        {/* Product Walkthrough Content Grid */}
        <div className="mt-16 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
          
          {/* Left Panel: Live Workflow Demonstration */}
          <div className="glass-card rounded-[24px] p-8 md:p-10 flex flex-col justify-between border border-line bg-surface/40 relative overflow-hidden shadow-2xl">
            
            {/* Faint animated grid backing inside panel */}
            <div className="absolute inset-0 bg-grid-dot opacity-40 pointer-events-none" />
            
            <div className="relative z-10 space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-500">
                  Live workflow demo
                </p>
                <h3 className="mt-4 text-3xl font-bold tracking-tight text-ink md:text-4xl">
                  Watch your progress grow
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-body max-w-md">
                  Observe the building process take place in real-time as formatting, keywords, and ATS scores optimize dynamically.
                </p>
              </div>

              {/* Progress Panel Simulation */}
              <div className="space-y-4 rounded-2xl border border-line bg-surface/85 p-5 shadow-xs">
                
                {/* Resume build progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-ink mb-1.5">
                    <span>Formatting Status</span>
                    <span>{demoProgress === 0 ? "Initializing..." : `${demoProgress}%`}</span>
                  </div>
                  <div className="h-2 w-full bg-line rounded-full overflow-hidden">
                    <motion.div
                      animate={{ width: demoProgress === 0 ? "20%" : `${demoProgress}%` }}
                      transition={{ duration: 1.8, ease: "easeInOut" }}
                      className="h-full bg-gradient-to-r from-brand-500 to-teal-400"
                    />
                  </div>
                </div>

                {/* Live AI Optimization bullet check */}
                <div className="p-3.5 rounded-xl border border-line/65 bg-canvas/30 space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-brand-600 flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-brand-500 animate-ping" />
                      AI Suggestion
                    </span>
                    <span className="text-[9px] text-muted font-bold">Step 3 of 4</span>
                  </div>
                  
                  {/* Dynamic bullet text toggle */}
                  <div className="text-[11px] leading-relaxed text-ink font-semibold">
                    {demoProgress === 0 ? (
                      <span className="text-muted/80">"I helped speed up database queries."</span>
                    ) : (
                      <span className="text-ink flex items-center gap-1">
                        ✨ "Boosted database queries by 45% using indexed Redis keys."
                      </span>
                    )}
                  </div>
                </div>

                {/* Score and checkmarks grid */}
                <div className="grid grid-cols-2 gap-3.5 pt-1">
                  
                  {/* ATS Score card */}
                  <div className="p-3.5 rounded-xl border border-line/65 bg-canvas/30 text-center flex flex-col justify-center">
                    <span className="text-[9px] font-bold text-muted uppercase">ATS Score</span>
                    <motion.span 
                      animate={{ scale: atsScore === 96 ? [1, 1.08, 1] : 1 }}
                      className="text-2xl font-extrabold text-brand-600 mt-1"
                    >
                      {atsScore}%
                    </motion.span>
                    <span className="text-[8.5px] font-bold text-ink mt-0.5">
                      {atsScore === 96 ? "Excellent Match" : "Keywords low"}
                    </span>
                  </div>

                  {/* Checklist indicators */}
                  <div className="space-y-1.5 justify-center flex flex-col text-xs font-semibold text-body">
                    {[
                      { label: "Grammar fixed", ok: demoProgress > 0 },
                      { label: "Keywords match", ok: demoProgress > 0 },
                      { label: "PDF Download ready", ok: demoProgress > 0 }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className={`size-4 rounded-full flex items-center justify-center text-[9px] ${
                          item.ok ? "bg-emerald-500/10 text-emerald-500" : "bg-line text-muted/50"
                        }`}>
                          <Check className="size-2.5" />
                        </span>
                        <span className={item.ok ? "text-ink font-bold" : "text-muted"}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>

                </div>

              </div>
            </div>

            {/* Static assurance footer */}
            <div className="mt-8 text-xs font-bold text-muted flex items-center gap-2 border-t border-line/45 pt-4">
              <span className="size-1.5 rounded-full bg-brand-500 animate-pulse" />
              <span>Includes automatic parsing checks for compliance.</span>
            </div>

          </div>

          {/* Right Panel: Staggered Workflow timeline */}
          <div className="relative flex flex-col justify-between">
            
            {/* Desktop timeline line overlay */}
            <div className="absolute left-[36px] top-8 hidden h-[84%] w-px bg-gradient-to-b from-brand-500/35 via-teal-500/20 to-transparent lg:block" />

            <div className="space-y-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = activeStep === index;
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, delay: index * 0.12 }}
                    className={`relative rounded-[22px] border p-5 md:p-6 transition-all duration-300 group cursor-default ${
                      isActive 
                        ? "border-brand-500/30 bg-brand-500/5 shadow-md" 
                        : "border-line bg-surface/30 hover:border-brand-500/20"
                    }`}
                  >
                    <div className="flex items-start gap-4 md:gap-5">
                      
                      {/* step icon wrapper */}
                      <div
                        className="flex size-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md transition-transform duration-300 group-hover:scale-105"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${step.gradient[0]}, ${step.gradient[1]})`,
                        }}
                      >
                        <Icon className="size-5 animate-pulse-soft" />
                      </div>

                      <div className="flex-1">
                        
                        {/* step header: index, title, completion time */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-bold tracking-[0.2em] text-brand-600">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <h3 className="text-base font-bold text-ink group-hover:text-brand-700 transition-colors">
                              {step.title}
                            </h3>
                          </div>
                          <span className="flex items-center gap-1 text-[9.5px] font-bold text-muted bg-canvas px-2.5 py-0.5 rounded-full border border-line">
                            <Clock className="size-2.5" />
                            <span>{step.time}</span>
                          </span>
                        </div>

                        <p className="mt-2 text-xs leading-relaxed text-body md:max-w-xl">
                          {step.desc}
                        </p>

                        {/* Mini product preview block inside card */}
                        <div className="mt-3.5 border-t border-line/40 pt-3">
                          {index === 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold text-muted uppercase">Layout Grid:</span>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3].map((v) => (
                                  <div key={v} className="h-6 w-5 rounded border border-line bg-surface flex flex-col p-0.5 gap-0.5 shadow-xs">
                                    <div className="h-1 w-full bg-brand-500/20 rounded-xs" />
                                    <div className="h-0.5 w-3 bg-muted/20 rounded-xs" />
                                    <div className="h-0.5 w-2.5 bg-muted/25 rounded-xs" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {index === 1 && (
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold text-muted uppercase">Data Form:</span>
                              <div className="flex gap-1">
                                <div className="h-4.5 w-16 rounded border border-line bg-surface px-1 py-0.5 text-[7px] text-muted truncate">
                                  Alex Smith
                                </div>
                                <div className="h-4.5 w-20 rounded border border-brand-300 bg-surface px-1 py-0.5 text-[7px] text-brand-600 truncate font-semibold">
                                  Engineer
                                </div>
                              </div>
                            </div>
                          )}

                          {index === 2 && (
                            <div className="flex items-center gap-1.5 text-[9px] text-brand-600 font-bold">
                              <span>✨ AI suggests action verbs to describe dashboard queries compliance.</span>
                            </div>
                          )}

                          {index === 3 && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9.5px] text-emerald-500 font-bold flex items-center gap-1">
                                <span className="size-1 rounded-full bg-emerald-500 animate-ping" />
                                ready_for_export.pdf
                              </span>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </div>

        {/* Section bottom CTA transition */}
        <div className="mt-16 flex flex-col items-center justify-center text-center space-y-3 pt-10 border-t border-line/45">
          <h4 className="text-lg font-bold text-ink">Ready to build your resume?</h4>
          <Link
            to="/app"
            className="btn-primary px-8.5 py-3 text-xs font-bold shadow-lg shadow-brand-500/10 cursor-pointer active:scale-95 transition-transform hover:scale-102 flex items-center justify-center gap-1.5 group"
            style={{ minHeight: "2.75rem" }}
          >
            <span>Start Building Free</span>
            <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <p className="text-[10px] text-muted font-semibold">No credit card required. Free forever.</p>
        </div>

      </div>

      <div className="section-line absolute bottom-0 inset-x-0" />
    </section>
  );
};

export default HowItWorks;
