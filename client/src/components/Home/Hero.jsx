import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ModernTemplate from "../templates/ModernTemplate";
import { dummyResumeData } from "../../assets/assets";

const Hero = () => {
  const { user } = useSelector((state) => state.auth);

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

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-[72px] bg-grid-dot">
      {/* Visual background layers */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-canvas via-canvas/90 to-canvas" />
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

      <div className="mx-auto flex w-full max-w-7xl flex-col px-6 py-16 lg:py-20 lg:px-8 z-10 gap-14">
        
        {/* Main Content Fold */}
        <div className="flex flex-col lg:flex-row items-center gap-12">
          
          {/* Left Side: Headline, Description, Social Proof, CTAs */}
          <div className="flex-1 text-center lg:text-left max-w-2xl lg:max-w-none flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mx-auto lg:mx-0 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/70 px-4.5 py-1.5 text-xs font-bold text-brand-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-brand-300">
                <Sparkles className="size-3 text-brand-500 animate-pulse" />
                <span>Build faster. Apply smarter.</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="mt-[20px] text-4xl font-extrabold leading-[1.08] text-ink sm:text-5xl md:text-6xl tracking-tight"
              style={{ letterSpacing: "-0.04em" }}
            >
              Create ATS-Friendly Resumes <span className="text-gradient">That Get Interviews</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="mt-[32px] mx-auto lg:mx-0 max-w-lg text-base sm:text-lg leading-relaxed text-body font-medium"
            >
              Build ATS-optimized resumes, improve every bullet point with AI, tailor your resume for any job description, and export a polished PDF in minutes.
            </motion.p>

            {/* Social Proof badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.24 }}
              className="mt-[28px] flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-muted"
            >
              <div className="flex items-center gap-1 bg-surface/50 border border-line px-3 py-1 rounded-full shadow-xs">
                <span className="text-amber-500">⭐⭐⭐⭐⭐</span>
                <span className="text-ink">4.9 / 5</span>
                <span className="text-[10px] text-muted">(12,000+ Resumes)</span>
              </div>
              <span className="hidden sm:inline text-line select-none">•</span>
              <div className="flex items-center gap-1.5 bg-surface/50 border border-line px-3 py-1 rounded-full shadow-xs">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-ink">95%</span>
                <span className="text-muted">Average ATS Score</span>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.32 }}
              className="mt-[32px] flex flex-col items-center gap-3.5 sm:flex-row sm:justify-center lg:justify-start"
            >
              <Link
                to="/app"
                className="btn-primary w-full sm:w-auto px-9 text-sm font-bold shadow-lg shadow-brand-500/10 cursor-pointer active:scale-95 transition-transform hover:scale-102 flex items-center justify-center gap-1.5 group animate-hover"
                style={{ minHeight: "3rem" }}
              >
                <span>{user ? "Go to Dashboard" : "Create Resume Free"}</span>
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#product-showcase"
                className="btn-outline w-full sm:w-auto px-8 text-sm font-bold cursor-pointer hover:bg-canvas hover:text-ink active:scale-95 transition-all flex items-center justify-center gap-1.5"
                style={{ minHeight: "3rem" }}
              >
                <Play className="size-3.5 text-brand-500 fill-brand-500" />
                <span>Watch 2-Min Demo</span>
              </a>
            </motion.div>

            {/* Reassurance Trust Text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.36 }}
              className="mt-[24px] text-[11px] font-bold text-muted/95 text-center lg:text-left leading-normal max-w-md mx-auto lg:mx-0"
            >
              Trusted by students, developers, and professionals creating ATS-ready resumes every day.
            </motion.p>

            {/* Feature Chips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.48 }}
              className="mt-[32px] flex flex-wrap items-center justify-center lg:justify-start gap-2.5"
            >
              {[
                { label: "6 ATS Templates", desc: "Parsed screens optimized" },
                { label: "AI Suggestions", desc: "Contextual rewrite pills" },
                { label: "One-Click Share", desc: "Vercel hosting style" }
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-1.5 rounded-xl border border-line bg-surface/35 hover:bg-surface hover:border-brand-500/20 px-3.5 py-1.5 text-[11px] transition duration-200 shadow-xs cursor-default"
                >
                  <span className="size-1.5 rounded-full bg-brand-500" />
                  <span className="font-bold text-ink">{item.label}</span>
                  <span className="text-[10px] text-muted">{item.desc}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Side: Mockup Frame with Interactive Animation */}
          <div className="flex-1 w-full lg:w-auto relative max-w-2xl lg:max-w-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Main Mockup Frame */}
              <div className="animate-float" style={{ perspective: "1200px" }}>
                <div className="relative overflow-hidden rounded-2xl border border-line bg-surface/50 backdrop-blur-md shadow-2xl shadow-emerald-500/10 transition-all duration-500 hover:shadow-emerald-500/20 group">
                  
                  {/* Browser bar */}
                  <div className="flex items-center gap-1.5 border-b border-line px-4 py-3 bg-surface/80">
                    <span className="size-2.5 rounded-full bg-red-400/70" />
                    <span className="size-2.5 rounded-full bg-yellow-400/70" />
                    <span className="size-2.5 rounded-full bg-emerald-400/70" />
                    <span className="ml-3 rounded-md bg-canvas px-3 py-1 text-[9px] font-bold text-muted border border-line/60">
                      app.resumeai.com/editor
                    </span>
                  </div>

                  {/* Editor Content Area */}
                  <div className="p-4 bg-canvas/60">
                    <div className="grid grid-cols-5 gap-4">
                      
                      {/* Left Column: editor simulator */}
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

                          {/* Interactive dynamic Bullet point simulator */}
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

                        {/* AI Suggestion box */}
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

                      {/* Right Column: preview page simulator */}
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

                    {/* bottom status strip */}
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

              {/* floating ATS Score gauge badge */}
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

              {/* floating feedback suggestion */}
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
                <span className="text-[10.5px] font-bold text-ink">AI Improved bullets!</span>
              </motion.div>
            </motion.div>
          </div>
        </div>


        {/* Statistics Cards Fold */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full border-t border-line/40 pt-10">
          {[
            { value: "12K+", label: "Resumes Created", desc: "Helping students and professionals land interviews worldwide." },
            { value: "95%", label: "ATS Success", desc: "Optimized for modern applicant tracking systems." },
            { value: "4.9★", label: "Rating", desc: "Loved by job seekers for speed and simplicity." },
            { value: "200+", label: "Companies", desc: "Resumes submitted to startups and global tech companies." }
          ].map((card, idx) => (
            <div
              key={idx}
              className="premium-card p-5 rounded-[22px] flex flex-col justify-between cursor-default min-h-[160px] transition-all duration-300 hover:-translate-y-1"
            >
              <div>
                <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-600">
                  {card.value}
                </p>
                <p className="text-xs font-bold text-ink mt-2">{card.label}</p>
              </div>
              <p className="text-[10px] text-muted mt-2.5 leading-relaxed">{card.desc}</p>
            </div>
          ))}
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
