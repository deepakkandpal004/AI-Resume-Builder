import { Code2, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

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

const ProjectForm = ({ data, onChange }) => {
  const [expanded, setExpanded] = useState({});

  const addProject = () => {
    const newProject = {
      name: "",
      type: "",
      description: "",
    };
    onChange([...data, newProject]);
  };

  const removeProject = (index) => {
    const updated = data.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updatedProject = (index, field, value) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
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
                  <div className="px-4 pb-4 space-y-3 border-t border-line pt-3">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-body mb-1">Project Name</label>
                        <input
                          value={project.name || ""}
                          onChange={(e) => updatedProject(index, "name", e.target.value)}
                          type="text"
                          placeholder="E-Commerce Platform"
                          className={inp}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-body mb-1">Type</label>
                        <input
                          value={project.type || ""}
                          onChange={(e) => updatedProject(index, "type", e.target.value)}
                          type="text"
                          placeholder="Full Stack / Mobile / ML"
                          className={inp}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-body mb-1">Description</label>
                      <AutoTextarea
                        value={project.description || ""}
                        onChange={(e) => updatedProject(index, "description", e.target.value)}
                        placeholder="Describe the project, your role, key features, and technologies used..."
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

export default ProjectForm;

