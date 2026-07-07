import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles, LayoutDashboard, BarChart3 } from "lucide-react";
import { useScrollReveal } from "../../hooks/useScrollReveal";

const TABS = [
  { id: "builder", label: "Resume Builder", icon: FileText },
  { id: "ai", label: "AI Optimizer", icon: Sparkles },
  { id: "templates", label: "Templates", icon: LayoutDashboard },
  { id: "ats", label: "ATS Score", icon: BarChart3 },
];

const BrowserChrome = ({ children }) => (
  <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
    <div className="flex items-center gap-2 border-b border-line px-4 py-3">
      <span className="size-2.5 rounded-full bg-red-400/60" />
      <span className="size-2.5 rounded-full bg-yellow-400/60" />
      <span className="size-2.5 rounded-full bg-emerald-400/60" />
      <span className="ml-3 rounded-md bg-line/40 px-3 py-1 text-[10px] text-muted">app.resumebuilder.io</span>
    </div>
    {children}
  </div>
);

const mockup = (tab) => (
  <BrowserChrome>
  <div className="flex h-80 overflow-hidden">
    {/* Sidebar */}
    <div className="hidden w-36 border-r border-line bg-line/20 p-3 sm:block">
      <div className="mb-4 h-2 w-16 rounded bg-line" />
      {["My Resumes", "Templates", "Settings"].map((s) => (
        <div
          key={s}
          className={`mb-1 rounded-md px-2 py-1.5 text-xs ${
            s === "My Resumes" ? "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400" : "text-muted"
          }`}
        >
          {s}
        </div>
      ))}
    </div>

    {/* Main content */}
    <div className="flex flex-1 flex-col p-4">
      {tab === "builder" && (
        <div className="flex h-full gap-4">
          <div className="flex flex-1 flex-col gap-3">
            <div className="h-4 w-24 rounded bg-line" />
            <div className="h-8 rounded border border-line bg-surface/50 px-3 py-2 text-xs text-muted">Alex Smith</div>
            <div className="h-4 w-20 rounded bg-line" />
            <div className="h-8 rounded border border-line bg-surface/50 px-3 py-2 text-xs text-muted">Full Stack Developer</div>
            <div className="h-4 w-16 rounded bg-line" />
            <div className="flex-1 rounded border border-line bg-surface/50 p-2 text-xs text-muted">Experience details...</div>
          </div>
          <div className="hidden w-44 flex-col rounded-lg border border-line bg-white p-3 shadow-sm md:flex">
            <div className="mb-2 h-3 w-20 rounded bg-gray-200" />
            <div className="mb-1 h-2 rounded bg-gray-100" />
            <div className="mb-1 h-2 rounded bg-gray-100" />
            <div className="mb-1 h-2 w-3/4 rounded bg-gray-100" />
            <div className="mt-3 mb-2 h-3 w-16 rounded bg-gray-200" />
            <div className="mb-1 h-2 rounded bg-gray-100" />
            <div className="mb-1 h-2 rounded bg-gray-100" />
            <div className="mt-auto flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-1">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              <span className="text-[8px] text-emerald-600">ATS Score: 92</span>
            </div>
          </div>
        </div>
      )}

      {tab === "ai" && (
        <div className="flex h-full flex-col gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
            <Sparkles className="size-4 text-emerald-400" />
            <div>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Summary Optimization</p>
              <p className="text-xs text-muted">Rewrite your professional summary for the target role</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-line bg-surface/50 p-3">
            <Sparkles className="size-4 text-muted" />
            <div>
              <p className="text-xs font-medium text-ink">Bullet Point Enhancement</p>
              <p className="text-xs text-muted">Strengthen each bullet with action verbs and metrics</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-line bg-surface/50 p-3">
            <Sparkles className="size-4 text-muted" />
            <div>
              <p className="text-xs font-medium text-ink">Keyword Matching</p>
              <p className="text-xs text-muted">Align your resume keywords with the job description</p>
            </div>
          </div>
        </div>
      )}

      {tab === "templates" && (
        <div className="grid h-full grid-cols-3 gap-3">
          {["Modern", "Classic", "Minimal"].map((t) => (
            <div key={t} className="flex flex-col items-center justify-center rounded-lg border border-line bg-surface/50 p-2">
              <div className="mb-2 h-16 w-full rounded border border-line/50 bg-white p-1">
                <div className="mb-1 h-2 w-3/4 rounded bg-gray-200" />
                <div className="mb-1 h-1.5 rounded bg-gray-100" />
                <div className="h-1.5 w-1/2 rounded bg-gray-100" />
              </div>
              <span className="text-[10px] text-muted">{t}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "ats" && (
        <div className="flex h-full flex-col gap-4">
          <div className="flex items-center justify-center gap-6">
            <div className="flex size-20 items-center justify-center rounded-full border-4 border-emerald-400">
              <span className="text-xl font-bold text-emerald-500">92</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Strong Match</p>
              <p className="text-xs text-muted">Your resume matches 92% of job requirements</p>
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted">Matched Keywords</p>
            <div className="flex flex-wrap gap-1">
              {["React", "Node.js", "TypeScript", "SQL", "AWS"].map((k) => (
                <span key={k} className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-600 dark:text-emerald-400">{k}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted">Missing Keywords</p>
            <div className="flex flex-wrap gap-1">
              {["Docker", "GraphQL", "Kubernetes"].map((k) => (
                <span key={k} className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] text-red-500">{k}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  </BrowserChrome>
);

const ProductShowcase = () => {
  const [activeTab, setActiveTab] = useState("builder");
  const ref = useScrollReveal();

  return (
    <section id="product-showcase" className="relative overflow-hidden px-6 py-28 md:px-10">
      <div className="pointer-events-none absolute inset-0 gradient-glow-left" />
      <div className="pointer-events-none absolute inset-0 dot-grid" />
      <div className="section-line absolute top-0 inset-x-0" />

      <div ref={ref} className="mx-auto max-w-7xl reveal">
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent-200 bg-accent-50 px-4 py-1.5 text-sm font-medium text-accent-700 dark:border-teal-500/20 dark:bg-teal-500/10 dark:text-accent-400">
            <LayoutDashboard className="size-4" />
            Product flow
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl leading-[1.1]">
            See the editor, AI, and preview working together
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-body">
            Navigate between tabs to see how each tool helps you build a stronger resume faster.
          </p>
        </div>

        <div className="mt-14">
          <div className="flex flex-wrap justify-center gap-2 rounded-2xl border border-line bg-surface/20 p-1.5">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-emerald-500/15 text-emerald-500 shadow-sm"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  <Icon className="size-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-line bg-surface/20 backdrop-blur-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {mockup(activeTab)}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="section-line absolute bottom-0 inset-x-0" />
    </section>
  );
};

export default ProductShowcase;
