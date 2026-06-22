import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, Sparkles, Check } from "lucide-react";

const Hero = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <section className="relative overflow-hidden">
      {/* Soft background glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-brand-300/30 blur-[120px]" />

      <div className="mx-auto flex max-w-4xl flex-col items-center px-6 pb-20 pt-20 text-center md:pt-28">
        {/* Eyebrow */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 py-1.5 text-sm text-brand-700">
          <Sparkles className="size-4" />
          <span>AI-powered resume building</span>
        </div>

        {/* Headline */}
        <h1 className="max-w-3xl text-5xl font-bold leading-[1.1] tracking-tight text-ink md:text-6xl">
          Build a resume that{" "}
          <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
            gets you hired
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-lg text-muted">
          Create, customize and download a polished, professional resume in
          minutes — with smart AI assistance every step of the way.
        </p>

        {/* CTAs */}
        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <Link to="/app" className="btn-brand h-12 px-8 text-base">
            {user ? "Go to dashboard" : "Get started free"}
            <ArrowRight className="size-4" />
          </Link>
          <a href="#features" className="btn-outline h-12 px-7 text-base">
            <FileText className="size-4" />
            See how it works
          </a>
        </div>

        {/* Product highlights (honest, not fake stats) */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
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
    </section>
  );
};

export default Hero;
