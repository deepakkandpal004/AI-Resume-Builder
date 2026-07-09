import { Code2, Plus, Trash2, ChevronDown, ChevronUp, Github, Globe, Sparkles, Loader2 } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import api from "../configs/api";

const inp = "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow";

const TechTag = ({ value, onChange, onRemove }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 dark:bg-brand-500/10 pl-2.5 pr-1 py-0.5 text-xs text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
    {value}
    <button onClick={onRemove} className="rounded-full p-0.5 hover:bg-brand-200 dark:hover:bg-brand-500/30 transition-colors">
      <Trash2 className="size-2.5" />
    </button>
  </span>
);

const ProjectForm = ({ data, onChange }) => {
  const { token } = useSelector((state) => state.auth);
  const [expanded, setExpanded] = useState({});
  const [techInputs, setTechInputs] = useState({});
  const [generatingIndex, setGeneratingIndex] = useState(-1);

  const addProject = () => {
    const newProject = {
      name: "",
      type: "",
      description: "",
      techStack: [],
      githubUrl: "",
      liveUrl: "",
    };
    onChange([...data, newProject]);
  };

  const removeProject = (index) => {
    const updated = data.filter((_, i) => i !== index);
    const newTechInputs = { ...techInputs };
    delete newTechInputs[index];
    setTechInputs(newTechInputs);
    onChange(updated);
  };

  const updatedProject = (index, field, value) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const addTech = (index) => {
    const val = (techInputs[index] || "").trim();
    if (!val) return;
    const project = data[index];
    const current = project.techStack || [];
    if (!current.includes(val)) {
      updatedProject(index, "techStack", [...current, val]);
    }
    setTechInputs((prev) => ({ ...prev, [index]: "" }));
  };

  const removeTech = (projIndex, techIndex) => {
    const project = data[projIndex];
    const updated = (project.techStack || []).filter((_, i) => i !== techIndex);
    updatedProject(projIndex, "techStack", updated);
  };

  const handleTechKey = (index, e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTech(index);
    }
  };

  const enhanceDescription = async (index) => {
    setGeneratingIndex(index);
    const project = data[index];
    try {
      const { data: result } = await api.post(
        "/api/ai/enhance-job-desc",
        { userContent: `project: ${project.name || ""}, description: "${project.description || ""}"` },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updatedProject(index, "description", result.enhancedContent || project.description);
      toast.success("Description enhanced!");
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-ink">Projects</h3>
          <p className="text-sm text-muted mt-0.5">
            {data.length > 0
              ? `${data.length} project${data.length > 1 ? "s" : ""} added`
              : "Add your projects"}
          </p>
        </div>
        <button
          onClick={addProject}
          className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink hover:bg-canvas transition-colors"
        >
          <Plus size={16} />
          Add Project
        </button>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-line rounded-xl">
          <Code2 className="size-10 text-muted mb-3" />
          <p className="text-sm text-muted">No projects added yet</p>
          <button
            onClick={addProject}
            className="mt-4 text-sm text-brand-600 hover:text-brand-700 font-medium"
          >
            + Add your first project
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((project, index) => {
            const isOpen = expanded[index] !== false;
            return (
              <div
                key={index}
                className="border border-line rounded-xl bg-surface overflow-hidden"
              >
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-canvas transition-colors"
                  onClick={() => toggleExpand(index)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-500/10 shrink-0">
                      <Code2 className="size-4 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">
                        {project.name || `Project #${index + 1}`}
                      </p>
                      {project.type && (
                        <p className="text-xs text-muted mt-0.5">{project.type}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeProject(index); }}
                      className="p-1.5 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                    {isOpen ? <ChevronUp className="size-4 text-muted" /> : <ChevronDown className="size-4 text-muted" />}
                  </div>
                </div>

                {isOpen && (
                  <div className="px-5 pb-5 space-y-5 border-t border-line pt-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-body mb-1.5">Project Name</label>
                        <input
                          value={project.name || ""}
                          onChange={(e) => updatedProject(index, "name", e.target.value)}
                          type="text"
                          placeholder="E-Commerce Platform"
                          className={inp}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-body mb-1.5">Type</label>
                        <input
                          value={project.type || ""}
                          onChange={(e) => updatedProject(index, "type", e.target.value)}
                          type="text"
                          placeholder="Full Stack / Mobile / ML"
                          className={inp}
                        />
                      </div>
                    </div>

                    {/* Description with AI enhance */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-medium text-body">Description</label>
                        <button
                          onClick={() => enhanceDescription(index)}
                          disabled={generatingIndex === index || !project.description?.trim()}
                          className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-brand-600 to-accent-600 px-2 py-0.5 text-[10px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        >
                          {generatingIndex === index ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <Sparkles className="size-3" />
                          )}
                          AI Enhance
                        </button>
                      </div>
                      <textarea
                        value={project.description || ""}
                        onChange={(e) => updatedProject(index, "description", e.target.value)}
                        rows={5}
                        className="w-full resize-y min-h-[100px] max-h-[300px] overflow-y-auto rounded-lg border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
                        placeholder="Describe the project, your role, key features, and technologies used..."
                      />
                    </div>

                    {/* Tech Stack */}
                    <div>
                      <label className="block text-xs font-medium text-body mb-1.5">Tech Stack</label>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={techInputs[index] || ""}
                          onChange={(e) => setTechInputs((prev) => ({ ...prev, [index]: e.target.value }))}
                          onKeyDown={(e) => handleTechKey(index, e)}
                          className={inp}
                          placeholder="Type a technology and press Enter"
                        />
                        <button
                          onClick={() => addTech(index)}
                          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-700"
                        >
                          <Plus className="size-3.5" /> Add
                        </button>
                      </div>
                      {(project.techStack?.length > 0) && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {project.techStack.map((tech, ti) => (
                            <TechTag key={ti} value={tech} onRemove={() => removeTech(index, ti)} />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Links */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-body mb-1.5">
                          <Github className="size-3.5" /> GitHub URL <span className="text-muted font-normal">(optional)</span>
                        </label>
                        <input
                          value={project.githubUrl || ""}
                          onChange={(e) => updatedProject(index, "githubUrl", e.target.value)}
                          type="url"
                          placeholder="https://github.com/username/repo"
                          className={inp}
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-medium text-body mb-1.5">
                          <Globe className="size-3.5" /> Live Demo URL <span className="text-muted font-normal">(optional)</span>
                        </label>
                        <input
                          value={project.liveUrl || ""}
                          onChange={(e) => updatedProject(index, "liveUrl", e.target.value)}
                          type="url"
                          placeholder="https://myapp.vercel.app"
                          className={inp}
                        />
                      </div>
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

export default ProjectForm;

