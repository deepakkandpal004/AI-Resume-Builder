import {
  FileTextIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UploadCloud,
  UploadCloudIcon,
  XIcon,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import api from "../configs/api";
import pdfToText from "react-pdftotext";

// Lightweight modal wrapper
const Modal = ({ onClose, title, children }) => (
  <div
    onClick={onClose}
    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-xl"
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        <button
          onClick={onClose}
          className="text-muted transition hover:text-ink"
          aria-label="Close"
        >
          <XIcon className="size-5" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const Dashboard = () => {
  const { user, token } = useSelector((state) => state.auth);
  const accents = ["#4F46E5", "#0D9488", "#7C3AED", "#2563EB", "#E11D48", "#D97706"];

  const [allResumes, setAllResumes] = useState([]);
  const [showCreateResume, setShowCreateResume] = useState(false);
  const [showUploadResume, setShowUploadResume] = useState(false);
  const [title, setTitle] = useState("");
  const [resume, setResume] = useState(null);
  const [editResumeId, setEditResumeId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const loadAllResumes = async () => {
    try {
      const { data } = await api.get("/api/users/resumes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllResumes(Array.isArray(data.resumes) ? data.resumes : []);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
      setAllResumes([]);
    }
  };

  const createResume = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(
        "/api/resumes/create",
        { title },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAllResumes([...allResumes, data.resume]);
      setTitle("");
      setShowCreateResume(false);
      navigate(`/app/builder/${data.resume._id}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const uploadResume = async (e) => {
    e.preventDefault();
    if (!resume) {
      toast.error("Please select a resume file");
      return;
    }
    setIsLoading(true);
    try {
      const resumeText = await pdfToText(resume);
      const { data } = await api.post(
        "/api/ai/upload-resume",
        { title, resumeText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Resume uploaded successfully");
      setTitle("");
      setResume(null);
      setShowUploadResume(false);
      navigate(`/app/builder/${data.resumeId}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
    setIsLoading(false);
  };

  const editTitle = async (e) => {
    e.preventDefault();
    const target = allResumes.find((r) => r._id === editResumeId);
    if (!target) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("resumeId", editResumeId);
      // Send personal_info too so the server doesn't clobber it
      formData.append(
        "resumeData",
        JSON.stringify({ title, personal_info: target.personal_info || {} })
      );
      await api.put("/api/resumes/update", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllResumes((prev) =>
        prev.map((r) => (r._id === editResumeId ? { ...r, title } : r))
      );
      toast.success("Title updated");
      setEditResumeId("");
      setTitle("");
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
    setIsLoading(false);
  };

  const deleteResume = async (resumeId) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;
    try {
      await api.delete(`/api/resumes/delete/${resumeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllResumes((prev) => prev.filter((r) => r._id !== resumeId));
      toast.success("Resume deleted");
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (token) loadAllResumes();
  }, [token]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">
          Welcome back, {user?.name || "there"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Create a new resume or pick up where you left off.
        </p>
      </div>

      {/* Action tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
        <button
          onClick={() => setShowCreateResume(true)}
          className="group flex items-center gap-4 rounded-2xl border border-dashed border-line bg-surface p-5 text-left transition-all hover:border-brand-400 hover:shadow-md"
        >
          <span className="flex size-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:group-hover:bg-brand-500/20">
            <PlusIcon className="size-6" />
          </span>
          <span>
            <span className="block font-semibold text-ink">Create Resume</span>
            <span className="block text-sm text-muted">Start from scratch</span>
          </span>
        </button>

        <button
          onClick={() => setShowUploadResume(true)}
          className="group flex items-center gap-4 rounded-2xl border border-dashed border-line bg-surface p-5 text-left transition-all hover:border-accent-500 hover:shadow-md"
        >
          <span className="flex size-12 items-center justify-center rounded-xl bg-accent-50 text-accent-600 transition-colors group-hover:bg-accent-100 dark:bg-accent-500/10 dark:text-accent-300 dark:group-hover:bg-accent-500/20">
            <UploadCloudIcon className="size-6" />
          </span>
          <span>
            <span className="block font-semibold text-ink">Upload Existing</span>
            <span className="block text-sm text-muted">Import a PDF resume</span>
          </span>
        </button>
      </div>

      <div className="my-8 flex items-center gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Your Resumes
        </h2>
        <span className="rounded-full bg-canvas px-2 py-0.5 text-xs text-muted">
          {allResumes.length}
        </span>
      </div>

      {/* Resume grid */}
      {allResumes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface py-16 text-center">
          <FileTextIcon className="mx-auto mb-3 size-10 text-muted/60" />
          <p className="text-sm text-muted">
            No resumes yet. Create or upload one to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {allResumes.map((r, index) => {
            const accent =
              r.accent_color?.startsWith("#")
                ? r.accent_color
                : accents[index % accents.length];
            return (
              <div
                key={r._id}
                onClick={() => navigate(`/app/builder/${r._id}`)}
                className="group relative flex h-52 cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface p-4 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Accent strip */}
                <span
                  className="absolute inset-x-0 top-0 h-1.5"
                  style={{ backgroundColor: accent }}
                />

                <span
                  className="flex size-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: accent + "1A", color: accent }}
                >
                  <FileTextIcon className="size-6" />
                </span>

                <div>
                  <p className="line-clamp-2 font-semibold text-ink">{r.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    Updated {new Date(r.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Hover actions */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-2 top-2.5 hidden items-center gap-1 group-hover:flex"
                >
                  <button
                    onClick={() => {
                      setEditResumeId(r._id);
                      setTitle(r.title);
                    }}
                    className="rounded-lg bg-surface/90 p-1.5 text-muted shadow-sm transition hover:text-brand-600"
                    aria-label="Edit title"
                  >
                    <PencilIcon className="size-4" />
                  </button>
                  <button
                    onClick={() => deleteResume(r._id)}
                    className="rounded-lg bg-surface/90 p-1.5 text-muted shadow-sm transition hover:text-rose-600"
                    aria-label="Delete resume"
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      {showCreateResume && (
        <Modal
          title="Create a Resume"
          onClose={() => {
            setShowCreateResume(false);
            setTitle("");
          }}
        >
          <form onSubmit={createResume}>
            <input
              onChange={(e) => setTitle(e.target.value)}
              value={title}
              type="text"
              placeholder="Enter resume title"
              className="mb-4 w-full px-4 py-2.5"
              required
            />
            <button type="submit" className="btn-brand w-full">
              Create Resume
            </button>
          </form>
        </Modal>
      )}

      {/* Upload modal */}
      {showUploadResume && (
        <Modal
          title="Upload Resume"
          onClose={() => {
            setShowUploadResume(false);
            setTitle("");
            setResume(null);
          }}
        >
          <form onSubmit={uploadResume}>
            <input
              onChange={(e) => setTitle(e.target.value)}
              value={title}
              type="text"
              placeholder="Enter resume title"
              className="mb-4 w-full px-4 py-2.5"
              required
            />
            <label htmlFor="resume-input" className="block text-sm text-body">
              Select resume file
              <div className="my-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line p-6 text-muted transition-colors hover:border-accent-500 hover:text-accent-700">
                {resume ? (
                  <p className="font-medium text-accent-700">{resume.name}</p>
                ) : (
                  <>
                    <UploadCloud className="size-10 stroke-[1.5]" />
                    <p className="text-sm">Click to upload a PDF</p>
                  </>
                )}
              </div>
            </label>
            <input
              type="file"
              id="resume-input"
              accept=".pdf"
              hidden
              onChange={(e) => setResume(e.target.files[0])}
            />
            <button type="submit" disabled={isLoading} className="btn-brand w-full disabled:opacity-60">
              {isLoading ? "Processing..." : "Upload & Continue"}
            </button>
          </form>
        </Modal>
      )}

      {/* Edit title modal */}
      {editResumeId && (
        <Modal
          title="Edit Resume Title"
          onClose={() => {
            setEditResumeId("");
            setTitle("");
          }}
        >
          <form onSubmit={editTitle}>
            <input
              onChange={(e) => setTitle(e.target.value)}
              value={title}
              type="text"
              placeholder="Enter resume title"
              className="mb-4 w-full px-4 py-2.5"
              required
            />
            <button type="submit" disabled={isLoading} className="btn-brand w-full disabled:opacity-60">
              {isLoading ? "Saving..." : "Update"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;
