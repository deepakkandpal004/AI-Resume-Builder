import { Check, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useScrollReveal } from "../../hooks/useScrollReveal";

const plans = [
  {
    name: "Free",
    price: "0",
    currency: "₹",
    period: "forever",
    desc: "Build a complete resume without paying upfront.",
    categories: [
      {
        title: "AI Features",
        features: [
          "AI Enhance (10/day)",
          "Resume Tailor (3/day)",
          "ATS Score Check (1/day)",
        ],
      },
      {
        title: "Resume Features",
        features: [
          "All 6 templates",
          "Full customization",
          "Public share link",
        ],
      },
      {
        title: "Export & Sharing",
        features: [
          "PDF export",
        ],
      },
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
    categories: [
      {
        title: "AI Features",
        features: [
          "Unlimited AI Enhance",
          "Unlimited Resume Tailor",
          "Unlimited ATS Score Check",
          "Priority AI processing",
        ],
      },
      {
        title: "Resume Features",
        features: [
          "Everything in Free",
          "Unlimited Cover Letters",
          "Unlimited Interview Prep",
        ],
      },
    ],
    cta: "Go Pro",
    href: "/app/upgrade",
    highlighted: true,
  },
];

const Pricing = () => {
  const ref = useScrollReveal();
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <section id="pricing" className="relative overflow-hidden px-6 py-24 md:px-10">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.03),transparent_50%),radial-gradient(circle_at_70%_70%,rgba(16,185,129,0.02),transparent_50%)] blur-3xl" />
      <div className="pointer-events-none absolute inset-0 dot-grid" />
      <div className="section-line absolute top-0 inset-x-0" />

      <div ref={ref} className="mx-auto max-w-5xl reveal">
        {/* Header Block */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-bold text-brand-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-brand-400">
            <Sparkles className="size-4 text-brand-500" />
            <span>Straightforward pricing</span>
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl leading-[1.15] max-w-3xl">
            Start free. Upgrade once if you need more.
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-body max-w-xl">
            No subscription. No hidden fees. The free plan covers the essentials.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-14 grid gap-8 md:grid-cols-2 items-stretch max-w-4xl mx-auto"
        >
          {plans.map((plan) => {
            const isPro = plan.highlighted;

            return (
              <motion.div
                variants={cardVariants}
                key={plan.name}
                className={`relative flex flex-col h-full rounded-[20px] border transition-all duration-250 ease-out transform-gpu select-none outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:-translate-y-1.5 ${
                  isPro
                    ? "border-brand-500 bg-gradient-to-b from-brand-500/[0.04] to-surface/20 shadow-md shadow-brand-500/[0.02] hover:border-brand-500 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.18)] hover:-translate-y-1.5 hover:scale-[1.03] order-1 md:order-2 z-10"
                    : "border-line/60 bg-gradient-to-b from-surface/40 to-surface/15 shadow-xs hover:border-brand-500/20 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.08)] hover:-translate-y-1.5 hover:scale-[1.005] order-2 md:order-1"
                }`}
              >
                {/* Subtle radial green glow behind Pro card */}
                {isPro && (
                  <div className="pointer-events-none absolute inset-0 rounded-[20px] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08),transparent_60%)] blur-2xl z-[-1]" />
                )}

                {/* Floating "Best value" badge */}
                {isPro && (
                  <motion.span
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full border border-brand-500/30 bg-emerald-600 px-4 py-1 text-xs font-bold text-white shadow-md shadow-brand-500/20 backdrop-blur-md"
                  >
                    Best value
                  </motion.span>
                )}

                {/* Card Header */}
                <div className="p-8 pb-0">
                  <h3 className="text-xl font-bold text-ink">{plan.name}</h3>
                  <p className="mt-2 text-xs font-bold text-muted min-h-[32px]">{plan.desc}</p>
                  
                  {/* Visual Pricing Anchor */}
                  <div className="mt-5 flex flex-col items-center text-center pb-6 border-b border-line/45">
                    <span className={`text-[10px] uppercase font-extrabold tracking-wider ${
                      isPro ? "text-brand-600 dark:text-emerald-400" : "text-muted"
                    }`}>
                      {isPro ? "Lifetime access" : "No credit card required"}
                    </span>
                    <span className="mt-1 text-5xl font-extrabold text-ink tracking-tight font-display">
                      {plan.currency}{plan.price}
                    </span>
                    <span className="mt-1 text-[11px] text-muted font-bold">
                      {isPro ? "One-time payment" : "Free forever"}
                    </span>
                  </div>
                </div>

                {/* Feature List */}
                <div className="flex-1 px-8 py-6 space-y-6">
                  {plan.categories.map((category) => (
                    <div key={category.title} className="space-y-2.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted select-none">
                        {category.title}
                      </span>
                      <ul className="space-y-3">
                        {category.features.map((f) => (
                          <li key={f} className="flex items-start gap-2.5 text-xs sm:text-sm">
                            {category.title === "AI Features" ? (
                              <Sparkles className="size-3.5 shrink-0 text-brand-500 mt-0.5" />
                            ) : (
                              <Check className="size-3.5 shrink-0 text-emerald-400 mt-0.5" />
                            )}
                            <span className="text-body font-semibold">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* CTA Action Button */}
                <div className="p-8 pt-0">
                  <Link
                    to={plan.href}
                    aria-label={`Get started with ${plan.name} plan`}
                    className={`group flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-center text-sm font-semibold transition-all duration-250 ease-out transform-gpu active:scale-98 ${
                      isPro
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 hover:scale-[1.01]"
                        : "border border-line bg-surface/35 hover:border-brand-500/30 text-body hover:text-ink shadow-xs hover:shadow-md"
                    }`}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight className="size-4 transition-transform duration-250 ease-out transform-gpu group-hover:translate-x-1" />
                  </Link>
                </div>

              </motion.div>
            );
          })}
        </motion.div>

        {/* Unified Section Trust Metrics */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-[11px] font-extrabold text-muted select-none reveal">
          <div className="flex items-center gap-1.5">
            <Check className="size-3.5 text-brand-500" />
            <span>One-time payment</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="size-3.5 text-brand-500" />
            <span>Lifetime updates</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="size-3.5 text-brand-500" />
            <span>Secure checkout</span>
          </div>
        </div>

      </div>

      <div className="section-line absolute bottom-0 inset-x-0" />
    </section>
  );
};

export default Pricing;
