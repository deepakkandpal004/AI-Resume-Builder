import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ChevronDown, ChevronUp, AlertCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchLatestScan } from '../../app/features/atsSlice';
import CircularScoreGauge from './CircularScoreGauge';
import Upgrade_Prompt from './Upgrade_Prompt';

// ---------------------------------------------------------------------------
// Helper: relative timestamp
// ---------------------------------------------------------------------------
function getRelativeTime(dateString) {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

// ---------------------------------------------------------------------------
// Helper: map suggestion.section → ResumeBuilder tab index
// ---------------------------------------------------------------------------
const SECTION_TO_TAB = {
  summary: 0,
  professional_summary: 0,
  experience: 1,
  education: 2,
  projects: 3,
  skills: 4,
};

// ---------------------------------------------------------------------------
// Skeleton placeholder for a single section card
// ---------------------------------------------------------------------------
const SkeletonSection = () => (
  <div className="animate-pulse rounded-xl border border-line bg-surface p-4 space-y-3">
    <div className="h-5 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
    <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
    <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
  </div>
);

// ---------------------------------------------------------------------------
// Collapsible section wrapper
// ---------------------------------------------------------------------------
const CollapsibleSection = ({ title, isOpen, onToggle, children }) => (
  <div className="rounded-xl border border-line bg-surface overflow-hidden">
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-canvas"
      aria-expanded={isOpen}
    >
      <span className="font-semibold text-ink">{title}</span>
      {isOpen ? (
        <ChevronUp className="size-5 text-muted shrink-0" />
      ) : (
        <ChevronDown className="size-5 text-muted shrink-0" />
      )}
    </button>
    {isOpen && (
      <div className="border-t border-line px-4 pb-4 pt-3">
        {children}
      </div>
    )}
  </div>
);

// ---------------------------------------------------------------------------
// Priority badge for Skills Gap
// ---------------------------------------------------------------------------
const PriorityBadge = ({ priority }) => {
  const norm = (priority || '').toLowerCase();
  if (norm === 'high') {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
        High
      </span>
    );
  }
  if (norm === 'medium') {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
        Medium
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
      Low
    </span>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
const ATS_Results_Panel = ({ resumeId, onNavigateTab }) => {
  const dispatch = useDispatch();
  const { scanStatus, currentScan, error, quotaExhausted, scansRemainingToday } =
    useSelector((state) => state.ats);

  // Part 12.2 — collapsible section state
  const [openSections, setOpenSections] = useState({
    scoreSummary: true,
    keywords: false,
    skillsGap: false,
    suggestions: false,
  });

  const toggleSection = (key) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  // Part 12.1 — fetch on mount when idle with no data
  useEffect(() => {
    if (resumeId && currentScan === null && scanStatus === 'idle') {
      dispatch(fetchLatestScan(resumeId));
    }
  }, [resumeId, currentScan, scanStatus, dispatch]);

  // Part 12.1 — show toast for non-429 errors
  useEffect(() => {
    if (scanStatus === 'failed' && !quotaExhausted && error) {
      toast.error(error);
    }
  }, [scanStatus, quotaExhausted, error]);

  // -------------------------------------------------------------------------
  // STATE: Loading skeleton
  // -------------------------------------------------------------------------
  if (scanStatus === 'loading') {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading ATS results">
        <SkeletonSection />
        <SkeletonSection />
        <SkeletonSection />
        <SkeletonSection />
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // STATE: Quota exhausted → show upgrade prompt
  // -------------------------------------------------------------------------
  if (quotaExhausted) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted">0 of 1 free scan used today</p>
        <Upgrade_Prompt />
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // STATE: Error (non-quota)
  // -------------------------------------------------------------------------
  if (scanStatus === 'failed' && !quotaExhausted) {
    return (
      <div
        role="alert"
        className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
      >
        <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-500" />
        <div>
          <p className="font-medium text-red-700 dark:text-red-400">Analysis failed</p>
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error || 'Something went wrong. Please try again.'}
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // STATE: Idle with no scan
  // -------------------------------------------------------------------------
  if (scanStatus === 'idle' && currentScan === null) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-surface px-6 py-12 text-center">
        <p className="text-sm text-muted">
          No analysis yet — paste a job description and click Analyze.
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // STATE: Results available (scanStatus === 'succeeded' or 'idle' with data)
  // -------------------------------------------------------------------------
  const {
    atsScore = 0,
    matchedKeywords = [],
    missingKeywords = [],
    skillsGap = [],
    suggestions = [],
    createdAt,
  } = currentScan || {};

  // Group skills by category
  const groupedSkills = skillsGap.reduce((acc, item) => {
    const cat = item.category || 'Missing Skills';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* ------------------------------------------------------------------ */}
      {/* Part 12.3 — Quota notices                                           */}
      {/* ------------------------------------------------------------------ */}
      {scansRemainingToday === 1 && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
        >
          <Info className="size-4 shrink-0" />
          1 free scan remaining today
        </div>
      )}

      {scansRemainingToday === 0 && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
        >
          <Info className="size-4 shrink-0" />
          0 of 1 free scan used today
        </div>
      )}

      {/* Part 12.3 — Timestamp */}
      {createdAt && (
        <p className="text-xs text-muted">
          Last analyzed: {getRelativeTime(createdAt)}
        </p>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Section 1 — Score Summary                                           */}
      {/* ------------------------------------------------------------------ */}
      <CollapsibleSection
        title="Score Summary"
        isOpen={openSections.scoreSummary}
        onToggle={() => toggleSection('scoreSummary')}
      >
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <CircularScoreGauge score={atsScore} />
          <div className="flex flex-wrap gap-4 text-sm text-ink">
            <div className="flex flex-col items-center rounded-lg border border-line bg-canvas px-4 py-3 min-w-[80px]">
              <span className="text-2xl font-bold text-brand-600">{atsScore}</span>
              <span className="text-xs text-muted mt-0.5">Score</span>
            </div>
            <div className="flex flex-col items-center rounded-lg border border-line bg-canvas px-4 py-3 min-w-[80px]">
              <span className="text-2xl font-bold text-green-600">{matchedKeywords.length}</span>
              <span className="text-xs text-muted mt-0.5">Matched</span>
            </div>
            <div className="flex flex-col items-center rounded-lg border border-line bg-canvas px-4 py-3 min-w-[80px]">
              <span className="text-2xl font-bold text-red-500">{missingKeywords.length}</span>
              <span className="text-xs text-muted mt-0.5">Missing</span>
            </div>
            <div className="flex flex-col items-center rounded-lg border border-line bg-canvas px-4 py-3 min-w-[80px]">
              <span className="text-2xl font-bold text-amber-500">{skillsGap.length}</span>
              <span className="text-xs text-muted mt-0.5">Gaps</span>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* ------------------------------------------------------------------ */}
      {/* Section 2 — Keywords                                                */}
      {/* ------------------------------------------------------------------ */}
      <CollapsibleSection
        title="Keywords"
        isOpen={openSections.keywords}
        onToggle={() => toggleSection('keywords')}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Matched */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-400">
              Matched: {matchedKeywords.length}
            </p>
            {matchedKeywords.length === 0 ? (
              <p className="text-sm text-muted">No matched keywords.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {matchedKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Missing */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-400">
              Missing: {missingKeywords.length}
            </p>
            {missingKeywords.length === 0 ? (
              <p className="text-sm text-muted">No missing keywords.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {missingKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </CollapsibleSection>

      {/* ------------------------------------------------------------------ */}
      {/* Section 3 — Skills Gap                                              */}
      {/* ------------------------------------------------------------------ */}
      <CollapsibleSection
        title="Skills Gap"
        isOpen={openSections.skillsGap}
        onToggle={() => toggleSection('skillsGap')}
      >
        {skillsGap.length === 0 ? (
          <p className="text-sm text-green-700 dark:text-green-400">
            Great news — no significant skills gap detected for this job.
          </p>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedSkills).map(([category, items]) => (
              <div key={category}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  {category}
                </p>
                <ul className="space-y-1.5">
                  {items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-ink">
                      <PriorityBadge priority={item.priority} />
                      <span>{item.skill || item.name || item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </CollapsibleSection>

      {/* ------------------------------------------------------------------ */}
      {/* Section 4 — Suggestions                                             */}
      {/* ------------------------------------------------------------------ */}
      <CollapsibleSection
        title="Suggestions"
        isOpen={openSections.suggestions}
        onToggle={() => toggleSection('suggestions')}
      >
        {suggestions.length === 0 ? (
          <p className="text-sm text-muted">No suggestions available.</p>
        ) : (
          <ol className="space-y-2">
            {suggestions.map((suggestion, i) => {
              const tabIndex =
                suggestion.section != null
                  ? SECTION_TO_TAB[suggestion.section] ?? null
                  : null;
              const isClickable = tabIndex !== null;

              const handleClick = () => {
                if (!isClickable) return;
                if (onNavigateTab) {
                  onNavigateTab(tabIndex);
                }
              };

              return (
                <li
                  key={i}
                  onClick={isClickable ? handleClick : undefined}
                  className={`flex items-start gap-3 rounded-lg border border-line bg-canvas p-3 text-sm transition-colors ${
                    isClickable
                      ? 'cursor-pointer hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20'
                      : ''
                  }`}
                  role={isClickable ? 'button' : undefined}
                  tabIndex={isClickable ? 0 : undefined}
                  onKeyDown={
                    isClickable
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleClick();
                          }
                        }
                      : undefined
                  }
                  aria-label={
                    isClickable
                      ? `${suggestion.text || suggestion} — click to navigate`
                      : undefined
                  }
                >
                  {/* Rank number */}
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                    {i + 1}
                  </span>

                  {/* Suggestion text */}
                  <span className="flex-1 text-ink">
                    {suggestion.text || suggestion}
                  </span>

                  {/* Points badge */}
                  {suggestion.scoreImpact != null && (
                    <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      +{suggestion.scoreImpact} pts
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </CollapsibleSection>
    </div>
  );
};

export default ATS_Results_Panel;
