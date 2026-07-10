import { Loader2, Plus, Sparkles, X, Lightbulb } from "lucide-react";
import React from "react";
import toast from "react-hot-toast";
import api from "../configs/api";

const inp = "premium-input";

const SkillsForm = ({ data, onChange, profession, token }) => {
  const [newSkill, setNewSkill] = React.useState("");
  const [suggestions, setSuggestions] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const addSkill = () => {
    const skill = newSkill.trim();
    if (skill && !data.includes(skill)) {
      onChange([...data, skill]);
      setNewSkill("");
    }
  };

  const removeSkill = (indexToRemove) => {
    onChange(data.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const suggestSkills = async () => {
    if (!profession) {
      toast.error("Please set your profession in Personal Info first.");
      return;
    }
    setLoading(true);
    try {
      const { data: result } = await api.post(
        "/api/ai/suggest-skills",
        { targetRole: profession, currentSkills: data },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuggestions(result.suggestedSkills);
    } catch (error) {
      if (error.response?.data?.quotaExhausted) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.response?.data?.message || error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const addSuggestedSkill = (skill) => {
    if (!data.includes(skill)) {
      onChange([...data, skill]);
    }
  };

  const hasSuggestions = suggestions &&
    (suggestions.technical?.length > 0 ||
     suggestions.soft?.length > 0 ||
     suggestions.tools?.length > 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h3 className="text-sm font-bold text-ink">Skills</h3>
        <p className="text-xs text-muted mt-0.5">
          {data.length > 0
            ? `${data.length} skill${data.length > 1 ? "s" : ""} added`
            : "Add your technical and soft skills"}
        </p>
      </div>

      {/* Add skill input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={handleKeyPress}
            className={inp}
            placeholder="Type a skill and press Enter"
          />
        </div>
        <button
          onClick={addSkill}
          disabled={!newSkill.trim()}
          className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
        >
          <Plus className="size-4" /> Add
        </button>
      </div>

      {/* Skill tags */}
      {data.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {data.map((skill, index) => (
            <span
              key={index}
              className="premium-pill"
            >
              <span>{skill}</span>
              <button
                onClick={() => removeSkill(index)}
                className="rounded-full p-0.5 transition-colors hover:bg-brand-200 dark:hover:bg-brand-500/30 cursor-pointer"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-line rounded-xl bg-surface/30">
          <Lightbulb className="size-10 text-muted/50 mb-3" />
          <p className="text-sm font-semibold text-ink">No skills added yet</p>
          <p className="text-xs text-muted mt-1.5">Type a skill above and press Enter or click Add.</p>
        </div>
      )}

      {/* AI Suggestions trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={suggestSkills}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-3.5 py-2.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm active:scale-95"
        >
          {loading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Sparkles className="size-3.5" />
          )}
          <span>{loading ? "Suggesting..." : "Suggest with AI"}</span>
        </button>
        {hasSuggestions && (
          <button
            onClick={() => setSuggestions(null)}
            className="text-xs text-muted hover:text-ink transition hover:underline font-semibold"
          >
            Clear suggestions
          </button>
        )}
      </div>

      {!profession && (
        <div className="rounded-xl bg-amber-50 px-3.5 py-3 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300 border border-amber-200/30 leading-normal">
          Set your profession in <strong>Personal Info</strong> to enable AI skill suggestions.
        </div>
      )}

      {/* AI Suggestions panel */}
      {hasSuggestions && (
        <div className="space-y-4 rounded-2xl border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-500/20 dark:bg-purple-500/5">
          <p className="flex items-center gap-2 text-xs font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
            <Sparkles className="size-3.5" />
            Suggested Skills for &ldquo;{profession}&rdquo;
          </p>

          {suggestions.technical?.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">Technical</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.technical.map((skill, i) => (
                  <button
                    key={i}
                    onClick={() => addSuggestedSkill(skill)}
                    disabled={data.includes(skill)}
                    className="rounded-full border border-purple-200 bg-surface px-2.5 py-1 text-xs text-purple-700 transition hover:bg-purple-100/55 disabled:opacity-40 dark:border-purple-600 dark:bg-purple-900/30 dark:text-purple-300"
                  >
                    {data.includes(skill) ? "✓ " : "+ "}
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          )}

          {suggestions.soft?.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">Soft Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.soft.map((skill, i) => (
                  <button
                    key={i}
                    onClick={() => addSuggestedSkill(skill)}
                    disabled={data.includes(skill)}
                    className="rounded-full border border-purple-200 bg-surface px-2.5 py-1 text-xs text-purple-700 transition hover:bg-purple-100/55 disabled:opacity-40 dark:border-purple-600 dark:bg-purple-900/30 dark:text-purple-300"
                  >
                    {data.includes(skill) ? "✓ " : "+ "}
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          )}

          {suggestions.tools?.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">Tools &amp; Technologies</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.tools.map((skill, i) => (
                  <button
                    key={i}
                    onClick={() => addSuggestedSkill(skill)}
                    disabled={data.includes(skill)}
                    className="rounded-full border border-purple-200 bg-surface px-2.5 py-1 text-xs text-purple-700 transition hover:bg-purple-100/55 disabled:opacity-40 dark:border-purple-600 dark:bg-purple-900/30 dark:text-purple-300"
                  >
                    {data.includes(skill) ? "✓ " : "+ "}
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl bg-brand-50 dark:bg-brand-500/10 p-3.5 text-xs text-muted border border-brand-200/30 dark:border-brand-500/10 leading-relaxed">
        <strong>Tip:</strong> Add 8–12 relevant skills including both technical and soft skills.
      </div>
    </div>
  );
};

export default SkillsForm;
