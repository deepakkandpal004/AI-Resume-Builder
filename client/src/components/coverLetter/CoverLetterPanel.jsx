import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  Mail,
  Loader2,
  Copy,
  Download,
  Trash2,
  Clock,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import {
  generateCoverLetter,
  fetchCoverLetters,
  deleteCoverLetter,
  selectLetter,
} from "../../app/features/coverLetterSlice";

const MIN_JD_LENGTH = 50;
const MAX_JD_LENGTH = 10000;

const TONES = [
  { value: "formal", label: "Formal" },
  { value: "conversational", label: "Conversational" },
  { value: "enthusiastic", label: "Enthusiastic" },
];

const CoverLetterPanel = ({ resumeId }) => {
  const dispatch = useDispatch();
  const { genStatus, historyStatus, error, quotaExhausted, lettersRemainingToday, current, history } =
    useSelector((state) => state.coverLetter);

  const [companyName, setCompanyName] = useState("");
  const [positionTitle, setPositionTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState("formal");
  const [validationError, setValidationError] = useState("");
  const [editableContent, setEditableContent] = useState("");

  const isLoading = genStatus === "loading";

  // Load saved letters on mount / resume change.
  useEffect(() => {
    if (resumeId) {
      dispatch(fetchCoverLetters(resumeId));
    }
  }, [resumeId, dispatch]);

  // Keep the editable textarea in sync with the selected/generated letter.
  useEffect(() => {
    setEditableContent(current?.content || "");
  }, [current]);

  const handleGenerate = () => {
    setValidationError("");

    if (!companyName.trim() || !positionTitle.trim()) {
      setValidationError("Company name and position title are required.");
      return;
    }
    if (jobDescription.trim().length < MIN_JD_LENGTH) {
      setValidationError(
        `Please enter a more complete job description (at least ${MIN_JD_LENGTH} characters).`
      );
      return;
    }

    dispatch(
      generateCoverLetter({
        resumeId,
        jobDescription: jobDescription.slice(0, MAX_JD_LENGTH),
        companyName: companyName.trim(),
        positionTitle: positionTitle.trim(),
        tone,
      })
    )
      .unwrap()
      .then(() => toast.success("Cover letter generated"))
      .catch((payload) => {
        if (!payload?.quotaExhausted) {
          toast.error(payload?.message || "Generation failed");
        }
      });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editableContent);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Clipboard access denied. Please copy manually.");
    }
  };

  const handleDownload = () => {
    const safe = (s) => (s || "cover-letter").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    const filename = `${safe(current?.companyName)}-${safe(current?.positionTitle)}.txt`;
    const blob = new Blob([editableContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSelectHistory = (letter) => {
    dispatch(selectLetter(letter));
  };

  const handleDelete = (letterId, e) => {
    e.stopPropagation();
    dispatch(deleteCoverLetter(letterId))
      .unwrap()
      .then(() => toast.success("Cover letter deleted"))
      .catch((payload) => toast.error(payload?.message || "Failed to delete"));
  };

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-ink">Cover Letter Generator</h3>
        <p className="text-sm text-muted">
          Generate a tailored cover letter from your resume and a job description.
        </p>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Company</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Acme Corp"
            className="w-full rounded-lg border border-line p-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Position</label>
          <input
            type="text"
            value={positionTitle}
            onChange={(e) => setPositionTitle(e.target.value)}
            placeholder="e.g. Senior Engineer"
            className="w-full rounded-lg border border-line p-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Tone</label>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="w-full rounded-lg border border-line p-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {TONES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Job Description</label>
        <textarea
          value={jobDescription}
          onChange={(e) => {
            setJobDescription(e.target.value);
            setValidationError("");
          }}
          maxLength={MAX_JD_LENGTH}
          rows={8}
          placeholder="Paste the job description here..."
          className={`w-full resize-none rounded-lg border p-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
            validationError ? "border-red-400 focus:ring-red-400" : "border-line"
          }`}
        />
        <p className="mt-1 text-right text-xs text-muted">
          {jobDescription.length.toLocaleString()} / {MAX_JD_LENGTH.toLocaleString()}
        </p>
      </div>

      {/* Validation error */}
      {validationError && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {validationError}
        </p>
      )}

      {/* Quota notice */}
      {quotaExhausted ? (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">Daily cover letter limit reached.</p>
            <p className="text-amber-700">
              Free plan includes a limited number of generations per day. Upgrade to premium for unlimited cover letters.
            </p>
          </div>
        </div>
      ) : (
        lettersRemainingToday !== null && (
          <p className="text-xs text-muted">
            {lettersRemainingToday} cover letter{lettersRemainingToday === 1 ? "" : "s"} remaining today.
          </p>
        )
      )}

      {/* Generate button */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isLoading || quotaExhausted}
        className="flex items-center gap-2 rounded-lg bg-linear-to-r from-brand-600 to-accent-600 px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
        {isLoading ? "Generating..." : "Generate Cover Letter"}
      </button>

      {error && genStatus === "failed" && !quotaExhausted && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Result */}
      {current && (
        <div className="space-y-3 rounded-lg border border-line p-4">
          <div className="flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Mail className="size-4 text-brand-600" />
              {current.companyName} — {current.positionTitle}
            </h4>
          </div>
          <textarea
            value={editableContent}
            onChange={(e) => setEditableContent(e.target.value)}
            rows={14}
            className="w-full resize-none rounded-lg border border-line p-4 text-sm leading-relaxed transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Generated cover letter (editable)"
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-canvas"
            >
              <Copy className="size-4" />
              Copy
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-canvas"
            >
              <Download className="size-4" />
              Download
            </button>
          </div>
        </div>
      )}

      {/* History */}
      <div className="space-y-2">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Clock className="size-4" />
          Saved Cover Letters
        </h4>
        {historyStatus === "loading" ? (
          <p className="text-sm text-muted">Loading...</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-muted">No cover letters yet. Generate one above.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((letter) => (
              <li
                key={letter.letterId}
                onClick={() => handleSelectHistory(letter)}
                className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-canvas ${
                  current?.letterId === letter.letterId ? "border-brand-400 bg-brand-50" : "border-line"
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">
                    {letter.companyName} — {letter.positionTitle}
                  </p>
                  <p className="text-xs text-muted">
                    {formatDate(letter.createdAt)} · {letter.tone}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDelete(letter.letterId, e)}
                  className="ml-2 shrink-0 rounded-md p-1.5 text-muted transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label="Delete cover letter"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CoverLetterPanel;
