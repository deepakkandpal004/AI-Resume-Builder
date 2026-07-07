import { Loader2, Plus, Sparkles, X, Lightbulb } from "lucide-react";
import React from "react";
import toast from "react-hot-toast";
import api from "../configs/api";

const inp = "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow";

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
        <h3 className="text-lg font-semibold text-ink">Skills</h3>
        <p className="text-sm text-muted mt-0.5">
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
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
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
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 dark:bg-brand-500/10 pl-3 pr-2 py-1 text-sm text-brand-700 dark:text-brand-300"
            >
              {skill}
              <button
                onClick={() => removeSkill(index)}
                className="rounded-full p-0.5 transition-colors hover:bg-brand-200 dark:hover:bg-brand-500/30"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-line rounded-xl">
          <Lightbulb className="size-10 text-muted mb-3" />
          <p className="text-sm text-muted">No skills added yet</p>
          <p className="text-xs text-muted mt-1">Type a skill above and press Enter or click Add</p>
        </div>
      )}

      {/* AI Suggestions trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={suggestSkills}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-3.5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {loading ? "Suggesting..." : "Suggest with AI"}
        </button>
        {hasSuggestions && (
          <button
            onClick={() => setSuggestions(null)}
            className="text-xs text-muted underline transition-colors hover:text-body"
          >
            Clear suggestions
          </button>
        )}
      </div>

      {!profession && (
        <div className="rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
          Set your profession in <strong>Personal Info</strong> to get AI skill suggestions.
        </div>
      )}

      {/* AI Suggestions panel */}
      {hasSuggestions && (
        <div className="space-y-3 rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-500/20 dark:bg-purple-500/5">
          <p className="flex items-center gap-2 text-sm font-semibold text-purple-800 dark:text-purple-300">
            <Sparkles className="size-4" />
            Suggested Skills for &ldquo;{profession}&rdquo;
          </p>

          {suggestions.technical?.length > 0 && (
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">Technical</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.technical.map((skill, i) => (
                  <button
                    key={i}
                    onClick={() => addSuggestedSkill(skill)}
                    disabled={data.includes(skill)}
                    className="rounded-full border border-purple-300 bg-white px-2.5 py-0.5 text-xs text-purple-700 transition-colors hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-purple-600 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-800/50"
                  >
                    {data.includes(skill) ? "✓ " : "+ "}
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          )}

          {suggestions.soft?.length > 0 && (
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">Soft Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.soft.map((skill, i) => (
                  <button
                    key={i}
                    onClick={() => addSuggestedSkill(skill)}
                    disabled={data.includes(skill)}
                    className="rounded-full border border-purple-300 bg-white px-2.5 py-0.5 text-xs text-purple-700 transition-colors hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-purple-600 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-800/50"
                  >
                    {data.includes(skill) ? "✓ " : "+ "}
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          )}

          {suggestions.tools?.length > 0 && (
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">Tools &amp; Technologies</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.tools.map((skill, i) => (
                  <button
                    key={i}
                    onClick={() => addSuggestedSkill(skill)}
                    disabled={data.includes(skill)}
                    className="rounded-full border border-purple-300 bg-white px-2.5 py-0.5 text-xs text-purple-700 transition-colors hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-purple-600 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-800/50"
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

      <div className="rounded-lg bg-brand-50 px-3 py-2.5 text-xs text-body dark:bg-brand-500/10">
        <strong>Tip:</strong> Add 8–12 relevant skills including both technical and soft skills.
      </div>
    </div>
  );
};

export default SkillsForm;
