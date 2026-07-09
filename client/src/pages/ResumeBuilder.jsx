import React, { useEffect, useState, useRef, useCallback, memo, useLayoutEffect, Suspense, lazy } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import api from "../configs/api";
import {
  ArrowLeftIcon,
  Award,
  BarChart2,
  Briefcase,
  FileText,
  FolderIcon,
  GraduationCap,
  History,
  Languages,
  Mail,
  MessageSquare,
  Palette,
  Settings2,
  Sparkles,
  Target,
  User,
  Search,
  CheckCircle2,
  Loader2,
  Download,
  Eye,
  Edit3,
  Pencil,
  Check,
  X,
  Save,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { resetAts } from "../app/features/atsSlice";
import { resetCoverLetter } from "../app/features/coverLetterSlice";
import { resetTailor } from "../app/features/tailorSlice";
import { resetInterview } from "../app/features/interviewSlice";
const JD_Input_Panel = lazy(() => import("../components/ats/JD_Input_Panel"));
const ATS_Results_Panel = lazy(() => import("../components/ats/ATS_Results_Panel"));
const CoverLetterPanel = lazy(() => import("../components/coverLetter/CoverLetterPanel"));
const TailorPanel = lazy(() => import("../components/tailor/TailorPanel"));
const InterviewPrepPanel = lazy(() => import("../components/interviewPrep/InterviewPrepPanel"));

import PersonalInfoForm from "../components/PersonalInfoForm";
import TemplateSelector from "../components/TemplateSelector";
import ColorPicker from "../components/ColorPicker";
import ProfessionalSummary from "../components/ProfessionalSummary";
import ExperienceForm from "../components/ExperienceForm";
import EducationForm from "../components/EducationForm";
import ProjectForm from "../components/ProjectForm";
import SkillsForm from "../components/SkillsForm";
import SectionManager from "../components/SectionManager";
import StylesPanel from "../components/StylesPanel";
import CertificationForm from "../components/CertificationForm";
import LanguageForm from "../components/LanguageForm";
import VersionHistoryPanel from "../components/VersionHistoryPanel";
import ResumePreview from "../components/ResumePreview";
import ThemeToggle from "../components/ThemeToggle";
import { getCompleteness, getCompletenessColor } from "../utils/completeness";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";
import useUnsavedChangesWarning from "../hooks/useUnsavedChangesWarning";

// Resume canvas width (Letter @ 96dpi)
const RESUME_WIDTH = 816;

const SectionForm = memo(({ section, resumeData, onChange, token, resumeId, removeBackground, setRemoveBackground, loadExistingResume, setActiveSectionIndex }) => {
  const formContent = (() => {
    switch (section.id) {
      case "personal":
        return (
          <PersonalInfoForm
            data={resumeData.personal_info}
            onChange={(data) => onChange({ ...resumeData, personal_info: data })}
            removeBackground={removeBackground}
            setRemoveBackground={setRemoveBackground}
            resumeId={resumeId}
          />
        );
      case "summary":
        return (
          <ProfessionalSummary
            data={resumeData.professional_summary}
            onChange={(data) => onChange((prev) => ({ ...prev, professional_summary: data }))}
            setResumeData={onChange}
          />
        );
      case "experience":
        return (
          <ExperienceForm
            data={resumeData.experience}
            onChange={(data) => onChange((prev) => ({ ...prev, experience: data }))}
          />
        );
      case "education":
        return (
          <EducationForm
            data={resumeData.education}
            onChange={(data) => onChange((prev) => ({ ...prev, education: data }))}
          />
        );
      case "projects":
        return (
          <ProjectForm
            data={resumeData.project}
            onChange={(data) => onChange((prev) => ({ ...prev, project: data }))}
          />
        );
      case "skills":
        return (
          <SkillsForm
            data={resumeData.skills}
            profession={resumeData.personal_info?.profession || ""}
            token={token}
            onChange={(data) => onChange((prev) => ({ ...prev, skills: data }))}
          />
        );
      case "certifications":
        return (
          <CertificationForm
            data={resumeData.certifications || []}
            onChange={(data) => onChange((prev) => ({ ...prev, certifications: data }))}
          />
        );
      case "languages":
        return (
          <LanguageForm
            data={resumeData.languages || []}
            onChange={(data) => onChange((prev) => ({ ...prev, languages: data }))}
          />
        );
      case "sections":
        return (
          <SectionManager
            sectionHeadings={resumeData.section_headings}
            onSectionHeadingsChange={(h) => onChange((prev) => ({ ...prev, section_headings: h }))}
            customSections={resumeData.custom_sections}
            onCustomSectionsChange={(cs) => onChange((prev) => ({ ...prev, custom_sections: cs }))}
          />
        );
      case "styles":
        return (
          <StylesPanel
            styleOptions={resumeData.style_options}
            onChange={(so) => onChange((prev) => ({ ...prev, style_options: so }))}
            resumeData={resumeData}
          />
        );
      case "ats":
        return (
          <div className="space-y-4">
            <Suspense fallback={<div className="animate-pulse h-24 rounded-lg bg-line/30" />}>
              <JD_Input_Panel resumeId={resumeId} />
            </Suspense>
            <Suspense fallback={<div className="animate-pulse h-24 rounded-lg bg-line/30" />}>
              <ATS_Results_Panel
              resumeId={resumeId}
              resumeData={resumeData}
              onNavigateTab={(tabIndex) => setActiveSectionIndex(tabIndex)}
              onReloadResume={loadExistingResume}
            />
            </Suspense>
          </div>
        );
      case "cover-letter":
        return <Suspense fallback={<div className="animate-pulse h-16 rounded-lg bg-line/30" />}><CoverLetterPanel resumeId={resumeId} resumeData={resumeData} /></Suspense>;
      case "interview":
        return <Suspense fallback={<div className="animate-pulse h-16 rounded-lg bg-line/30" />}><InterviewPrepPanel resumeId={resumeId} /></Suspense>;
      case "tailor":
        return (
          <Suspense fallback={<div className="animate-pulse h-24 rounded-lg bg-line/30" />}>
          <TailorPanel
            resumeId={resumeId}
            onApplyTailored={(patch) => {
              onChange((prev) => {
                const updated = { ...prev };
                if (patch.professional_summary) updated.professional_summary = patch.professional_summary;
                if (patch.skills) updated.skills = patch.skills;
                if (patch.experience_descriptions && updated.experience) {
                  updated.experience = updated.experience.map((exp, i) => {
                    const tailored = patch.experience_descriptions[i];
                    return tailored?.description ? { ...exp, description: tailored.description } : exp;
                  });
                }
                if (patch.project_descriptions && updated.project) {
                  updated.project = updated.project.map((proj, i) => {
                    const tailored = patch.project_descriptions[i];
                    return tailored?.description ? { ...proj, description: tailored.description } : proj;
                  });
                }
                return updated;
              });
            }}
          />
          </Suspense>
        );
      default:
        return null;
    }
  })();

  const isContentSection = ["personal","summary","experience","education","projects","skills","certifications","languages"].includes(section.id);

  return (
    <div className={isContentSection ? "space-y-5" : ""}>
      {formContent}
    </div>
  );
});

const ResumeBuilder = () => {
  const { resumeId } = useParams();
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [resumeData, setResumeData] = useState({
    _id: "",
    title: "",
    personal_info: {},
    professional_summary: "",
    experience: [],
    education: [],
    project: [],
    skills: [],
    certifications: [],
    languages: [],
    template: "classic",
    accent_color: "#4F46E5",
    public: false,
    section_headings: {},
    custom_sections: [],
    style_options: {
      fontFamily: "inter",
      fontSize: 14,
      lineSpacing: 1.5,
      sectionOrder: [],
      headingBold: true,
      headingItalic: false,
      contentBold: false,
      contentItalic: false,
      photoEffect: "none",
      pageSize: "letter",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [removeBackground, setRemoveBackground] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState("idle");
  const [showQuickJump, setShowQuickJump] = useState(false);
  const [quickJumpQuery, setQuickJumpQuery] = useState("");
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Stable preview scaling
  const previewContainerRef = useRef(null);
  const previewInnerRef = useRef(null);
  const [baseScale, setBaseScale] = useState(0.48);
  const [innerHeight, setInnerHeight] = useState(1056);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const finalScale = baseScale * zoomLevel;

  const autoSaveTimerRef = useRef(null);
  const isFirstLoad = useRef(true);
  const formRef = useRef(null);

  const loadExistingResume = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/api/resumes/get/${resumeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.resume) {
        const normalized = {
          ...data.resume,
          accent_color: data.resume.accent_color?.startsWith("#")
            ? data.resume.accent_color
            : `#${data.resume.accent_color || "4F46E5"}`,
          section_headings: data.resume.section_headings ?? {},
          custom_sections: data.resume.custom_sections ?? [],
          certifications: data.resume.certifications ?? [],
          languages: data.resume.languages ?? [],
          style_options: {
            fontFamily: "inter",
            fontSize: 14,
            lineSpacing: 1.5,
            sectionOrder: [],
            headingBold: true,
            headingItalic: false,
            contentBold: false,
            contentItalic: false,
            photoEffect: "none",
            pageSize: "letter",
            ...data.resume.style_options,
          },
        };
        setResumeData(normalized);
        setTitleDraft(data.resume.title);
        document.title = data.resume.title;
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
      isFirstLoad.current = false;
    }
  };

  const performSave = async (isAutoSave = false) => {
    try {
      if (!isAutoSave) setIsSaving(true);
      else setAutoSaveStatus("saving");

      const formData = new FormData();
      formData.append("resumeId", resumeId);

      let resumeDataToSend = { ...resumeData };
      if (resumeDataToSend.personal_info) {
        resumeDataToSend = {
          ...resumeDataToSend,
          personal_info: { ...resumeDataToSend.personal_info },
        };
        const img = resumeDataToSend.personal_info.image;
        if (img instanceof File) {
          formData.append("image", img);
          formData.append("removeBackground", removeBackground);
          resumeDataToSend.personal_info.image = "";
        } else if (typeof img === "string" && img.includes("imagekit.io")) {
          let cleanUrl = img
            .replace(/[,&?]e-bgremove/g, "")
            .replace(/tr=,/g, "tr=")
            .replace(/[?&]tr=$/g, "");
          if (removeBackground) {
            if (cleanUrl.includes("tr=")) {
              cleanUrl = cleanUrl.replace(/tr=([^&]*)/, "tr=$1,e-bgremove");
            } else {
              cleanUrl = cleanUrl.includes("?")
                ? `${cleanUrl}&tr=e-bgremove`
                : `${cleanUrl}?tr=e-bgremove`;
            }
          }
          resumeDataToSend.personal_info.image = cleanUrl;
        }
      }
      resumeDataToSend.custom_sections = resumeDataToSend.custom_sections.filter(
        (s) => s.heading.trim() !== "" || s.content.trim() !== ""
      );
      formData.append("resumeData", JSON.stringify(resumeDataToSend));

      const { data } = await api.put("/api/resumes/update", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      if (data.resume?.personal_info?.image) {
        setResumeData((prev) => ({
          ...prev,
          personal_info: { ...prev.personal_info, image: data.resume.personal_info.image },
        }));
      }
      if (!isAutoSave) toast.success("Resume saved");
      else setAutoSaveStatus("saved");
      setHasUnsavedChanges(false); // Clear unsaved changes flag
    } catch (error) {
      if (!isAutoSave) toast.error(error?.response?.data?.message || error.message);
      else setAutoSaveStatus("error");
    } finally {
      if (!isAutoSave) setIsSaving(false);
    }
  };

  const saveResume = () => performSave(false);

  const handleRestore = (resume) => {
    setResumeData(resume);
    setTitleDraft(resume.title);
    setShowVersionHistory(false);
  };

  const handleTitleSave = () => {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== resumeData.title) {
      setResumeData((prev) => ({ ...prev, title: trimmed }));
    } else {
      setTitleDraft(resumeData.title);
    }
    setEditingTitle(false);
  };

  const handleExportPDF = useCallback(async () => {
    const original = document.getElementById("resume-preview");
    if (!original) return;
    const toastId = "pdf-export";
    toast.loading("Generating PDF...", { id: toastId });

    const wrapper = original.parentElement;
    if (!wrapper) return;

    const clone = wrapper.cloneNode(true);
    clone.style.position = "fixed";
    clone.style.left = "0";
    clone.style.top = "0";
    clone.style.zIndex = "-9999";
    clone.style.pointerEvents = "none";
    document.body.appendChild(clone);

    const clonePreview = clone.querySelector("#resume-preview");
    if (!clonePreview) {
      document.body.removeChild(clone);
      return;
    }

    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const filename =
        (resumeData?.personal_info?.full_name || "resume")
          .replace(/\s+/g, "_")
          .toLowerCase() + "_resume.pdf";
      await html2pdf()
        .set({
          margin: 0,
          filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, letterRendering: true },
          jsPDF: {
            unit: "in",
            format: resumeData?.style_options?.pageSize || "letter",
            orientation: "portrait",
          },
        })
        .from(clonePreview)
        .save();
      toast.success("PDF exported!", { id: toastId });
    } catch {
      toast.error("PDF export failed. Try using the preview page.", { id: toastId });
    } finally {
      document.body.removeChild(clone);
    }
  }, [resumeData]);

  const scrollToSection = useCallback((index) => {
    setActiveSectionIndex(index);
    if (formRef.current) {
      formRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const handleZoomIn = () =>
    setZoomLevel((z) => Math.min(parseFloat((z + 0.1).toFixed(1)), 2.0));
  const handleZoomOut = () =>
    setZoomLevel((z) => Math.max(parseFloat((z - 0.1).toFixed(1)), 0.5));
  const handleZoomReset = () => setZoomLevel(1.0);

  // Cmd+K quick jump
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowQuickJump(true);
        setQuickJumpQuery("");
      }
      if (e.key === "Escape") {
        setShowQuickJump(false);
        setIsMobilePreview(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Auto-save with abort
  const autoSaveVersionRef = useRef(0);

  useEffect(() => {
    if (isFirstLoad.current) return;
    if (!resumeData._id) return;
    setAutoSaveStatus("idle");
    setHasUnsavedChanges(true); // Mark as having unsaved changes
    clearTimeout(autoSaveTimerRef.current);
    const currentVersion = ++autoSaveVersionRef.current;
    autoSaveTimerRef.current = setTimeout(async () => {
      if (currentVersion !== autoSaveVersionRef.current) return;
      await performSave(true);
    }, 2500);
    return () => clearTimeout(autoSaveTimerRef.current);
  }, [resumeData]);

  // Load + reset slices
  useEffect(() => {
    if (token) {
      loadExistingResume();
      dispatch(resetAts());
      dispatch(resetCoverLetter());
      dispatch(resetTailor());
      dispatch(resetInterview());
    }
  }, [resumeId, token]);

  useEffect(() => {
    return () => {
      dispatch(resetAts());
      dispatch(resetCoverLetter());
      dispatch(resetInterview());
    };
  }, [resumeId, dispatch]);

  // ResizeObserver: container width -> baseScale
  useLayoutEffect(() => {
    const el = previewContainerRef.current;
    if (!el) return;
    const w = el.clientWidth;
    if (w > 0) setBaseScale(w / RESUME_WIDTH);
    const obs = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) setBaseScale(w / RESUME_WIDTH);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // ResizeObserver: inner resume height -> innerHeight
  useEffect(() => {
    const el = previewInnerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      const h = entry.contentRect.height;
      if (h > 0) setInnerHeight(h);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'mod+s': (e) => {
      saveResume();
      toast.success('Saved with Ctrl+S', { duration: 1500 });
    },
    'mod+e': (e) => {
      handleExportPDF();
    },
    'mod+p': (e) => {
      setIsMobilePreview(true);
    },
    'escape': (e) => {
      if (showVersionHistory) setShowVersionHistory(false);
      if (isMobilePreview) setIsMobilePreview(false);
      if (showQuickJump) setShowQuickJump(false);
      if (editingTitle) {
        setEditingTitle(false);
        setTitleDraft(resumeData.title);
      }
    },
    'mod+k': (e) => {
      setShowQuickJump(true);
    },
  }, !editingTitle); // Disable when editing title to allow normal text input

  // Unsaved changes warning
  const { showWarning, confirmNavigation, cancelNavigation, checkUnsavedChanges } = 
    useUnsavedChangesWarning(hasUnsavedChanges);

  const sections = [
    { id: "personal",       name: "Personal Info",  icon: User          },
    { id: "summary",        name: "Summary",         icon: FileText      },
    { id: "experience",     name: "Experience",      icon: Briefcase     },
    { id: "education",      name: "Education",       icon: GraduationCap },
    { id: "projects",       name: "Projects",        icon: FolderIcon    },
    { id: "skills",         name: "Skills",          icon: Sparkles      },
    { id: "certifications", name: "Certifications",  icon: Award         },
    { id: "languages",      name: "Languages",       icon: Languages     },
    { id: "sections",       name: "Sections",        icon: Settings2     },
    { id: "styles",         name: "Styles",          icon: Palette       },
    { id: "ats",            name: "ATS Score",       icon: BarChart2     },
    { id: "tailor",         name: "Tailor to JD",    icon: Target        },
    { id: "cover-letter",   name: "Cover Letter",    icon: Mail          },
    { id: "interview",      name: "Interview Prep",  icon: MessageSquare },
  ];

  const activeSection = sections[activeSectionIndex];

  const sectionGroups = [
    { name: "Content",  sections: sections.slice(0, 8)  },
    { name: "Settings", sections: sections.slice(8, 10) },
    { name: "Tools",    sections: sections.slice(10)    },
  ];

  const { score: completenessScore, missing: completenessMissing } = getCompleteness(resumeData);
  const { bar: completenessBar, text: completenessText } = getCompletenessColor(completenessScore);

  const sectionHasData = (section) => {
    const val = resumeData[section.id];
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === "string") return val.length > 30;
    if (typeof val === "object" && val) return Object.keys(val).length > 1;
    return false;
  };

  const AutoSaveIndicator = () => {
    if (autoSaveStatus === "saving")
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
          <Loader2 className="size-3 animate-spin" /> Saving...
        </span>
      );
    if (autoSaveStatus === "saved")
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CheckCircle2 className="size-3" /> Saved
        </span>
      );
    if (autoSaveStatus === "error")
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          Save failed
        </span>
      );
    return null;
  };

  if (isLoading && !resumeData._id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-canvas">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-brand-600" />
          <p className="text-sm text-muted">Loading resume...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-canvas flex flex-col overflow-hidden">

      {/* ── STICKY HEADER ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur-md border-b border-line shadow-sm shrink-0">
        <div className="px-4 lg:px-5">

          {/* Row 1: Nav + Title + Primary Actions */}
          <div className="flex items-center justify-between h-12 gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Link
                to="/app"
                className="flex items-center gap-1 text-xs text-muted transition-colors hover:text-brand-600 shrink-0"
              >
                <ArrowLeftIcon className="size-3.5" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <span className="text-line/60 hidden sm:block select-none">|</span>
              <div className="flex items-center gap-1.5 min-w-0">
                {editingTitle ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={titleDraft}
                      onChange={(e) => setTitleDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleTitleSave();
                        if (e.key === "Escape") {
                          setEditingTitle(false);
                          setTitleDraft(resumeData.title);
                        }
                      }}
                      className="w-36 sm:w-52 rounded-md border border-brand-400 bg-surface px-2 py-1 text-sm font-semibold text-ink outline-none focus:ring-2 focus:ring-brand-500"
                      autoFocus
                    />
                    <button onClick={handleTitleSave} className="p-1 text-emerald-600 hover:text-emerald-700">
                      <Check className="size-3.5" />
                    </button>
                    <button
                      onClick={() => { setEditingTitle(false); setTitleDraft(resumeData.title); }}
                      className="p-1 text-muted hover:text-ink"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setEditingTitle(true)} className="group flex items-center gap-1.5 min-w-0">
                    <span className="text-sm font-semibold text-ink truncate max-w-[120px] sm:max-w-[220px]">
                      {resumeData.title || "Untitled Resume"}
                    </span>
                    <Pencil className="size-3 text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                )}
              </div>
              <AutoSaveIndicator />
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={saveResume}
                disabled={autoSaveStatus === "saving" || isSaving}
                className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-canvas disabled:opacity-50"
              >
                <Save className="size-3.5" />
                <span className="hidden sm:inline">{autoSaveStatus === "saving" || isSaving ? "Saving..." : "Save"}</span>
              </button>
              <button
                onClick={handleExportPDF}
                className="hidden sm:flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-700"
              >
                <Download className="size-3.5" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => setShowVersionHistory(true)}
                className="hidden sm:flex items-center justify-center size-8 rounded-lg border border-line bg-surface text-muted transition hover:bg-canvas hover:text-ink"
                title="Version History"
              >
                <History className="size-3.5" />
              </button>
              <button
                onClick={() => setIsMobilePreview(true)}
                className="lg:hidden flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs text-muted transition hover:bg-canvas hover:text-ink"
              >
                <Eye className="size-3.5" />
                <span>Preview</span>
              </button>
              <ThemeToggle className="size-8 rounded-lg border-line bg-surface text-muted hover:bg-canvas hover:text-ink" />
            </div>
          </div>

          {/* Row 2: Design Tools */}
          <div className="flex items-center gap-2 pb-2 border-t border-line/30 pt-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <TemplateSelector
                selectedTemplate={resumeData.template}
                onChange={(t) => setResumeData((prev) => ({ ...prev, template: t }))}
              />
              <ColorPicker
                selectedColor={resumeData.accent_color}
                onChange={(c) => setResumeData((prev) => ({ ...prev, accent_color: c }))}
              />
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN 3-COLUMN LAYOUT ──────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* LEFT SIDEBAR */}
        <aside className="hidden lg:flex flex-col w-52 shrink-0 border-r border-line bg-surface/30 overflow-y-auto">
          <div className="p-3 space-y-5">
            {sectionGroups.map((group) => (
              <div key={group.name}>
                <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted/60">
                  {group.name}
                </p>
                <div className="space-y-0.5">
                  {group.sections.map((section) => {
                    const idx = sections.indexOf(section);
                    const Icon = section.icon;
                    const isActive = idx === activeSectionIndex;
                    const hasData = sectionHasData(section);
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(idx)}
                        className={"group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-all duration-150 " +
                          (isActive
                            ? "bg-brand-600 text-white shadow-sm shadow-brand-600/20"
                            : "text-muted hover:bg-line/30 hover:text-ink")}
                      >
                        <Icon className="size-3.5 shrink-0" />
                        <span className="flex-1 text-left truncate">{section.name}</span>
                        {!isActive && (
                          hasData
                            ? <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
                            : <span className="size-2 shrink-0 rounded-full border border-dashed border-muted/40" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar footer: progress ring */}
          <div className="mt-auto p-3 border-t border-line">
            <div className="flex items-center gap-2.5">
              <div className="relative size-9 shrink-0">
                <svg className="size-9 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3" className="text-line" />
                  <circle
                    cx="18" cy="18" r="14" fill="none" strokeWidth="3"
                    strokeDasharray={String(2 * Math.PI * 14)}
                    strokeDashoffset={String(2 * Math.PI * 14 * (1 - completenessScore / 100))}
                    strokeLinecap="round"
                    stroke="currentColor"
                    className={
                      completenessScore >= 80
                        ? "text-emerald-500"
                        : completenessScore >= 50
                        ? "text-amber-500"
                        : "text-rose-500"
                    }
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-ink">
                  {completenessScore}%
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-ink">Profile</p>
                <p className="text-[10px] text-muted truncate">
                  {completenessScore === 100 ? "Complete!" : completenessMissing.length + " sections left"}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER: FORM */}
        <div ref={formRef} className="flex-1 min-w-0 overflow-y-auto pb-20 lg:pb-0" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <div className="px-4 py-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-ink">{activeSection.name}</h2>
                <p className="text-xs text-muted mt-0.5">Step {activeSectionIndex + 1} of {sections.length}</p>
              </div>
              <button
                onClick={() => { setShowQuickJump(true); setQuickJumpQuery(""); }}
                className="hidden sm:flex items-center gap-1.5 rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-xs text-muted transition hover:bg-surface hover:text-ink"
              >
                <Search className="size-3" />
                <kbd className="rounded border border-line bg-surface px-1 text-[9px]">Cmd+K</kbd>
              </button>
            </div>

            <div className="bg-surface rounded-xl border border-line shadow-sm overflow-hidden">
              <div className="p-5 sm:p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeSection.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                  >
                    <SectionForm
                      section={activeSection}
                      resumeData={resumeData}
                      onChange={setResumeData}
                      token={token}
                      resumeId={resumeId}
                      removeBackground={removeBackground}
                      setRemoveBackground={setRemoveBackground}
                      loadExistingResume={loadExistingResume}
                      setActiveSectionIndex={setActiveSectionIndex}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Prev / Next navigation */}
              <div className="flex items-center justify-between border-t border-line bg-canvas/40 px-5 py-3">
                <button
                  onClick={() => scrollToSection(Math.max(0, activeSectionIndex - 1))}
                  disabled={activeSectionIndex === 0}
                  className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-muted transition hover:bg-canvas hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="size-3.5" />
                  {activeSectionIndex > 0 ? sections[activeSectionIndex - 1].name : "Previous"}
                </button>

                <div className="flex items-center gap-1">
                  {sections.slice(0, 8).map((sec, i) => (
                    <button
                      key={i}
                      onClick={() => scrollToSection(i)}
                      className={"rounded-full transition-all duration-200 " +
                        (i === activeSectionIndex
                          ? "w-5 h-1.5 bg-brand-600"
                          : sectionHasData(sec)
                          ? "w-1.5 h-1.5 bg-emerald-400"
                          : "w-1.5 h-1.5 bg-line")}
                    />
                  ))}
                </div>

                <button
                  onClick={() => scrollToSection(Math.min(sections.length - 1, activeSectionIndex + 1))}
                  disabled={activeSectionIndex === sections.length - 1}
                  className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-muted transition hover:bg-canvas hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {activeSectionIndex < sections.length - 1 ? sections[activeSectionIndex + 1].name : "Next"}
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: LIVE PREVIEW */}
        <div className="hidden lg:flex flex-col flex-1 min-w-0 border-l border-line overflow-hidden bg-canvas/20">

          {/* Preview toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-line bg-surface/70 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="size-2.5 rounded-full bg-rose-400/80" />
                <span className="size-2.5 rounded-full bg-amber-400/80" />
                <span className="size-2.5 rounded-full bg-emerald-400/80" />
              </div>
              <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Live Preview</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.3}
                title="Zoom out"
                className="flex items-center justify-center size-6 rounded-md border border-line bg-canvas text-muted transition hover:bg-surface hover:text-ink disabled:opacity-30"
              >
                <ZoomOut className="size-3" />
              </button>
              <button
                onClick={handleZoomReset}
                title="Reset zoom"
                className="min-w-[44px] rounded-md border border-line bg-canvas px-1.5 py-0.5 text-center text-[11px] font-mono text-muted transition hover:bg-surface hover:text-ink"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
              <button
                onClick={handleZoomIn}
                disabled={zoomLevel >= 2.0}
                title="Zoom in"
                className="flex items-center justify-center size-6 rounded-md border border-line bg-canvas text-muted transition hover:bg-surface hover:text-ink disabled:opacity-30"
              >
                <ZoomIn className="size-3" />
              </button>
              <button
                onClick={handleExportPDF}
                title="Download PDF"
                className="ml-1 flex items-center gap-1 rounded-md border border-line bg-canvas px-2 py-0.5 text-[11px] text-muted transition hover:bg-surface hover:text-ink"
              >
                <Download className="size-3" />
                PDF
              </button>
            </div>
          </div>

          {/* Preview scroll area */}
          <div className="flex-1 overflow-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            <div className="min-h-full" style={{
              backgroundImage: "radial-gradient(circle, rgba(128,128,128,0.15) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}>
              <div ref={previewContainerRef} className="w-full h-full flex items-start justify-center">

                {/*
                  Height-compensation wrapper:
                  CSS transform: scale() does NOT affect layout flow.
                  We set height = innerHeight * finalScale (the visual height)
                  and overflow:hidden to clip the excess layout space.
                */}
                <div
                  className="relative overflow-hidden"
                  style={{ height: Math.max(innerHeight * finalScale, 100) }}
                >
                  <div
                    style={{
                      width: RESUME_WIDTH,
                      transformOrigin: "top left",
                      transform: "scale(" + finalScale + ")",
                      borderRadius: 6,
                      overflow: "hidden",
                      boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.10), 0 12px 40px rgba(0,0,0,0.08)",
                    }}
                  >
                    <div ref={previewInnerRef}>
                      <ResumePreview
                        data={resumeData}
                        template={resumeData.template}
                        accentColor={resumeData.accent_color}
                        styleOptions={resumeData.style_options}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE SLIDE-IN DRAWER ────────────────────────────────────── */}
      <AnimatePresence>
        {isMobilePreview && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobilePreview(false)}
            />
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 z-50 h-full w-[92vw] max-w-sm bg-canvas shadow-2xl flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-surface/80 backdrop-blur-sm shrink-0">
                <h3 className="text-sm font-semibold text-ink">Live Preview</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportPDF}
                    className="flex items-center gap-1.5 rounded-lg border border-line bg-canvas px-3 py-1.5 text-xs text-muted transition hover:text-ink"
                  >
                    <Download className="size-3.5" />
                    PDF
                  </button>
                  <button
                    onClick={() => setIsMobilePreview(false)}
                    className="flex items-center justify-center size-8 rounded-lg border border-line bg-canvas text-muted transition hover:text-ink"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <ResumePreview
                  data={resumeData}
                  template={resumeData.template}
                  accentColor={resumeData.accent_color}
                  styleOptions={resumeData.style_options}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── QUICK JUMP MODAL ──────────────────────────────────────────── */}
      {showQuickJump && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
          onClick={() => setShowQuickJump(false)}
        >
          <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-md rounded-2xl border border-line bg-surface shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 border-b border-line px-4 py-3">
              <Search className="size-4 text-muted shrink-0" />
              <input
                type="text"
                placeholder="Jump to section..."
                value={quickJumpQuery}
                onChange={(e) => setQuickJumpQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
                autoFocus
              />
              <kbd className="rounded-md border border-line bg-canvas px-1.5 py-0.5 text-[10px] text-muted">ESC</kbd>
            </div>
            <div className="max-h-60 overflow-y-auto p-1">
              {sections
                .filter((s) => s.name.toLowerCase().includes(quickJumpQuery.toLowerCase()))
                .map((section) => {
                  const Icon = section.icon;
                  const idx = sections.indexOf(section);
                  return (
                    <button
                      key={section.id}
                      onClick={() => { scrollToSection(idx); setShowQuickJump(false); }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-body transition hover:bg-line/20 hover:text-ink"
                    >
                      <Icon className="size-4 shrink-0 text-muted" />
                      <span>{section.name}</span>
                    </button>
                  );
                })}
              {quickJumpQuery &&
                sections.filter((s) => s.name.toLowerCase().includes(quickJumpQuery.toLowerCase())).length === 0 && (
                  <p className="px-3 py-6 text-center text-sm text-muted">No sections match</p>
                )}
            </div>
          </motion.div>
        </div>
      )}

      {/* ── VERSION HISTORY ───────────────────────────────────────────── */}
      {showVersionHistory && (
        <VersionHistoryPanel
          resumeId={resumeId}
          onRestore={handleRestore}
          onClose={() => setShowVersionHistory(false)}
        />
      )}

      {/* ── MOBILE BOTTOM ACTION BAR ──────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-line bg-surface/95 backdrop-blur-md safe-area-inset-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          <button
            onClick={saveResume}
            disabled={autoSaveStatus === "saving" || isSaving}
            className="flex flex-col items-center gap-1 px-3 py-1.5 text-xs font-medium text-body transition hover:text-brand-600 disabled:opacity-50"
          >
            <Save className="size-5" />
            <span>Save</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex flex-col items-center gap-1 px-3 py-1.5 text-xs font-medium text-body transition hover:text-brand-600"
          >
            <Download className="size-5" />
            <span>PDF</span>
          </button>
          <button
            onClick={() => setIsMobilePreview(true)}
            className="flex flex-col items-center gap-1 px-3 py-1.5 text-xs font-medium text-body transition hover:text-brand-600"
          >
            <Eye className="size-5" />
            <span>Preview</span>
          </button>
          <button
            onClick={() => setShowVersionHistory(true)}
            className="flex flex-col items-center gap-1 px-3 py-1.5 text-xs font-medium text-body transition hover:text-brand-600"
          >
            <History className="size-5" />
            <span>History</span>
          </button>
        </div>
      </div>

      {/* ── UNSAVED CHANGES WARNING MODAL ─────────────────────────────── */}
      <AnimatePresence>
        {showWarning && (
          <>
            <motion.div
              key="warning-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm"
              onClick={cancelNavigation}
            />
            <motion.div
              key="warning-modal"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="relative w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-2xl">
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
                    <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-ink">Unsaved Changes</h3>
                    <p className="mt-1 text-sm text-body">
                      You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={cancelNavigation}
                    className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-body transition hover:bg-line/20"
                  >
                    Stay
                  </button>
                  <button
                    onClick={confirmNavigation}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                  >
                    Leave Anyway
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResumeBuilder;
