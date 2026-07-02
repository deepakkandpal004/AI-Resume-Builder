import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Sparkles, Loader2, Lightbulb, TrendingUp, ListChecks, Wrench, Layout } from "lucide-react";
import { scoreResume, resetScore } from "../../app/features/resumeScoreSlice";
import Upgrade_Prompt from "../ats/Upgrade_Prompt";

const SCORE_LABELS = {
  overall: "Overall",
  contentQuality: "Content Quality",
  completeness: "Completeness",
  skillsPresentation: "Skills",
  formatting: "Formatting",
};

const SCORE_ICONS = {
  overall: TrendingUp,
  contentQuality: Lightbulb,
  completeness: ListChecks,
  skillsPresentation: Wrench,
  formatting: Layout,
};

function ScoreGauge({ value, label, icon: Icon, color }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="88" height="88" className="-rotate-90">
        <circle cx="44" cy="44" r={radius} fill="none" stroke="var(--color-line)" strokeWidth="6" />
        <circle
          cx="44" cy="44" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        {Icon && <Icon className="size-5" style={{ color }} />}
        <span className="text-lg font-bold" style={{ color }}>{value}</span>
      </div>
      <span className="text-xs text-muted text-center leading-tight">{label}</span>
    </div>
  );
}

function getScoreColor(score) {
  if (score >= 80) return "#0D9488";
  if (score >= 50) return "#D97706";
  return "#E11D48";
}

const SkeletonCard = () => (
  <div className="animate-pulse rounded-xl border border-line bg-surface p-4 space-y-3">
    <div className="h-5 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
    <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
    <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
  </div>
);

const ResumeScorePanel = ({ resumeId }) => {
  const dispatch = useDispatch();
  const { status, scores, suggestions, error, quotaExhausted } = useSelector((state) => state.resumeScore);

  useEffect(() => {
    return () => { dispatch(resetScore()); };
  }, [dispatch]);

  const handleScore = () => {
    dispatch(scoreResume({ resumeId }));
  };

  if (quotaExhausted) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted">You've used all your free scores today.</p>
        <Upgrade_Prompt />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-ink">Resume Score</h3>
          <p className="text-sm text-muted">AI evaluates your resume quality across key dimensions</p>
        </div>
        <button
          onClick={handleScore}
          disabled={status === "loading"}
          className="btn-brand"
        >
          {status === "loading" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {status === "loading" ? "Scoring..." : scores ? "Re-score" : "Score My Resume"}
        </button>
      </div>

      {status === "loading" && (
        <div className="grid grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {error && !quotaExhausted && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {scores && (
        <>
          <div className="grid grid-cols-5 gap-3">
            {Object.entries(SCORE_LABELS).map(([key, label]) => {
              const value = scores[key] ?? 0;
              const color = getScoreColor(value);
              const Icon = SCORE_ICONS[key];
              return (
                <div key={key} className="relative flex flex-col items-center rounded-xl border border-line bg-surface p-4">
                  <ScoreGauge value={value} label={label} icon={Icon} color={color} />
                </div>
              );
            })}
          </div>

          {suggestions.length > 0 && (
            <div className="rounded-xl border border-line bg-surface p-5">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
                <Lightbulb className="size-4 text-brand-500" />
                Improvement Suggestions
              </h4>
              <ul className="space-y-2">
                {suggestions.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm text-body">
                    <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-brand-500" />
                    <span>{s.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {!scores && status !== "loading" && !error && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line py-16 text-center">
          <Sparkles className="mb-3 size-10 text-muted" />
          <p className="text-sm text-muted">Click "Score My Resume" to get AI-powered feedback</p>
        </div>
      )}
    </div>
  );
};

export default ResumeScorePanel;
