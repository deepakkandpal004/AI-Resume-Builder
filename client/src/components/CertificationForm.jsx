import { Award, ExternalLink, Plus, Trash2, ChevronDown, ChevronUp, Sparkles, Loader2 } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import api from "../configs/api";

const inp = "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow";

const CertificationForm = ({ data, onChange }) => {
  const { token } = useSelector((state) => state.auth);
  const [expanded, setExpanded] = useState({});
  const [generatingIndex, setGeneratingIndex] = useState(-1);

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

  const enhanceEntry = async (index) => {
    setGeneratingIndex(index);
    const cert = data[index];
    try {
      const prompt = `enhance this certification description: ${cert.name || ""} issued by ${cert.issuer || ""}`;
      const { data: result } = await api.post(
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-ink">Certifications</h3>
          <p className="text-sm text-muted mt-0.5">
            {data.length > 0
              ? `${data.length} certification${data.length > 1 ? "s" : ""} added`
              : "Add licenses, certificates, and credentials"}
          </p>
        </div>
        <button
          onClick={add}
          className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink hover:bg-canvas transition-colors"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-line rounded-xl">
          <Award className="size-10 text-muted mb-3" />
          <p className="text-sm text-muted">No certifications added yet</p>
          <p className="text-xs text-muted mt-1">Add AWS, Google Cloud, PMP, or any other credentials</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((cert, index) => {
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
                      <Award className="size-4 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">
                        {cert.name || `Certification #${index + 1}`}
                      </p>
                      {cert.issuer && (
                        <p className="text-xs text-muted mt-0.5">{cert.issuer}</p>
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
                      onClick={(e) => { e.stopPropagation(); remove(index); }}
                      className="p-1.5 rounded-lg text-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                    {isOpen ? <ChevronUp className="size-4 text-muted" /> : <ChevronDown className="size-4 text-muted" />}
                  </div>
                </div>

                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 border-t border-line pt-3">
                    <div>
                      <label className="block text-xs font-medium text-body mb-1">Certificate Name *</label>
                      <input
                        type="text"
                        value={cert.name || ""}
                        onChange={(e) => update(index, "name", e.target.value)}
                        placeholder="AWS Certified Solutions Architect"
                        className={inp}
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-body mb-1">Issuing Organisation</label>
                        <input
                          type="text"
                          value={cert.issuer || ""}
                          onChange={(e) => update(index, "issuer", e.target.value)}
                          placeholder="Amazon Web Services"
                          className={inp}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-body mb-1">Issue Date</label>
                          <input
                            type="month"
                            value={cert.issue_date || ""}
                            onChange={(e) => update(index, "issue_date", e.target.value)}
                            placeholder="Issued"
                            className={inp}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-body mb-1">Expiry <span className="text-muted font-normal">(optional)</span></label>
                          <input
                            type="month"
                            value={cert.expiry_date || ""}
                            onChange={(e) => update(index, "expiry_date", e.target.value)}
                            placeholder="Expires"
                            className={inp}
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-body mb-1 flex items-center gap-1">
                        <ExternalLink className="size-3" /> Credential URL <span className="text-muted font-normal">(optional)</span>
                      </label>
                      <input
                        type="url"
                        value={cert.credential_url || ""}
                        onChange={(e) => update(index, "credential_url", e.target.value)}
                        placeholder="https://www.credly.com/..."
                        className={inp}
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

export default CertificationForm;
