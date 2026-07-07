import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
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
  TrendingUp,
  User,
  Search,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { resetAts } from "../app/features/atsSlice";
import { resetCoverLetter } from "../app/features/coverLetterSlice";
import { resetInterview } from "../app/features/interviewSlice";
import { resetTailor } from "../app/features/tailorSlice";
import JD_Input_Panel from "../components/ats/JD_Input_Panel";
import ResumeScorePanel from "../components/resumeScore/ResumeScorePanel";
import ATS_Results_Panel from "../components/ats/ATS_Results_Panel";
import CoverLetterPanel from "../components/coverLetter/CoverLetterPanel";
import InterviewPrepPanel from "../components/interviewPrep/InterviewPrepPanel";
import TailorPanel from "../components/tailor/TailorPanel";

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
import { getCompleteness, getCompletenessColor } from "../utils/completeness";

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
  const [showVersionHistory, setShowVersionHistory] = useState(false);

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
      if (!isAutoSave) setIsLoading(true);
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
          personal_info: {
            ...prev.personal_info,
            image: data.resume.personal_info.image,
          },
        }));
      }

      if (!isAutoSave) toast.success("Resume saved successfully");
      else setAutoSaveStatus("saved");
    } catch (error) {
      if (!isAutoSave) toast.error(error?.response?.data?.message || error.message);
      else setAutoSaveStatus("error");
    } finally {
      if (!isAutoSave) setIsLoading(false);
    }
  };

  const saveResume = () => performSave(false);

  const handleRestore = (resume) => {
    setResumeData(resume);
    setShowVersionHistory(false);
  };

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [removeBackground, setRemoveBackground] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState("idle");
  const [showQuickJump, setShowQuickJump] = useState(false);
  const [quickJumpQuery, setQuickJumpQuery] = useState("");
  const autoSaveTimerRef = useRef(null);
  const isFirstLoad = useRef(true);

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
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Auto-save: fires 2.5s after the last change, skips the initial load
  useEffect(() => {
    if (isFirstLoad.current) return;
    if (!resumeData._id) return;

    setAutoSaveStatus("idle");
    clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      performSave(true);
    }, 2500);

    return () => clearTimeout(autoSaveTimerRef.current);
  }, [resumeData]);

  const sections = [
    { id: "personal",      name: "Personal Info",   icon: User         },
    { id: "summary",       name: "Summary",          icon: FileText     },
    { id: "experience",    name: "Experience",       icon: Briefcase    },
    { id: "education",     name: "Education",        icon: GraduationCap},
    { id: "projects",      name: "Projects",         icon: FolderIcon   },
    { id: "skills",        name: "Skills",           icon: Sparkles     },
    { id: "certifications",name: "Certifications",   icon: Award        },
    { id: "languages",     name: "Languages",        icon: Languages    },
    { id: "sections",      name: "Sections",         icon: Settings2    },
    { id: "styles",        name: "Styles",           icon: Palette      },
    { id: "score",         name: "Resume Score",     icon: TrendingUp   },
    { id: "ats",           name: "ATS Score",        icon: BarChart2    },
    { id: "tailor",        name: "Tailor to JD",     icon: Target       },
    { id: "cover-letter",  name: "Cover Letter",     icon: Mail         },
    { id: "interview",     name: "Interview Prep",   icon: MessageSquare},
  ];

  const activeSection = sections[activeSectionIndex];

  const sectionGroups = [
    {
      name: "Content",
      sections: sections.slice(0, 8),
    },
    {
      name: "Style",
      sections: sections.slice(8, 10),
    },
    {
      name: "AI Tools",
      sections: sections.slice(10),
    },
  ];

  useEffect(() => {
    if (token) {
      loadExistingResume();
      dispatch(resetAts());
      dispatch(resetCoverLetter());
      dispatch(resetInterview());
      dispatch(resetTailor());
    }
  }, [resumeId, token]);

  useEffect(() => {
    return () => {
      dispatch(resetAts());
      dispatch(resetCoverLetter());
    };
  }, [resumeId, dispatch]);

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Link
          to={"/app"}
          className="inline-flex items-center gap-2 text-sm text-muted transition-all hover:text-brand-600"
        >
          <ArrowLeftIcon className="size-4" /> Back to Dashboard
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">

        {/* Sticky top toolbar */}
        <div className="sticky top-0 z-30 bg-canvas pb-3 mb-6 border-b border-line">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TemplateSelector
                selectedTemplate={resumeData.template}
                onChange={(t) => setResumeData((prev) => ({ ...prev, template: t }))}
              />
              <ColorPicker
                selectedColor={resumeData.accent_color}
                onChange={(c) => setResumeData((prev) => ({ ...prev, accent_color: c }))}
              />
              <button
                onClick={() => { setShowQuickJump(true); setQuickJumpQuery(""); }}
                className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-muted transition hover:bg-canvas hover:text-ink"
              >
                <Search className="size-3.5 inline mr-1" />
                Quick jump
                <kbd className="ml-1.5 rounded border border-line bg-canvas px-1 text-[10px]">⌘K</kbd>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.open(`/view/${resumeId}?builder=true`, "_blank")}
                className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-muted transition hover:bg-canvas hover:text-ink"
              >
                <ExternalLink className="size-3.5" />
                Preview
              </button>
              {autoSaveStatus === "saving" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                  <Loader2 className="size-3 animate-spin" /> Saving…
                </span>
              )}
              {autoSaveStatus === "saved" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <CheckCircle2 className="size-3" /> Saved
                </span>
              )}
              {autoSaveStatus === "error" && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                  Save failed
                </span>
              )}
              <button
                onClick={saveResume}
                disabled={isLoading}
                className="btn-brand px-4 py-1.5 text-sm disabled:opacity-60"
              >
                {isLoading ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => setShowVersionHistory(true)}
                className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-muted transition hover:bg-canvas"
              >
                <History className="size-3.5" />
                History
              </button>
            </div>
          </div>
        </div>

        {/* Main 3-column grid */}
        <div className="grid lg:grid-cols-12 gap-6">

          {/* Left: Section Nav */}
          <div className="lg:col-span-3 max-lg:mb-6">
            <div className="sticky top-24 space-y-5">
              {sectionGroups.map((group) => (
                <div key={group.name}>
                  <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted">{group.name}</p>
                  {group.sections.map((section) => {
                    const idx = sections.indexOf(section);
                    const Icon = section.icon;
                    const isActive = idx === activeSectionIndex;
                    const val = resumeData[section.id];
                    const hasData = Array.isArray(val) ? val.length > 0 : typeof val === "string" ? val.length > 50 : typeof val === "object" && val ? Object.keys(val).length > 1 : false;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSectionIndex(idx)}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-brand-600 text-white"
                            : "text-muted hover:bg-line/20 hover:text-ink"
                        }`}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span className="flex-1 text-left truncate">{section.name}</span>
                        {hasData && !isActive && (
                          <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Center: Form */}
          <div className="lg:col-span-9 max-lg:mb-6">
            <div className="bg-surface rounded-xl border border-line p-6">
              <h2 className="text-lg font-semibold text-ink mb-5">{activeSection.name}</h2>
              <div className="space-y-6">
                {activeSection.id === "personal" && (
                  <PersonalInfoForm
                    data={resumeData.personal_info}
                    onChange={(data) => setResumeData({ ...resumeData, personal_info: data })}
                    removeBackground={removeBackground}
                    setRemoveBackground={setRemoveBackground}
                    resumeId={resumeId}
                  />
                )}
                {activeSection.id === "summary" && (
                  <ProfessionalSummary
                    data={resumeData.professional_summary}
                    onChange={(data) => setResumeData((prev) => ({ ...prev, professional_summary: data }))}
                    setResumeData={setResumeData}
                  />
                )}
                {activeSection.id === "experience" && (
                  <ExperienceForm
                    data={resumeData.experience}
                    onChange={(data) => setResumeData((prev) => ({ ...prev, experience: data }))}
                  />
                )}
                {activeSection.id === "education" && (
                  <EducationForm
                    data={resumeData.education}
                    onChange={(data) => setResumeData((prev) => ({ ...prev, education: data }))}
                  />
                )}
                {activeSection.id === "projects" && (
                  <ProjectForm
                    data={resumeData.project}
                    onChange={(data) => setResumeData((prev) => ({ ...prev, project: data }))}
                  />
                )}
                {activeSection.id === "skills" && (
                  <SkillsForm
                    data={resumeData.skills}
                    profession={resumeData.personal_info?.profession || ""}
                    token={token}
                    onChange={(data) => setResumeData((prev) => ({ ...prev, skills: data }))}
                  />
                )}
                {activeSection.id === "certifications" && (
                  <CertificationForm
                    data={resumeData.certifications || []}
                    onChange={(data) => setResumeData((prev) => ({ ...prev, certifications: data }))}
                  />
                )}
                {activeSection.id === "languages" && (
                  <LanguageForm
                    data={resumeData.languages || []}
                    onChange={(data) => setResumeData((prev) => ({ ...prev, languages: data }))}
                  />
                )}
                {activeSection.id === "sections" && (
                  <SectionManager
                    sectionHeadings={resumeData.section_headings}
                    onSectionHeadingsChange={(h) => setResumeData((prev) => ({ ...prev, section_headings: h }))}
                    customSections={resumeData.custom_sections}
                    onCustomSectionsChange={(cs) => setResumeData((prev) => ({ ...prev, custom_sections: cs }))}
                  />
                )}
                {activeSection.id === "styles" && (
                  <StylesPanel
                    styleOptions={resumeData.style_options}
                    onChange={(so) => setResumeData((prev) => ({ ...prev, style_options: so }))}
                    resumeData={resumeData}
                  />
                )}
                {activeSection.id === "score" && (
                  <ResumeScorePanel resumeId={resumeId} />
                )}
                {activeSection.id === "ats" && (
                  <div className="space-y-4">
                    <JD_Input_Panel resumeId={resumeId} />
                    <ATS_Results_Panel
                      resumeId={resumeId}
                      resumeData={resumeData}
                      onNavigateTab={(tabIndex) => setActiveSectionIndex(tabIndex)}
                      onReloadResume={loadExistingResume}
                    />
                  </div>
                )}
                {activeSection.id === "cover-letter" && (
                  <CoverLetterPanel resumeId={resumeId} resumeData={resumeData} />
                )}
                {activeSection.id === "tailor" && (
                  <TailorPanel
                    resumeId={resumeId}
                    onApplyTailored={(patch) => {
                      setResumeData((prev) => {
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
                )}
                {activeSection.id === "interview" && (
                  <InterviewPrepPanel resumeId={resumeId} />
                )}
              </div>
            </div>

            {/* Completeness bar */}
            {(() => {
              const { score, missing } = getCompleteness(resumeData);
              const { bar, text } = getCompletenessColor(score);
              return (
                <div className="mt-4 bg-surface rounded-xl border border-line p-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-body">Resume completeness</span>
                    <span className={`font-semibold tabular-nums ${text}`}>{score}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-line overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${bar}`} style={{ width: `${score}%` }} />
                  </div>
                  {missing.length > 0 && score < 100 && (
                    <p className="mt-1.5 text-[11px] text-muted">
                      Add: {missing.slice(0, 3).join(", ")}{missing.length > 3 ? ` +${missing.length - 3} more` : ""}
                    </p>
                  )}
                </div>
              );
            })()}
          </div>

        </div>
      </div>

      {/* Quick jump modal */}
      {showQuickJump && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={() => setShowQuickJump(false)}>
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
                placeholder="Jump to section…"
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
                      onClick={() => { setActiveSectionIndex(idx); setShowQuickJump(false); }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-body transition hover:bg-line/20 hover:text-ink"
                    >
                      <Icon className="size-4 shrink-0 text-muted" />
                      <span>{section.name}</span>
                    </button>
                  );
                })}
              {quickJumpQuery && sections.filter((s) => s.name.toLowerCase().includes(quickJumpQuery.toLowerCase())).length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-muted">No sections match "{quickJumpQuery}"</p>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {showVersionHistory && (
        <VersionHistoryPanel
          resumeId={resumeId}
          onRestore={handleRestore}
          onClose={() => setShowVersionHistory(false)}
        />
      )}
    </div>
  );
};

export default ResumeBuilder;
