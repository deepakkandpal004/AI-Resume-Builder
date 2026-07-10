import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { useScrollReveal } from "../../hooks/useScrollReveal";

const CallToAction = () => {
  void motion;
  const ref = useScrollReveal();

  return (
    <section id="cta" className="relative overflow-hidden px-6 py-28 md:px-10">
      <div className="section-line absolute top-0 inset-x-0" />

      <div ref={ref} className="mx-auto max-w-6xl reveal">
        <div className="relative overflow-hidden rounded-3xl px-8 py-24 text-center sm:px-16">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-emerald-600/10 dark:from-emerald-600/30 dark:via-teal-600/20 dark:to-emerald-800/30" />
          <div className="pointer-events-none absolute inset-0 dot-grid" />

          <motion.div
            className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-emerald-400/10 blur-3xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
          <motion.div
            className="pointer-events-none absolute -bottom-20 -left-20 size-80 rounded-full bg-teal-400/10 blur-3xl"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 7, repeat: Infinity }}
          />

          <div className="absolute inset-0 rounded-3xl border border-line bg-surface/60 backdrop-blur-sm dark:bg-transparent dark:border-line/30" />

          <div className="relative">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm font-medium text-brand-600 dark:text-emerald-300 dark:border-white/20 dark:bg-white/10 backdrop-blur-sm">
              <Sparkles className="size-4" />
              Build Your Future
            </div>

            <h2
              className="mx-auto max-w-3xl text-4xl font-black text-ink sm:text-5xl lg:text-6xl leading-[1.1] dark:text-white"
              style={{ letterSpacing: "-0.03em" }}
            >
              Build Your Resume Today. <br />
              <span className="text-gradient">Get More Interviews</span> Tomorrow.
            </h2>

            <p className="mx-auto mt-6 max-w-lg text-lg text-body dark:text-white/60">
              Join thousands of job seekers who have already created professional,
              ATS-friendly resumes in minutes.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/app"
                className="btn-primary px-10 py-4 text-base shadow-xl"
              >
                Create Resume Free
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="#templates"
                className="btn-outline px-10 py-4 text-base"
              >
                View Templates
              </a>
            </div>

            <p className="mt-5 text-sm text-muted dark:text-white/40">
              Free forever &middot; No credit card &middot; No subscription needed
            </p>
          </div>
        </div>
      </div>

      <div className="section-line absolute bottom-0 inset-x-0" />
    </section>
  );
};

export default CallToAction;
