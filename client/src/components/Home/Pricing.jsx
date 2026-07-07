import { Check, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import Title from "./Title";

const plans = [
  {
    name: "Free",
    price: "0",
    currency: "₹",
    period: "forever",
    desc: "Build a complete resume without paying upfront.",
    features: [
      "All 6 templates",
      "Full customization",
      "PDF export",
      "Public share link",
      "AI Enhance (10/day)",
      "Resume Tailor (3/day)",
      "ATS Score Check (1/day)",
    ],
    cta: "Get started free",
    href: "/app",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "299",
    currency: "₹",
    period: "lifetime",
    desc: "Unlock unlimited AI with a single payment.",
    features: [
      "Everything in Free",
      "Unlimited AI Enhance",
      "Unlimited Resume Tailor",
      "Unlimited ATS Score Check",
      "Unlimited Cover Letters",
      "Unlimited Interview Prep",
      "Priority AI processing",
    ],
    cta: "Go Pro",
    href: "/app/upgrade",
    highlighted: true,
  },
];

const Pricing = () => {
  const ref = useScrollReveal();

  return (
    <section id="pricing" className="relative overflow-hidden px-6 py-28 md:px-10">
      <div className="pointer-events-none absolute inset-0 gradient-glow" />
      <div className="pointer-events-none absolute inset-0 dot-grid" />
      <div className="section-line absolute top-0 inset-x-0" />

      <div ref={ref} className="mx-auto max-w-5xl reveal">
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-brand-400">
            <Sparkles className="size-4" />
            Straightforward pricing
          </div>
          <Title
            title="Start free. Upgrade once if you need more."
            description="No subscription. No hidden fees. The free plan covers the essentials."
          />
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2 md:items-start">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: plan.highlighted ? 0.15 : 0 }}
              className={`relative rounded-2xl border p-8 transition-all hover:-translate-y-1 hover:shadow-xl ${
                plan.highlighted
                  ? "gradient-border bg-emerald-500/[0.03] shadow-emerald-500/10"
                  : "border-line bg-surface/20"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-1 text-xs font-semibold text-white shadow-lg">
                  Best value
                </span>
              )}

              <h3 className="text-xl font-bold text-ink">{plan.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-ink font-display">
                  {plan.currency}{plan.price}
                </span>
                <span className="text-sm text-muted">/{plan.period}</span>
              </div>
              <p className="mt-2 text-sm text-body">{plan.desc}</p>

              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                    <span className="text-body">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                to={plan.href}
                className={`mt-8 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-center text-sm font-semibold transition-all active:scale-95 ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5"
                    : "border border-line text-body hover:border-emerald-500/30 hover:text-ink"
                }`}
              >
                {plan.cta}
                <ArrowRight className="size-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="section-line absolute bottom-0 inset-x-0" />
    </section>
  );
};

export default Pricing;
