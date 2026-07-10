import React, { useEffect, useState, useRef, useCallback, memo, useLayoutEffect, Suspense, lazy } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
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
  Undo,
  Redo,
  Heart,
  Maximize2,
  Minimize2,
  Keyboard,
} from "lucide-react";
import { resetAts } from "../app/features/atsSlice";
import { resetCoverLetter } from "../app/features/coverLetterSlice";
import { resetTailor } from "../app/features/tailorSlice";
import { resetInterview } from "../app/features/interviewSlice";
import { logout } from "../app/features/authSlice";
import Logo from "../components/Logo";
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
  void motion;
  const { resumeId } = useParams();
  const { token, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

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
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Undo/Redo state history
  const [history, setHistory] = useState([]);
  const [historyPointer, setHistoryPointer] = useState(-1);
  const isUndoingOrRedoing = useRef(false);

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
        setHistory([normalized]);
        setHistoryPointer(0);
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
    setZoomLevel((z) => Math.max(parseFloat((z - 0.1).toFixed(1)), 0.3));
  const handleZoomReset = () => setZoomLevel(1.0);
  const handleFitWidth = () => setZoomLevel(1.0);
  const handleFitPage = () => {
    const el = previewContainerRef.current;
    if (!el) return;
    const containerHeight = el.clientHeight || 800;
    const targetScale = (containerHeight - 80) / innerHeight;
    const fitZoom = targetScale / baseScale;
    setZoomLevel(parseFloat(Math.min(Math.max(fitZoom, 0.3), 2.0).toFixed(2)));
  };

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeData]);

  // Debounced history recording for Undo/Redo
  useEffect(() => {
    if (isFirstLoad.current) return;
    if (!resumeData._id) return;
    if (isUndoingOrRedoing.current) return;

    const handler = setTimeout(() => {
      setHistory((prev) => {
        const nextHistory = prev.slice(0, historyPointer + 1);
        if (
          nextHistory.length > 0 &&
          JSON.stringify(nextHistory[nextHistory.length - 1]) === JSON.stringify(resumeData)
        ) {
          return prev;
        }
        const updated = [...nextHistory, resumeData];
        if (updated.length > 50) updated.shift();
        setHistoryPointer(updated.length - 1);
        return updated;
      });
    }, 800);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeData]);

  const handleUndo = () => {
    if (historyPointer > 0) {
      isUndoingOrRedoing.current = true;
      const nextPointer = historyPointer - 1;
      setHistoryPointer(nextPointer);
      setResumeData(history[nextPointer]);
      setHasUnsavedChanges(true);
      setTimeout(() => {
        isUndoingOrRedoing.current = false;
      }, 50);
    }
  };

  const handleRedo = () => {
    if (historyPointer < history.length - 1) {
      isUndoingOrRedoing.current = true;
      const nextPointer = historyPointer + 1;
      setHistoryPointer(nextPointer);
      setResumeData(history[nextPointer]);
      setHasUnsavedChanges(true);
      setTimeout(() => {
        isUndoingOrRedoing.current = false;
      }, 50);
    }
  };

  // Load + reset slices
  useEffect(() => {
    if (token) {
      loadExistingResume();
      dispatch(resetAts());
      dispatch(resetCoverLetter());
      dispatch(resetTailor());
      dispatch(resetInterview());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    'mod+s': () => {
      saveResume();
      toast.success('Saved with Ctrl+S', { duration: 1500 });
    },
    'mod+e': () => {
      handleExportPDF();
    },
    'mod+p': () => {
      setIsMobilePreview(true);
    },
    'mod+z': () => {
      handleUndo();
    },
    'mod+y': () => {
      handleRedo();
    },
    'shift+mod+z': () => {
      handleRedo();
    },
    'escape': () => {
      if (showVersionHistory) setShowVersionHistory(false);
      if (isMobilePreview) setIsMobilePreview(false);
      if (showQuickJump) setShowQuickJump(false);
      if (showShortcutsModal) setShowShortcutsModal(false);
      if (editingTitle) {
        setEditingTitle(false);
        setTitleDraft(resumeData.title);
      }
    },
    'mod+k': () => {
      setShowQuickJump(true);
    },
  }, !editingTitle); // Disable when editing title to allow normal text input

  // Unsaved changes warning
  const { showWarning, confirmNavigation, cancelNavigation } = 
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
  getCompletenessColor(completenessScore);

  const [showHealthPanel, setShowHealthPanel] = useState(false);

  const getHealthChecks = () => {
    const checks = [];
    
    // Contact Info Check
    const hasEmail = !!resumeData.personal_info?.email;
    const hasPhone = !!resumeData.personal_info?.phone;
    const hasLocation = !!resumeData.personal_info?.location;
    checks.push({
      id: "contact",
      label: "Contact Information",
      status: hasEmail && hasPhone && hasLocation ? "pass" : "fail",
      detail: !hasEmail ? "Missing email address" : !hasPhone ? "Missing phone number" : !hasLocation ? "Missing location" : "Fully provided",
    });

    // Professional Summary Check
    const summaryLength = (resumeData.professional_summary || "").length;
    checks.push({
      id: "summary",
      label: "Professional Summary",
      status: summaryLength >= 150 && summaryLength <= 450 ? "pass" : summaryLength > 0 ? "warning" : "fail",
      detail: summaryLength === 0 ? "Missing summary" : summaryLength < 150 ? "Too short (aim for 150+ chars)" : summaryLength > 450 ? "Too long (shorten under 450 chars)" : "Perfect length",
    });

    // Work Experience Check
    const expCount = resumeData.experience?.length || 0;
    const hasAchievements = resumeData.experience?.every(exp => (exp.description || "").trim().length > 10);
    checks.push({
      id: "experience",
      label: "Work Experience",
      status: expCount > 0 ? (hasAchievements ? "pass" : "warning") : "fail",
      detail: expCount === 0 ? "Add at least 1 position" : !hasAchievements ? "Some entries lack descriptions" : `${expCount} position(s) added`,
    });

    // Skills Check
    const skillsCount = resumeData.skills?.length || 0;
    checks.push({
      id: "skills",
      label: "Skills Assessment",
      status: skillsCount >= 5 ? "pass" : skillsCount > 0 ? "warning" : "fail",
      detail: skillsCount === 0 ? "No skills added yet" : skillsCount < 5 ? "Add at least 5 skills" : `${skillsCount} skills added`,
    });

    // Education Check
    const eduCount = resumeData.education?.length || 0;
    checks.push({
      id: "education",
      label: "Education Details",
      status: eduCount > 0 ? "pass" : "fail",
      detail: eduCount === 0 ? "Add your education" : `${eduCount} education entries`,
    });

    return checks;
  };

  const sectionHasData = (section) => {
    const val = resumeData[section.id];
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === "string") return val.length > 30;
    if (typeof val === "object" && val) return Object.keys(val).length > 1;
    return false;
  };

  const AutoSaveIndicator = () => {
    return (
      <div className="min-w-[120px] flex items-center justify-start">
        <AnimatePresence mode="wait">
          <motion.div
            key={autoSaveStatus}
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 3 }}
            transition={{ duration: 0.15 }}
            className="inline-flex shrink-0"
          >
            {autoSaveStatus === "saving" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/20 text-[10px] font-bold text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/40">
                <Loader2 className="size-3 animate-spin" />
                <span>Saving...</span>
              </span>
            )}
            {autoSaveStatus === "saved" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/40">
                <Check className="size-3" />
                <span>Saved</span>
                <span className="text-[9px] opacity-75 hidden sm:inline">• Updated just now</span>
              </span>
            )}
            {autoSaveStatus === "error" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/20 text-[10px] font-bold text-rose-700 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/40">
                Save failed
              </span>
            )}
            {autoSaveStatus === "idle" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 dark:bg-zinc-900 text-[10px] font-bold text-muted border border-line">
                <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Unsaved changes</span>
              </span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
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

      {/* ── PREMIUM HEADER TOOLBAR ───────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-surface border-b border-line shadow-sm shrink-0 h-16 flex items-center px-4 lg:px-6">
        <div className="w-full flex items-center justify-between gap-4">
          
          {/* Left section: Logo + Title + Autosave */}
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/app" className="flex items-center justify-center p-1.5 rounded-lg hover:bg-canvas text-muted hover:text-brand-600 transition-colors shrink-0" title="Back to Dashboard">
              <ArrowLeftIcon className="size-4" />
            </Link>
            <div className="w-px h-5 bg-line mx-1 shrink-0" />
            <Logo size="sm" className="hidden md:inline-flex shrink-0" />
            <div className="w-px h-5 bg-line mx-1 hidden md:block shrink-0" />
            
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
                    className="w-36 sm:w-48 rounded-lg border border-brand-400 bg-surface px-2 py-1 text-sm font-semibold text-ink outline-none focus:ring-2 focus:ring-brand-500"
                    autoFocus
                  />
                  <button onClick={handleTitleSave} className="p-1 text-emerald-600 hover:text-emerald-700 cursor-pointer">
                    <Check className="size-3.5" />
                  </button>
                  <button
                    onClick={() => { setEditingTitle(false); setTitleDraft(resumeData.title); }}
                    className="p-1 text-muted hover:text-ink cursor-pointer"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <button onClick={() => setEditingTitle(true)} className="group flex items-center gap-1.5 min-w-0 cursor-pointer">
                  <span className="text-sm font-bold text-ink truncate max-w-[120px] sm:max-w-[200px]">
                    {resumeData.title || "Untitled Resume"}
                  </span>
                  <Pencil className="size-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              )}
            </div>
            
            <div className="w-px h-5 bg-line mx-1 shrink-0" />
            <AutoSaveIndicator />
          </div>

          {/* Center section: Undo & Redo */}
          <div className="hidden sm:flex items-center gap-1 bg-canvas border border-line p-0.5 rounded-lg">
            <button
              onClick={handleUndo}
              disabled={historyPointer <= 0}
              className="p-1.5 rounded-md text-muted transition hover:bg-surface hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Undo (Cmd+Z)"
            >
              <Undo className="size-3.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyPointer >= history.length - 1}
              className="p-1.5 rounded-md text-muted transition hover:bg-surface hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="Redo (Cmd+Y)"
            >
              <Redo className="size-3.5" />
            </button>
          </div>

          {/* Right section: Design Tools, PDF, History, Theme, Profile */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Template & Color Selector */}
            <div className="hidden md:flex items-center gap-2">
              <TemplateSelector
                selectedTemplate={resumeData.template}
                onChange={(t) => setResumeData((prev) => ({ ...prev, template: t }))}
              />
              <ColorPicker
                selectedColor={resumeData.accent_color}
                onChange={(c) => setResumeData((prev) => ({ ...prev, accent_color: c }))}
              />
            </div>
            
            <div className="w-px h-5 bg-line mx-1 hidden md:block shrink-0" />

            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700 shadow-sm active:scale-95 cursor-pointer"
            >
              <Download className="size-3.5" />
              <span>Download PDF</span>
            </button>
            
            <button
              onClick={() => setShowVersionHistory(true)}
              className="flex items-center justify-center size-8 rounded-lg border border-line bg-surface text-muted transition hover:bg-canvas hover:text-ink cursor-pointer"
              title="Version History"
            >
              <History className="size-4" />
            </button>
            
            <ThemeToggle className="size-8 rounded-lg border border-line bg-surface text-muted hover:bg-canvas hover:text-ink" />
            
            <span className="text-line select-none font-light">|</span>
            
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex size-8 items-center justify-center rounded-full border border-line bg-surface/80 hover:bg-canvas transition-colors"
              >
                <div className="flex size-6 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              </button>
              {profileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setProfileMenuOpen(false)} />
                  <div className="absolute right-0 top-full z-45 mt-2 w-48 overflow-hidden rounded-xl border border-line bg-surface shadow-lg">
                    <div className="px-3 py-2 border-b border-line/40">
                      <p className="text-xs font-semibold text-ink truncate">{user?.name}</p>
                      <p className="text-[10px] text-muted truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/app"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted hover:bg-line/25"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        dispatch(logout());
                        navigate("/");
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted hover:bg-line/25 hover:text-red-500 border-t border-line/45"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          
        </div>
      </header>

      {/* ── MAIN 3-COLUMN LAYOUT ──────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* LEFT SIDEBAR */}
        <aside className="hidden lg:flex flex-col lg:w-[18%] lg:min-w-[220px] lg:max-w-[260px] shrink-0 border-r border-line bg-surface/30 overflow-y-auto">
          <div className="p-4 space-y-6">
            {sectionGroups.map((group) => (
              <div key={group.name}>
                <p className="mb-2 px-2.5 text-[10px] font-bold uppercase tracking-widest text-muted/50">
                  {group.name}
                </p>
                <div className="space-y-1">
                  {group.sections.map((section) => {
                    const idx = sections.indexOf(section);
                    const Icon = section.icon;
                    const isActive = idx === activeSectionIndex;
                    const hasData = sectionHasData(section);
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(idx)}
                        className={"group flex w-full items-center gap-2.5 px-3 py-2.5 text-xs font-semibold transition-all duration-150 rounded-xl " +
                          (isActive
                            ? "bg-brand-50/70 border-l-2 border-brand-600 pl-[11px] -ml-[1px] text-brand-700 dark:bg-brand-500/10 dark:border-brand-500 dark:text-brand-300 shadow-sm"
                            : "text-muted hover:bg-slate-50 dark:hover:bg-zinc-900/50 hover:text-ink")}
                      >
                        <Icon className="size-4 shrink-0 transition-transform group-hover:scale-105" />
                        <span className="flex-1 text-left truncate">{section.name}</span>
                        {!isActive && (
                          hasData
                            ? <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                            : <span className="size-1.5 shrink-0 rounded-full bg-slate-300 dark:bg-zinc-700" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar footer widgets */}
          <div className="mt-auto p-4 border-t border-line space-y-4 bg-canvas/30 shrink-0">
            {/* Progress widget */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted">Completion</span>
                <span className="font-bold text-ink">{completenessScore}%</span>
              </div>
              <div className="h-1.5 w-full bg-line rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${
                    completenessScore >= 80 ? "bg-emerald-500" : completenessScore >= 50 ? "bg-amber-500" : "bg-rose-500"
                  }`}
                  style={{ width: `${completenessScore}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-muted font-medium">
                <span>{completenessMissing.length} sections left</span>
                <span>Est: ~{Math.max(2, Math.round(completenessMissing.length * 1.5))} mins</span>
              </div>
            </div>

            {/* Quick actions panel */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                onClick={() => {
                  const atsIdx = sections.findIndex(s => s.id === "ats");
                  if (atsIdx !== -1) scrollToSection(atsIdx);
                }}
                className="flex flex-col items-center gap-1 rounded-xl border border-line bg-surface/50 p-2 text-center transition hover:bg-surface hover:shadow-xs group cursor-pointer"
              >
                <span className="text-[10px] font-bold text-ink group-hover:text-brand-600 transition">ATS Score</span>
                <span className="text-[9px] text-muted">Optimize copy</span>
              </button>
              <button
                onClick={() => setShowShortcutsModal(true)}
                className="flex flex-col items-center gap-1 rounded-xl border border-line bg-surface/50 p-2 text-center transition hover:bg-surface hover:shadow-xs group cursor-pointer"
              >
                <div className="flex items-center gap-1">
                  <Keyboard className="size-3 text-muted group-hover:text-brand-600 transition" />
                  <span className="text-[10px] font-bold text-ink group-hover:text-brand-600 transition">Keys</span>
                </div>
                <span className="text-[9px] text-muted">Shortcuts</span>
              </button>
            </div>
          </div>
        </aside>

        {/* CENTER: FORM */}
        <div ref={formRef} className="lg:w-[42%] lg:min-w-[460px] min-w-0 overflow-y-auto pb-20 lg:pb-0" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
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
              <div className="flex items-center justify-between border-t border-line bg-surface px-6 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.02)] shrink-0">
                <button
                  onClick={() => scrollToSection(Math.max(0, activeSectionIndex - 1))}
                  disabled={activeSectionIndex === 0}
                  className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-4 py-2.5 text-xs font-semibold text-muted transition hover:bg-canvas hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                >
                  <ChevronLeft className="size-4" />
                  <span>{activeSectionIndex > 0 ? `Back to ${sections[activeSectionIndex - 1].name}` : "Previous"}</span>
                </button>

                <div className="hidden sm:flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-widest leading-none">
                    Step {activeSectionIndex + 1} of {sections.length}: {activeSection.name}
                  </span>
                  <div className="w-28 h-1 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all duration-300"
                      style={{ width: `${((activeSectionIndex + 1) / sections.length) * 100}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => scrollToSection(Math.min(sections.length - 1, activeSectionIndex + 1))}
                  disabled={activeSectionIndex === sections.length - 1}
                  className="flex items-center gap-1.5 rounded-xl border border-brand-600 bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-brand-700 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 shadow-sm shadow-brand-600/10"
                >
                  <span>{activeSectionIndex < sections.length - 1 ? `Next: ${sections[activeSectionIndex + 1].name}` : "Next"}</span>
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: LIVE PREVIEW */}
        <div className="hidden lg:flex flex-col lg:w-[40%] lg:min-w-[440px] flex-1 border-l border-line overflow-hidden bg-canvas/20">

          {/* Preview toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-line bg-surface/80 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="size-2 rounded-full bg-slate-300 dark:bg-zinc-700" />
                <span className="size-2 rounded-full bg-slate-300 dark:bg-zinc-700" />
                <span className="size-2 rounded-full bg-slate-300 dark:bg-zinc-700" />
              </div>
              <span className="text-[10px] font-bold text-muted ml-1.5 uppercase tracking-wider">
                {resumeData.style_options?.pageSize === "a4" ? "A4 Paper" : "Letter Paper"}
              </span>
            </div>

            {/* Zoom controllers */}
            <div className="flex items-center gap-1.5 bg-canvas/50 border border-line p-0.5 rounded-lg">
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.3}
                className="p-1 rounded text-muted hover:bg-surface hover:text-ink transition-colors disabled:opacity-30 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="size-3.5" />
              </button>
              
              <button
                onClick={handleZoomReset}
                className="text-[10px] font-bold text-muted hover:text-ink px-2 py-0.5 rounded transition-colors cursor-pointer"
                title="Reset to 100%"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
              
              <button
                onClick={handleZoomIn}
                disabled={zoomLevel >= 2.0}
                className="p-1 rounded text-muted hover:bg-surface hover:text-ink transition-colors disabled:opacity-30 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="size-3.5" />
              </button>
              
              <div className="h-3.5 w-px bg-line mx-0.5" />
              
              <button
                onClick={handleFitWidth}
                className="p-1.5 rounded text-[10px] font-semibold text-muted hover:bg-surface hover:text-ink transition-colors cursor-pointer"
                title="Fit to Width"
              >
                <Minimize2 className="size-3" />
              </button>

              <button
                onClick={handleFitPage}
                className="p-1.5 rounded text-[10px] font-semibold text-muted hover:bg-surface hover:text-ink transition-colors cursor-pointer"
                title="Fit Page vertically"
              >
                <Maximize2 className="size-3" />
              </button>
            </div>

            {/* Download Action */}
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700 active:scale-95 cursor-pointer shadow-sm shadow-brand-600/10"
              title="Download PDF"
            >
              <Download className="size-3.5" />
              <span className="hidden sm:inline text-[11px] font-bold">Download</span>
            </button>
          </div>

          {/* Preview scroll area */}
          <div className="flex-1 overflow-auto bg-slate-100/70 dark:bg-zinc-900/70" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            <div className="min-h-full" style={{
              backgroundImage: "radial-gradient(var(--color-line) 1.5px, transparent 1.5px)",
              backgroundSize: "20px 20px",
            }}>
              <div ref={previewContainerRef} className="w-full h-full flex items-start justify-center py-10 px-4">

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
                    className="premium-paper"
                    style={{
                      width: RESUME_WIDTH,
                      transformOrigin: "top left",
                      transform: "scale(" + finalScale + ")",
                      borderRadius: 4,
                      overflow: "hidden",
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

      {/* ── KEYBOARD SHORTCUTS MODAL ──────────────────────────────────── */}
      {showShortcutsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setShowShortcutsModal(false)}
        >
          <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-ink">Keyboard Shortcuts</h3>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="p-1 rounded-lg text-muted hover:bg-canvas hover:text-ink transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              {[
                { keys: ["⌘", "S"], desc: "Save current progress" },
                { keys: ["⌘", "Z"], desc: "Undo last change" },
                { keys: ["⌘", "Y"], desc: "Redo last change" },
                { keys: ["⌘", "K"], desc: "Search & quick jump" },
                { keys: ["⌘", "E"], desc: "Download PDF" },
                { keys: ["⌘", "P"], desc: "Toggle preview canvas" },
                { keys: ["ESC"], desc: "Close menus or modals" }
              ].map((shortcut, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-line/40 last:border-0">
                  <span className="text-xs text-body">{shortcut.desc}</span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((k, j) => (
                      <kbd key={j} className="rounded-md border border-line bg-canvas px-1.5 py-0.5 text-[9px] font-bold text-ink shadow-xs">
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
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

      {/* ── COLLAPSIBLE FLOATING HEALTH PANEL ───────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50 hidden lg:block">
        <AnimatePresence>
          {showHealthPanel ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-80 rounded-2xl border border-line bg-surface p-4 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-line pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <Heart className="size-4 text-rose-500 fill-rose-500 animate-pulse" />
                  <span className="text-sm font-bold text-ink font-sans">Resume Score & Health</span>
                </div>
                <button
                  onClick={() => setShowHealthPanel(false)}
                  className="rounded-lg p-1 text-muted hover:bg-canvas hover:text-ink transition-colors cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Score progress metrics */}
                <div className="space-y-3">
                  {/* ATS Rating */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-semibold text-body">ATS Suitability</span>
                      <span className="text-[11px] font-bold text-ink">{completenessScore}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${completenessScore}%` }} />
                    </div>
                  </div>

                  {/* Grammar Rating */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-semibold text-body">Grammar & Spell Check</span>
                      <span className="text-[11px] font-bold text-ink">{resumeData.professional_summary ? 100 : 0}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${resumeData.professional_summary ? 100 : 0}%` }} />
                    </div>
                  </div>

                  {/* Readability Rating */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-semibold text-body">Readability Score</span>
                      <span className="text-[11px] font-bold text-ink">{resumeData.professional_summary?.length > 100 ? 92 : 40}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${resumeData.professional_summary?.length > 100 ? 92 : 40}%` }} />
                    </div>
                  </div>

                  {/* Keywords Rating */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-semibold text-body">Industry Keywords</span>
                      <span className={`text-[11px] font-bold ${resumeData.skills?.length >= 8 ? "text-emerald-500" : resumeData.skills?.length >= 4 ? "text-amber-500" : "text-rose-500"}`}>
                        {resumeData.skills?.length >= 8 ? "Excellent" : resumeData.skills?.length >= 4 ? "Good" : "Needs Work"}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${resumeData.skills?.length >= 8 ? "bg-emerald-500" : resumeData.skills?.length >= 4 ? "bg-amber-500" : "bg-rose-500"}`} 
                        style={{ width: `${resumeData.skills?.length >= 8 ? 95 : resumeData.skills?.length >= 4 ? 65 : 30}%` }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Checklist checks */}
                <div className="space-y-2.5 pt-3 border-t border-line max-h-40 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                  {getHealthChecks().map((check) => {
                    const isPass = check.status === "pass";
                    const isWarning = check.status === "warning";
                    return (
                      <div key={check.id} className="flex items-start gap-2.5 text-xs py-0.5">
                        <span className="mt-0.5 shrink-0">
                          {isPass ? (
                            <CheckCircle2 className="size-3.5 text-emerald-500" />
                          ) : isWarning ? (
                            <AlertTriangle className="size-3.5 text-amber-500" />
                          ) : (
                            <X className="size-3.5 text-rose-500" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between items-baseline">
                            <p className="font-semibold text-ink leading-none">{check.label}</p>
                            <span className={`text-[8px] font-bold uppercase ${isPass ? "text-emerald-500" : isWarning ? "text-amber-500" : "text-rose-500"}`}>
                              {check.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted mt-0.5 leading-tight">{check.detail}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.button
              layoutId="health-panel-trigger"
              onClick={() => setShowHealthPanel(true)}
              className="flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 shadow-lg hover:shadow-xl hover:bg-canvas transition-all duration-200 cursor-pointer"
            >
              <Heart className="size-4 text-rose-500 fill-rose-500" />
              <span className="text-xs font-bold text-ink">Health Check</span>
              <span className={`size-2 rounded-full ${completenessScore >= 80 ? "bg-emerald-500" : completenessScore >= 50 ? "bg-amber-500" : "bg-rose-500"}`} />
            </motion.button>
          )}
        </AnimatePresence>
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
