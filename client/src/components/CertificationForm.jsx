import { Award, ExternalLink, Plus, Trash2 } from "lucide-react";
import React from "react";

const PROFICIENCY_LEVELS = ["", "Basic", "Conversational", "Professional", "Fluent", "Native"];

const CertificationForm = ({ data, onChange }) => {
  const add = () => {
    onChange([
      ...data,
      { name: "", issuer: "", issue_date: "", expiry_date: "", credential_url: "" },
    ]);
  };

  const remove = (index) => onChange(data.filter((_, i) => i !== index));

  const update = (index, field, value) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-ink">
            <Award className="size-5" /> Certifications
          </h3>
          <p className="text-sm text-muted">Add licenses, certificates, and credentials</p>
        </div>
        <button
          onClick={add}
          className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:hover:bg-brand-500/20"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-muted">
          <Award className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-slate-600" />
          <p>No certifications added yet.</p>
          <p className="text-sm">Add AWS, Google Cloud, PMP, or any other credentials.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((cert, index) => (
            <div key={index} className="p-4 border border-line rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-semibold text-body">Certification #{index + 1}</h4>
                <button
                  onClick={() => remove(index)}
                  className="text-rose-500 hover:text-rose-700 transition-colors"
                  aria-label="Remove certification"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-medium text-muted">Certificate Name *</label>
                  <input
                    type="text"
                    value={cert.name || ""}
                    onChange={(e) => update(index, "name", e.target.value)}
                    placeholder="e.g. AWS Certified Solutions Architect"
                    className="w-full px-3 py-2 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted">Issuing Organisation</label>
                  <input
                    type="text"
                    value={cert.issuer || ""}
                    onChange={(e) => update(index, "issuer", e.target.value)}
                    placeholder="e.g. Amazon Web Services"
                    className="w-full px-3 py-2 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted">Issue Date</label>
                  <input
                    type="month"
                    value={cert.issue_date || ""}
                    onChange={(e) => update(index, "issue_date", e.target.value)}
                    className="w-full px-3 py-2 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted">Expiry Date <span className="text-muted font-normal">(optional)</span></label>
                  <input
                    type="month"
                    value={cert.expiry_date || ""}
                    onChange={(e) => update(index, "expiry_date", e.target.value)}
                    className="w-full px-3 py-2 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted flex items-center gap-1">
                    <ExternalLink className="size-3" /> Credential URL <span className="text-muted font-normal">(optional)</span>
                  </label>
                  <input
                    type="url"
                    value={cert.credential_url || ""}
                    onChange={(e) => update(index, "credential_url", e.target.value)}
                    placeholder="https://www.credly.com/..."
                    className="w-full px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificationForm;
