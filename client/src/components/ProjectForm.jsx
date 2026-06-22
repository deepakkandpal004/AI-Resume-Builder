import { Plus, Trash2 } from "lucide-react";
import React from "react";

const ProjectForm = ({ data, onChange }) => {
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
  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-ink">
            Projects
          </h3>
          <p className="text-sm text-muted">Add your projects</p>
        </div>
        <button
          onClick={addProject}
          className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:hover:bg-brand-500/20"
        >
          <Plus className="size-4" />
          Add Project
        </button>
      </div>

      <div className="space-y-4 mt-6">
        {data.map((project, index) => (
          <div
            key={index}
            className="p-4 border border-line rounded-lg space-y-3"
          >
            <div className="flex justify-between items-start">
              <h4 className="font-semibold">Project #{index + 1}</h4>
              <button
                className="text-sm text-red-500 hover:text-red-700 transition-colors"
                onClick={() => removeProject(index)}
              >
                <Trash2 className="size-4" />
              </button>
            </div>

            <div className="grid gap-3">
              <input
                value={project.name || ""}
                onChange={(e) => updatedProject(index, "name", e.target.value)}
                type="text"
                placeholder="Project Name"
                className="px-3 py-2 text-sm rounded-lg"
              />

              <input
                value={project.type || ""}
                onChange={(e) => updatedProject(index, "type", e.target.value)}
                type="text"
                className="px-3 py-2 text-sm rounded-lg"
                placeholder="Project Type"
              />

              <textarea
                rows={4}
                value={project.description || ""}
                onChange={(e) =>
                  updatedProject(index, "description", e.target.value)
                }
                placeholder="Describe the project..."
                className="w-full px-3 py-2 text-sm rounded-lg resize-none"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectForm;

