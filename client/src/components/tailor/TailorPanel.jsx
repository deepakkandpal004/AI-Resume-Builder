import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  Sparkles,
  Loader2,
  Check,
  ArrowRight,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";
import {
  tailorResume,
  resetTailor,
  markApplied,
} from "../../app/features/tailorSlice";

const MIN_JD_LENGTH = 50;
const MAX_JD_LENGTH = 10000;

// ── Diff helpers ──────────────────────────────────────────────────────────────

/** Count words that are in `b` but not in `a` */
const countNewWords = (a, b) => {
  if (!a || !b) return 0;
  const setA = new Set(a.toLowerCase().split(/\s+/));
  return b
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3 && !setA.has(w)).length;
};

/** Count items in `b` that aren't in `a` */
const countNewSkills = (a, b) => {
  if (!a || !b) return 0;
  const setA = new Set(a.map((s) => s.toLowerCase().trim()));
  return b.filter((s) => !setA.has(s.toLowerCase().trim())).length;
};

// ── Section card component ────────────────────────────────────────────────────

const DiffCard = ({ label, original, tailored, type = "text" }) => {
  const [expanded, setExpanded] = useState(false);

  let changeSummary = "";
  if (type === "text") {
    const n = countNewWords(original, tailored);
    changeSummary = n > 0 ? `${n} new keywords added` : "Refined wording";
  } else if (type === "skills") {
    const n = countNewSkills(original, tailored);
    changeSummary = n > 0 ? `${n} new skills added` : "Skills reordered";
  } else if (type === "entries") {
    changeSummary = `${original?.length || 0} entries updated`;
  }

  return (
    <div className="rounded-lg border border-line overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-canvas/50 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex size-2 shrink-0 rounded-full bg-teal-500" />
          <span className="text-sm font-medium text-ink truncate">{label}</span>
          <span className="text-xs text-muted hidden sm:inline">— {changeSummary}</span>
        </div>
        {expanded ? (
          <ChevronUp className="size-4 text-muted shrink-0" />
        ) : (
          <ChevronDown className="size-4 text-muted shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-line divide-y divide-line">
          {/* Before */}
          <div className="p-4">
            <p className="text-[11px] uppercase tracking-wide font-semibold text-rose-500 mb-2">
              Before
            </p>
            {type === "skills" ? (
              <div className="flex flex-wrap gap-1.5">
                {(original || []).map((s, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            ) : type === "entries" ? (
              <div className="space-y-2">
                {(original || []).map((e, i) => (
                  <div key={i} className="text-sm text-body">
                    <span className="font-medium">{e.company || e.name}</span>
                    {e.position && <span className="text-muted"> · {e.position}</span>}
                    {e.description && (
                      <p className="mt-0.5 text-xs text-muted line-clamp-3">
                        {e.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-body leading-relaxed">{original}</p>
            )}
          </div>

          {/* After */}
          <div className="p-4 bg-teal-50/50 dark:bg-teal-500/5">
            <p className="text-[11px] uppercase tracking-wide font-semibold text-teal-600 dark:text-teal-400 mb-2">
              After
            </p>
            {type === "skills" ? (
              <div className="flex flex-wrap gap-1.5">
                {(tailored || []).map((s, i) => {
                  const isNew = !(original || [])
                    .map((x) => x.toLowerCase().trim())
                    .includes(s.toLowerCase().trim());
                  return (
                    <span
                      key={i}
                      className={`rounded-full px-2.5 py-0.5 text-xs ${
                        isNew
                          ? "bg-teal-100 text-teal-800 font-medium ring-1 ring-teal-300 dark:bg-teal-500/20 dark:text-teal-200 dark:ring-teal-500/40"
                          : "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300"
                      }`}
                    >
                      {isNew && "✦ "}{s}
                    </span>
                  );
                })}
              </div>
            ) : type === "entries" ? (
              <div className="space-y-2">
                {(tailored || []).map((e, i) => (
                  <div key={i} className="text-sm text-body">
                    <span className="font-medium">{e.company || e.name}</span>
                    {e.position && <span className="text-muted"> · {e.position}</span>}
                    {e.description && (
                      <p className="mt-0.5 text-xs text-teal-700 dark:text-teal-300 leading-relaxed">
                        {e.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-teal-800 dark:text-teal-200 leading-relaxed">
                {tailored}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main panel ────────────────────────────────────────────────────────────────

const TailorPanel = ({ resumeId, onApplyTailored }) => {
  const dispatch = useDispatch();
  const { status, error, original, tailored, applied } = useSelector(
    (state) => state.tailor
  );

  const [jobDescription, setJobDescription] = useState("");
  const [validationError, setValidationError] = useState("");

  const isLoading = status === "loading";
  const hasResults = !!tailored;

  const handleGenerate = () => {
    setValidationError("");

    if (jobDescription.trim().length < MIN_JD_LENGTH) {
      setValidationError(
        `Please enter a more complete job description (at least ${MIN_JD_LENGTH} characters).`
      );
      return;
    }

    dispatch(
      tailorResume({
        resumeId,
        jobDescription: jobDescription.slice(0, MAX_JD_LENGTH),
      })
    )
      .unwrap()
      .then(() => toast.success("Resume tailored to job description!"))
      .catch((payload) =>
        toast.error(payload?.message || "Tailoring failed")
      );
  };

  const handleApply = () => {
    if (!tailored || applied) return;

    // Build the patched resume data and call the parent callback
    const patch = {};

    if (tailored.professional_summary) {
      patch.professional_summary = tailored.professional_summary;
    }
    if (Array.isArray(tailored.skills) && tailored.skills.length > 0) {
      patch.skills = tailored.skills;
    }
    if (Array.isArray(tailored.experience) && tailored.experience.length > 0) {
      // Merge tailored descriptions back into the existing experience objects
      patch.experience_descriptions = tailored.experience; // { company, position, description }
    }
    if (Array.isArray(tailored.project) && tailored.project.length > 0) {
      patch.project_descriptions = tailored.project; // { name, description }
    }

    onApplyTailored(patch);
    dispatch(markApplied());
    toast.success("Tailored content applied! Remember to save.");
  };

  const handleReset = () => {
    dispatch(resetTailor());
    setJobDescription("");
    setValidationError("");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-ink">
          Tailor to Job Description
        </h3>
        <p className="mt-0.5 text-sm text-muted">
          Paste a job description and AI will rewrite your summary, skills, experience, and
          projects to match it — making your resume ATS-friendly for that specific role.
        </p>
      </div>

      {/* Input */}
      {!hasResults && (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Job Description
            </label>
            <textarea
              id="tailor-job-description"
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
                setValidationError("");
              }}
              maxLength={MAX_JD_LENGTH}
              rows={10}
              placeholder="Paste the full job description here…"
              className={`w-full resize-none rounded-lg border bg-surface p-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                validationError
                  ? "border-red-400 focus:ring-red-400"
                  : "border-line"
              }`}
            />
            <p className="mt-1 text-right text-xs text-muted">
              {jobDescription.length.toLocaleString()} /{" "}
              {MAX_JD_LENGTH.toLocaleString()}
            </p>
          </div>

          {validationError && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
            >
              {validationError}
            </p>
          )}

          <button
            type="button"
            id="tailor-generate-btn"
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-600 to-accent-600 px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {isLoading ? "Tailoring your resume…" : "Tailor Resume"}
          </button>
        </>
      )}

      {/* Error */}
      {error && status === "failed" && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results — before/after diffs */}
      {hasResults && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm font-medium text-ink flex items-center gap-2">
              <Check className="size-4 text-teal-500" />
              Tailored for this role
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-canvas"
              >
                <RotateCcw className="size-3.5" />
                Start over
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={applied}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${
                  applied
                    ? "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300 cursor-default"
                    : "bg-gradient-to-r from-brand-600 to-accent-600 text-white hover:opacity-90"
                }`}
              >
                {applied ? (
                  <>
                    <Check className="size-3.5" />
                    Applied
                  </>
                ) : (
                  <>
                    <ArrowRight className="size-3.5" />
                    Apply to Resume
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Info note */}
          <div className="rounded-lg bg-brand-50 p-3 text-sm text-body dark:bg-brand-500/10">
            <p>
              <strong>Review the changes below</strong>, then click{" "}
              <strong>Apply to Resume</strong> to update your resume. Click on any
              section to expand the before/after comparison.
            </p>
          </div>

          {/* Diff cards */}
          <div className="space-y-2">
            {tailored.professional_summary && (
              <DiffCard
                label="Professional Summary"
                original={original?.professional_summary}
                tailored={tailored.professional_summary}
                type="text"
              />
            )}
            {tailored.skills?.length > 0 && (
              <DiffCard
                label="Skills"
                original={original?.skills}
                tailored={tailored.skills}
                type="skills"
              />
            )}
            {tailored.experience?.length > 0 && (
              <DiffCard
                label="Experience"
                original={original?.experience}
                tailored={tailored.experience}
                type="entries"
              />
            )}
            {tailored.project?.length > 0 && (
              <DiffCard
                label="Projects"
                original={original?.project}
                tailored={tailored.project}
                type="entries"
              />
            )}
          </div>

          {applied && (
            <p className="text-xs text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
              <Check className="size-3.5" />
              Changes applied to your resume. Don't forget to <strong>Save</strong>.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TailorPanel;
