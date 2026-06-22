import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const CallToAction = () => {
  return (
    <section id="cta" className="px-6 py-20">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-accent-600 px-8 py-16 text-center sm:px-16">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 size-64 rounded-full bg-white/10 blur-2xl" />

        <h2 className="relative mx-auto max-w-2xl text-3xl font-bold text-white sm:text-4xl">
          Build a resume that helps you stand out and get hired
        </h2>
        <p className="relative mx-auto mt-4 max-w-md text-white/80">
          Join thousands of job seekers creating professional resumes in minutes.
        </p>

        <Link
          to="/app"
          className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 font-medium text-brand-700 transition-all hover:bg-brand-50 active:scale-95"
        >
          Get started free
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
};

export default CallToAction;
