import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  Copy,
  AlertTriangle,
  MessageSquare,
  RefreshCw,
  ClipboardList,
} from "lucide-react";
import {
  generateInterviewQuestions,
  resetInterview,
} from "../../app/features/interviewSlice";

// Category badge colours
const CATEGORY_STYLES = {
  Behavioural:  { bg: "bg-blue-50 dark:bg-blue-500/10",   text: "text-blue-700 dark:text-blue-300",   dot: "bg-blue-500"   },
  Technical:    { bg: "bg-violet-50 dark:bg-violet-500/10", text: "text-violet-700 dark:text-violet-300", dot: "bg-violet-500" },
  Situational:  { bg: "bg-amber-50 dark:bg-amber-500/10",  text: "text-amber-700 dark:text-amber-300",  dot: "bg-amber-500"  },
  "Role-Specific": { bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
};

const getCategoryStyle = (category) =>
  CATEGORY_STYLES[category] ?? {
    bg: "bg-gray-50 dark:bg-gray-500/10",
    text: "text-gray-700 dark:text-gray-300",
    dot: "bg-gray-400",
  };

const InterviewPrepPanel = ({ resumeId }) => {
  const dispatch = useDispatch();
  const { status, error, quotaExhausted, questions } = useSelector(
    (state) => state.interview
  );

  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [expandedIndex, setExpandedIndex] = useState(null);

  const isLoading = status === "loading";
  const hasResults = questions.length > 0;

  const handleGenerate = () => {
    dispatch(
      generateInterviewQuestions({ resumeId, targetRole, jobDescription })
    )
      .unwrap()
      .then(() => {
        setExpandedIndex(0); // auto-expand first question
        toast.success("Interview questions generated!");
      })
      .catch((payload) => {
        if (!payload?.quotaExhausted) {
          toast.error(payload?.message || "Generation failed");
        }
      });
  };

  const handleRegenerate = () => {
    dispatch(resetInterview());
    setExpandedIndex(null);
    dispatch(generateInterviewQuestions({ resumeId, targetRole, jobDescription }))
      .unwrap()
      .then(() => {
        setExpandedIndex(0);
        toast.success("Fresh questions generated!");
      })
      .catch((payload) => {
        if (!payload?.quotaExhausted) {
          toast.error(payload?.message || "Generation failed");
        }
      });
  };

  const copyQuestion = async (q) => {
    try {
      await navigator.clipboard.writeText(
        `Q: ${q.question}\n\nSuggested Answer:\n${q.suggestedAnswer}`
      );
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Clipboard access denied. Please copy manually.");
    }
  };

  const copyAll = async () => {
    const text = questions
      .map(
        (q, i) =>
          `${i + 1}. [${q.category}] ${q.question}\n\nSuggested Answer:\n${q.suggestedAnswer}`
      )
      .join("\n\n---\n\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("All questions copied!");
    } catch {
      toast.error("Clipboard access denied. Please copy manually.");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h3 className="flex items-center gap-2 text-lg font-semibold text-ink">
          <MessageSquare className="size-5 text-brand-600" />
          Interview Prep
        </h3>
        <p className="mt-0.5 text-sm text-muted">
          Generate 10 tailored interview questions with suggested answers based on your resume.
        </p>
      </div>

      {/* Inputs */}
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Target Role <span className="text-muted font-normal">(optional)</span>
          </label>
          <input
            id="interview-target-role"
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Senior Frontend Engineer, Product Manager"
            className="w-full rounded-lg border border-line p-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Job Description Snippet{" "}
            <span className="text-muted font-normal">(optional, ≤ 500 chars)</span>
          </label>
          <textarea
            id="interview-job-description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value.slice(0, 500))}
            rows={4}
            placeholder="Paste key lines from the job description to make questions more specific..."
            className="w-full resize-none rounded-lg border border-line p-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <p className="mt-1 text-right text-xs text-muted">
            {jobDescription.length} / 500
          </p>
        </div>
      </div>

      {/* Quota warning */}
      {quotaExhausted && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">Daily limit reached.</p>
            <p className="text-amber-700 dark:text-amber-400">
              Free plan allows 3 question sets per day. Upgrade to premium for unlimited access.
            </p>
          </div>
        </div>
      )}

      {/* Generate button */}
      {!hasResults && (
        <button
          type="button"
          id="interview-generate-btn"
          onClick={handleGenerate}
          disabled={isLoading || quotaExhausted}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-600 to-accent-600 px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {isLoading ? "Generating questions…" : "Generate Interview Questions"}
        </button>
      )}

      {/* Error */}
      {error && status === "failed" && !quotaExhausted && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
        >
          {error}
        </p>
      )}

      {/* Results */}
      {hasResults && (
        <div className="space-y-4">
          {/* Results toolbar */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-ink">
              {questions.length} questions generated
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyAll}
                className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-canvas"
              >
                <ClipboardList className="size-3.5" />
                Copy All
              </button>
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={isLoading}
                className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-canvas disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="size-3.5" />
                )}
                Regenerate
              </button>
            </div>
          </div>

          {/* Accordion cards */}
          <div className="space-y-2">
            {questions.map((q, i) => {
              const style = getCategoryStyle(q.category);
              const isOpen = expandedIndex === i;

              return (
                <div
                  key={i}
                  className="rounded-lg border border-line overflow-hidden transition-shadow hover:shadow-sm"
                >
                  {/* Question row — always visible */}
                  <button
                    type="button"
                    onClick={() => setExpandedIndex(isOpen ? null : i)}
                    className="flex w-full items-start gap-3 p-4 text-left"
                  >
                    {/* Number */}
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                      {i + 1}
                    </span>

                    <div className="flex-1 min-w-0">
                      {/* Category badge */}
                      <span
                        className={`mb-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}
                      >
                        <span className={`size-1.5 rounded-full ${style.dot}`} />
                        {q.category}
                      </span>
                      {/* Question text */}
                      <p className="text-sm font-medium text-ink leading-snug">
                        {q.question}
                      </p>
                    </div>

                    {/* Chevron */}
                    <span className="mt-0.5 shrink-0 text-muted">
                      {isOpen ? (
                        <ChevronUp className="size-4" />
                      ) : (
                        <ChevronDown className="size-4" />
                      )}
                    </span>
                  </button>

                  {/* Suggested answer — expandable */}
                  {isOpen && (
                    <div className="border-t border-line bg-canvas px-4 pb-4 pt-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                            💡 Suggested Answer
                          </p>
                          <p className="text-sm text-body leading-relaxed">
                            {q.suggestedAnswer}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyQuestion(q)}
                          className="shrink-0 rounded-md border border-line p-1.5 text-muted transition-colors hover:bg-surface hover:text-ink"
                          title="Copy Q&A"
                        >
                          <Copy className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewPrepPanel;
