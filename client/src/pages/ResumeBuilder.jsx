import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import api from "../configs/api";
import {
  ArrowLeftIcon,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  DownloadIcon,
  EyeIcon,
  EyeOffIcon,
  FileText,
  FolderIcon,
  GraduationCap,
  Share2Icon,
  Sparkles,
  User,
} from "lucide-react";

import PersonalInfoForm from "../components/PersonalInfoForm";
import ResumePreview from "../components/ResumePreview";
import TemplateSelector from "../components/TemplateSelector";
import ColorPicker from "../components/ColorPicker";
import ProfessionalSummary from "../components/ProfessionalSummary";
import ExperienceForm from "../components/ExperienceForm";
import EducationForm from "../components/EducationForm";
import ProjectForm from "../components/ProjectForm";
import SkillsForm from "../components/SkillsForm";

const ResumeBuilder = () => {
  const { resumeId } = useParams();
  const { token } = useSelector((state) => state.auth);

  const [resumeData, setResumeData] = useState({
    _id: "",
    title: "",
    personal_info: {},
    professional_summary: "",
    experience: [],
    education: [],
    project: [],
    skills: [],
    template: "classic",
    accent_color: "#4F46E5",
    public: false,
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
            : `#${data.resume.accent_color || "4F46E5"}`
        };
        setResumeData(normalized);
        document.title = data.resume.title;
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const saveResume = async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("resumeId", resumeId);

      let resumeDataToSend = { ...resumeData };
      if (resumeDataToSend.personal_info) {
        resumeDataToSend = {
          ...resumeDataToSend,
          personal_info: { ...resumeDataToSend.personal_info }
        };

        if (typeof resumeDataToSend.personal_info.image === 'object' && resumeDataToSend.personal_info.image !== null) {
          formData.append("image", resumeDataToSend.personal_info.image);
          resumeDataToSend.personal_info.image = "";
        }
      }

      formData.append("resumeData", JSON.stringify(resumeDataToSend));
      formData.append("removeBackground", removeBackground);
      
      await api.put("/api/resumes/update", formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data" 
        },
      });
      toast.success("Resume saved successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [removeBackground, setRemoveBackground] = useState(false);

  const sections = [
    { id: "personal", name: "Personal Info", icon: User },
    { id: "summary", name: "Summary", icon: FileText },
    { id: "experience", name: "Experience", icon: Briefcase },
    { id: "education", name: "Education", icon: GraduationCap },
    { id: "projects", name: "Projects", icon: FolderIcon },
    { id: "skills", name: "Skills", icon: Sparkles },
  ];

  const activeSection = sections[activeSectionIndex];

  useEffect(() => {
    if (token) {
      loadExistingResume();
    }
  }, [resumeId, token]);

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

    if(navigator.share){
      navigator.share({url: resumeUrl, text: "Check out my resume!"});
    } else {
      alert('share not supported on this browser');
    }
  }

  const downloadResume = () => {
    window.print();
  }
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
            <div className="bg-white rounded-lg shadow-sm border border-line p-6 pt-1">
              {/* progress bar using activeSectionIndex */}
              <hr className="absolute top-0 left-0 right-0 border-2 border-gray-200" />
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
                      className="flex items-center gap-1 p-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
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
                    className={`flex items-center gap-1 p-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all ${
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
              </div>
              <button
                onClick={saveResume}
                disabled={isLoading}
                className="btn-brand mt-6 px-6 py-2 text-sm disabled:opacity-60"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Right Panel - Resume Preview */}
          <div className="lg:col-span-7 max-lg:mt-6">
            <div className="relative w-full">
              <div className="absolute bottom-3 left-0 right-0 flex items-center justify-end gap-2">
                {resumeData.public && (
                  <button onClick={handleShare} className="flex items-center gap-2 rounded-lg bg-accent-50 px-4 py-2 text-xs font-medium text-accent-700 transition-colors hover:bg-accent-100">
                    <Share2Icon className="size-4"/> Share 
                  </button>
                )}
                <button onClick={changeResumeVisibility} className="flex items-center gap-2 rounded-lg bg-canvas px-4 py-2 text-xs font-medium text-body ring-1 ring-line transition-colors hover:bg-white">
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
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
