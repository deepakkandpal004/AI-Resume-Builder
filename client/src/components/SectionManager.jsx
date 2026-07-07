import { Plus, Trash2, ChevronDown, ChevronUp, FileText } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

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

const inp = "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow";

const AutoTextarea = ({ value, onChange, placeholder }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      rows={3}
      className="w-full resize-none rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow overflow-hidden"
      placeholder={placeholder}
    />
  );
};

const SectionManager = ({
  sectionHeadings,
  onSectionHeadingsChange,
  customSections,
  onCustomSectionsChange,
}) => {
  const [localHeadings, setLocalHeadings] = useState(() => {
    const init = {};
    for (const key of Object.keys(DEFAULT_SECTION_HEADINGS)) {
      init[key] = sectionHeadings[key] ?? DEFAULT_SECTION_HEADINGS[key];
    }
    return init;
  });

  const [expanded, setExpanded] = useState({});

  const handleHeadingChange = (key, value) => {
    setLocalHeadings((prev) => ({ ...prev, [key]: value }));
    onSectionHeadingsChange({ ...sectionHeadings, [key]: value });
  };

  const handleHeadingBlur = (key, value) => {
    if (value.trim() === "") {
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

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-ink">Section Manager</h3>
        <p className="text-sm text-muted mt-0.5">Rename built-in headings and add custom sections.</p>
      </div>

      {/* Built-in Sections */}
      <div className="space-y-3 pb-5 border-b border-line">
        <h4 className="text-sm font-semibold text-body">Built-in Sections</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
          {Object.keys(DEFAULT_SECTION_HEADINGS).map((key) => (
            <div key={key}>
              <label className="block text-xs font-medium text-muted mb-1 capitalize">{key}</label>
              <input
                type="text"
                value={localHeadings[key] ?? DEFAULT_SECTION_HEADINGS[key]}
                maxLength={100}
                onChange={(e) => handleHeadingChange(key, e.target.value)}
                onBlur={(e) => handleHeadingBlur(key, e.target.value)}
                className={inp}
                placeholder={DEFAULT_SECTION_HEADINGS[key]}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Custom Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-body">Custom Sections</h4>
            <p className="text-xs text-muted mt-0.5">{customSections.length}/10 used</p>
          </div>
          <button
            onClick={addSection}
            disabled={customSections.length >= 10}
            className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink hover:bg-canvas transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={16} />
            Add Section
          </button>
        </div>

        {customSections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-line rounded-xl">
            <FileText className="size-10 text-muted mb-3" />
            <p className="text-sm text-muted">No custom sections yet</p>
            <p className="text-xs text-muted mt-1">Add sections like Volunteering, Awards, or Publications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {customSections.map((section, index) => {
              const isOpen = expanded[section.id] !== false;
              return (
                <div
                  key={section.id}
                  className="border border-line rounded-xl bg-surface overflow-hidden"
                >
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-canvas transition-colors"
                    onClick={() => toggleExpand(section.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-500/10 shrink-0">
                        <FileText className="size-4 text-brand-600 dark:text-brand-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink truncate">
                          {section.heading || `Custom #${index + 1}`}
                        </p>
                        {section.content && (
                          <p className="text-xs text-muted mt-0.5 truncate">{section.content}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}
                        className="p-1.5 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                      {isOpen ? <ChevronUp className="size-4 text-muted" /> : <ChevronDown className="size-4 text-muted" />}
                    </div>
                  </div>

                  {isOpen && (
                    <div className="px-4 pb-4 space-y-3 border-t border-line pt-3">
                      <div>
                        <label className="block text-xs font-medium text-body mb-1">Section Heading</label>
                        <input
                          type="text"
                          value={section.heading}
                          maxLength={100}
                          onChange={(e) => updateSection(section.id, "heading", e.target.value)}
                          className={inp}
                          placeholder="e.g. Volunteering, Awards, Publications"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-body mb-1">Content</label>
                        <AutoTextarea
                          value={section.content}
                          onChange={(e) => updateSection(section.id, "content", e.target.value)}
                          placeholder="Describe this section..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {customSections.length >= 10 && (
          <div className="rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
            Maximum of 10 custom sections reached.
          </div>
        )}
      </div>

      <div className="rounded-lg bg-brand-50 px-3 py-2.5 text-xs text-body dark:bg-brand-500/10">
        <strong>Tip:</strong> Rename headings to match your industry (e.g. "Experience" → "Work History"). Add custom sections for Awards, Volunteering, or Publications.
      </div>
    </div>
  );
};

export default SectionManager;
