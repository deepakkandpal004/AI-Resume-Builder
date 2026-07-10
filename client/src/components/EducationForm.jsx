import { GraduationCap, Plus, Trash2, ChevronDown, ChevronUp, Sparkles, Loader2 } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import api from "../configs/api";

const inp = "premium-input";

const EducationForm = ({ data, onChange }) => {
  const { token } = useSelector((state) => state.auth);
  const [expanded, setExpanded] = useState({});
  const [generatingIndex, setGeneratingIndex] = useState(-1);

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

  const generateEducationWithAI = () => {
    const aiEdu = {
      institution: "Stanford University",
      degree: "Master of Science",
      field: "Computer Science",
      graduation_date: "2021-06",
      gpa: "3.9 / 4.0"
    };
    onChange([...data, aiEdu]);
    toast.success("Education entry generated with AI! Edit details below.");
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

  const enhanceEntry = async (index) => {
    setGeneratingIndex(index);
    const entry = data[index];
    try {
      const prompt = `enhance this education entry: ${entry.degree || ""} in ${entry.field || ""} from ${entry.institution || ""}`;
      await api.post(
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

  const toggleExpand = (index) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-ink">Education</h3>
          <p className="text-xs text-muted mt-1 leading-relaxed max-w-[280px] sm:max-w-none">
            Showcase your academic credentials, school degrees, and study fields.
          </p>
        </div>
        <button
          onClick={addEducation}
          className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink hover:bg-canvas transition-colors active:scale-95 cursor-pointer shrink-0"
        >
          <Plus size={14} />
          <span>Add Education</span>
        </button>
      </div>

      {/* Empty state */}
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-line rounded-2xl bg-surface/30 px-6">
          <GraduationCap className="size-10 text-muted/50 mb-3" />
          <p className="text-sm font-bold text-ink">No education details added yet</p>
          <p className="text-xs text-muted mt-1.5 max-w-[280px]">Add your degrees and institutions to verify your academic qualifications.</p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            <button
              onClick={generateEducationWithAI}
              className="text-xs font-bold text-purple-700 hover:text-purple-800 bg-purple-50 dark:bg-purple-950/20 px-3.5 py-2.5 rounded-xl transition active:scale-95 border border-purple-200/40 cursor-pointer"
            >
              ✨ Generate with AI
            </button>
            <button
              onClick={addEducation}
              className="text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-50 dark:bg-brand-950/20 px-3.5 py-2.5 rounded-xl transition active:scale-95 border border-brand-200/40 cursor-pointer"
            >
              Add Manually
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {data.map((education, index) => {
            const isOpen = expanded[index] !== false;
            const title = education.degree
              ? `${education.degree}${education.institution ? ` @ ${education.institution}` : ""}`
              : education.institution || `Entry #${index + 1}`;
            return (
              <div
                key={index}
                className="border border-line rounded-2xl bg-surface overflow-hidden hover:border-slate-300 dark:hover:border-zinc-700 transition-colors shadow-sm"
              >
                {/* Header bar */}
                <div
                  className="flex items-center justify-between px-4 py-3.5 cursor-pointer select-none hover:bg-canvas/50 transition-colors"
                  onClick={() => toggleExpand(index)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-500/10 shrink-0">
                      <GraduationCap className="size-4 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-ink truncate">{title}</p>
                      {education.graduation_date && (
                        <p className="text-[10px] text-muted mt-0.5 font-medium">{education.graduation_date}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); enhanceEntry(index); }}
                      disabled={generatingIndex === index}
                      className="p-1.5 rounded-lg text-muted hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
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
                  <div className="px-4 pb-4 space-y-4 border-t border-line pt-4 bg-canvas/10">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-muted mb-1.5">Institution</label>
                        <input
                          value={education.institution || ""}
                          onChange={(e) => updatedEducation(index, "institution", e.target.value)}
                          type="text"
                          placeholder="Indian Institute of Technology"
                          className={inp}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted mb-1.5">Degree</label>
                        <input
                          value={education.degree || ""}
                          onChange={(e) => updatedEducation(index, "degree", e.target.value)}
                          type="text"
                          placeholder="B.Tech in Computer Science"
                          className={inp}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted mb-1.5">Field of Study</label>
                        <input
                          value={education.field || ""}
                          onChange={(e) => updatedEducation(index, "field", e.target.value)}
                          type="text"
                          placeholder="Computer Science"
                          className={inp}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted mb-1.5">Graduation Date</label>
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
                      <label className="block text-xs font-semibold text-muted mb-1.5">GPA <span className="text-muted font-normal">(optional)</span></label>
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
