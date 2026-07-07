import React from "react";
import { Link } from "react-router-dom";
import { Check, X, Sparkles, ArrowRight } from "lucide-react";
import Title from "./Title";
import { useScrollReveal } from "../../hooks/useScrollReveal";

const plans = [
  {
    name: "Free",
    price: "0",
    currency: "₹",
    period: "forever",
    description: "Everything you need to build a great resume.",
    features: [
      { text: "All 7 templates", included: true },
      { text: "Full customization", included: true },
      { text: "PDF export", included: true },
      { text: "Public share link", included: true },
      { text: "AI Enhance (10/day)", included: true },
      { text: "Resume Tailor (3/day)", included: true },
      { text: "ATS Score Check (1/day)", included: true },
      { text: "Cover Letters (3/day)", included: true },
      { text: "Interview Prep (3/day)", included: true },
      { text: "Priority AI processing", included: false },
    ],
    cta: "Get started free",
    href: "/app",
    highlighted: false,
  },
  {
    name: "Premium",
    price: "299",
    currency: "₹",
    period: "lifetime",
    description: "Unlock unlimited AI tools for a single one-time payment.",
    features: [
      { text: "All 7 templates", included: true },
      { text: "Full customization", included: true },
      { text: "PDF export", included: true },
      { text: "Public share link", included: true },
      { text: "Unlimited AI Enhance", included: true },
      { text: "Unlimited Resume Tailor", included: true },
      { text: "Unlimited ATS Score Check", included: true },
      { text: "Unlimited Cover Letters", included: true },
      { text: "Unlimited Interview Prep", included: true },
      { text: "Priority AI processing", included: true },
    ],
    cta: "Go Premium",
    href: "/app/upgrade",
    highlighted: true,
  },
];

const Pricing = () => {
  const ref = useScrollReveal();

  return (
    <section id="pricing" className="mx-auto max-w-5xl scroll-mt-20 px-6 py-20">
      <div ref={ref} className="reveal flex flex-col items-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent-50 px-4 py-1.5 text-sm text-accent-700 dark:bg-accent-500/10 dark:text-accent-300">
          <Sparkles className="size-4" />
          <span>Simple pricing</span>
        </div>

        <Title
          title="Free to start. Premium when you need more."
          description="No subscription. No hidden fees. Just a one-time upgrade for unlimited access."
        />
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2 md:items-start">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`reveal relative rounded-2xl border-2 p-8 transition-all hover:-translate-y-1 hover:shadow-xl ${
              plan.highlighted
                ? "border-brand-500 bg-brand-600/5 shadow-lg shadow-brand-500/10 dark:bg-brand-500/5"
                : "border-line bg-surface"
            }`}
            style={{ transitionDelay: plan.highlighted ? "150ms" : "0ms" }}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-600 to-accent-600 px-4 py-1 text-xs font-semibold text-white">
                Best value
              </span>
            )}

            <h3 className="text-xl font-bold text-ink">{plan.name}</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-ink">{plan.currency}{plan.price}</span>
              <span className="text-sm text-muted">/{plan.period}</span>
            </div>
            <p className="mt-2 text-sm text-muted">{plan.description}</p>

            <ul className="mt-6 space-y-3">
              {plan.features.map((f) => (
                <li key={f.text} className="flex items-start gap-3 text-sm">
                  {f.included ? (
                    <Check className="mt-0.5 size-4 shrink-0 text-accent-600" />
                  ) : (
                    <X className="mt-0.5 size-4 shrink-0 text-muted/50" />
                  )}
                  <span className={f.included ? "text-body" : "text-muted/60"}>
                    {f.text}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              to={plan.href}
              className={`mt-8 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-center text-sm font-semibold transition-all active:scale-95 ${
                plan.highlighted
                  ? "bg-brand-600 text-white hover:bg-brand-700"
                  : "border border-line text-ink hover:bg-canvas"
              }`}
            >
              {plan.cta}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-muted">All plans include full template customization, dark mode, and PDF export.</p>
    </section>
  );
};

export default Pricing;
