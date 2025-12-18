import React, { useEffect } from "react";
import toast from "react-hot-toast";
import ResumePreview from "../components/ResumePreview";
import Loader from "../components/Loader";
import { ArrowLeftIcon } from "lucide-react";
import { useParams } from "react-router-dom";
import api from "../configs/api";

const Preview = () => {
  const { resumeId } = useParams();
  const cleanId = (resumeId || "").match(/[a-fA-F0-9]{24}/)?.[0] || resumeId;

  const [isLoading, setIsLoading] = React.useState(true);

  const [resumeData, setResumeData] = React.useState(null);

  const loadResume = async () => {
    try {
      const response = await api.get(`/api/resumes/public/${cleanId}`);
      const resume = response.data;
      const normalized = {
        ...resume,
        accent_color: resume.accent_color?.startsWith("#")
          ? resume.accent_color
          : `#${resume.accent_color || "3B82F6"}`
      };
      setResumeData(normalized);
      setIsLoading(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
    finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResume();
  }, [resumeId]);
  return resumeData ? (
    <div className="bg-slate-100">
      <div className="max-w-3xl mx-auto py-10">
        <ResumePreview data={resumeData} template={resumeData.template} accentColor={resumeData.accent_color} classes="py-4 bg-white"/>
      </div>
    </div>
    ):(
      <div>
        {isLoading ? <Loader/> : (
          <div className="flex flex-col items-center justify-center h-screen gap-4">
            <p className="text-center text-6xl text-slate-400 font-medium">Resume not found</p>
            <a href="/" className="mt-6 bg-green-500 hover:bg-green-600 text-white px-6 h-9 m-1 ring-offset-1 ring-1 ring-green-400 rounded-full flex items-center transition-colors">
              <ArrowLeftIcon className="mr-2 size-4"/> Go to home page
            </a>
          </div>
        )}
      </div>
    );
};

export default Preview;
