import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { useScrollReveal } from "../../hooks/useScrollReveal";

const CallToAction = () => {
  const ref = useScrollReveal();

  return (
    <section id="cta" className="px-6 py-20">
      <div ref={ref} className="reveal relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-accent-600 px-8 py-20 text-center sm:px-16">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute left-1/3 top-1/3 size-40 rounded-full bg-white/5 blur-2xl" />

        <div className="relative">
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-sm font-medium text-white/90 backdrop-blur-sm">
            <Sparkles className="size-4" />
            <span>AI-powered resume builder</span>
          </div>

          <h2 className="mx-auto max-w-2xl text-3xl font-bold text-white sm:text-4xl">
            Build a resume that helps you stand out and get hired
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/80">
            Join thousands of job seekers creating professional resumes in minutes.
            No credit card required.
          </p>

          <Link
            to="/app"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 font-semibold text-brand-700 transition-all hover:bg-brand-50 hover:shadow-xl active:scale-95"
          >
            Get started free
            <ArrowRight className="size-4" />
          </Link>

          <p className="mt-4 text-xs text-white/60">Free forever · No credit card · Cancel anytime</p>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
