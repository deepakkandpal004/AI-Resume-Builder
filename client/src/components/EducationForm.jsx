import { GraduationCap, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import React, { useState } from "react";

const inp = "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow";

const EducationForm = ({ data, onChange }) => {
  const [expanded, setExpanded] = useState({});

  const addEducation = () => {
    const newEducation = {
      institution: "",
      degree: "",
      field: "",
      graduation_date: "",
      gpa: "",
    };
    onChange([...data, newEducation]);
  };

  const removeEducation = (index) => {
    const updated = data.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updatedEducation = (index, field, value) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const toggleExpand = (index) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-ink">Education</h3>
          <p className="text-sm text-muted mt-0.5">
            {data.length > 0
              ? `${data.length} entr${data.length > 1 ? "ies" : "y"} added`
              : "Add your education details"}
          </p>
        </div>
        <button
          onClick={addEducation}
          className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink hover:bg-canvas transition-colors"
        >
          <Plus size={16} />
          Add Education
        </button>
      </div>

      {/* Empty state */}
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-line rounded-xl">
          <GraduationCap className="size-10 text-muted mb-3" />
          <p className="text-sm text-muted">No education added yet</p>
          <button
            onClick={addEducation}
            className="mt-4 text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            + Add your first entry
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((education, index) => {
            const isOpen = expanded[index] !== false;
            const title = education.degree
              ? `${education.degree}${education.institution ? ` @ ${education.institution}` : ""}`
              : education.institution || `Entry #${index + 1}`;
            return (
              <div
                key={index}
                className="border border-line rounded-xl bg-surface overflow-hidden"
              >
                {/* Header bar */}
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-canvas transition-colors"
                  onClick={() => toggleExpand(index)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-500/10 shrink-0">
                      <GraduationCap className="size-4 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{title}</p>
                      {education.graduation_date && (
                        <p className="text-xs text-muted mt-0.5">{education.graduation_date}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeEducation(index); }}
                      className="p-1.5 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                    {isOpen ? <ChevronUp className="size-4 text-muted" /> : <ChevronDown className="size-4 text-muted" />}
                  </div>
                </div>

                {/* Collapsible body */}
                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 border-t border-line pt-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-body mb-1">Institution</label>
                        <input
                          value={education.institution || ""}
                          onChange={(e) => updatedEducation(index, "institution", e.target.value)}
                          type="text"
                          placeholder="Indian Institute of Technology"
                          className={inp}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-body mb-1">Degree</label>
                        <input
                          value={education.degree || ""}
                          onChange={(e) => updatedEducation(index, "degree", e.target.value)}
                          type="text"
                          placeholder="B.Tech in Computer Science"
                          className={inp}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-body mb-1">Field of Study</label>
                        <input
                          value={education.field || ""}
                          onChange={(e) => updatedEducation(index, "field", e.target.value)}
                          type="text"
                          placeholder="Computer Science"
                          className={inp}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-body mb-1">Graduation Date</label>
                        <input
                          value={education.graduation_date || ""}
                          onChange={(e) => updatedEducation(index, "graduation_date", e.target.value)}
                          type="month"
                          placeholder="Graduated"
                          className={inp}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-body mb-1">GPA <span className="text-muted font-normal">(optional)</span></label>
                      <input
                        value={education.gpa || ""}
                        onChange={(e) => updatedEducation(index, "gpa", e.target.value)}
                        type="text"
                        placeholder="8.5 / 10"
                        className={`${inp} max-w-[200px]`}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EducationForm;
