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
  const { upload, uploading, progress, error: uploadError } = useImageUpload();
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
    <div>
      {/* ── Photo uploader ───────────────────────────────────────── */}
      <div className="flex items-start gap-5 pb-6 mb-6 border-b border-line">

        {/* Avatar / click-to-upload trigger */}
        <label className="relative cursor-pointer group shrink-0">
          {imagePreviewSrc ? (
            <div className="relative w-16 h-16">
              <img
                src={imagePreviewSrc}
                alt=""
                className="w-16 h-16 rounded-full object-cover ring-2 ring-line group-hover:opacity-70 transition-opacity"
              />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55">
                  <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none"
                      stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" />
                    <circle cx="18" cy="18" r="15.9" fill="none"
                      stroke="white" strokeWidth="2.5"
                      strokeDasharray={`${progress} 100`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-white">{progress}%</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center w-16 h-16 rounded-full border-2 border-dashed border-line bg-canvas text-muted hover:border-brand-400 hover:text-brand-600 transition-colors">
              {uploading
                ? <RefreshCw className="size-5 animate-spin" />
                : <User className="size-5" />}
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

        {/* Photo controls */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {!imagePreviewSrc && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas transition-colors disabled:opacity-50"
            >
              {uploading ? `Uploading… ${progress}%` : "Upload Photo"}
            </button>
          )}
          {imagePreviewSrc && (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas transition-colors disabled:opacity-50"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="size-3.5" />
              </button>
            </>
          )}

          {/* Remove Background toggle */}
          {data.image && (
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-xs text-muted">Remove BG</span>
              <input
                type="checkbox"
                className="sr-only peer"
                checked={removeBackground}
                disabled={uploading}
                onChange={() => setRemoveBackground((prev) => !prev)}
              />
              <div className="w-8 h-4 bg-slate-300 rounded-full peer-checked:bg-brand-600 transition-colors duration-200 relative">
                <div className="absolute left-0.5 top-0.5 bg-white w-3 h-3 rounded-full transition-transform duration-200 peer-checked:translate-x-4" />
              </div>
            </label>
          )}

          {removeBackground && (
            <p className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 w-full">
              <Info className="size-3 shrink-0" />
              Applied when you save
            </p>
          )}

          {uploading && (
            <p className="text-[11px] text-muted animate-pulse">{progress}% uploaded</p>
          )}
        </div>
      </div>

      {/* Upload error */}
      {uploadError && (
        <div className="mb-4 flex items-start gap-2 text-xs text-rose-600">
          <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
          <span>Upload failed: {uploadError}. Photo will be saved on next resume save.</span>
        </div>
      )}

      {/* ── Fields grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
        {fields.map((field) => {
          const Icon = field.icon;
          return (
            <div key={field.key} className={field.col === 2 ? "md:col-span-2" : ""}>
              <label className="flex items-center gap-1.5 text-sm font-medium text-body mb-1.5">
                <Icon className="size-3.5 text-muted" />
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
  );
};

export default PersonalInfoForm;
