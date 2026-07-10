import {
  BriefcaseBusiness,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  User,
  RefreshCw,
  AlertCircle,
  Info,
  Trash2,
} from "lucide-react";
import React, { useRef } from "react";
import { useSelector } from "react-redux";
import useImageUpload from "../hooks/useImageUpload";

const PersonalInfoForm = ({
  data,
  onChange,
  removeBackground,
  setRemoveBackground,
  resumeId,
}) => {
  const { user } = useSelector((state) => state.auth);
  const { upload, uploading, error: uploadError } = useImageUpload();
  const fileInputRef = useRef(null);

  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const handleImageSelect = async (file) => {
    if (!file) return;
    onChange({ ...data, image: file });
    try {
      const cdnUrl = await upload(file, {
        userId: user?._id || "user",
        resumeId: resumeId || "resume",
        removeBg: false,
      });
      onChange({ ...data, image: cdnUrl });
    } catch { /* upload failure handled by useImageUpload */ }
  };

  const handleRemoveImage = () => {
    onChange({ ...data, image: null });
  };

  const inp = "w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow";

  const fields = [
    { key: "full_name",  label: "Full Name",    icon: User,             type: "text",  required: true, col: 1 },
    { key: "profession", label: "Profession",   icon: BriefcaseBusiness,type: "text",  required: false, col: 1 },
    { key: "email",      label: "Email Address", icon: Mail,            type: "email", required: true, col: 1 },
    { key: "phone",      label: "Phone Number",  icon: Phone,           type: "text",  required: false, col: 1 },
    { key: "location",   label: "Location",      icon: MapPin,          type: "text",  required: false, col: 1 },
    { key: "linkedin",   label: "LinkedIn",      icon: Linkedin,        type: "url",   required: false, col: 1 },
    { key: "website",    label: "Website",       icon: Globe,           type: "url",   required: false, col: 2 },
  ];

  const imagePreviewSrc =
    typeof data.image === "string"
      ? data.image
      : data.image instanceof File
      ? URL.createObjectURL(data.image)
      : null;

  return (
    <div className="space-y-5">
      {/* ── Photo uploader ───────────────────────────────────────── */}
      <div className="premium-card p-5 flex flex-col sm:flex-row items-center gap-6">
        <label className="relative cursor-pointer group shrink-0">
          {imagePreviewSrc ? (
            <div className="relative w-20 h-20 overflow-hidden rounded-2xl border border-line shadow-sm">
              <img
                src={imagePreviewSrc}
                alt=""
                className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
              />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="size-5 animate-spin text-white" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl border border-dashed border-line bg-canvas/30 text-muted hover:border-brand-500 hover:text-brand-600 transition-all hover:bg-canvas/50">
              {uploading
                ? <RefreshCw className="size-6 animate-spin text-brand-500" />
                : <User className="size-6 text-muted/50" />}
              <span className="text-[10px] mt-1 font-bold tracking-wide uppercase text-muted/65">Photo</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg, image/png"
            className="hidden"
            onChange={(e) => handleImageSelect(e.target.files[0])}
          />
        </label>

        <div className="flex-1 min-w-0 text-center sm:text-left">
          <h4 className="text-sm font-semibold text-ink">Profile Picture</h4>
          <p className="text-xs text-muted mt-0.5 mb-3.5">PNG or JPG. Maximum 5MB.</p>
          
          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="rounded-xl border border-line bg-surface px-3.5 py-2 text-xs font-semibold text-ink hover:bg-canvas transition-colors disabled:opacity-50 active:scale-95"
            >
              {imagePreviewSrc ? "Replace" : "Select Photo"}
            </button>
            
            {imagePreviewSrc && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors active:scale-95"
              >
                <Trash2 className="size-3.5" />
              </button>
            )}

            {imagePreviewSrc && (
              <div className="h-4 w-px bg-line mx-1" />
            )}

            {/* Remove Background toggle */}
            {data.image && (
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <span className="text-xs text-muted font-medium">Remove BG</span>
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={removeBackground}
                  disabled={uploading}
                  onChange={() => setRemoveBackground((prev) => !prev)}
                />
                <div className="w-8 h-4.5 bg-slate-200 dark:bg-zinc-800 rounded-full peer-checked:bg-emerald-500 transition-colors duration-200 relative shrink-0">
                  <div className="absolute left-0.5 top-0.5 bg-white w-3.5 h-3.5 rounded-full transition-transform duration-200 peer-checked:translate-x-3.5 shadow-sm" />
                </div>
              </label>
            )}
          </div>

          {removeBackground && (
            <p className="flex items-center justify-center sm:justify-start gap-1 text-[10px] font-medium text-amber-600 dark:text-amber-400 mt-2.5">
              <Info className="size-3 shrink-0" />
              Background removal applied upon next save
            </p>
          )}
        </div>
      </div>

      {/* Upload error */}
      {uploadError && (
        <div className="flex items-start gap-2 text-xs text-rose-600">
          <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
          <span>Upload failed: {uploadError}. Photo will be saved on next resume save.</span>
        </div>
      )}

      {/* ── Identity details card ─────────────────────────────────── */}
      <div className="premium-card p-5 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">Identity Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.slice(0, 2).map((field) => {
            const Icon = field.icon;
            return (
              <div key={field.key}>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-muted mb-1.5">
                  <Icon className="size-3.5" />
                  {field.label}
                  {field.required && <span className="text-rose-500">*</span>}
                </label>
                <input
                  type={field.type}
                  value={data[field.key] || ""}
                  required={field.required}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className={inp}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Contact details card ──────────────────────────────────── */}
      <div className="premium-card p-5 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">Contact Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fields.slice(2, 5).map((field) => {
            const Icon = field.icon;
            return (
              <div key={field.key}>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-muted mb-1.5">
                  <Icon className="size-3.5" />
                  {field.label}
                  {field.required && <span className="text-rose-500">*</span>}
                </label>
                <input
                  type={field.type}
                  value={data[field.key] || ""}
                  required={field.required}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className={inp}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Online presence card ──────────────────────────────────── */}
      <div className="premium-card p-5 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">Online Presence</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.slice(5).map((field) => {
            const Icon = field.icon;
            return (
              <div key={field.key}>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-muted mb-1.5">
                  <Icon className="size-3.5" />
                  {field.label}
                  {field.required && <span className="text-rose-500">*</span>}
                </label>
                <input
                  type={field.type}
                  value={data[field.key] || ""}
                  required={field.required}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className={inp}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
