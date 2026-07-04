import { Loader2, Plus, Sparkles, X } from "lucide-react";
import React from "react";
import toast from "react-hot-toast";
import api from "../configs/api";

const SkillsForm = ({ data, onChange, profession, token }) => {
  const [newSkill, setNewSkill] = React.useState("");
  const [suggestions, setSuggestions] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const addSkill = () => {
    if (newSkill.trim() && !data.includes(newSkill.trim())) {
      onChange([...data, newSkill.trim()]);
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
    <div className="space-y-4">
      <div>
        <h3 className="flex items-center gap-2 text-lg font-semibold text-ink">Skills</h3>
        <p className="text-sm text-muted">Add your technical and soft skills</p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1 px-3 py-2 text-sm"
          placeholder="Enter a skill and press Enter"
        />
        <button
          onClick={addSkill}
          disabled={!newSkill.trim()}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="size-4" /> Add Skill
        </button>
      </div>

      {data.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {data.map((skill, index) => (
            <span
              key={index}
              className="flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
            >
              {skill}
              <button
                onClick={() => removeSkill(index)}
                className="ml-1 rounded-full p-0.5 transition-colors hover:bg-brand-100 dark:hover:bg-brand-500/20"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-muted">
          <Sparkles className="mx-auto mb-2 h-10 w-10 text-gray-300" />
          <p>No skills added yet.</p>
          <p className="text-sm">Add your technical and soft skills</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={suggestSkills}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {loading ? "Suggesting..." : "Suggest with AI"}
        </button>
        {hasSuggestions && (
          <button
            onClick={() => setSuggestions(null)}
            className="text-sm text-muted underline transition-colors hover:text-body"
          >
            Clear suggestions
          </button>
        )}
      </div>

      {!profession && (
        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
          Set your profession in <strong>Personal Info</strong> to get AI skill suggestions.
        </div>
      )}

      {hasSuggestions && (
        <div className="space-y-3 rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-500/20 dark:bg-purple-500/5">
          <p className="flex items-center gap-2 text-sm font-semibold text-purple-800 dark:text-purple-300">
            <Sparkles className="h-4 w-4" />
            AI Suggested Skills for "{profession}"
          </p>

          {suggestions.technical?.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-purple-600 dark:text-purple-400">Technical</p>
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
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-purple-600 dark:text-purple-400">Soft Skills</p>
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
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-purple-600 dark:text-purple-400">Tools & Technologies</p>
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

      <div className="rounded-lg bg-brand-50 p-3 text-sm text-body dark:bg-brand-500/10">
        <p>
          <strong>Tip:</strong> Add 8-12 relevant skills. Include both technical skills
          (programming languages, tools) and soft skills (leadership, communication).
        </p>
      </div>
    </div>
  );
};

export default SkillsForm;
