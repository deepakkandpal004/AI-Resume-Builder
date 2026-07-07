import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, Sparkles, Check } from "lucide-react";
import ModernTemplate from "../templates/ModernTemplate";
import { dummyResumeData } from "../../assets/assets";
import { useScrollReveal } from "../../hooks/useScrollReveal";

const Hero = () => {
  const { user } = useSelector((state) => state.auth);
  const headingRef = useScrollReveal();
  const mockupRef = useScrollReveal();

  return (
    <section className="relative overflow-hidden">
      {/* Animated background glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 animate-gradient rounded-full bg-gradient-to-r from-brand-400/30 via-accent-400/20 to-brand-600/30 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 -z-10 h-[400px] w-[400px] animate-float-delayed rounded-full bg-accent-400/20 blur-[100px]" />

      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 pb-16 pt-16 md:flex-row md:pb-28 md:pt-24 md:px-10">
        {/* Left — Text */}
        <div ref={headingRef} className="flex-1 text-center md:text-left reveal">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 py-1.5 text-sm text-brand-700 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-300">
            <Sparkles className="size-4" />
            <span>AI-powered resume building</span>
          </div>

          <h1 className="max-w-2xl text-5xl font-bold leading-[1.1] tracking-tight text-ink md:text-6xl">
            Build a resume that{" "}
            <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
              gets you hired
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lg text-muted">
            Create, customize and download a polished, professional resume in
            minutes — with smart AI assistance every step of the way.
          </p>

          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row md:justify-start">
            <Link to="/app" className="btn-brand h-12 px-8 text-base">
              {user ? "Go to dashboard" : "Get started free"}
              <ArrowRight className="size-4" />
            </Link>
            <a href="#features" className="btn-outline h-12 px-7 text-base">
              <FileText className="size-4" />
              See how it works
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted md:justify-start">
            <span className="inline-flex items-center gap-2">
              <Check className="size-4 text-accent-600" /> 100% free to use
            </span>
            <span className="inline-flex items-center gap-2">
              <Check className="size-4 text-accent-600" /> ATS-friendly templates
            </span>
            <span className="inline-flex items-center gap-2">
              <Check className="size-4 text-accent-600" /> No watermark
            </span>
          </div>
        </div>

        {/* Right — Resume mockup */}
        <div ref={mockupRef} className="mt-14 flex-1 md:mt-0 reveal reveal-delay-2">
          <div className="animate-float" style={{ perspective: "1000px" }}>
            <div className="mx-auto max-w-[460px] overflow-hidden rounded-2xl border border-line bg-white shadow-2xl shadow-brand-500/15 transition-all hover:shadow-brand-500/25 dark:shadow-black/30">
              {/* Mockup toolbar */}
              <div className="flex items-center gap-1.5 border-b border-gray-100 bg-gray-50 px-4 py-3">
                <span className="size-3 rounded-full bg-rose-400" />
                <span className="size-3 rounded-full bg-amber-400" />
                <span className="size-3 rounded-full bg-emerald-400" />
                <span className="ml-3 rounded-md bg-white px-3 py-1 text-[10px] text-gray-400 shadow-sm">
                  alex-smith-resume.pdf
                </span>
              </div>
              {/* Scaled-down resume preview */}
              <div className="overflow-hidden" style={{ maxHeight: "420px" }}>
                <div className="origin-top" style={{ transform: "scale(0.6)", width: "calc(100% / 0.6)", transformOrigin: "top left" }}>
                  <ModernTemplate
                    data={dummyResumeData[0]}
                    accentColor="#4F46E5"
                    styleOptions={{}}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
