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

  // Upload happens immediately on file select — compressed before sending.
  // removeBg is NOT applied here; it's deferred to save time (applied on Save).
  const handleImageSelect = async (file) => {
    if (!file) return;

    // Show local preview instantly
    onChange({ ...data, image: file });

    try {
      const cdnUrl = await upload(file, {
        userId: user?._id || "user",
        resumeId: resumeId || "resume",
        removeBg: false, // never apply bg-removal on initial upload — defer to save
      });
      onChange({ ...data, image: cdnUrl });
    } catch {
      // Keep local File object — server fallback handles it on save
    }
  };

  const fields = [
    { key: "full_name",  label: "Full Name",        icon: User,             type: "text",  required: true  },
    { key: "email",      label: "Email Address",     icon: Mail,             type: "email", required: true  },
    { key: "phone",      label: "Phone Number",      icon: Phone,            type: "text",  required: false },
    { key: "location",   label: "Location",          icon: MapPin,           type: "text",  required: false },
    { key: "profession", label: "Profession",        icon: BriefcaseBusiness,type: "text",  required: false },
    { key: "linkedin",   label: "LinkedIn Profile",  icon: Linkedin,         type: "url",   required: false },
    { key: "website",    label: "Personal Website",  icon: Globe,            type: "url",   required: false },
  ];

  const imagePreviewSrc =
    typeof data.image === "string"
      ? data.image
      : data.image instanceof File
      ? URL.createObjectURL(data.image)
      : null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-ink">Personal Information</h3>
      <p className="text-sm text-muted">Get started with your personal information</p>

      {/* ── Photo uploader ───────────────────────────────────────── */}
      <div className="flex items-center gap-4 mt-5">

        {/* Avatar / click-to-upload trigger */}
        <label className="relative cursor-pointer group shrink-0">
          {imagePreviewSrc ? (
            <div className="relative w-16 h-16">
              <img
                src={imagePreviewSrc}
                alt="profile"
                className="w-16 h-16 rounded-full object-cover ring ring-slate-300 group-hover:opacity-70 transition-opacity"
              />
              {/* Circular progress overlay while uploading */}
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
            <div className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-700">
              {uploading
                ? <RefreshCw className="size-10 p-2.5 border rounded-full animate-spin" />
                : <User className="size-10 p-2.5 border rounded-full" />}
              <span className="text-sm">{uploading ? `Uploading… ${progress}%` : "Upload Photo"}</span>
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

        {/* Controls shown once we have any image */}
        {data.image && (
          <div className="flex flex-col gap-2 pl-1">

            {/* Remove Background toggle — deferred, applied on Save */}
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-body">Remove Background</p>
              <label className="relative inline-flex items-center cursor-pointer gap-3">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={removeBackground}
                  disabled={uploading}
                  onChange={() => setRemoveBackground((prev) => !prev)}
                />
                <div className="w-9 h-5 bg-slate-300 rounded-full peer-checked:bg-brand-600 transition-colors duration-200" />
                <span className="dot absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform duration-200 peer-checked:translate-x-4" />
                <span className="text-xs text-muted ml-1">
                  {removeBackground ? "On" : "Off"}
                </span>
              </label>
              {/* Hint — so user knows it applies on save, not instantly */}
              {removeBackground && (
                <p className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
                  <Info className="size-3 shrink-0" />
                  Applied when you save the resume
                </p>
              )}
            </div>

            {/* Replace photo */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-xs text-brand-600 hover:text-brand-700 underline underline-offset-2 disabled:opacity-50 text-left w-fit"
            >
              Replace photo
            </button>
          </div>
        )}
      </div>

      {/* Upload error */}
      {uploadError && (
        <div className="mt-2 flex items-start gap-2 text-xs text-rose-600">
          <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
          <span>Upload failed: {uploadError}. Photo will be saved on next resume save.</span>
        </div>
      )}

      {/* Upload progress text (shown when no avatar preview yet) */}
      {uploading && !imagePreviewSrc && (
        <p className="mt-1 text-xs text-muted animate-pulse">Uploading… {progress}%</p>
      )}

      {/* ── Personal info fields ─────────────────────────────────── */}
      {fields.map((field) => {
        const Icon = field.icon;
        return (
          <div key={field.key} className="space-y-1 mt-5">
            <label className="flex items-center gap-2 text-sm font-medium text-body">
              <Icon className="size-4" />
              {field.label}
              {field.required && <span className="text-rose-500">*</span>}
            </label>
            <input
              type={field.type}
              value={data[field.key] || ""}
              required={field.required}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="mt-1 w-full px-3 py-2 text-sm"
              placeholder={`Enter your ${field.label.toLowerCase()}`}
            />
          </div>
        );
      })}
    </div>
  );
};

export default PersonalInfoForm;
