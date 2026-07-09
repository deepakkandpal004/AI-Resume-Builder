import { Languages, Plus, Trash2, Globe, Sparkles, Loader2 } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import api from "../configs/api";

// eslint-disable-next-line react-refresh/only-export-components
export const PROFICIENCY_LEVELS = [
  "Elementary",
  "Conversational",
  "Professional",
  "Fluent",
  "Native / Bilingual",
];

const LEVEL_DOTS = {
  "Elementary":         1,
  "Conversational":     2,
  "Professional":       3,
  "Fluent":             4,
  "Native / Bilingual": 5,
};

const inp = "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow";

const LanguageForm = ({ data, onChange }) => {
  const { token } = useSelector((state) => state.auth);
  const [generatingIndex, setGeneratingIndex] = useState(-1);

  const add = () => {
    onChange([...data, { name: "", proficiency: "Conversational" }]);
  };

  const remove = (index) => onChange(data.filter((_, i) => i !== index));

  const update = (index, field, value) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const enhanceEntry = async (index) => {
    setGeneratingIndex(index);
    const lang = data[index];
    try {
      const prompt = `rewrite this language proficiency entry professionally: ${lang.name || ""} - ${lang.proficiency || ""}`;
      const { data: result } = await api.post(
        "/api/ai/enhance-pro-sum",
        { userContent: prompt },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Entry enhanced!");
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setGeneratingIndex(-1);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-ink">Languages</h3>
          <p className="text-sm text-muted mt-0.5">
            {data.length > 0
              ? `${data.length} language${data.length > 1 ? "s" : ""} added`
              : "Add languages you speak and your proficiency level"}
          </p>
        </div>
        <button
          onClick={add}
          className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink hover:bg-canvas transition-colors"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-line rounded-xl">
          <Globe className="size-10 text-muted mb-3" />
          <p className="text-sm text-muted">No languages added yet</p>
          <p className="text-xs text-muted mt-1">Listing languages can strengthen your resume</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.map((lang, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 border border-line rounded-xl bg-surface"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-500/10 shrink-0">
                <Languages className="size-4 text-brand-600 dark:text-brand-400" />
              </div>
              <input
                type="text"
                value={lang.name || ""}
                onChange={(e) => update(index, "name", e.target.value)}
                placeholder="e.g. Hindi, English"
                className="flex-1 min-w-0 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
              />

              <select
                value={lang.proficiency || "Conversational"}
                onChange={(e) => update(index, "proficiency", e.target.value)}
                className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
              >
                {PROFICIENCY_LEVELS.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>

              <div className="hidden sm:flex items-center gap-0.5 shrink-0">
                {[1, 2, 3, 4, 5].map((dot) => (
                  <span
                    key={dot}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      dot <= (LEVEL_DOTS[lang.proficiency] ?? 2)
                        ? "bg-brand-500"
                        : "bg-line"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => enhanceEntry(index)}
                disabled={generatingIndex === index}
                className="p-1.5 rounded-lg text-muted hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors shrink-0"
                title="Enhance with AI"
              >
                {generatingIndex === index ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="size-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-1.5 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors shrink-0"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {data.length > 0 && (
        <div className="rounded-lg bg-brand-50 px-3 py-2.5 text-xs text-body dark:bg-brand-500/10">
          <strong>Tip:</strong> Even listing your native language is worth including — it confirms communication ability for international roles.
        </div>
      )}
    </div>
  );
};

export default LanguageForm;
