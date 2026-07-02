import { Plus, Settings2, Trash2 } from "lucide-react";
import React, { useState } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const DEFAULT_SECTION_HEADINGS = {
  summary: "Professional Summary",
  experience: "Professional Experience",
  education: "Education",
  projects: "Projects",
  skills: "Skills",
  certifications: "Certifications",
  languages: "Languages",
};

const SectionManager = ({
  sectionHeadings,
  onSectionHeadingsChange,
  customSections,
  onCustomSectionsChange,
}) => {
  // Local state to track the live input values for built-in headings
  // so we can show what the user is typing before they blur
  const [localHeadings, setLocalHeadings] = useState(() => {
    const init = {};
    for (const key of Object.keys(DEFAULT_SECTION_HEADINGS)) {
      init[key] = sectionHeadings[key] ?? DEFAULT_SECTION_HEADINGS[key];
    }
    return init;
  });

  const handleHeadingChange = (key, value) => {
    setLocalHeadings((prev) => ({ ...prev, [key]: value }));
    onSectionHeadingsChange({ ...sectionHeadings, [key]: value });
  };

  const handleHeadingBlur = (key, value) => {
    if (value.trim() === "") {
      // Revert to default: remove key from map and reset local display
      const updated = { ...sectionHeadings };
      delete updated[key];
      onSectionHeadingsChange(updated);
      setLocalHeadings((prev) => ({
        ...prev,
        [key]: DEFAULT_SECTION_HEADINGS[key],
      }));
    }
  };

  const addSection = () => {
    if (customSections.length >= 10) return;
    const newSection = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `cs_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      heading: "",
      content: "",
    };
    onCustomSectionsChange([...customSections, newSection]);
  };

  const removeSection = (id) => {
    onCustomSectionsChange(customSections.filter((s) => s.id !== id));
  };

  const updateSection = (id, field, value) => {
    onCustomSectionsChange(
      customSections.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="flex items-center gap-2 text-lg font-semibold text-ink">
          <Settings2 className="size-5" />
          Section Manager
        </h3>
        <p className="text-sm text-muted">
          Rename built-in section headings and add your own custom sections.
        </p>
      </div>

      {/* Built-in Section Headings */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-body uppercase tracking-wide">
          Built-in Sections
        </h4>
        {Object.keys(DEFAULT_SECTION_HEADINGS).map((key) => (
          <div key={key} className="space-y-1">
            <label className="text-xs font-medium text-muted capitalize">
              {key}
            </label>
            <input
              type="text"
              value={localHeadings[key] ?? DEFAULT_SECTION_HEADINGS[key]}
              maxLength={100}
              onChange={(e) => handleHeadingChange(key, e.target.value)}
              onBlur={(e) => handleHeadingBlur(key, e.target.value)}
              className="w-full px-3 py-2 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-surface text-ink"
              placeholder={DEFAULT_SECTION_HEADINGS[key]}
            />
          </div>
        ))}
      </div>

      {/* Divider */}
      <hr className="border-line" />

      {/* Custom Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-body uppercase tracking-wide">
              Custom Sections
            </h4>
            <p className="text-xs text-muted mt-0.5">
              {customSections.length}/10 sections used
            </p>
          </div>
          <button
            onClick={addSection}
            disabled={customSections.length >= 10}
            className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:hover:bg-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={16} />
            Add Section
          </button>
        </div>

        {customSections.length === 0 ? (
          <div className="text-center py-8 text-muted">
            <Settings2 className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-slate-600" />
            <p>No custom sections yet.</p>
            <p className="text-sm">
              Add sections like Volunteering, Awards, or Publications.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {customSections.map((section, index) => (
              <div
                key={section.id}
                className="p-4 border border-line rounded-lg space-y-3"
              >
                {/* Section header row */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-body">
                    Custom Section #{index + 1}
                  </span>
                  <button
                    onClick={() => removeSection(section.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    aria-label={`Remove custom section ${index + 1}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                {/* Heading input */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted">
                    Section Heading
                  </label>
                  <input
                    type="text"
                    value={section.heading}
                    maxLength={100}
                    onChange={(e) =>
                      updateSection(section.id, "heading", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-surface text-ink"
                    placeholder="e.g. Volunteering, Awards, Publications"
                  />
                </div>

                {/* Content textarea */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted">
                    Content
                  </label>
                  <textarea
                    value={section.content}
                    onChange={(e) =>
                      updateSection(section.id, "content", e.target.value)
                    }
                    rows={4}
                    className="w-full px-3 py-2 text-sm border border-line rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 bg-surface text-ink"
                    placeholder="Describe this section..."
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {customSections.length >= 10 && (
          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
            You've reached the maximum of 10 custom sections.
          </div>
        )}
      </div>

      {/* Tip */}
      <div className="rounded-lg bg-brand-50 p-3 text-sm text-body dark:bg-brand-500/10">
        <p>
          <strong>Tip:</strong> Rename built-in headings to match your industry
          (e.g., "Experience" → "Work History"). Add custom sections for
          Awards, Volunteering, or Publications.
        </p>
      </div>
    </div>
  );
};

export default SectionManager;
