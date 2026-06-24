import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, CheckCircle2, Zap } from "lucide-react";

const BENEFITS = [
  "Unlimited ATS scans",
  "Priority AI analysis",
];

const Upgrade_Prompt = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-brand-300 bg-gradient-to-br from-brand-50 to-accent-50 p-6 shadow-lg dark:border-brand-700 dark:from-brand-950 dark:to-accent-950">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-brand-400/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 size-32 rounded-full bg-accent-400/20 blur-2xl" />

      {/* Icon badge */}
      <div className="relative mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-accent-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
        <Sparkles className="size-3" />
        Premium
      </div>

      {/* Title */}
      <h3 className="relative text-xl font-bold text-brand-700 dark:text-brand-300">
        Upgrade to Premium
      </h3>
      <p className="relative mt-1 text-sm text-gray-600 dark:text-gray-400">
        You've reached your daily scan limit. Unlock more with Premium.
      </p>

      {/* Benefits list */}
      <ul className="relative mt-4 space-y-2">
        {BENEFITS.map((benefit) => (
          <li key={benefit} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <CheckCircle2 className="size-4 shrink-0 text-brand-500" />
            {benefit}
          </li>
        ))}
      </ul>

      {/* CTA button */}
      <button
        type="button"
        onClick={() => navigate("/app/upgrade")}
        className="relative mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-brand-500 hover:to-accent-500 active:scale-95"
      >
        <Zap className="size-4" />
        Upgrade to Premium
      </button>
    </div>
  );
};

export default Upgrade_Prompt;
