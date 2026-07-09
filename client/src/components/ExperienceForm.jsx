import { Briefcase, Loader2, Plus, Sparkles, Trash2, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import api from "../configs/api";

const inp = "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow";

const AchievementItem = ({ value, onChange, onRemove, onAdd, isLast, placeholder }) => (
  <div className="flex items-start gap-2 group">
    <span className="mt-2.5 size-1.5 rounded-full bg-brand-400 shrink-0" />
    <input
      type="text"
      value={value}
      onChange={onChange}
      className="flex-1 min-w-0 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
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

  const rewriteBullets = async (index) => {
    setGeneratingIndex(index);
    const experience = data[index];
    try {
      const { data: result } = await api.post(`/api/ai/rewrite-bullets`, {
        text: experience.description,
        position: experience.position,
        company: experience.company,
      }, {headers: { Authorization: `Bearer ${token}` }});
      updatedExperience(index, "description", result.rewrittenText || experience.description);
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
          <h3 className="text-lg font-semibold text-ink">Professional Experience</h3>
          <p className="text-sm text-muted mt-0.5">
            {data.length > 0
              ? `${data.length} position${data.length > 1 ? "s" : ""} added`
              : "Add your work experience"}
          </p>
        </div>
        <button
          onClick={addExperience}
          className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink hover:bg-canvas transition-colors"
        >
          <Plus size={16} />
          Add Experience
        </button>
      </div>

      {/* Empty state */}
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-line rounded-xl">
          <Briefcase className="size-10 text-muted mb-3" />
          <p className="text-sm text-muted">No experience added yet</p>
          <button
            onClick={addExperience}
            className="mt-4 text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            + Add your first position
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((experience, index) => {
            const isOpen = expanded[index] !== false;
            const achievements = getAchievements(experience.description);
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
                      <Briefcase className="size-4 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">
                        {experience.position || experience.company
                          ? `${experience.position || "Untitled"}${experience.company ? ` @ ${experience.company}` : ""}`
                          : `Experience #${index + 1}`}
                      </p>
                      {(experience.start_date || experience.is_current) && (
                        <p className="text-xs text-muted mt-0.5">
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
                  <div className="px-4 pb-4 space-y-3 border-t border-line pt-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-body mb-1">Company</label>
                        <input
                          value={experience.company || ""}
                          onChange={(e) => updatedExperience(index, "company", e.target.value)}
                          type="text"
                          placeholder="Tata Consultancy Services"
                          className={inp}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-body mb-1">Job Title</label>
                        <input
                          value={experience.position || ""}
                          onChange={(e) => updatedExperience(index, "position", e.target.value)}
                          type="text"
                          placeholder="Software Engineer"
                          className={inp}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-body mb-1">Location</label>
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
                          <label className="block text-xs font-medium text-body mb-1">Start Date</label>
                          <input
                            value={experience.start_date || ""}
                            onChange={(e) => updatedExperience(index, "start_date", e.target.value)}
                            type="month"
                            placeholder="Joined"
                            className={inp}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-body mb-1">End Date</label>
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
                        className="rounded border-line text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-sm text-body">Currently working here</span>
                    </label>

                    {/* Achievements */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-body">Achievements</label>
                        <button
                          onClick={() => rewriteBullets(index)}
                          disabled={generatingIndex === index || achievements.length === 0 || (achievements.length === 1 && !achievements[0].trim())}
                          className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-brand-600 to-accent-600 px-2.5 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                          {generatingIndex === index ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <Sparkles className="size-3" />
                          )}
                          AI Rewrite
                        </button>
                      </div>
                      <div className="space-y-1.5">
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

      <div className="rounded-lg bg-brand-50 px-3 py-2.5 text-xs text-body dark:bg-brand-500/10">
        <strong>Tip:</strong> Use specific, quantifiable achievements (e.g. "Increased revenue by 30%"). Add each achievement as a separate bullet.
      </div>
    </div>
  );
};

export default ExperienceForm;
