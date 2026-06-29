import { Languages, Plus, Trash2 } from "lucide-react";
import React from "react";

export const PROFICIENCY_LEVELS = [
  "Elementary",
  "Conversational",
  "Professional",
  "Fluent",
  "Native / Bilingual",
];

// Visual indicator dots for each level
const LEVEL_DOTS = {
  "Elementary":         1,
  "Conversational":     2,
  "Professional":       3,
  "Fluent":             4,
  "Native / Bilingual": 5,
};

const LanguageForm = ({ data, onChange }) => {
  const add = () => {
    onChange([...data, { name: "", proficiency: "Conversational" }]);
  };

  const remove = (index) => onChange(data.filter((_, i) => i !== index));

  const update = (index, field, value) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-ink">
            <Languages className="size-5" /> Languages
          </h3>
          <p className="text-sm text-muted">Add languages you speak and your proficiency level</p>
        </div>
        <button
          onClick={add}
          className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:hover:bg-brand-500/20"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-muted">
          <Languages className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-slate-600" />
          <p>No languages added yet.</p>
          <p className="text-sm">Listing languages can strengthen your resume.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((lang, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border border-line rounded-lg">
              {/* Language name */}
              <input
                type="text"
                value={lang.name || ""}
                onChange={(e) => update(index, "name", e.target.value)}
                placeholder="Language (e.g. Spanish)"
                className="flex-1 px-3 py-2 text-sm"
              />

              {/* Proficiency select */}
              <select
                value={lang.proficiency || "Conversational"}
                onChange={(e) => update(index, "proficiency", e.target.value)}
                className="px-3 py-2 text-sm border border-line rounded-lg bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {PROFICIENCY_LEVELS.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>

              {/* Proficiency dots — visual indicator */}
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
                onClick={() => remove(index)}
                className="text-rose-500 hover:text-rose-700 transition-colors shrink-0"
                aria-label="Remove language"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {data.length > 0 && (
        <div className="rounded-lg bg-brand-50 p-3 text-sm text-body dark:bg-brand-500/10">
          <p><strong>Tip:</strong> Even listing your native language is worth including — it confirms communication ability for international roles.</p>
        </div>
      )}
    </div>
  );
};

export default LanguageForm;
