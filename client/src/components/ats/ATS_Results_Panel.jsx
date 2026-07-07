import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  Info, 
  Sparkles, 
  Check, 
  Copy, 
  X, 
  Loader2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchLatestScan } from '../../app/features/atsSlice';
import CircularScoreGauge from './CircularScoreGauge';
import Upgrade_Prompt from './Upgrade_Prompt';
import api from '../../configs/api';

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
  summary: 1,
  professional_summary: 1,
  experience: 2,
  education: 3,
  projects: 4,
  skills: 5,
  certifications: 6,
  languages: 7,
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
const ATS_Results_Panel = ({ resumeId, resumeData, onNavigateTab, onReloadResume }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth?.token);
  const { scanStatus, historyStatus, currentScan, error, quotaExhausted, scansRemainingToday } =
    useSelector((state) => state.ats);

  // Part 12.2 — collapsible section state
  const [openSections, setOpenSections] = useState({
    scoreSummary: true,
    keywords: false,
    skillsGap: false,
    suggestions: false,
  });

  const [showTailorModal, setShowTailorModal] = useState(false);
  const [tailorLoading, setTailorLoading] = useState(false);
  const [tailorData, setTailorData] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState('summary');
  const [isApplying, setIsApplying] = useState(false);

  const toggleSection = (key) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const triggerTailoring = async () => {
    const jobDescription = sessionStorage.getItem('ats_jd_' + resumeId);
    if (!jobDescription || jobDescription.trim().length < 50) {
      toast.error("Please scan with a valid job description (at least 50 characters) first.");
      return;
    }

    setShowTailorModal(true);
    setTailorLoading(true);
    setTailorData(null);
    setActiveModalTab('summary');

    try {
      const { data } = await api.post('/api/ai/tailor-resume', 
        { resumeId, jobDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTailorData(data);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to tailor resume");
      setShowTailorModal(false);
    } finally {
      setTailorLoading(false);
    }
  };

  const handleApplyToCurrent = async () => {
    if (!tailorData || !resumeData) return;
    setIsApplying(true);
    try {
      const tailoredResume = {
        ...resumeData,
        professional_summary: tailorData.tailored.professional_summary,
        skills: tailorData.tailored.skills,
        experience: resumeData.experience.map((exp) => {
          const matchedTailored = tailorData.tailored.experience.find(
            (te) => te.company.toLowerCase() === exp.company.toLowerCase() && 
                    te.position.toLowerCase() === exp.position.toLowerCase()
          );
          return {
            ...exp,
            description: matchedTailored ? matchedTailored.description : exp.description,
          };
        }),
        project: resumeData.project.map((proj) => {
          const matchedTailored = tailorData.tailored.project.find(
            (tp) => tp.name.toLowerCase() === proj.name.toLowerCase()
          );
          return {
            ...proj,
            description: matchedTailored ? matchedTailored.description : proj.description,
          };
        }),
      };

      const formData = new FormData();
      formData.append("resumeId", resumeId);
      formData.append("resumeData", JSON.stringify(tailoredResume));

      await api.put("/api/resumes/update", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Resume updated and tailored successfully!");
      setShowTailorModal(false);
      if (onReloadResume) {
        onReloadResume();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to save tailored changes");
    } finally {
      setIsApplying(false);
    }
  };

  const handleSaveAsCopy = async () => {
    if (!tailorData || !resumeData) return;
    setIsApplying(true);
    try {
      const newTitle = `${resumeData.title || "Untitled"} (Tailored)`;
      const createRes = await api.post(
        "/api/resumes/create",
        { title: newTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const newResumeId = createRes.data.resume._id;

      const tailoredResume = {
        ...resumeData,
        _id: newResumeId,
        title: newTitle,
        professional_summary: tailorData.tailored.professional_summary,
        skills: tailorData.tailored.skills,
        experience: resumeData.experience.map((exp) => {
          const matchedTailored = tailorData.tailored.experience.find(
            (te) => te.company.toLowerCase() === exp.company.toLowerCase() && 
                    te.position.toLowerCase() === exp.position.toLowerCase()
          );
          return {
            ...exp,
            description: matchedTailored ? matchedTailored.description : exp.description,
          };
        }),
        project: resumeData.project.map((proj) => {
          const matchedTailored = tailorData.tailored.project.find(
            (tp) => tp.name.toLowerCase() === proj.name.toLowerCase()
          );
          return {
            ...proj,
            description: matchedTailored ? matchedTailored.description : proj.description,
          };
        }),
      };

      const formData = new FormData();
      formData.append("resumeId", newResumeId);
      formData.append("resumeData", JSON.stringify(tailoredResume));

      await api.put("/api/resumes/update", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("New tailored copy created successfully!");
      setShowTailorModal(false);
      navigate(`/app/builder/${newResumeId}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to create tailored copy");
    } finally {
      setIsApplying(false);
    }
  };

  // Part 12.1 — fetch on mount when idle with no data
  useEffect(() => {
    if (resumeId && currentScan === null && scanStatus === 'idle' && historyStatus === 'idle') {
      dispatch(fetchLatestScan(resumeId));
    }
  }, [resumeId, currentScan, scanStatus, historyStatus, dispatch]);

  // Part 12.1 — show toast for non-429 errors
  useEffect(() => {
    if (scanStatus === 'failed' && !quotaExhausted && error) {
      toast.error(error);
    }
  }, [scanStatus, quotaExhausted, error]);

  // -------------------------------------------------------------------------
  // STATE: Loading skeleton — only for active scan, not for history fetch
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
  // STATE: Loading history (first visit, no scan yet) — subtle indicator
  // -------------------------------------------------------------------------
  if (historyStatus === 'loading' && currentScan === null) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading previous scan">
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
  // STATE: Error (non-quota, scan error only)
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
  // STATE: Idle with no scan (show empty state once history has been checked)
  // -------------------------------------------------------------------------
  if (scanStatus === 'idle' && currentScan === null && historyStatus !== 'loading') {
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
        <div className="flex flex-col gap-4">
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
          <div className="border-t border-line pt-3 flex justify-end">
            <button
              onClick={triggerTailoring}
              className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-700 shadow-sm"
            >
              <Sparkles className="size-3.5" />
              Auto-Tailor Resume
            </button>
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

      {/* Tailor Modal */}
      {showTailorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-line bg-surface shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-brand-500 animate-pulse" />
                <h2 className="text-lg font-bold text-ink">AI Resume Tailoring Assistant</h2>
              </div>
              <button 
                onClick={() => setShowTailorModal(false)}
                className="text-muted hover:text-ink transition-colors"
                disabled={isApplying}
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Content */}
            {tailorLoading ? (
              <div className="flex flex-col items-center justify-center flex-grow py-20 gap-4">
                <Loader2 className="size-10 animate-spin text-brand-600" />
                <p className="text-sm font-medium text-ink">Analyzing Job Description & Tailoring Resume...</p>
                <p className="text-xs text-muted max-w-xs text-center">We're optimizing your summary, skills, work accomplishments, and projects using expert ATS formatting.</p>
              </div>
            ) : tailorData ? (
              <div className="flex flex-col flex-grow overflow-hidden">
                {/* Tabs Selector */}
                <div className="flex border-b border-line px-6 bg-canvas/40">
                  {['summary', 'skills', 'experience', 'projects'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveModalTab(tab)}
                      className={`px-4 py-3 text-sm font-semibold capitalize border-b-2 transition-colors -mb-[2px] ${
                        activeModalTab === tab
                          ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                          : 'border-transparent text-muted hover:text-ink'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab content panel */}
                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                  {activeModalTab === 'summary' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="rounded-xl border border-line bg-canvas/30 p-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Original Summary</h3>
                        <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
                          {tailorData.original.professional_summary || <span className="italic text-muted">No summary provided</span>}
                        </p>
                      </div>
                      <div className="rounded-xl border border-brand-100 bg-brand-50/20 dark:border-brand-900/30 dark:bg-brand-950/10 p-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-2">Tailored Summary</h3>
                        <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
                          {tailorData.tailored.professional_summary}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeModalTab === 'skills' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="rounded-xl border border-line bg-canvas/30 p-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Original Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {tailorData.original.skills.length > 0 ? (
                            tailorData.original.skills.map((skill, index) => (
                              <span key={index} className="rounded bg-canvas border border-line px-2.5 py-1 text-xs font-medium text-ink">
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="italic text-muted text-sm">No skills listed</span>
                          )}
                        </div>
                      </div>
                      <div className="rounded-xl border border-brand-100 bg-brand-50/20 dark:border-brand-900/30 dark:bg-brand-950/10 p-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-2">Tailored Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {tailorData.tailored.skills.map((skill, index) => {
                            const isNew = !tailorData.original.skills.some(
                              (orig) => orig.toLowerCase() === skill.toLowerCase()
                            );
                            return (
                              <span
                                key={index}
                                className={`rounded px-2.5 py-1 text-xs font-medium border flex items-center gap-1 ${
                                  isNew
                                    ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/10 dark:border-green-900/30 dark:text-green-400'
                                    : 'bg-canvas border-line text-ink'
                                }`}
                              >
                                {skill}
                                {isNew && <span className="text-[10px] bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-1 rounded-sm">New</span>}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeModalTab === 'experience' && (
                    <div className="space-y-6">
                      {tailorData.tailored.experience.length === 0 ? (
                        <p className="text-sm italic text-muted">No experience sections to tailor.</p>
                      ) : (
                        tailorData.tailored.experience.map((tailoredExp, index) => {
                          const originalExp = tailorData.original.experience[index] || {};
                          return (
                            <div key={index} className="rounded-xl border border-line overflow-hidden">
                              <div className="bg-canvas border-b border-line px-4 py-2 flex items-center justify-between">
                                <span className="font-semibold text-sm text-ink">
                                  {tailoredExp.position} @ {tailoredExp.company}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-canvas/10">
                                <div className="space-y-1">
                                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted">Original Accomplishments</h4>
                                  <p className="text-xs text-muted whitespace-pre-wrap leading-relaxed">
                                    {originalExp.description || <span className="italic">No description</span>}
                                  </p>
                                </div>
                                <div className="space-y-1 border-t md:border-t-0 md:border-l border-line pt-3 md:pt-0 md:pl-4">
                                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">Tailored accomplishments (Optimized)</h4>
                                  <p className="text-xs text-ink whitespace-pre-wrap leading-relaxed">
                                    {tailoredExp.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {activeModalTab === 'projects' && (
                    <div className="space-y-6">
                      {tailorData.tailored.project.length === 0 ? (
                        <p className="text-sm italic text-muted">No project sections to tailor.</p>
                      ) : (
                        tailorData.tailored.project.map((tailoredProj, index) => {
                          const originalProj = tailorData.original.project[index] || {};
                          return (
                            <div key={index} className="rounded-xl border border-line overflow-hidden">
                              <div className="bg-canvas border-b border-line px-4 py-2">
                                <span className="font-semibold text-sm text-ink">{tailoredProj.name}</span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-canvas/10">
                                <div className="space-y-1">
                                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted">Original Description</h4>
                                  <p className="text-xs text-muted whitespace-pre-wrap leading-relaxed">
                                    {originalProj.description || <span className="italic">No description</span>}
                                  </p>
                                </div>
                                <div className="space-y-1 border-t md:border-t-0 md:border-l border-line pt-3 md:pt-0 md:pl-4">
                                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">Tailored Description</h4>
                                  <p className="text-xs text-ink whitespace-pre-wrap leading-relaxed">
                                    {tailoredProj.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-line px-6 py-4 bg-canvas/20">
                  <span className="text-xs text-muted text-center sm:text-left">
                    Save as copy to preserve original draft, or overwrite to update active template.
                  </span>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setShowTailorModal(false)}
                      disabled={isApplying}
                      className="w-1/3 sm:w-auto px-4 py-2 text-xs font-semibold rounded-lg border border-line hover:bg-canvas text-ink transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAsCopy}
                      disabled={isApplying}
                      className="w-1/3 sm:w-auto px-4 py-2 text-xs font-semibold rounded-lg border border-brand-600 text-brand-600 hover:bg-brand-50/50 dark:border-brand-400 dark:text-brand-400 dark:hover:bg-brand-950/20 transition-colors flex items-center justify-center gap-1.5"
                    >
                      {isApplying ? <Loader2 className="size-3.5 animate-spin" /> : <Copy className="size-3.5" />}
                      Create Copy
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyToCurrent}
                      disabled={isApplying}
                      className="w-1/3 sm:w-auto px-4 py-2 text-xs font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors flex items-center justify-center gap-1.5"
                    >
                      {isApplying ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                      Apply & Save
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default ATS_Results_Panel;
