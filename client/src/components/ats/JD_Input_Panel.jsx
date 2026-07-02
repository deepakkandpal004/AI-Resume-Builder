import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Clipboard, Search, Loader2 } from 'lucide-react';
import { runScan } from '../../app/features/atsSlice';

const MAX_LENGTH = 10000;
const MIN_LENGTH = 50;
const STORAGE_KEY_PREFIX = 'ats_jd_';

const JD_Input_Panel = ({ resumeId, onScanComplete }) => {
  const dispatch = useDispatch();
  const scanStatus = useSelector((state) => state.ats.scanStatus);

  const [value, setValue] = useState('');
  const [validationError, setValidationError] = useState('');
  const [clipboardError, setClipboardError] = useState('');
  const [truncationBanner, setTruncationBanner] = useState('');
  const isLoading = scanStatus === 'loading';

  // On mount: restore from sessionStorage
  useEffect(() => {
    if (!resumeId) return;
    const stored = sessionStorage.getItem(STORAGE_KEY_PREFIX + resumeId);
    if (stored) {
      setValue(stored);
    }
  }, [resumeId]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (resumeId) {
      sessionStorage.setItem(STORAGE_KEY_PREFIX + resumeId, newValue);
    }
    // Clear errors on edit
    setValidationError('');
    setTruncationBanner('');
    setClipboardError('');
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setValue(text);
      if (resumeId) {
        sessionStorage.setItem(STORAGE_KEY_PREFIX + resumeId, text);
      }
      setClipboardError('');
      setValidationError('');
      setTruncationBanner('');
    } catch (err) {
      if (
        err.name === 'NotAllowedError' ||
        (err.message && err.message.toLowerCase().includes('permission'))
      ) {
        setClipboardError('Clipboard access denied. Please paste manually.');
      } else {
        setClipboardError('Clipboard access denied. Please paste manually.');
      }
      // Do NOT modify textarea content
    }
  };

  const handleAnalyze = () => {
    setValidationError('');
    setTruncationBanner('');
    setClipboardError('');

    const trimmed = value.trim();

    if (trimmed.length < MIN_LENGTH) {
      setValidationError(
        'Please enter a more complete job description (at least 50 characters).'
      );
      return;
    }

    let finalDescription = value;
    if (value.length > MAX_LENGTH) {
      finalDescription = value.slice(0, MAX_LENGTH);
      setValue(finalDescription);
      if (resumeId) {
        sessionStorage.setItem(STORAGE_KEY_PREFIX + resumeId, finalDescription);
      }
      setTruncationBanner('Job description truncated to 10,000 characters.');
    }

    dispatch(runScan({ resumeId, jobDescription: finalDescription }))
      .unwrap()
      .then((result) => {
        if (onScanComplete) onScanComplete(result);
      })
      .catch(() => {
        // Error state is handled by Redux slice / parent components
      });
  };

  const charCount = value.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-ink">Job Description</h3>
        <p className="text-sm text-muted">
          Paste the job description to analyze your resume's ATS compatibility.
        </p>
      </div>

      {/* Textarea area */}
      <div className="relative">
        <textarea
          value={value}
          onChange={handleChange}
          maxLength={MAX_LENGTH}
          rows={14}
          className={`w-full resize-none rounded-lg border p-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
            validationError ? 'border-red-400 focus:ring-red-400' : 'border-line'
          }`}
          placeholder="Paste your job description here..."
          aria-label="Job description input"
          aria-describedby={
            validationError
              ? 'jd-validation-error'
              : truncationBanner
              ? 'jd-truncation-banner'
              : clipboardError
              ? 'jd-clipboard-error'
              : undefined
          }
        />

        {/* Character counter */}
        <p className="mt-1 text-right text-xs text-muted">
          <span className={charCount >= MAX_LENGTH ? 'text-red-500 font-medium' : ''}>
            {charCount.toLocaleString()}
          </span>{' '}
          / {MAX_LENGTH.toLocaleString()}
        </p>
      </div>

      {/* Validation error */}
      {validationError && (
        <p
          id="jd-validation-error"
          role="alert"
          className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 border border-red-200"
        >
          {validationError}
        </p>
      )}

      {/* Truncation banner */}
      {truncationBanner && (
        <p
          id="jd-truncation-banner"
          role="status"
          className="rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-700 border border-amber-200"
        >
          {truncationBanner}
        </p>
      )}

      {/* Clipboard error */}
      {clipboardError && (
        <p
          id="jd-clipboard-error"
          role="alert"
          className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 border border-red-200"
        >
          {clipboardError}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        {/* Paste from clipboard */}
        <button
          type="button"
          onClick={handlePasteFromClipboard}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Paste from clipboard"
        >
          <Clipboard className="size-4" />
          Paste from clipboard
        </button>

        {/* Analyze button */}
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-brand-600 to-accent-600 px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={isLoading ? 'Analyzing resume' : 'Analyze resume'}
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Search className="size-4" />
          )}
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>
    </div>
  );
};

export default JD_Input_Panel;
