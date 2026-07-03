import React, { useEffect } from "react";
import toast from "react-hot-toast";
import ResumePreview from "../components/ResumePreview";
import Loader from "../components/Loader";
import { ArrowLeftIcon, DownloadIcon } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import api from "../configs/api";
import Logo from "../components/Logo";

const Preview = () => {
  const { resumeId } = useParams();
  const cleanId = (resumeId || "").match(/[a-fA-F0-9]{24}/)?.[0] || resumeId;

  const [isLoading, setIsLoading] = React.useState(true);
  const [resumeData, setResumeData] = React.useState(null);

  const loadResume = async () => {
    try {
      const response = await api.get(`/api/resumes/public/${cleanId}`);
      const resume = response.data;
      const styleOptions = {
        fontFamily: "inter",
        fontSize: 14,
        lineSpacing: 1.5,
        sectionOrder: [],
        ...resume.style_options,
      };
      const normalized = {
        ...resume,
        accent_color: resume.accent_color?.startsWith("#")
          ? resume.accent_color
          : `#${resume.accent_color || "4F46E5"}`,
        style_options: styleOptions,
      };
      setResumeData(normalized);
      setIsLoading(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResume();
  }, [resumeId]);

  return resumeData ? (
    <div className="min-h-screen bg-canvas">
      {/* Public header — hidden when printing */}
      <header className="sticky top-0 z-40 border-b border-line bg-surface/80 backdrop-blur-md print:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/">
            <Logo className="h-8 w-auto text-ink" />
          </Link>
          <button
            onClick={async () => {
              const element = document.getElementById("resume-preview");
              if (!element) { window.print(); return; }
              try {
                const html2pdf = (await import("html2pdf.js")).default;
                const filename = (resumeData?.personal_info?.full_name || "resume")
                  .replace(/\s+/g, "_").toLowerCase() + "_resume.pdf";
                await html2pdf()
                  .set({
                    margin: 0,
                    filename,
                    image: { type: "jpeg", quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
                    jsPDF: { unit: "in", format: resumeData?.style_options?.pageSize || "letter", orientation: "portrait" },
                  })
                  .from(element)
                  .save();
              } catch { window.print(); }
            }}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-brand-700"
          >
            <DownloadIcon className="size-4" /> Download PDF
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-10 print:p-0">
        <ResumePreview
          data={resumeData}
          template={resumeData.template}
          accentColor={resumeData.accent_color}
          styleOptions={resumeData.style_options}
          classes="py-4 bg-white"
        />
      </div>
    </div>
  ) : (
    <div>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="flex h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
          <p className="text-7xl font-bold text-line">404</p>
          <p className="text-2xl font-semibold text-ink">Resume not found</p>
          <p className="max-w-sm text-sm text-muted">
            This resume may have been removed or set to private.
          </p>
          <Link to="/" className="btn-brand mt-2">
            <ArrowLeftIcon className="size-4" /> Go to home page
          </Link>
        </div>
      )}
    </div>
  );
};

export default Preview;
