import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ArrowRight, Check, LayoutTemplate, Lock, Star, ShieldCheck, FileText, Clock, Lightbulb } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import ModernTemplate from "../templates/ModernTemplate";
import { dummyResumeData } from "../../assets/assets";

const Hero = () => {
  const { user } = useSelector((state) => state.auth);
  const shouldReduceMotion = useReducedMotion();

  // Static values for the mockup (no animation loop needed)
  const jobTitleText = "Platform Engineer";
  const atsScore = 96;

  const animVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 15 },
    visible: (customDelay) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: shouldReduceMotion ? 0 : customDelay,
        ease: "easeOut",
      },
    }),
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-[90px] pb-16">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-canvas" />

      <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-6 py-12 lg:py-16 lg:px-8 z-10 gap-14">
        
        {/* Main Content Fold (Centered Layout) */}
        <div className="flex flex-col items-center text-center max-w-4xl">
          
          {/* Badge */}
          <motion.div
            variants={animVariants}
            custom={0}
            initial="hidden"
            animate="visible"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/70 px-4.5 py-1.5 text-xs font-bold text-brand-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-brand-300">
              <Lightbulb className="size-3 text-brand-500" />
              <span>Build faster. Apply smarter.</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={animVariants}
            custom={0.08}
            initial="hidden"
            animate="visible"
            className="mt-6 text-4xl font-extrabold leading-[1.1] text-ink sm:text-5xl md:text-6xl lg:text-7xl tracking-tight max-w-4xl"
            style={{ letterSpacing: "-0.04em" }}
          >
            Create ATS-Friendly Resumes <span className="text-brand-600">That Get Interviews</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={animVariants}
            custom={0.16}
            initial="hidden"
            animate="visible"
            className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-body font-medium"
          >
            Build professional templates optimized for ATS, refine every bullet point with smart rewriting, and export a polished PDF instantly.
          </motion.p>

          {/* Trust Badges */}
          <motion.div
            variants={animVariants}
            custom={0.24}
            initial="hidden"
            animate="visible"
            className="mt-6 flex flex-wrap justify-center gap-2.5 max-w-3xl"
          >
            {[
              { label: "ATS Optimized", icon: Check, color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400" },
              { label: "Smart Rewriting", icon: Lightbulb, color: "text-indigo-600 bg-indigo-500/10 border-indigo-500/20 dark:text-indigo-400" },
              { label: "Professional Templates", icon: LayoutTemplate, color: "text-blue-600 bg-blue-500/10 border-blue-500/20 dark:text-blue-400" },
              { label: "Secure", icon: Lock, color: "text-purple-600 bg-purple-500/10 border-purple-500/20 dark:text-purple-400" },
              { label: "Free Forever", icon: Star, color: "text-amber-600 bg-amber-500/10 border-amber-500/20 dark:text-amber-400" },
            ].map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.label}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-[11px] font-bold transition-all duration-200 hover:scale-105 select-none shadow-xs cursor-default ${badge.color}`}
                >
                  <Icon className="size-3.5" />
                  <span>{badge.label}</span>
                </div>
              );
            })}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={animVariants}
            custom={0.3}
            initial="hidden"
            animate="visible"
            className="mt-8 flex flex-col items-center gap-3.5 sm:flex-row sm:justify-center w-full sm:w-auto"
          >
            <Link
              to="/app"
              aria-label={user ? "Go to Dashboard" : "Build My Resume"}
              className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-emerald-600 text-white px-9 py-3.5 text-center text-sm font-extrabold shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 hover:-translate-y-0.5 hover:scale-[1.01] transition-all duration-250 ease-out transform-gpu active:scale-98"
            >
              <span>{user ? "Go to Dashboard" : "Build My Resume"}</span>
              <ArrowRight className="size-4 transition-transform duration-250 ease-out transform-gpu group-hover:translate-x-1" />
            </Link>
            <a
              href="#templates"
              aria-label="Browse Templates"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-line bg-surface/35 hover:border-brand-500/30 text-body hover:text-ink px-8 py-3.5 text-center text-sm font-bold shadow-xs hover:shadow-md transition-all duration-250 ease-out transform-gpu active:scale-98"
            >
              <span>Browse Templates</span>
            </a>
          </motion.div>

          {/* Reassurance Trust Icons Text */}
          <motion.div
            variants={animVariants}
            custom={0.36}
            initial="hidden"
            animate="visible"
            className="mt-6 flex flex-wrap justify-center gap-6 text-[11px] font-extrabold text-muted select-none"
          >
            <span>No Credit Card</span>
            <span>Instant PDF Export</span>
            <span>No Hidden Charges</span>
          </motion.div>

        </div>

        {/* Product Preview Centered Below Content */}
        <div className="w-full relative max-w-4xl mt-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="relative group"
          >
            {/* Browser Mockup Container */}
            <div>
              <div className="relative overflow-hidden rounded-[20px] border border-line bg-surface/50 backdrop-blur-md shadow-2xl">
                
                {/* Browser address bar chrome */}
                <div className="flex items-center gap-1.5 border-b border-line px-4 py-3 bg-surface/80">
                  <span className="size-2.5 rounded-full bg-red-400/70" />
                  <span className="size-2.5 rounded-full bg-yellow-400/70" />
                  <span className="size-2.5 rounded-full bg-emerald-400/70" />
                  <span className="ml-3 rounded-md bg-canvas px-3 py-1 text-[9px] font-bold text-muted border border-line/60 select-none">
                    resumebuilder.com/editor
                  </span>
                </div>

                {/* Editor Content */}
                <div className="p-4 bg-canvas/60">
                  <div className="grid grid-cols-5 gap-4">
                    
                    {/* Left: editor panel */}
                    <div className="col-span-2 space-y-3 rounded-xl border border-line bg-surface/80 p-3.5 text-left shadow-sm">
                      <div className="flex items-center gap-1.5 border-b border-line/50 pb-2">
                        <span className="size-1.5 rounded-full bg-brand-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Resume Editor</span>
                      </div>
                      
                      <div className="space-y-2.5">
                        <div>
                          <div className="text-[8px] text-muted font-bold mb-1 uppercase tracking-wide">Full Name</div>
                          <div className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[10px] text-ink font-semibold">
                            Alex Smith
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-[8px] text-muted font-bold mb-1 uppercase tracking-wide">Job Title</div>
                          <div className="rounded-lg border border-brand-300 bg-surface px-2.5 py-1.5 text-[10px] text-brand-600 dark:text-brand-400 font-bold min-h-[28px] flex items-center">
                            <span>{jobTitleText}</span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl border border-brand-500/30 bg-brand-500/5">
                          <div className="text-[8px] text-muted font-bold mb-1 uppercase tracking-wide">Experience Bullet</div>
                          <div className="text-[9.5px] leading-relaxed text-ink font-semibold">
                            <span>Boosted load speeds by 40% with virtualized list rendering.</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-brand-500/30 bg-brand-500/5 p-2.5 text-left shadow-xs">
                        <div className="flex items-center gap-1.5 text-[8px] font-bold text-brand-600">
                          <span className="size-1.5 rounded-full bg-brand-500" />
                          <span>Smart Suggestion</span>
                        </div>
                        <p className="mt-1 text-[7.5px] leading-normal text-muted font-medium">
                          "Boosted load response by 40% with virtualized list matrices."
                        </p>
                      </div>
                    </div>

                    {/* Right: A4 preview */}
                    <div className="col-span-3 flex flex-col rounded-xl border border-line bg-surface p-3.5 shadow-sm">
                      <div className="mb-2 flex items-center gap-1.5 text-left">
                        <span className="size-1.5 rounded-full bg-teal-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted">A4 Preview</span>
                      </div>

                      <div className="relative flex-1 overflow-hidden rounded-lg bg-white shadow-inner border border-line/60" style={{ minHeight: "260px" }}>
                        <div 
                          className="absolute left-0 top-0 origin-top-left" 
                          style={{ 
                            transform: "scale(0.42)", 
                            width: "238%", 
                            height: "238%" 
                          }}
                        >
                          <ModernTemplate
                            data={dummyResumeData[0]}
                            accentColor="#10b981"
                            styleOptions={{}}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status bar */}
                  <div className="mt-3 flex items-center justify-between rounded-xl border border-line bg-surface px-3 py-2 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-brand-500" />
                      <span className="text-[10px] text-muted font-semibold">
                        Saved • Updated just now
                      </span>
                    </div>
                    <span className="text-[8.5px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-md dark:bg-brand-500/10">
                      Saved ✓
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ATS Score badge — static, no floating animation */}
            <div className="absolute -bottom-4 -left-4 rounded-xl border border-line bg-surface/90 backdrop-blur-md px-4 py-2.5 shadow-xl flex items-center gap-3.5 z-20">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-emerald-500 font-extrabold text-sm">
                  ATS Score: {atsScore}%
                </span>
                <span className="text-line">|</span>
                <span className="text-ink font-bold text-[11px]">
                  Excellent Match
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Statistics Cards Fold */}
        <div className="w-full border-t border-line/45 pt-12 mt-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-teal-500/20 bg-teal-500/10 px-3.5 py-1 text-[10px] font-extrabold text-teal-600 dark:text-accent-400 uppercase tracking-wider select-none">
              <span>Built for Job Seekers</span>
            </div>
            <h3 className="text-2xl font-bold text-ink tracking-tight sm:text-3xl">
              Trusted by Job Seekers Everywhere
            </h3>
            <p className="text-xs sm:text-sm text-muted max-w-md mt-2 leading-relaxed font-semibold">
              See how an ATS-optimized resume improves your chances of landing interviews.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {[
              { value: "Instant", label: "PDF Downloads", desc: "Export your polished A4 resume directly to PDF with zero watermarks.", icon: FileText, accent: "#475569" },
              { value: "ATS", label: "Optimized Formats", desc: "Clean structures explicitly designed to pass applicant tracking scanners.", icon: ShieldCheck, accent: "#6366f1" },
              { value: "Smart", label: "Bullet Rewriter", desc: "Context-aware suggestions to strengthen your job descriptions.", icon: Lightbulb, accent: "#e11d48" },
              { value: "One-time", label: "Payment", desc: "Unlock professional elements with a single purchase. Zero subscriptions.", icon: Clock, accent: "#d97706" }
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="group relative flex flex-col justify-between p-6 rounded-[20px] border border-line/50 bg-surface/60 backdrop-blur-md cursor-default min-h-[170px] shadow-xs transition-all duration-250 ease-out transform-gpu hover:-translate-y-1.5 hover:border-brand-500/20 hover:shadow-lg hover:bg-surface/80"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <span className="text-3xl font-extrabold tracking-tight text-ink font-display">
                        {card.value}
                      </span>
                      <span className="text-xs font-bold text-ink mt-1.5">{card.label}</span>
                    </div>
                    <div 
                      className="p-2.5 rounded-xl border border-line bg-surface transition-all duration-250 ease-out transform-gpu group-hover:scale-110 group-hover:rotate-3"
                      style={{ color: card.accent }}
                    >
                      <Icon className="size-4.5" />
                    </div>
                  </div>
                  <p className="text-[10.5px] text-muted leading-relaxed font-semibold mt-4">{card.desc}</p>
                </div>
              );
            })}
          </div>

        </div>

        {/* Scroll Indicator */}
        <div 
          className="flex flex-col items-center justify-center pt-8 cursor-pointer group select-none" 
          onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
        >
          <span className="text-[11px] font-bold text-muted group-hover:text-brand-600 transition-colors">See How It Works</span>
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-muted group-hover:text-brand-600 transition-colors mt-1 font-bold"
          >
            ↓
          </motion.div>
        </div>

      </div>
      {/* Gentle Section Divider Line */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-line/30" />
    </section>
  );
};

export default Hero;
