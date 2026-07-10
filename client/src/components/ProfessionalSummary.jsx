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
      toast.success("Summary enhanced!");
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setIsGenerating(false);
    }
  }

  const handleAIOption = async (actionType) => {
    if (!data?.trim()) {
      toast.error("Please enter some summary text first.");
      return;
    }
    try {
      setIsGenerating(true);
      let promptText = "";
      switch (actionType) {
        case "grammar":
          promptText = `Fix grammar, spelling, and phrasing for this professional summary: "${data}"`;
          break;
        case "professional":
          promptText = `Make this professional summary sound highly professional, executive, and elite: "${data}"`;
          break;
        case "quantify":
          promptText = `Enhance this summary by adding quantified accomplishments, industry metrics, or percentage results: "${data}"`;
          break;
        case "shorten":
          promptText = `Shorten this professional summary to make it extremely punchy and concise: "${data}"`;
          break;
        case "expand":
          promptText = `Expand this professional summary to elaborate on key strengths, skills, and strategic achievements: "${data}"`;
          break;
        default:
          promptText = `enhance this summary: "${data}"`;
      }
      const response = await api.post(`/api/ai/enhance-pro-sum`, { userContent: promptText }, { headers: { Authorization: `Bearer ${token}` } });
      onChange(response.data.enhancedContent || "");
      toast.success("Summary updated with AI!");
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const charCount = (data || "").length;
  const isOptimal = charCount >= 150 && charCount <= 400;
  const colorClass = charCount === 0 ? "text-muted" : isOptimal ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400";

  const inp = "premium-input w-full resize-none overflow-hidden min-h-[100px]";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-zinc-900/30 p-4 rounded-xl border border-line">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-ink">Professional Summary</h3>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Write a brief 2-3 sentence overview of your career history, key achievements, and values to catch recruiter interest.
          </p>
        </div>
        <button
          disabled={isGenerating || !data}
          onClick={generateSummary}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50 shrink-0 shadow-sm active:scale-95 disabled:cursor-not-allowed"
        >
          {isGenerating ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
          <span>{isGenerating ? "Enhancing..." : "AI Enhance"}</span>
        </button>
      </div>

      <textarea
        ref={textareaRef}
        value={data || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className={inp}
        placeholder="e.g. Dedicated Senior Software Engineer with 8+ years of experience leading agile teams to build scalable cloud architectures..."
      />

      <div className="flex items-center justify-between text-[11px] px-1">
        <span className="text-muted font-medium">
          {charCount === 0
            ? "Aim for 150–400 characters"
            : charCount < 150
            ? "Try to write at least 150 characters"
            : charCount <= 400
            ? "Great length for a summary!"
            : "Consider shortening to under 400 characters"}
        </span>
        <span className={`font-semibold tabular-nums ${colorClass}`}>
          {charCount} / 400
        </span>
      </div>

      {/* AI Toolbar Row */}
      <div className="flex flex-wrap items-center gap-1.5 pt-3.5 border-t border-line/45">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted mr-1.5">AI Writer:</span>
        <button
          onClick={() => handleAIOption("grammar")}
          disabled={isGenerating || !data?.trim()}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg border border-line bg-surface hover:border-purple-300 hover:text-purple-600 transition disabled:opacity-40 cursor-pointer text-body shadow-xs"
        >
          Fix Grammar
        </button>
        <button
          onClick={() => handleAIOption("professional")}
          disabled={isGenerating || !data?.trim()}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg border border-line bg-surface hover:border-purple-300 hover:text-purple-600 transition disabled:opacity-40 cursor-pointer text-body shadow-xs"
        >
          Executive Tone
        </button>
        <button
          onClick={() => handleAIOption("quantify")}
          disabled={isGenerating || !data?.trim()}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg border border-line bg-surface hover:border-purple-300 hover:text-purple-600 transition disabled:opacity-40 cursor-pointer text-body shadow-xs"
        >
          Quantify
        </button>
        <button
          onClick={() => handleAIOption("shorten")}
          disabled={isGenerating || !data?.trim()}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg border border-line bg-surface hover:border-purple-300 hover:text-purple-600 transition disabled:opacity-40 cursor-pointer text-body shadow-xs"
        >
          Shorten
        </button>
        <button
          onClick={() => handleAIOption("expand")}
          disabled={isGenerating || !data?.trim()}
          className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg border border-line bg-surface hover:border-purple-300 hover:text-purple-600 transition disabled:opacity-40 cursor-pointer text-body shadow-xs"
        >
          Expand
        </button>
      </div>
    </div>
  );
};

export default ProfessionalSummary;
