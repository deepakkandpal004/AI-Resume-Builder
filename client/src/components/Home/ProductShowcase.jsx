import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles, LayoutDashboard, BarChart3, ArrowRight, Check, Loader2 } from "lucide-react";
import { useScrollReveal } from "../../hooks/useScrollReveal";

const TABS = [
  { id: "builder", label: "Resume Builder", icon: FileText },
  { id: "ai", label: "AI Optimizer", icon: Sparkles },
  { id: "templates", label: "Templates", icon: LayoutDashboard },
  { id: "ats", label: "ATS Score", icon: BarChart3 },
];

const BrowserChrome = ({ children, savedTime, statusText }) => (
  <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl relative">
    {/* Browser header bar */}
    <div className="flex items-center justify-between border-b border-line px-4 py-3 bg-line/10">
      <div className="flex items-center gap-2">
        {/* macOS traffic lights */}
        <span className="size-2.5 rounded-full bg-red-400/60" />
        <span className="size-2.5 rounded-full bg-yellow-400/60" />
        <span className="size-2.5 rounded-full bg-emerald-400/60" />
        <span className="ml-3 rounded-md bg-canvas border border-line px-3 py-0.5 text-[10px] text-muted font-semibold tracking-wide">
          app.resumebuilder.io/editor
        </span>
      </div>
      <div className="flex items-center gap-2 text-[10px] font-semibold text-muted">
        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>{statusText || "Draft"}</span>
        <span className="text-line">•</span>
        <span>Saved {savedTime || "just now"}</span>
      </div>
    </div>
    {children}
  </div>
);

const ProductShowcase = () => {
  const scrollRef = useScrollReveal();
  const [activeTab, setActiveTab] = useState("builder");
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  // Resume Builder state variables
  const [typedRole, setTypedRole] = useState("Full Stack Dev");
  const [typedCursor, setTypedCursor] = useState(true);

  // AI Optimization state variables
  const [aiStep, setAiStep] = useState(0); // 0: Weak, 1: Analyzing, 2: Improving, 3: Completed

  // Template State
  const [selectedTemplate, setSelectedTemplate] = useState("Modern");

  // ATS score gauge loop values
  const [atsScore, setAtsScore] = useState(82);

  // Toast notifications trigger states
  const [toastMessage, setToastMessage] = useState("");

  // 1. Auto play loops (every 9.5s)
  useEffect(() => {
    if (isUserInteracting) return;

    const mainTimer = setInterval(() => {
      setActiveTab((prev) => {
        const idx = TABS.findIndex((t) => t.id === prev);
        const nextId = TABS[(idx + 1) % TABS.length].id;
        return nextId;
      });
    }, 9500);

    return () => clearInterval(mainTimer);
  }, [isUserInteracting]);

  // 2. Typing loop for Builder
  useEffect(() => {
    if (activeTab !== "builder") return;

    // Reset initially
    setTypedRole("Full Stack Dev");
    setTypedCursor(true);

    const step1 = setTimeout(() => setTypedRole("Full Stack Deve"), 1200);
    const step2 = setTimeout(() => setTypedRole("Full Stack Devel"), 1500);
    const step3 = setTimeout(() => setTypedRole("Full Stack Develop"), 1800);
    const step4 = setTimeout(() => {
      setTypedRole("Full Stack Developer");
      setToastMessage("Autosaved ✓");
    }, 2100);

    // Blinking cursor simulation
    const cursorInterval = setInterval(() => {
      setTypedCursor((c) => !c);
    }, 500);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      clearTimeout(step4);
      clearInterval(cursorInterval);
    };
  }, [activeTab]);

  // 3. AI optimizer step loop
  useEffect(() => {
    if (activeTab !== "ai") return;

    setAiStep(0);
    setAtsScore(82);

    const step1 = setTimeout(() => setAiStep(1), 2000); // Analyzing
    const step2 = setTimeout(() => setAiStep(2), 4000); // Improving
    const step3 = setTimeout(() => {
      setAiStep(3); // Completed
      setAtsScore(96);
      setToastMessage("AI Rewrite Finished! ✨");
    }, 6000);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
    };
  }, [activeTab]);

  // 4. Auto close toasts
  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(""), 2500);
    return () => clearTimeout(t);
  }, [toastMessage]);

  // User click wrapper
  const handleTabClick = (tabId) => {
    setIsUserInteracting(true);
    setActiveTab(tabId);
    setToastMessage(`Switched to ${TABS.find((t) => t.id === tabId).label}`);
  };

  return (
    <section id="product-showcase" className="relative overflow-hidden px-6 py-28 md:px-10">
      {/* Background polish */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.04),_transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-30" />
      <div className="section-line absolute top-0 inset-x-0" />

      <div ref={scrollRef} className="mx-auto max-w-7xl reveal">
        
        {/* Outcome-driven header block */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-500/10 px-4 py-1.5 text-xs font-bold text-teal-600 dark:text-accent-400">
            <LayoutDashboard className="size-4 text-brand-500 animate-pulse" />
            <span>Product Showcase</span>
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl leading-[1.1] max-w-4xl">
            Everything happens in one intelligent workspace
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-body font-medium">
            Everything works together seamlessly—from editing and AI optimization to ATS scoring and export—so you can focus on landing interviews.
          </p>

          {/* Minimal Feature pills */}
          <div className="mt-6 flex flex-wrap justify-center gap-2.5 max-w-2xl">
            {[
              { label: "⚡ Live Preview" },
              { label: "✨ AI Rewrite" },
              { label: "📄 ATS Templates" },
              { label: "📈 ATS Checker" },
              { label: "⬇ Export PDF" }
            ].map((pill) => (
              <span
                key={pill.label}
                className="px-3.5 py-1.5 rounded-full text-[10.5px] font-bold border border-line bg-surface/35 text-ink hover:-translate-y-0.5 hover:border-brand-500/20 hover:shadow-xs transition duration-200 cursor-default flex items-center gap-1.5"
              >
                {pill.label}
              </span>
            ))}
          </div>
        </div>

        {/* Tab Selection */}
        <div className="mt-10 max-w-5xl mx-auto px-0 sm:px-4">
          <div className="flex flex-wrap justify-center gap-2 rounded-2xl border border-line bg-surface/30 p-1.5">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all duration-300 relative cursor-pointer ${
                    isActive
                      ? "bg-brand-500/10 text-brand-600 shadow-xs"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  <Icon className="size-4 animate-pulse-soft" />
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="showcase-underline"
                      className="absolute bottom-0 inset-x-0 h-[2px] bg-brand-500 rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Browser Demonstration Window Wrapper */}
          <div className="mt-10 relative">
            
            {/* Floating callout badges (Visible on lg viewports, hidden on mobile) */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -left-12 z-20 hidden lg:flex items-center gap-1.5 rounded-full border border-brand-500/20 bg-surface/85 backdrop-blur-md px-3.5 py-1.5 text-[10px] font-bold text-brand-600 shadow-lg cursor-default"
            >
              <Check className="size-3 text-brand-500" />
              <span>ATS Score 96%</span>
            </motion.div>

            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -right-12 z-20 hidden lg:flex items-center gap-1.5 rounded-full border border-line bg-surface/85 backdrop-blur-md px-3.5 py-1.5 text-[10px] font-bold text-ink shadow-lg cursor-default"
            >
              <Check className="size-3 text-brand-500" />
              <span>Export Ready</span>
            </motion.div>

            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-16 -right-14 z-20 hidden lg:flex items-center gap-1.5 rounded-full border border-teal-500/20 bg-surface/85 backdrop-blur-md px-3.5 py-1.5 text-[10px] font-bold text-teal-600 shadow-lg cursor-default"
            >
              <Check className="size-3 text-brand-500" />
              <span>Keyword Match +32%</span>
            </motion.div>

            {/* Main Interactive Browser Mockup Container */}
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-line bg-surface/20 shadow-2xl hover:shadow-emerald-500/[0.04] transition-shadow duration-300"
            >
              <BrowserChrome 
                savedTime={activeTab === "builder" ? "2s ago" : "just now"}
                statusText={activeTab === "builder" ? "Autosaved" : "Draft"}
              >
                <div className="flex h-[380px] overflow-hidden bg-canvas">
                  
                  {/* Mockup Sidebar */}
                  <div className="hidden w-40 border-r border-line bg-surface p-4.5 sm:block space-y-4">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-bold text-muted tracking-widest">Workspace</span>
                      <div className="h-7.5 rounded-lg bg-brand-500/10 text-brand-600 flex items-center px-2.5 gap-2 text-xs font-bold border border-brand-500/20">
                        <FileText className="size-3.5" />
                        <span>My Resumes</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-bold text-muted tracking-widest">Analytics</span>
                      <div className="h-7.5 rounded-lg hover:bg-line/40 text-muted flex items-center px-2.5 gap-2 text-xs font-bold transition-colors">
                        <BarChart3 className="size-3.5" />
                        <span>ATS Audit</span>
                      </div>
                    </div>
                  </div>

                  {/* Left Workspace Panel (Editor or Stats side) */}
                  <div className="flex-1 p-5 overflow-y-auto border-r border-line bg-surface/50">
                    <AnimatePresence mode="wait">
                      
                      {/* 1. Builder Editor Simulator */}
                      {activeTab === "builder" && (
                        <motion.div
                          key="builder-left"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }}
                          className="space-y-3.5"
                        >
                          <div className="space-y-1">
                            <label className="text-[9.5px] uppercase font-bold text-muted">Full Name</label>
                            <div className="h-9 rounded-lg border border-line bg-surface px-3 flex items-center text-xs text-ink font-semibold">
                              Alex Smith
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9.5px] uppercase font-bold text-muted">Target Position</label>
                            <div className="h-9 rounded-lg border border-brand-500/30 bg-surface px-3 flex items-center text-xs text-brand-600 font-bold">
                              <span>{typedRole}</span>
                              {typedCursor && <span className="w-0.5 h-3.5 bg-brand-500 ml-0.5 animate-pulse" />}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9.5px] uppercase font-bold text-muted">Professional Experience</label>
                            <div className="rounded-lg border border-line bg-surface p-3 text-xs text-muted leading-relaxed font-semibold h-24">
                              Developed scalable SaaS applications using React and Node.js. Optimized database metrics to improve core LCP.
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* 2. AI Optimization Step Flow */}
                      {activeTab === "ai" && (
                        <motion.div
                          key="ai-left"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }}
                          className="space-y-4"
                        >
                          <div className="flex items-center gap-3 p-3.5 rounded-xl border border-brand-500/25 bg-brand-500/[0.04]">
                            <Sparkles className="size-5 text-brand-500 animate-pulse" />
                            <div>
                              <h4 className="text-xs font-bold text-ink">AI Copilot Engine</h4>
                              <p className="text-[10px] text-muted">Intelligently strengthening action verbs & metrics.</p>
                            </div>
                          </div>

                          {/* Rewrite comparison card */}
                          <div className="space-y-3 p-4 rounded-xl border border-line bg-surface">
                            <div>
                              <span className="text-[8.5px] uppercase font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded">Weak Description</span>
                              <p className="text-xs text-muted mt-2 font-semibold">"I helped speed up database queries."</p>
                            </div>

                            <div className="h-px bg-line/65" />

                            <div>
                              <span className="text-[8.5px] uppercase font-bold text-brand-600 bg-brand-500/10 px-2 py-0.5 rounded flex items-center gap-1.5 w-fit">
                                {aiStep === 1 && <Loader2 className="size-2.5 animate-spin" />}
                                <span>{aiStep === 0 ? "Pending Rewrite" : aiStep === 1 ? "Analyzing..." : aiStep === 2 ? "Improving Bullet..." : "AI Optimized Bullet ✓"}</span>
                              </span>
                              <p className="text-xs text-ink mt-2 font-bold leading-relaxed">
                                {aiStep <= 1 ? (
                                  <span className="text-muted/50 italic">Waiting for AI parser...</span>
                                ) : (
                                  <span>✨ "Boosted database queries by 45% using indexed Redis keys."</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* 3. Templates Showcase Toggles */}
                      {activeTab === "templates" && (
                        <motion.div
                          key="templates-left"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }}
                          className="space-y-3"
                        >
                          <span className="text-[9.5px] uppercase font-bold text-muted tracking-wider">Select Layout Template</span>
                          <div className="grid grid-cols-2 gap-2.5">
                            {["Modern", "Professional", "Minimal", "Executive"].map((template) => {
                              const isSel = selectedTemplate === template;
                              return (
                                <div
                                  key={template}
                                  onClick={() => setSelectedTemplate(template)}
                                  className={`p-3 rounded-xl border cursor-pointer text-left transition-all duration-200 ${
                                    isSel 
                                      ? "border-brand-500 bg-brand-500/[0.04]" 
                                      : "border-line bg-surface hover:border-brand-500/30"
                                }`}
                              >
                                <span className="text-xs font-bold text-ink block">{template}</span>
                                <span className="text-[9.5px] text-muted mt-0.5 block">
                                  {template === "Modern" ? "Trendy grid" : template === "Professional" ? "Corporate layout" : "Clean design"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* 4. ATS Match Audit Metrics */}
                    {activeTab === "ats" && (
                      <motion.div
                        key="ats-left"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        className="space-y-4"
                      >
                        <span className="text-[9.5px] uppercase font-bold text-muted tracking-wider block">ATS Compliance Analysis</span>
                        
                        {/* Match metrics progress list */}
                        <div className="space-y-3">
                          {[
                            { name: "Grammar Match", score: "100%" },
                            { name: "Keyword density", score: "94%" },
                            { name: "Content Readability", score: "91%" },
                          ].map((item, index) => (
                            <div key={item.name} className="space-y-1">
                              <div className="flex items-center justify-between text-[11px] font-bold text-ink">
                                <span>{item.name}</span>
                                <span>{item.score}</span>
                              </div>
                              <div className="h-1.5 w-full bg-line rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: item.score }}
                                  transition={{ duration: 1.2, delay: index * 0.15 }}
                                  className="h-full bg-brand-500"
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Keyword tags pills mapping */}
                        <div className="pt-2">
                          <span className="text-[10px] font-bold text-muted block mb-1.5">Parsed matching skills</span>
                          <div className="flex flex-wrap gap-1">
                            {["React", "Node.js", "TypeScript", "Indexed DB", "AWS"].map((tag) => (
                              <span key={tag} className="px-2 py-0.5 text-[9.5px] font-bold bg-emerald-500/10 text-emerald-600 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>

                {/* Right Document A4 Live Preview Mockup */}
                <div className="w-56 p-5 flex flex-col justify-center bg-line/20 relative">
                  
                  {/* Floating Action Badge showing inside preview context */}
                  <AnimatePresence>
                    {toastMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-lg border border-brand-500 bg-surface shadow-md text-[9.5px] font-bold text-brand-600 flex items-center gap-1.5"
                      >
                        <Check className="size-3 text-brand-500" />
                        <span>{toastMessage}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="text-[8px] font-bold uppercase tracking-wider text-muted mb-2 text-center">Live Preview</div>

                  {/* Document sheet */}
                  <div className="flex-1 bg-white border border-line rounded-lg p-4 shadow-sm flex flex-col justify-between text-left relative overflow-hidden transition-all duration-300">
                    
                    {/* Template styles adjustments preview based on selection tab */}
                    <div className={`space-y-3.5 h-full flex flex-col justify-between ${
                      selectedTemplate === "Professional" ? "font-serif text-gray-800" : "font-sans text-slate-800"
                    }`}>
                      
                      {/* Name header */}
                      <div className="space-y-1 text-center">
                        <div className="text-[12px] font-extrabold tracking-tight text-slate-900 leading-none">Alex Smith</div>
                        <div className="text-[8px] font-bold text-brand-600 flex items-center justify-center gap-0.5">
                          <span>{activeTab === "builder" ? typedRole : "Full Stack Developer"}</span>
                        </div>
                      </div>

                      {/* Work summary block */}
                      <div className="space-y-1.5">
                        <div className="h-0.5 w-full bg-slate-200" />
                        <div className="h-1 w-10 bg-slate-300 rounded-xs" />
                        <p className="text-[6.5px] text-slate-500 leading-relaxed font-semibold">
                          {activeTab === "ai" && aiStep >= 2 ? (
                            <span>✨ Boosted database queries by 45% using indexed Redis keys. Managed LCP optimization.</span>
                          ) : (
                            <span>Developed scalable web applications. Managed LCP parameters for modern SaaS dashboard templates.</span>
                          )}
                        </p>
                      </div>

                      {/* Experience outline block */}
                      <div className="space-y-1.5 flex-1 pt-1.5 justify-center flex flex-col">
                        <div className="h-1 w-12 bg-slate-300 rounded-xs" />
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[6px] font-bold text-slate-700">
                            <span>SaaS Platform Architect</span>
                            <span className="text-slate-400">2024 - Present</span>
                          </div>
                          <div className="h-0.5 w-full bg-slate-100 rounded-xs" />
                          <div className="h-0.5 w-11/12 bg-slate-100 rounded-xs" />
                        </div>
                      </div>

                      {/* Footer tags */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-[5.5px] font-bold text-slate-400">Page 1 of 1</span>
                        <div className="flex items-center gap-1 rounded bg-brand-500/10 px-1.5 py-0.5">
                          <span className="size-1 rounded-full bg-brand-500" />
                          <span className="text-[6px] text-brand-600 font-bold">ATS Score: {atsScore}</span>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

              </div>
            </BrowserChrome>
          </motion.div>
        </div>

      </div>

      <div className="section-line absolute bottom-0 inset-x-0" />
    </section>
  );
};

export default ProductShowcase;
