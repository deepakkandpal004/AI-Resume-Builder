import { Plus, Sidebar, Sparkles, X } from "lucide-react";
import React from "react";

const SkillsForm = ({ data, onChange }) => {
  const [newSkill, setNewSkill] = React.useState("");

  const addSkill = () => {
    if (newSkill.trim() && !data.includes(newSkill.trim())) {
      onChange([...data, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (indexToRemove) => {
    onChange(data.filter((_, index) => index !== indexToRemove))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  }
  return (
  <div className="space-y-4">
    <div>
        <h3 className="flex items-center gap-2 text-lg font-semibold text-ink">Skills</h3>
        <p className="text-sm text-muted">Add your technical and soft skills</p>
    </div>
     <div className="flex gap-2">
        <input 
          type="text" 
          value={newSkill} 
          onChange={(e) => setNewSkill(e.target.value)} 
          onKeyDown={handleKeyPress}
          className="flex-1 px-3 py-2 text-sm"
          placeholder="Enter a skill and press Enter" 
        />
        <button 
          onClick={addSkill} 
          disabled={!newSkill.trim()}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="size-4"/> Add Skill
        </button>
     </div>
     {data.length > 0 ? (
        <div className="flex flex-wrap gap-2">
            {data.map((skill, index) => (
                <span key={index} className="flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                    {skill}
                    <button 
                      onClick={() => removeSkill(index)} 
                      className="ml-1 rounded-full p-0.5 transition-colors hover:bg-brand-100 dark:hover:bg-brand-500/20"
                    ><X className="w-3 h-3"/></button>   
                </span>
            ))}
        </div>
     ):
     (
        <div className="text-center py-8 text-muted">
            <Sparkles className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p>No skills added yet.</p>
            <p className="text-sm">Add your technical and soft skills</p>
        </div>
     )}
     <div className="rounded-lg bg-brand-50 p-3 text-sm text-body dark:bg-brand-500/10">
        <p><strong>Tip:</strong>  Add 8-12 relevant skills. Include both technical skills (programming languages, tools) and soft skills (leadership, communication).</p>
     </div>

  </div>
  )
};

export default SkillsForm;
