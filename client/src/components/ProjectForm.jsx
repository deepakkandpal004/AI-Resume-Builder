import { Code2, Plus, Trash2, ChevronDown, ChevronUp, Github, Globe, Sparkles, Loader2, X } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import api from "../configs/api";

const inp = "premium-input";

const TechTag = ({ value, onRemove }) => (
  <span className="premium-pill">
    <span>{value}</span>
    <button onClick={onRemove} className="rounded-full p-0.5 hover:bg-brand-200 dark:hover:bg-brand-500/30 transition-colors cursor-pointer">
      <X className="size-3" />
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

  const generateProjectWithAI = () => {
    const aiProj = {
      name: "AI Generated E-Commerce Platform",
      type: "Full Stack Development",
      description: "Designed and built a high-performance e-commerce platform using React, Node.js, and MongoDB, resulting in a 40% increase in checkout conversions.",
      techStack: ["React", "Node.js", "MongoDB", "Express", "Tailwind CSS"],
      githubUrl: "https://github.com/example/ecommerce",
      liveUrl: "https://example-ecommerce.vercel.app"
    };
    onChange([...data, aiProj]);
    toast.success("Project generated with AI! Customize it below.");
  };

  const handleImportGitHub = () => {
    toast.success("GitHub repository metadata imported! (Mock demo)");
    const ghProj = {
      name: "GitHub Open Source Contribution",
      type: "Open Source Repository",
      description: "Contributed to and maintained a developer tool repository, writing automated Jest test suites and optimizing Webpack bundling times.",
      techStack: ["JavaScript", "Jest", "Webpack", "GitHub Actions"],
      githubUrl: "https://github.com/developer/contrib-tool",
      liveUrl: ""
    };
    onChange([...data, ghProj]);
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

  const enhanceDescriptionWithStyle = async (index, styleType) => {
    setGeneratingIndex(index);
    const project = data[index];
    try {
      let prefix = "";
      switch (styleType) {
        case "grammar":
          prefix = "Fix grammar, spelling, and professional phrasing for this project details: ";
          break;
        case "quantify":
          prefix = "Quantify achievements, add key metrics, engineering stats, and data points: ";
          break;
        case "ats":
          prefix = "Optimize for ATS search compatibility, industry-standard skill matches, and technical keywords: ";
          break;
        case "professional":
          prefix = "Enhance the details to sound highly professional, executive-level, and polished: ";
          break;
        default:
          prefix = "Enhance the description: ";
      }
      
      const { data: result } = await api.post(
        "/api/ai/enhance-job-desc",
        { userContent: `${prefix} project: ${project.name || ""}, description: "${project.description || ""}"` },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updatedProject(index, "description", result.enhancedContent || project.description);
      toast.success("Description updated with AI!");
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
          <h3 className="text-sm font-bold text-ink">Projects</h3>
          <p className="text-xs text-muted mt-0.5">
            {data.length > 0
              ? `${data.length} project${data.length > 1 ? "s" : ""} added`
              : "Add your personal or professional projects"}
          </p>
        </div>
        <button
          onClick={addProject}
          className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-ink hover:bg-canvas transition-colors active:scale-95"
        >
          <Plus size={14} />
          <span>Add Project</span>
        </button>
      </div>

      {/* Empty State */}
      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-line rounded-2xl bg-surface/30 px-6">
          <Code2 className="size-10 text-muted/50 mb-3" />
          <p className="text-sm font-bold text-ink">No projects added yet</p>
          <p className="text-xs text-muted mt-1.5 max-w-[280px]">Showcase your repositories, applications, or designs to impress recruiters.</p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            <button
              onClick={generateProjectWithAI}
              className="text-xs font-bold text-purple-700 hover:text-purple-800 bg-purple-50 dark:bg-purple-950/20 px-3.5 py-2.5 rounded-xl transition active:scale-95 border border-purple-200/40 cursor-pointer"
            >
              ✨ Generate with AI
            </button>
            <button
              onClick={handleImportGitHub}
              className="text-xs font-bold text-ink hover:bg-canvas bg-surface border border-line px-3.5 py-2.5 rounded-xl transition active:scale-95 cursor-pointer"
            >
              Import from GitHub
            </button>
            <button
              onClick={addProject}
              className="text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-50 dark:bg-brand-950/20 px-3.5 py-2.5 rounded-xl transition active:scale-95 border border-brand-200/40 cursor-pointer"
            >
              Add Manually
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {data.map((project, index) => {
            const isOpen = expanded[index] !== false;
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
                      <Code2 className="size-4 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-ink truncate">
                        {project.name || `Project #${index + 1}`}
                      </p>
                      {project.type && (
                        <p className="text-[10px] text-muted mt-0.5 font-medium">{project.type}</p>
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

                {/* Collapsible body */}
                {isOpen && (
                  <div className="px-4 pb-4 space-y-4 border-t border-line pt-4 bg-canvas/10">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-muted mb-1.5">Project Name</label>
                        <input
                          value={project.name || ""}
                          onChange={(e) => updatedProject(index, "name", e.target.value)}
                          type="text"
                          placeholder="E-Commerce Platform"
                          className={inp}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted mb-1.5">Type</label>
                        <input
                          value={project.type || ""}
                          onChange={(e) => updatedProject(index, "type", e.target.value)}
                          type="text"
                          placeholder="Full Stack / Mobile / ML"
                          className={inp}
                        />
                      </div>
                    </div>

                    {/* Description with AI Enhance */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-muted mb-1">Description</label>
                        <button
                          type="button"
                          onClick={() => enhanceDescriptionWithStyle(index, "normal")}
                          disabled={generatingIndex !== -1 || !project.description?.trim()}
                          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50 active:scale-95 disabled:cursor-not-allowed shadow-sm"
                        >
                          {generatingIndex === index ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="size-3.5" />
                          )}
                          <span>AI Enhance</span>
                        </button>
                      </div>
                      <textarea
                        value={project.description || ""}
                        onChange={(e) => updatedProject(index, "description", e.target.value)}
                        rows={4}
                        className="premium-input w-full resize-y min-h-[80px] max-h-[250px] overflow-y-auto leading-relaxed"
                        placeholder="Describe the project, your role, key features, and technologies used..."
                      />

                      {/* Universal inline AI pills */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted mr-1">AI Assistant:</span>
                        <button
                          type="button"
                          onClick={() => enhanceDescriptionWithStyle(index, "grammar")}
                          disabled={generatingIndex !== -1 || !project.description?.trim()}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg border border-line bg-surface hover:border-purple-300 hover:text-purple-600 transition disabled:opacity-40 cursor-pointer text-body shadow-xs"
                        >
                          Fix Grammar
                        </button>
                        <button
                          type="button"
                          onClick={() => enhanceDescriptionWithStyle(index, "professional")}
                          disabled={generatingIndex !== -1 || !project.description?.trim()}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg border border-line bg-surface hover:border-purple-300 hover:text-purple-600 transition disabled:opacity-40 cursor-pointer text-body shadow-xs"
                        >
                          Professional Tone
                        </button>
                        <button
                          type="button"
                          onClick={() => enhanceDescriptionWithStyle(index, "quantify")}
                          disabled={generatingIndex !== -1 || !project.description?.trim()}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg border border-line bg-surface hover:border-purple-300 hover:text-purple-600 transition disabled:opacity-40 cursor-pointer text-body shadow-xs"
                          title="Quantify accomplishments"
                        >
                          Quantify
                        </button>
                        <button
                          type="button"
                          onClick={() => enhanceDescriptionWithStyle(index, "ats")}
                          disabled={generatingIndex !== -1 || !project.description?.trim()}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg border border-line bg-surface hover:border-purple-300 hover:text-purple-600 transition disabled:opacity-40 cursor-pointer text-body shadow-xs"
                          title="ATS optimized keywords"
                        >
                          ATS Keywords
                        </button>
                      </div>
                    </div>

                    {/* Tech Stack */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-muted mb-1.5">Tech Stack</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={techInputs[index] || ""}
                          onChange={(e) => setTechInputs((prev) => ({ ...prev, [index]: e.target.value }))}
                          onKeyDown={(e) => handleTechKey(index, e)}
                          className="premium-input flex-1"
                          placeholder="Type a technology and press Enter"
                        />
                        <button
                          onClick={() => addTech(index)}
                          className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-700 active:scale-95"
                        >
                          <Plus className="size-4" /> Add
                        </button>
                      </div>
                      {(project.techStack?.length > 0) && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {project.techStack.map((tech, ti) => (
                            <TechTag key={ti} value={tech} onRemove={() => removeTech(index, ti)} />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Links */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-muted mb-1.5">
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
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-muted mb-1.5">
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

