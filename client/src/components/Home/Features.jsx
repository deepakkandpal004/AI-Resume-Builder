import React from "react";
import {
  Sparkles,
  BarChart3,
  LayoutTemplate,
  Eye,
  ScanLine,
  Link as LinkIcon,
  FileText,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import Title from "./Title";
import { Link as RouterLink } from "react-router-dom";

const features = [
  {
    icon: Sparkles,
    title: "AI Resume Optimization",
    desc: "Rewrite bullet points, improve active verbs, and tailor your resume dynamically.",
    gradient: ["rgba(16,185,129,0.95)", "rgba(20,184,166,0.95)"],
    featured: true,
  },
  {
    icon: BarChart3,
    title: "ATS Score Checker",
    desc: "Instantly analyze keyword gaps and screen compatibility against any job post.",
    gradient: ["rgba(20,184,166,0.95)", "rgba(34,211,238,0.95)"],
  },
  {
    icon: LayoutTemplate,
    title: "Professional Templates",
    desc: "Access clean, recruiter-approved layout templates optimized for fast reading.",
    gradient: ["rgba(16,185,129,0.95)", "rgba(34,197,94,0.95)"],
  },
  {
    icon: Eye,
    title: "Live Resume Preview",
    desc: "Visualize layout and section adjustments in real time before exporting to PDF.",
    gradient: ["rgba(20,184,166,0.95)", "rgba(16,185,129,0.95)"],
  },
  {
    icon: MessageSquare,
    title: "Cover Letter Generator",
    desc: "Draft tailored cover letters matching the role's tone in a single click.",
    gradient: ["rgba(34,211,238,0.95)", "rgba(20,184,166,0.95)"],
  },
  {
    icon: ScanLine,
    title: "Background Removal",
    desc: "Clean up profile headshots instantly with smart portrait background extraction.",
    gradient: ["rgba(52,211,153,0.95)", "rgba(16,185,129,0.95)"],
  },
  {
    icon: LinkIcon,
    title: "Shareable Resume Links",
    desc: "Host your resume securely and send public access links to hiring teams.",
    gradient: ["rgba(34,211,238,0.95)", "rgba(20,184,166,0.95)"],
  },
  {
    icon: FileText,
    title: "PDF Import & Export",
    desc: "Import files directly to convert details or export to print-ready PDF.",
    gradient: ["rgba(20,184,166,0.95)", "rgba(16,185,129,0.95)"],
  },
];

const Features = () => {
  const ref = useScrollReveal();

  return (
    <section id="features" className="relative overflow-hidden px-6 py-28 md:px-10">
      {/* Background gradients and meshes */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.04),_transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-35" />
      <div className="section-line absolute top-0 inset-x-0" />

      <div ref={ref} className="mx-auto max-w-7xl reveal">
        
        {/* Header Badge & Title */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200/50 bg-brand-50/70 px-4 py-1.5 text-xs font-bold text-brand-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-brand-400 shadow-xs shadow-brand-500/5">
            <Sparkles className="size-3.5 text-brand-500 animate-pulse" />
            <span>Core Capabilities</span>
          </div>
          <Title
            title="Everything you need to build a stronger resume"
            description="Write faster, score higher, generate cover letters, prep for interviews — all in one place."
          />
        </div>

        {/* Features Card Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full">
          {features.map((f, i) => {
            const Icon = f.icon;
            const isFeatured = f.featured;
            
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className={`premium-card group relative overflow-hidden rounded-[20px] p-7 cursor-default min-h-[200px] flex flex-col justify-between transition-all duration-250 ease-out border bg-surface/50 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-emerald-500/[0.04] ${
                  isFeatured 
                    ? "border-emerald-500/35 bg-gradient-to-br from-emerald-500/[0.04] to-surface/90 shadow-xs" 
                    : "border-line/70 hover:border-emerald-500/35"
                }`}
              >
                <div>
                  
                  {/* Top Header Row with Icon and Badge */}
                  <div className="flex items-start justify-between mb-6">
                    
                    {/* Icon container */}
                    <div
                      className={`flex items-center justify-center rounded-xl text-white shadow-xs transition-transform duration-250 ${
                        isFeatured ? "size-13" : "size-12"
                      }`}
                      style={{ backgroundImage: `linear-gradient(135deg, ${f.gradient[0]}, ${f.gradient[1]})` }}
                    >
                      <Icon className={`group-hover:scale-108 transition-transform duration-250 ${
                        isFeatured ? "size-6.5" : "size-5.5"
                      }`} />
                    </div>

                    {/* Featured Badge */}
                    {isFeatured && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-brand-500/10 text-brand-700 border border-brand-500/20 dark:bg-emerald-500/20 dark:text-brand-300">
                        Most Popular
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-ink transition-colors group-hover:text-brand-700">
                    {f.title}
                  </h3>
                  <p className="mt-3 text-xs leading-relaxed text-body line-clamp-2">
                    {f.desc}
                  </p>
                </div>

                {/* Arrow detail footer sliding in on hover */}
                <div className="flex items-center justify-between mt-4 border-t border-line/30 pt-3">
                  <span className="text-[10px] font-bold text-brand-600">Learn more</span>
                  <ArrowRight className="size-3.5 text-brand-500 opacity-0 -translate-x-2.5 transition-all duration-250 ease-out group-hover:opacity-100 group-hover:translate-x-0" />
                </div>

                {/* Glow backdrop layer on hover */}
                <div className="pointer-events-none absolute -inset-px rounded-[20px] opacity-0 transition-opacity duration-250 group-hover:opacity-100">
                  <div
                    className="absolute inset-0 rounded-[20px]"
                    style={{ backgroundImage: `linear-gradient(135deg, ${f.gradient[0]}, ${f.gradient[1]})`, opacity: 0.02 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA Block with trust elements */}
        <div className="mt-14 flex flex-col items-center justify-center text-center space-y-3.5">
          <RouterLink
            to="/app"
            className="btn-primary px-8 py-3.5 shadow-lg shadow-emerald-500/10 hover:shadow-xl hover:shadow-emerald-500/20 active:scale-95 transition-all duration-250 flex items-center gap-2 font-bold cursor-pointer hover:bg-brand-600/90"
            style={{ minHeight: "2.75rem" }}
          >
            <Sparkles className="size-4 animate-pulse" />
            <span>Try all features free</span>
            <ArrowRight className="size-4" />
          </RouterLink>
          
          {/* Trust bullets underneath */}
          <div className="flex items-center gap-3.5 text-[10px] font-bold text-muted">
            <span>✓ Free Forever</span>
            <span className="text-line select-none">•</span>
            <span>✓ No Credit Card Required</span>
          </div>
        </div>
      </div>

      <div className="section-line absolute bottom-0 inset-x-0" />
    </section>
  );
};

export default Features;
