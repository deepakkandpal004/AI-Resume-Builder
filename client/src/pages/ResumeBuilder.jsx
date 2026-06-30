import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import api from "../configs/api";
import {
  ArrowLeftIcon,
  Award,
  BarChart2,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  DownloadIcon,
  EyeIcon,
  EyeOffIcon,
  FileText,
  FolderIcon,
  GraduationCap,
  Languages,
  Mail,
  MessageSquare,
  Palette,
  Settings2,
  Share2Icon,
  Sparkles,
  Target,
  User,
} from "lucide-react";
import { resetAts } from "../app/features/atsSlice";
import { resetCoverLetter } from "../app/features/coverLetterSlice";
import { resetInterview } from "../app/features/interviewSlice";
import { resetTailor } from "../app/features/tailorSlice";
import JD_Input_Panel from "../components/ats/JD_Input_Panel";
import ATS_Results_Panel from "../components/ats/ATS_Results_Panel";
import CoverLetterPanel from "../components/coverLetter/CoverLetterPanel";
import InterviewPrepPanel from "../components/interviewPrep/InterviewPrepPanel";
import TailorPanel from "../components/tailor/TailorPanel";

import PersonalInfoForm from "../components/PersonalInfoForm";
import ResumePreview from "../components/ResumePreview";
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
    },
  });

  const [isLoading, setIsLoading] = useState(false);

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

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [removeBackground, setRemoveBackground] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState("idle"); // "idle" | "saving" | "saved" | "error"
  const autoSaveTimerRef = useRef(null);
  const isFirstLoad = useRef(true);

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
    { id: "ats",           name: "ATS Score",        icon: BarChart2    },
    { id: "tailor",        name: "Tailor to JD",     icon: Target       },
    { id: "cover-letter",  name: "Cover Letter",     icon: Mail         },
    { id: "interview",     name: "Interview Prep",   icon: MessageSquare},
  ];

  const activeSection = sections[activeSectionIndex];

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

  const changeResumeVisibility = async() => {
    try {
      const formData = new FormData();
      formData.append("resumeId", resumeId);
      formData.append("resumeData", JSON.stringify({ public: !resumeData.public }));
      const { data } = await api.put("/api/resumes/update", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResumeData({ ...resumeData, public: !resumeData.public });
      toast.success(data.message || "Resume visibility updated successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  }

  const handleShare = () => {
    const frontendUrl = window.location.href.split("/app")[0];
    const resumeUrl = frontendUrl + "/view/" + resumeId;

    if (navigator.share) {
      navigator.share({ url: resumeUrl, text: "Check out my resume!" });
    } else {
      navigator.clipboard.writeText(resumeUrl).then(() => {
        toast.success("Resume link copied to clipboard!");
      }).catch(() => {
        toast.error("Could not copy link. Please copy manually: " + resumeUrl);
      });
    }
  }

  const downloadResume = async () => {
    const element = document.getElementById("resume-preview");
    if (!element) { window.print(); return; }

    try {
      // Dynamically import to keep initial bundle size small
      const html2pdf = (await import("html2pdf.js")).default;
      const filename = (resumeData.title || "resume").replace(/\s+/g, "_").toLowerCase() + ".pdf";

      await html2pdf()
        .set({
          margin: 0,
          filename,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, letterRendering: true },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        })
        .from(element)
        .save();
    } catch {
      // Fallback to print if html2pdf fails
      window.print();
    }
  };
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
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Panel - Form */}
          <div className="relative lg:col-span-5 rounded-lg overflow-hidden">
            <div className="bg-surface rounded-lg shadow-sm border border-line p-6 pt-1">
              {/* progress bar using activeSectionIndex */}
              <hr className="absolute top-0 left-0 right-0 border-2 border-line" />
              <hr
                className="absolute top-0 left-0 h-1 bg-gradient-to-r from-brand-500 to-accent-500 border-none transition-all duration-500"
                style={{
                  width: `${
                    (activeSectionIndex * 100) / (sections.length - 1)
                  }%`,
                }}
              />

              {/* Section Navigation */}
              <div className="flex justify-between items-center mb-6 border-b border-line py-1">
                <div className="flex items-center gap-2">
                  <TemplateSelector
                    selectedTemplate={resumeData.template}
                    onChange={(template) => {
                      setResumeData((prev) => ({
                        ...prev,
                        template: template,
                      }));
                    }}
                  />
                  <ColorPicker
                    selectedColor={resumeData.accent_color}
                    onChange={(color) => {
                      setResumeData((prev) => ({
                        ...prev,
                        accent_color: color,
                      }));
                    }}
                  />
                </div>
                <div className="flex items-center">
                  {activeSectionIndex !== 0 && (
                    <button
                      className="flex items-center gap-1 p-3 rounded-lg text-sm font-medium text-muted hover:bg-canvas transition-all"
                      disabled={activeSectionIndex === 0}
                      onClick={() =>
                        setActiveSectionIndex((prevIndex) =>
                          Math.max(prevIndex - 1, 0)
                        )
                      }
                    >
                      <ChevronLeft className="size-4" /> Previous
                    </button>
                  )}
                  <button
                    className={`flex items-center gap-1 p-3 rounded-lg text-sm font-medium text-muted hover:bg-canvas transition-all ${
                      activeSectionIndex === sections.length - 1 && "opacity-50"
                    }`}
                    disabled={activeSectionIndex === sections.length - 1}
                    onClick={() =>
                      setActiveSectionIndex((prevIndex) =>
                        Math.min(prevIndex + 1, sections.length - 1)
                      )
                    }
                  >
                    {" "}
                    Next
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>

              {/* Section Tabs */}
              <div className="mb-6 flex gap-1 overflow-x-auto pb-1">
                {sections.map((section, index) => {
                  const Icon = section.icon;
                  const isActive = index === activeSectionIndex;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSectionIndex(index)}
                      className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-brand-600 text-white"
                          : "text-muted hover:bg-canvas hover:text-ink"
                      }`}
                    >
                      <Icon className="size-4" />
                      <span className="max-sm:hidden">{section.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Form Content */}
              <div className="space-y-6">
                {activeSection.id === "personal" && (
                  <PersonalInfoForm
                    data={resumeData.personal_info}
                    onChange={(data) => {
                      setResumeData({ ...resumeData, personal_info: data });
                    }}
                    removeBackground={removeBackground}
                    setRemoveBackground={setRemoveBackground}
                    resumeId={resumeId}
                  />
                )}
                {activeSection.id === "summary" && (
                  <ProfessionalSummary
                    data={resumeData.professional_summary}
                    onChange={(data) =>
                      setResumeData((prev) => ({
                        ...prev,
                        professional_summary: data,
                      }))
                    }
                    setResumeData={setResumeData}
                  />
                )}
                {activeSection.id === "experience" && (
                  <ExperienceForm
                    data={resumeData.experience}
                    onChange={(data) => {
                      setResumeData((prev) => ({
                        ...prev,
                        experience: data,
                      }));
                    }}
                  />
                )}

                {activeSection.id === "education" && (
                  <EducationForm
                    data={resumeData.education}
                    onChange={(data) => {
                      setResumeData((prev) => ({
                        ...prev,
                        education: data,
                      }));
                    }}
                  />
                )}

                {activeSection.id === "projects" && (
                  <ProjectForm
                    data={resumeData.project}
                    onChange={(data) => {
                      setResumeData((prev) => ({
                        ...prev,
                        project: data,
                      }));
                    }}
                  />
                )}

                {activeSection.id === "skills" && (
                  <SkillsForm
                    data={resumeData.skills}
                    onChange={(data) => {
                      setResumeData((prev) => ({
                        ...prev,
                        skills: data,
                      }));
                    }}
                  />
                )}

                {activeSection.id === "certifications" && (
                  <CertificationForm
                    data={resumeData.certifications || []}
                    onChange={(data) =>
                      setResumeData((prev) => ({ ...prev, certifications: data }))
                    }
                  />
                )}

                {activeSection.id === "languages" && (
                  <LanguageForm
                    data={resumeData.languages || []}
                    onChange={(data) =>
                      setResumeData((prev) => ({ ...prev, languages: data }))
                    }
                  />
                )}

                {activeSection.id === "sections" && (
                  <SectionManager
                    sectionHeadings={resumeData.section_headings}
                    onSectionHeadingsChange={(h) =>
                      setResumeData((prev) => ({ ...prev, section_headings: h }))
                    }
                    customSections={resumeData.custom_sections}
                    onCustomSectionsChange={(cs) =>
                      setResumeData((prev) => ({ ...prev, custom_sections: cs }))
                    }
                  />
                )}

                {activeSection.id === "styles" && (
                  <StylesPanel
                    styleOptions={resumeData.style_options}
                    onChange={(so) =>
                      setResumeData((prev) => ({ ...prev, style_options: so }))
                    }
                    resumeData={resumeData}
                  />
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

                        if (patch.professional_summary) {
                          updated.professional_summary = patch.professional_summary;
                        }
                        if (patch.skills) {
                          updated.skills = patch.skills;
                        }

                        // Merge tailored experience descriptions into existing entries
                        if (patch.experience_descriptions && updated.experience) {
                          updated.experience = updated.experience.map((exp, i) => {
                            const tailored = patch.experience_descriptions[i];
                            if (tailored?.description) {
                              return { ...exp, description: tailored.description };
                            }
                            return exp;
                          });
                        }

                        // Merge tailored project descriptions
                        if (patch.project_descriptions && updated.project) {
                          updated.project = updated.project.map((proj, i) => {
                            const tailored = patch.project_descriptions[i];
                            if (tailored?.description) {
                              return { ...proj, description: tailored.description };
                            }
                            return proj;
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
              {/* ── Completeness score ────────────────────────────── */}
              {(() => {
                const { score, missing } = getCompleteness(resumeData);
                const { bar, text } = getCompletenessColor(score);
                return (
                  <div className="mt-6 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-body">Resume completeness</span>
                      <span className={`font-semibold tabular-nums ${text}`}>{score}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-line overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${bar}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    {missing.length > 0 && score < 100 && (
                      <p className="text-[11px] text-muted">
                        Add: {missing.slice(0, 3).join(", ")}{missing.length > 3 ? ` +${missing.length - 3} more` : ""}
                      </p>
                    )}
                  </div>
                );
              })()}

              <button
                onClick={saveResume}
                disabled={isLoading}
                className="btn-brand mt-4 px-6 py-2 text-sm disabled:opacity-60"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
              {/* Auto-save status indicator */}
              {autoSaveStatus === "saving" && (
                <p className="mt-2 text-xs text-muted animate-pulse">Auto-saving…</p>
              )}
              {autoSaveStatus === "saved" && (
                <p className="mt-2 text-xs text-teal-600 dark:text-teal-400">✓ Auto-saved</p>
              )}
              {autoSaveStatus === "error" && (
                <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">⚠ Auto-save failed — click Save to retry</p>
              )}
            </div>
          </div>

          {/* Right Panel - Resume Preview */}
          <div className="lg:col-span-7 max-lg:mt-6">
            <div className="relative w-full">
              <div className="absolute bottom-3 left-0 right-0 flex items-center justify-end gap-2">
                {resumeData.public && (
                  <button onClick={handleShare} className="flex items-center gap-2 rounded-lg bg-accent-50 px-4 py-2 text-xs font-medium text-accent-700 transition-colors hover:bg-accent-100 dark:bg-accent-500/10 dark:text-accent-300 dark:hover:bg-accent-500/20">
                    <Share2Icon className="size-4"/> Share 
                  </button>
                )}
                <button onClick={changeResumeVisibility} className="flex items-center gap-2 rounded-lg bg-canvas px-4 py-2 text-xs font-medium text-body ring-1 ring-line transition-colors hover:bg-surface">
                  {resumeData.public ? <EyeIcon className="size-4"/> : <EyeOffIcon className="size-4"/>}
                  {resumeData.public ? 'Public' : 'Private'}
                </button>
                <button onClick={downloadResume} className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-700">
                  <DownloadIcon className="size-4"/> Download
                </button>
                </div>
              </div>
            <ResumePreview
              data={resumeData}
              accentColor={resumeData.accent_color}
              template={resumeData.template}
              styleOptions={resumeData.style_options}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
