import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Sparkles, Check, LayoutTemplate, Lock, Star, ShieldCheck, FileText, Zap } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import ModernTemplate from "../templates/ModernTemplate";
import { dummyResumeData } from "../../assets/assets";

const AnimatedCounter = ({ value, duration = 1500 }) => {
  const hasNumbers = /[0-9]/.test(value);
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!hasNumbers) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          
          const numberPart = parseFloat(value.replace(/[^0-9.]/g, ""));
          const isDecimal = value.includes(".");
          
          let startTimestamp = null;
          const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentCount = progress * numberPart;
            setCount(isDecimal ? parseFloat(currentCount.toFixed(1)) : Math.floor(currentCount));
            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              setCount(numberPart);
            }
          };
          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [value, duration, hasNumbers]);

  if (!hasNumbers) {
    return <span>{value}</span>;
  }

  const suffix = value.replace(/[0-9.]/g, "");
  return (
    <span ref={elementRef}>
      {count}
      {suffix}
    </span>
  );
};

const Hero = () => {
  const { user } = useSelector((state) => state.auth);
  const shouldReduceMotion = useReducedMotion();

  // Dynamic simulation loop states (Stages: 0=Typing, 1=Suggesting, 2=Optimized, 3=Scoring, 4=Saved)
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStage((prev) => (prev + 1) % 5);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // Compute values for simulation states
  const jobTitleText = stage === 0 ? "Full Stack Dev" : "AI Platform Engineer";
  const atsScore = stage === 4 || stage === 3 ? 98 : 92;
  const isHighlight = stage >= 2;
  const isSuggesting = stage === 1;
  const isSaved = stage === 4;

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
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-[90px] pb-16 bg-grid-dot">
      {/* Visual background layers */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-canvas via-canvas/90 to-canvas" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.03),transparent_50%),radial-gradient(circle_at_70%_70%,rgba(16,185,129,0.02),transparent_50%)] blur-3xl" />
      <div className="pointer-events-none absolute inset-0 gradient-glow" />
      <div className="pointer-events-none absolute inset-0 gradient-glow-right" />

      {/* Floating color blobs */}
      <motion.div
        className="pointer-events-none absolute -top-48 left-1/2 -z-10 -translate-x-1/2 rounded-full bg-emerald-500/10"
        style={{ width: "600px", height: "600px", filter: "blur(130px)" }}
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-40 -right-24 -z-10 rounded-full bg-teal-400/10"
        style={{ width: "400px", height: "400px", filter: "blur(100px)" }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

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
              <Sparkles className="size-3 text-brand-500 animate-pulse" />
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
            Create ATS-Friendly Resumes <span className="text-gradient">That Get Interviews</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={animVariants}
            custom={0.16}
            initial="hidden"
            animate="visible"
            className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-body font-medium"
          >
            Build professional templates optimized for ATS, refine every bullet point using our AI resume builder, and export a polished PDF instantly.
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
              { label: "AI Powered", icon: Sparkles, color: "text-brand-600 bg-brand-500/10 border-brand-500/20 dark:text-brand-300" },
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
              aria-label={user ? "Go to Dashboard" : "Create My Resume"}
              className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-9 py-3.5 text-center text-sm font-extrabold shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 hover:scale-[1.01] transition-all duration-250 ease-out transform-gpu active:scale-98"
            >
              <span>{user ? "Go to Dashboard" : "Create My Resume"}</span>
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
            <div className="flex items-center gap-1.5">
              <Check className="size-3.5 text-brand-500" />
              <span>Free Forever</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="size-3.5 text-brand-500" />
              <span>No Credit Card</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="size-3.5 text-brand-500" />
              <span>Instant PDF Export</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="size-3.5 text-brand-500" />
              <span>No Hidden Charges</span>
            </div>
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
            {/* Interactive Browser Mockup Container */}
            <div className="animate-float" style={{ perspective: "1200px" }}>
              <div className="relative overflow-hidden rounded-[20px] border border-line bg-surface/50 backdrop-blur-md shadow-2xl shadow-emerald-500/[0.04] transition-all duration-300 hover:scale-[1.005] hover:shadow-emerald-500/[0.08] hover:border-brand-500/20">
                
                {/* Browser address bar chrome */}
                <div className="flex items-center gap-1.5 border-b border-line px-4 py-3 bg-surface/80">
                  <span className="size-2.5 rounded-full bg-red-400/70" />
                  <span className="size-2.5 rounded-full bg-yellow-400/70" />
                  <span className="size-2.5 rounded-full bg-emerald-400/70" />
                  <span className="ml-3 rounded-md bg-canvas px-3 py-1 text-[9px] font-bold text-muted border border-line/60 select-none">
                    app.resumeai.com/editor
                  </span>
                </div>

                {/* Editor Content simulation area */}
                <div className="p-4 bg-canvas/60">
                  <div className="grid grid-cols-5 gap-4">
                    
                    {/* Left: AI editor simulation panel */}
                    <div className="col-span-2 space-y-3 rounded-xl border border-line bg-surface/80 p-3.5 text-left shadow-sm">
                      <div className="flex items-center gap-1.5 border-b border-line/50 pb-2">
                        <span className="size-1.5 rounded-full bg-brand-500 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted">AI Editor</span>
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
                          <div className="relative rounded-lg border border-brand-300 bg-surface px-2.5 py-1.5 text-[10px] text-brand-600 dark:text-brand-400 font-bold overflow-hidden min-h-[28px] flex items-center">
                            <span>{jobTitleText}</span>
                            <span className="w-1.5 h-3 bg-brand-500 ml-0.5 animate-pulse" />
                          </div>
                        </div>

                        {/* Experience bullet optimizer container */}
                        <div className={`p-2.5 rounded-xl border transition-all duration-500 ${
                          isHighlight ? "border-brand-500/30 bg-brand-500/5" : "border-line bg-surface"
                        }`}>
                          <div className="text-[8px] text-muted font-bold mb-1 uppercase tracking-wide">Experience Bullet</div>
                          <div className="text-[9.5px] leading-relaxed text-ink font-semibold flex items-center justify-between gap-1.5">
                            <span>
                              {isHighlight 
                                ? "Boosted load speeds by 40% with virtualized list rendering." 
                                : "Led team to launch SaaS metrics dashboards..."}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Floating suggestion module */}
                      <div className={`rounded-xl border p-2.5 text-left transition-all duration-500 ${
                        isSuggesting || isHighlight ? "border-brand-500/30 bg-brand-500/5 shadow-xs" : "border-line bg-surface/30"
                      }`}>
                        <div className="flex items-center gap-1.5 text-[8px] font-bold text-brand-600">
                          <span className="size-1.5 rounded-full bg-brand-500 animate-ping" />
                          <span>AI Suggestion</span>
                        </div>
                        <p className="mt-1 text-[7.5px] leading-normal text-muted font-medium">
                          {isHighlight 
                            ? "Optimized details: 'Boosted load response by 40% with virtualized list matrices.'" 
                            : "Consider adding dynamic metrics or percent stats to increase score."}
                        </p>
                      </div>
                    </div>

                    {/* Right: preview canvas template simulator */}
                    <div className="col-span-3 flex flex-col rounded-xl border border-line bg-surface p-3.5 shadow-sm">
                      <div className="mb-2 flex items-center gap-1.5 text-left">
                        <span className="size-1.5 rounded-full bg-teal-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted">A4 Preview Canvas</span>
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

                  {/* bottom state panel status bar */}
                  <div className="mt-3 flex items-center justify-between rounded-xl border border-line bg-surface px-3 py-2 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-brand-500 animate-pulse" />
                      <span className="text-[10px] text-muted font-semibold">
                        {isSaved 
                          ? "✓ Saved • Updated just now" 
                          : "AI reviewing resume details..."}
                      </span>
                    </div>
                    <span className="text-[8.5px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-md dark:bg-brand-500/10">
                      {isSaved ? "Saved ✓" : "Editing..."}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* floating ATS Score gauge badge widget */}
            <motion.div
              animate={{ 
                scale: atsScore === 98 ? [1, 1.06, 1] : 1,
                y: [0, -3, 0]
              }}
              transition={{ 
                scale: { duration: 0.3 },
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
              className="absolute -bottom-4 -left-4 rounded-xl border border-line bg-surface/90 backdrop-blur-md px-4 py-2.5 shadow-xl flex items-center gap-3.5 z-20"
            >
              <div className="flex items-center gap-2 text-xs">
                <span className="text-emerald-500 font-extrabold text-sm transition-all duration-300">
                  ATS Score: {atsScore}%
                </span>
                <span className="text-line">|</span>
                <span className="text-ink font-bold text-[11px]">
                  {atsScore === 98 ? "Excellent Match" : "Good Match"}
                </span>
              </div>
            </motion.div>

            {/* floating dynamic bullet suggestions alert */}
            <motion.div
              animate={{ 
                y: [0, 4, 0]
              }}
              transition={{ 
                duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5
              }}
              className="absolute -right-4 top-1/3 rounded-xl border border-line bg-surface/90 backdrop-blur-md px-3.5 py-2 shadow-xl hidden sm:flex items-center gap-2 z-20"
            >
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[10px] font-bold text-purple-600">
                ✨
              </span>
              <span className="text-[10.5px] font-bold text-ink font-semibold">AI Improved bullets!</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Statistics Cards Fold */}
        <div className="w-full border-t border-line/45 pt-12 mt-8">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-teal-500/20 bg-teal-500/10 px-3.5 py-1 text-[10px] font-extrabold text-teal-600 dark:text-accent-400 uppercase tracking-wider select-none">
              <span>Trusted Worldwide</span>
            </div>
            <h3 className="text-2xl font-bold text-ink tracking-tight sm:text-3xl">
              Trusted by Thousands of Job Seekers
            </h3>
            <p className="text-xs sm:text-sm text-muted max-w-md mt-2 leading-relaxed font-semibold">
              Our metrics show the impact of an AI-optimized, ATS-compliant resume on job applications.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {[
              { value: "Instant", label: "PDF Downloads", desc: "Export your polished A4 resume directly to PDF with zero watermarks.", icon: FileText, accent: "#10b981" },
              { value: "ATS", label: "Optimized Formats", desc: "Clean structures explicitly designed to pass applicant tracking scanners.", icon: ShieldCheck, accent: "#6366f1" },
              { value: "AI", label: "Bullet Enhancer", desc: "Context-aware bullet suggestions to improve your job descriptions.", icon: Sparkles, accent: "#e11d48" },
              { value: "Lifetime", label: "Access Tier", desc: "Unlock professional elements with a one-time purchase. Zero subscriptions.", icon: Zap, accent: "#d97706" }
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="group relative flex flex-col justify-between p-6 rounded-[20px] border border-line/50 bg-gradient-to-b from-surface/20 to-surface/5 backdrop-blur-md cursor-default min-h-[170px] shadow-xs transition-all duration-250 ease-out transform-gpu hover:-translate-y-1.5 hover:border-brand-500/20 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.08)] hover:bg-surface/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col">
                      <span className="text-3xl font-extrabold tracking-tight text-brand-600 font-display">
                        <AnimatedCounter value={card.value} />
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

          {/* Trust Strip */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {[
              "ATS Optimized",
              "AI Powered",
              "Free Forever",
              "Secure",
              "Instant PDF Export"
            ].map((trust) => (
              <div
                key={trust}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/30 px-3.5 py-1 text-[10.5px] font-bold text-muted shadow-xs select-none cursor-default hover:border-brand-500/20 transition duration-200"
              >
                <Check className="size-3 text-brand-500" />
                <span>{trust}</span>
              </div>
            ))}
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
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-line/70 to-transparent" />
    </section>
  );
};

export default Hero;
