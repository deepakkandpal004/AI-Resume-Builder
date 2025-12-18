import { Briefcase, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import api from "../configs/api";

const ExperienceForm = ({ data, onChange }) => {
  const {token} = useSelector((state) => state.auth);
  const [generatingIndex, setGeneratingIndex] = useState(-1);
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

  const generateDescription = async (index) => {
    setGeneratingIndex(index);
    const experience = data[index];
    const prompt = `enhance this job description ${experience.description} for the position ${experience.position} at ${experience.company}`
    try {
      const { data: result } = await api.post(`/api/ai/enhance-job-desc`, {userContent: prompt}, {headers: { Authorization: `Bearer ${token}` },});
      updatedExperience(index, "description", result.enhancedContent || experience.description);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setGeneratingIndex(-1);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            Professional Experience
          </h3>
          <p className="text-sm text-gray-500">
            Add your work experience details here
          </p>
        </div>
        <button
          onClick={addExperience}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
        >
          <Plus size={16} />
          Add Experience
        </button>
      </div>

      {/* No Experience Case */}
      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No work experience added yet.</p>
          <p className="text-sm">Click "Add Experience" to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((experience, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg space-y-3"
            >
              {/* Header Row */}
              <div className="flex justify-between items-start">
                <h4 className="font-semibold">Experience #{index + 1}</h4>
                <button
                  className="text-sm text-red-500 hover:text-red-700 transition-colors"
                  onClick={() => removeExperience(index)}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              {/* Inputs */}
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  value={experience.company || ""}
                  onChange={(e) =>
                    updatedExperience(index, "company", e.target.value)
                  }
                  type="text"
                  placeholder="Company Name"
                  className="px-3 py-2 text-sm border rounded-lg"
                />

                <input
                  value={experience.position || ""}
                  onChange={(e) =>
                    updatedExperience(index, "position", e.target.value)
                  }
                  type="text"
                  placeholder="Job Title"
                  className="px-3 py-2 text-sm border rounded-lg"
                />

                <input
                  value={experience.start_date || ""}
                  onChange={(e) =>
                    updatedExperience(index, "start_date", e.target.value)
                  }
                  type="month"
                  className="px-3 py-2 text-sm border rounded-lg"
                />

                <input
                  value={experience.end_date || ""}
                  onChange={(e) =>
                    updatedExperience(index, "end_date", e.target.value)
                  }
                  type="month"
                  disabled={experience.is_current}
                  className="px-3 py-2 text-sm border rounded-lg disabled:bg-gray-100"
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={experience.is_current || false}
                  onChange={(e) => {
                    updatedExperience(index, "is_current", e.target.checked ? true : false);}
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Currently Working Here
                </span>
              </label>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Job Description</label>
                  <button onClick={() => generateDescription(index)} disabled={generatingIndex === index || !experience.position || !experience.company} className="flex items-center gap-1 px-2 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors disabled:opacity-50">
                    {generatingIndex === index ? (<Loader2 className="w-3 h-3 animate-spin" />) : (<Sparkles className="w-3 h-3" />)}
                    Enhance with AI
                  </button>
                </div>
                <textarea
                  value={experience.description || ""}
                  onChange={(e) =>
                    {updatedExperience(index, "description", e.target.value)}
                  }
                  rows={4}
                  className="w-full text-sm px-3 py-2 border rounded-lg resize-none"
                  placeholder="Describe your key responsibilities and achievements..."
                ></textarea>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


export default ExperienceForm;
