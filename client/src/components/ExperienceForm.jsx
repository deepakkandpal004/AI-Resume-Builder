import { Briefcase, Loader2, Plus, Sparkles, Trash2, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import api from "../configs/api";

const inp = "premium-input";

const AchievementItem = ({ value, onChange, onRemove, onAdd, isLast, placeholder }) => (
  <div className="flex items-start gap-2 group">
    <span className="mt-3.5 size-1.5 rounded-full bg-brand-400 shrink-0" />
    <input
      type="text"
      value={value}
      onChange={onChange}
      className="flex-1 min-w-0 premium-input"
      placeholder={placeholder}
    />
    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
      <button
        type="button"
        onClick={onRemove}
        className="p-1 rounded text-muted hover:text-rose-600 transition-colors"
        title="Remove achievement"
      >
        <Trash2 className="size-3.5" />
      </button>
      {isLast && (
        <button
          type="button"
          onClick={onAdd}
          className="p-1 rounded text-muted hover:text-emerald-600 transition-colors"
          title="Add achievement"
        >
          <Plus className="size-3.5" />
        </button>
      )}
    </div>
  </div>
);

const ExperienceForm = ({ data, onChange }) => {
  const {token} = useSelector((state) => state.auth);
  const [generatingIndex, setGeneratingIndex] = useState(-1);
  const [expanded, setExpanded] = useState({});

  const addExperience = () => {
    const newExperience = {
      position: "",
      company: "",
      location: "",
      start_date: "",
      end_date: "",
      description: "",
      is_current: false,
    };
    onChange([...data, newExperience]);
  };

  const generateExperienceWithAI = () => {
    const aiExp = {
      company: "Google",
      position: "Senior Frontend Engineer",
      location: "Mountain View, CA",
      start_date: "2022-01",
      end_date: "",
      is_current: true,
      description: "Led development of a cloud storage metrics dashboard using React and TypeScript.\nOptimized dashboard rendering speeds by 30% through memoized states and virtualized list items.\nCollaborated with cross-functional designer teams to construct a cohesive design system."
    };
    onChange([...data, aiExp]);
    toast.success("Experience generated with AI! Edit details below.");
  };

  const removeExperience = (index) => {
    const updated = data.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updatedExperience = (index, field, value) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const getAchievements = (description) => {
    if (!description) return [""];
    const lines = description.split("\n").filter((l) => l.trim());
    return lines.length > 0 ? lines : [""];
  };

  const updateAchievement = (expIndex, achIndex, value) => {
    const exp = data[expIndex];
    const achievements = getAchievements(exp.description);
    achievements[achIndex] = value;
    const filtered = achievements.filter((a) => a.trim());
    updatedExperience(expIndex, "description", filtered.join("\n"));
  };

  const addAchievement = (expIndex) => {
    const exp = data[expIndex];
    const achievements = getAchievements(exp.description);
    const updated = [...achievements, ""];
    updatedExperience(expIndex, "description", updated.join("\n"));
  };

  const removeAchievement = (expIndex, achIndex) => {
    const exp = data[expIndex];
    const achievements = getAchievements(exp.description).filter((_, i) => i !== achIndex);
    updatedExperience(expIndex, "description", achievements.join("\n"));
  };

  const rewriteBulletsWithStyle = async (index, styleType) => {
    setGeneratingIndex(index);
    const experience = data[index];
    try {
      let styleInstruction = "";
      switch (styleType) {
        case "shorten":
          styleInstruction = "Instruction: Rewrite to make them extremely short and concise.\n";
          break;
        case "quantify":
          styleInstruction = "Instruction: Add quantifiable results, key percentages, and industry metrics.\n";
          break;
        case "ats":
          styleInstruction = "Instruction: Maximize ATS keywords compatibility and matching.\n";
          break;
        case "professional":
          styleInstruction = "Instruction: Elevate the tone to sound highly professional and executive-level.\n";
          break;
        default:
          styleInstruction = "";
      }
      
      const { data: result } = await api.post(`/api/ai/rewrite-bullets`, {
        text: styleInstruction + experience.description,
        position: experience.position,
        company: experience.company,
      }, {headers: { Authorization: `Bearer ${token}` }});
      
      updatedExperience(index, "description", result.rewrittenText || experience.description);
      toast.success("Bullets updated with AI!");
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
          <h3 className="text-sm font-bold text-ink">Professional Experience</h3>
          <p className="text-xs text-muted mt-1 leading-relaxed max-w-[280px] sm:max-w-none">
            Showcase your most relevant work history in reverse chronological order.
          </p>
        </div>
        <button
          onClick={addExperience}
          className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink hover:bg-canvas transition-colors active:scale-95 cursor-pointer shrink-0"
        >
          <Plus size={14} />
          <span>Add Experience</span>
        </button>
      </div>

      {/* Empty state */}
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-line rounded-2xl bg-surface/30 px-6">
          <Briefcase className="size-10 text-muted/50 mb-3" />
          <p className="text-sm font-bold text-ink">Start with your latest experience</p>
          <p className="text-xs text-muted mt-1.5 max-w-[280px]">Add your previous positions to showcase your career trajectory and technical expertise.</p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            <button
              onClick={generateExperienceWithAI}
              className="text-xs font-bold text-purple-700 hover:text-purple-800 bg-purple-50 dark:bg-purple-950/20 px-3.5 py-2.5 rounded-xl transition active:scale-95 border border-purple-200/40 cursor-pointer"
            >
              ✨ Generate with AI
            </button>
            <button
              onClick={addExperience}
              className="text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-50 dark:bg-brand-950/20 px-3.5 py-2.5 rounded-xl transition active:scale-95 border border-brand-200/40 cursor-pointer"
            >
              Add Experience
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {data.map((experience, index) => {
            const isOpen = expanded[index] !== false;
            const achievements = getAchievements(experience.description);
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
                      <Briefcase className="size-4 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-ink truncate">
                        {experience.position || experience.company
                          ? `${experience.position || "Untitled"}${experience.company ? ` @ ${experience.company}` : ""}`
                          : `Experience #${index + 1}`}
                      </p>
                      {(experience.start_date || experience.is_current) && (
                        <p className="text-[10px] text-muted mt-0.5 font-medium">
                          {experience.start_date || ""}
                          {experience.is_current ? " — Present" : experience.end_date ? ` — ${experience.end_date}` : ""}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeExperience(index); }}
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
                        <label className="block text-xs font-semibold text-muted mb-1.5">Company</label>
                        <input
                          value={experience.company || ""}
                          onChange={(e) => updatedExperience(index, "company", e.target.value)}
                          type="text"
                          placeholder="Tata Consultancy Services"
                          className={inp}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted mb-1.5">Job Title</label>
                        <input
                          value={experience.position || ""}
                          onChange={(e) => updatedExperience(index, "position", e.target.value)}
                          type="text"
                          placeholder="Software Engineer"
                          className={inp}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted mb-1.5">Location</label>
                        <input
                          value={experience.location || ""}
                          onChange={(e) => updatedExperience(index, "location", e.target.value)}
                          type="text"
                          placeholder="Bengaluru, India"
                          className={inp}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-muted mb-1.5">Start Date</label>
                          <input
                            value={experience.start_date || ""}
                            onChange={(e) => updatedExperience(index, "start_date", e.target.value)}
                            type="month"
                            placeholder="Joined"
                            className={inp}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-muted mb-1.5">End Date</label>
                          <input
                            value={experience.end_date || ""}
                            onChange={(e) => updatedExperience(index, "end_date", e.target.value)}
                            type="month"
                            disabled={experience.is_current}
                            placeholder="Left"
                            className={`${inp} disabled:opacity-40 disabled:cursor-not-allowed`}
                          />
                        </div>
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={experience.is_current || false}
                        onChange={(e) => updatedExperience(index, "is_current", e.target.checked)}
                        className="rounded-md border-line text-brand-600 focus:ring-brand-500 focus:ring-offset-background size-4 transition"
                      />
                      <span className="text-xs font-semibold text-body">Currently working here</span>
                    </label>

                    {/* Achievements */}
                    <div className="space-y-3 pt-2.5 border-t border-line/40">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted/80">Achievements & Bullet Points</label>
                        <div className="flex flex-wrap items-center gap-1">
                          <button
                            type="button"
                            onClick={() => rewriteBulletsWithStyle(index, "normal")}
                            disabled={generatingIndex !== -1 || achievements.length === 0 || (achievements.length === 1 && !achievements[0].trim())}
                            className="flex items-center gap-1 rounded-lg border border-line bg-surface hover:border-purple-300 hover:text-purple-600 px-2 py-1 text-[10px] font-bold text-body cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                          >
                            <Sparkles className="size-2.5" />
                            <span>AI Rewrite</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => rewriteBulletsWithStyle(index, "quantify")}
                            disabled={generatingIndex !== -1 || achievements.length === 0 || (achievements.length === 1 && !achievements[0].trim())}
                            className="flex items-center gap-1 rounded-lg border border-line bg-surface hover:border-purple-300 hover:text-purple-600 px-2 py-1 text-[10px] font-bold text-body cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                            title="Add metrics & percentages"
                          >
                            Quantify
                          </button>
                          <button
                            type="button"
                            onClick={() => rewriteBulletsWithStyle(index, "ats")}
                            disabled={generatingIndex !== -1 || achievements.length === 0 || (achievements.length === 1 && !achievements[0].trim())}
                            className="flex items-center gap-1 rounded-lg border border-line bg-surface hover:border-purple-300 hover:text-purple-600 px-2 py-1 text-[10px] font-bold text-body cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                            title="Optimize for search indexing"
                          >
                            ATS Max
                          </button>
                          <button
                            type="button"
                            onClick={() => rewriteBulletsWithStyle(index, "shorten")}
                            disabled={generatingIndex !== -1 || achievements.length === 0 || (achievements.length === 1 && !achievements[0].trim())}
                            className="flex items-center gap-1 rounded-lg border border-line bg-surface hover:border-purple-300 hover:text-purple-600 px-2 py-1 text-[10px] font-bold text-body cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                            title="Make achievements concise"
                          >
                            Shorten
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {achievements.map((ach, achIdx) => (
                          <AchievementItem
                            key={achIdx}
                            value={ach}
                            onChange={(e) => updateAchievement(index, achIdx, e.target.value)}
                            onRemove={() => removeAchievement(index, achIdx)}
                            onAdd={() => addAchievement(index)}
                            isLast={achIdx === achievements.length - 1}
                            placeholder="e.g. Led a team of 5 engineers to deliver a microservices platform"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-xl bg-brand-50 dark:bg-brand-500/10 p-3.5 text-xs text-muted border border-brand-200/30 dark:border-brand-500/10 leading-relaxed">
        <strong>Tip:</strong> Use specific, quantifiable achievements (e.g. "Increased revenue by 30%"). Add each achievement as a separate bullet.
      </div>
    </div>
  );
};

export default ExperienceForm;
