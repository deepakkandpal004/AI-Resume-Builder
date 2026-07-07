import { Loader2, Sparkles } from 'lucide-react'
import React, { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import api from "../configs/api";
import { toast } from 'react-hot-toast'

const ProfessionalSummary = ({data, onChange}) => {

  const {token} = useSelector((state) => state.auth);
  const [isGenerating, setIsGenerating] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [data]);

  const generateSummary = async () => {
    try {
      setIsGenerating(true);
      const prompt = `enhance my professional summary: "${data}"`
      const response = await api.post(`/api/ai/enhance-pro-sum`, {userContent: prompt}, {headers: { Authorization: `Bearer ${token}` },});
      onChange(response.data.enhancedContent || "");
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setIsGenerating(false);
    }
  }

  const charCount = (data || "").length;
  const isOptimal = charCount >= 150 && charCount <= 400;
  const colorClass = charCount === 0 ? "text-muted" : isOptimal ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400";

  const inp = "w-full resize-none rounded-lg border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow overflow-hidden";

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-ink">Professional Summary</h3>
          <p className="text-sm text-muted mt-0.5">Craft a compelling summary that highlights your strengths</p>
        </div>
        <button
          disabled={isGenerating || !data}
          onClick={generateSummary}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-accent-600 px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 shrink-0"
        >
          {isGenerating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          {isGenerating ? "Enhancing..." : "AI Enhance"}
        </button>
      </div>

      <textarea
        ref={textareaRef}
        value={data || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className={inp}
        placeholder="Write a compelling professional summary that highlights your key strengths and career objectives..."
      />

      <div className="flex items-center justify-between text-xs">
        <span className="text-muted">
          {charCount === 0
            ? "Aim for 150–400 characters"
            : charCount < 150
            ? "Try to write at least 150 characters"
            : charCount <= 400
            ? "Great length for a summary"
            : "Consider shortening to under 400 characters"}
        </span>
        <span className={`font-medium tabular-nums ${colorClass}`}>
          {charCount} {charCount === 1 ? "char" : "chars"}
        </span>
      </div>
    </div>
  )
}

export default ProfessionalSummary
