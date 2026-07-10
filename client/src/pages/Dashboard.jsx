import {
  Copy,
  FileTextIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UploadCloud,
  UploadCloudIcon,
  XIcon,
  Sparkles,
  Search,
  ArrowUpDown,
  ChevronDown,
  MoreVertical,
  LayoutGrid,
  List,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../configs/api";
import pdfToText from "react-pdftotext";
import ClassicTemplate from "../components/templates/ClassicTemplate";
import ModernTemplate from "../components/templates/ModernTemplate";
import MinimalTemplate from "../components/templates/MinimalTemplate";
import ExecutiveTemplate from "../components/templates/ExecutiveTemplate";
import CreativeTemplate from "../components/templates/CreativeTemplate";
import CompactTemplate from "../components/templates/CompactTemplate";
import MinimalImageTemplate from "../components/templates/MinimalImageTemplate";

const getAtsColor = (score) => {
  if (score >= 75) return { bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-300" };
  if (score >= 50) return { bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-700 dark:text-amber-300" };
  return { bg: "bg-rose-50 dark:bg-rose-500/10", text: "text-rose-700 dark:text-rose-300" };
};

const TEMPLATE_LABELS = {
  classic: "Classic", modern: "Modern", minimal: "Minimal",
  "minimal-image": "Minimal + Photo", executive: "Executive",
  creative: "Creative", compact: "Compact",
};

const TEMPLATE_MAP = {
  classic: ClassicTemplate, modern: ModernTemplate, minimal: MinimalTemplate,
  "minimal-image": MinimalImageTemplate, executive: ExecutiveTemplate,
  creative: CreativeTemplate, compact: CompactTemplate,
};

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return new Date(date).toLocaleDateString();
};

const stagger = {
  initial: { opacity: 0, y: 16 },
  animate: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.03 * i, duration: 0.35 } }),
};

const Modal = ({ onClose, title, children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
    className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      onClick={(e) => e.stopPropagation()}
      className="relative w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-xl"
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        <button onClick={onClose} className="rounded-lg p-1.5 text-muted transition hover:bg-line/30 hover:text-ink" aria-label="Close">
          <XIcon className="size-5" />
        </button>
      </div>
      {children}
    </motion.div>
  </motion.div>
);

const Dashboard = () => {
  void motion;
  const { user, token } = useSelector((state) => state.auth);
  const accents = ["#10b981", "#2dd4bf", "#6366f1", "#2563EB", "#E11D48", "#D97706"];

  const [allResumes, setAllResumes] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState("");
  const [resume, setResume] = useState(null);
  const [editResumeId, setEditResumeId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showSort, setShowSort] = useState(false);
  const [menuCardId, setMenuCardId] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
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
    } finally {
      setLoadingResumes(false);
    }
  };

  const createResume = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(
        "/api/resumes/create", { title, template: selectedTemplate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAllResumes((prev) => [...prev, data.resume]);
      setTitle(""); setShowCreate(false);
      navigate(`/app/builder/${data.resume._id}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const uploadResume = async (e) => {
    e.preventDefault();
    if (!resume) { toast.error("Please select a resume file"); return; }
    setIsLoading(true);
    try {
      const resumeText = await pdfToText(resume);
      const { data } = await api.post(
        "/api/ai/upload-resume", { title, resumeText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Resume uploaded successfully");
      setTitle(""); setResume(null); setShowUpload(false);
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
      formData.append("resumeData", JSON.stringify({ title, personal_info: target.personal_info || {} }));
      await api.put("/api/resumes/update", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllResumes((prev) => prev.map((r) => (r._id === editResumeId ? { ...r, title } : r)));
      toast.success("Title updated");
      setEditResumeId(""); setTitle("");
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
    setIsLoading(false);
  };

  const deleteResume = async (resumeId) => {
    try {
      await api.delete(`/api/resumes/delete/${resumeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllResumes((prev) => prev.filter((r) => r._id !== resumeId));
      toast.success("Resume deleted");
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const duplicateResume = async (resumeId) => {
    try {
      const { data } = await api.post(
        `/api/resumes/duplicate/${resumeId}`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAllResumes((prev) => [...prev, data.resume]);
      toast.success("Resume duplicated");
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    if (token) loadAllResumes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filtered = allResumes
    .filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.updatedAt) - new Date(a.updatedAt);
      if (sortBy === "oldest") return new Date(a.updatedAt) - new Date(b.updatedAt);
      if (sortBy === "name-asc") return a.title.localeCompare(b.title);
      if (sortBy === "name-desc") return b.title.localeCompare(a.title);
      return 0;
    });

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "name-asc", label: "Name A-Z" },
    { value: "name-desc", label: "Name Z-A" },
  ];

  const inputClass = "w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-all duration-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/15 placeholder:text-muted";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-7xl px-4 py-10 md:px-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-ink">
          Welcome back, {user?.name || "there"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Create a new resume or pick up where you left off.
        </p>
      </motion.div>

      {/* Action tiles */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <button
          onClick={() => { setShowCreate(true); setSelectedTemplate("classic"); }}
          className="group flex items-center gap-4 rounded-2xl border border-dashed border-line bg-surface p-5 text-left transition-all hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:group-hover:bg-emerald-500/20">
            <PlusIcon className="size-6" />
          </span>
          <span>
            <span className="block font-semibold text-ink">Create Resume</span>
            <span className="block text-sm text-muted">Start from scratch</span>
          </span>
        </button>

        <button
          onClick={() => setShowUpload(true)}
          className="group flex items-center gap-4 rounded-2xl border border-dashed border-line bg-surface p-5 text-left transition-all hover:-translate-y-0.5 hover:border-teal-400 hover:shadow-lg hover:shadow-teal-500/10"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 transition-colors group-hover:bg-teal-100 dark:bg-teal-500/10 dark:text-teal-300 dark:group-hover:bg-teal-500/20">
            <UploadCloudIcon className="size-6" />
          </span>
          <span>
            <span className="block font-semibold text-ink">Upload Existing</span>
            <span className="block text-sm text-muted">Import a PDF resume</span>
          </span>
        </button>
      </motion.div>

      {/* Section label + Search & sort */}
      <div className="my-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Your Resumes</h2>
          <span className="rounded-full bg-line/30 px-2 py-0.5 text-xs text-muted">{filtered.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center rounded-xl border border-line overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition ${viewMode === "grid" ? "bg-surface text-emerald-600" : "bg-canvas text-muted hover:text-ink"}`}
              title="Grid view"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition ${viewMode === "list" ? "bg-surface text-emerald-600" : "bg-canvas text-muted hover:text-ink"}`}
              title="List view"
            >
              <List className="size-4" />
            </button>
          </div>
          <div className="relative flex-1 sm:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search resumes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-line bg-surface py-2 pl-9 pr-8 text-sm text-ink outline-none transition-all duration-200 placeholder:text-muted focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/15 sm:w-48"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-0.5 text-muted transition hover:text-ink"
              >
                <XIcon className="size-4" />
              </button>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-sm text-muted transition hover:border-emerald-400 hover:text-ink"
            >
              <ArrowUpDown className="size-3.5" />
              {sortOptions.find((o) => o.value === sortBy)?.label}
              <ChevronDown className="size-3.5" />
            </button>
            {showSort && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowSort(false)} />
                <div className="absolute right-0 z-40 mt-1 w-40 overflow-hidden rounded-xl border border-line bg-surface shadow-lg">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setShowSort(false); }}
                      className={`w-full px-3 py-2 text-left text-sm transition hover:bg-line/20 ${sortBy === opt.value ? "font-medium text-emerald-600" : "text-muted"}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Resume grid */}
      <AnimatePresence mode="wait">
        {loadingResumes ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse relative flex h-72 flex-col overflow-hidden rounded-2xl border border-line bg-surface p-4">
                <span className="absolute inset-x-0 top-0 h-1.5 rounded-t-2xl bg-line" />
                <div className="flex-1 rounded-lg bg-line/60" />
                <div className="mt-2 flex items-start gap-2">
                  <div className="size-7 rounded-lg bg-line" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-3/4 rounded bg-line" />
                    <div className="h-2.5 w-1/3 rounded bg-line" />
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between pt-2 border-t border-line/40">
                  <div className="h-4 w-12 rounded-full bg-line" />
                  <div className="flex gap-1">
                    <div className="size-6 rounded-lg bg-line" />
                    <div className="size-6 rounded-lg bg-line" />
                    <div className="size-6 rounded-lg bg-line" />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        ) : allResumes.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-dashed border-line bg-surface py-20 text-center"
          >
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
              <FileTextIcon className="size-8 text-emerald-500" />
            </div>
            <p className="text-sm font-medium text-ink">No resumes yet</p>
            <p className="mt-1 text-sm text-muted">Create a new resume or upload a PDF to get started.</p>
            <button
              onClick={() => { setShowCreate(true); setSelectedTemplate("classic"); }}
              className="btn-primary mt-6 px-6 py-2.5 text-sm"
            >
              <PlusIcon className="size-4" />
              Create your first resume
            </button>
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div
            key="no-results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-dashed border-line bg-surface py-16 text-center"
          >
            <Search className="mx-auto mb-3 size-10 text-muted stroke-[1.5]" />
            <p className="text-sm font-medium text-ink">No resumes match "{searchQuery}"</p>
            <p className="mt-1 text-sm text-muted">Try a different search term.</p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-4 rounded-xl border border-line bg-surface px-4 py-2 text-sm text-muted transition hover:text-ink"
            >
              Clear search
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial="initial"
            animate="animate"
            className={viewMode === "grid" ? "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "flex flex-col gap-3"}
          >
            {filtered.map((r, index) => {
              const accent = r.accent_color?.startsWith("#") ? r.accent_color : accents[index % accents.length];
              const templateLabel = TEMPLATE_LABELS[r.template] || r.template || "Classic";
              const ats = r.lastAts;
              const atsColor = ats ? getAtsColor(ats.atsScore) : null;

              return (
                <motion.div
                  key={r._id}
                  custom={index}
                  variants={stagger}
                  layout
                  onClick={() => navigate(`/app/builder/${r._id}`)}
                  onContextMenu={(e) => { e.preventDefault(); setMenuCardId(menuCardId === r._id ? null : r._id); }}
                  className={viewMode === "grid"
                    ? "group relative flex h-72 cursor-pointer flex-col overflow-hidden rounded-2xl border border-line bg-surface p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/5"
                    : "group relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-xl border border-line bg-surface px-4 py-3 transition-all duration-200 hover:bg-line/10"
                  }
                >
                  {viewMode === "grid" ? (
                    <>
                      <span className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: accent }} />
                      <div className="relative flex-1 min-h-0 rounded-lg overflow-hidden bg-canvas/30 flex items-center justify-center p-2">
                        <div className="resume-preview relative w-full h-full bg-white shadow-sm rounded overflow-hidden border border-line/10 text-slate-900">
                          {(() => {
                            const Preview = TEMPLATE_MAP[r.template] || ClassicTemplate;
                            return (
                              <div
                                className="origin-top"
                                style={{
                                  transform: "scale(0.14)",
                                  width: "calc(100% / 0.14)",
                                  transformOrigin: "top left",
                                }}
                              >
                                <Preview
                                  data={r}
                                  accentColor={accent}
                                  styleOptions={{ fontSize: 11, lineSpacing: 1.3, pageSize: "letter" }}
                                />
                              </div>
                            );
                          })()}
                          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent" />
                        </div>
                      </div>
                      <div className="mt-2 flex items-start gap-2 min-w-0">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: accent + "1A", color: accent }}>
                          <FileTextIcon className="size-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-ink">{r.title}</p>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="rounded-full bg-line/20 px-1.5 py-0.5 text-[9px] text-muted border border-line/50">{templateLabel}</span>
                            <span className="text-[9px] text-muted">{timeAgo(r.updatedAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between pt-2 border-t border-line/40">
                        <div>
                          {ats && (
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums ${atsColor.bg} ${atsColor.text}`}>
                              ATS {ats.atsScore}%
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="hidden sm:flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                            <button onClick={(e) => { e.stopPropagation(); setEditResumeId(r._id); setTitle(r.title); }} className="rounded-lg p-1 text-muted transition hover:bg-line/30 hover:text-emerald-600" title="Rename">
                              <PencilIcon className="size-3" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); duplicateResume(r._id); }} className="rounded-lg p-1 text-muted transition hover:bg-line/30 hover:text-teal-600" title="Duplicate">
                              <Copy className="size-3" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(r._id); }} className="rounded-lg p-1 text-muted transition hover:bg-line/30 hover:text-rose-600" title="Delete">
                              <TrashIcon className="size-3" />
                            </button>
                          </div>
                          <div className="relative sm:hidden">
                            <button
                              onClick={(e) => { e.stopPropagation(); setMenuCardId(menuCardId === r._id ? null : r._id); }}
                              className="rounded-lg p-1 text-muted transition hover:bg-line/30"
                            >
                              <MoreVertical className="size-3.5" />
                            </button>
                            {menuCardId === r._id && (
                              <>
                                <div className="fixed inset-0 z-30" onClick={(e) => { e.stopPropagation(); setMenuCardId(null); }} />
                                <div className="absolute right-0 bottom-full z-40 mb-1 w-32 overflow-hidden rounded-xl border border-line bg-surface shadow-lg">
                                  <button onClick={(e) => { e.stopPropagation(); setEditResumeId(r._id); setTitle(r.title); setMenuCardId(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted transition hover:bg-line/20 hover:text-emerald-600">
                                    <PencilIcon className="size-3" /> Rename
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); duplicateResume(r._id); setMenuCardId(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted transition hover:bg-line/20 hover:text-teal-600">
                                    <Copy className="size-3" /> Duplicate
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(r._id); setMenuCardId(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted transition hover:bg-line/20 hover:text-rose-600">
                                    <TrashIcon className="size-3" /> Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {menuCardId === r._id && (
                        <div
                          className="absolute right-2 top-12 z-40 hidden w-32 overflow-hidden rounded-xl border border-line bg-surface shadow-lg sm:block"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button onClick={() => { setEditResumeId(r._id); setTitle(r.title); setMenuCardId(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted transition hover:bg-line/20 hover:text-emerald-600">
                            <PencilIcon className="size-3" /> Rename
                          </button>
                          <button onClick={() => { duplicateResume(r._id); setMenuCardId(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted transition hover:bg-line/20 hover:text-teal-600">
                            <Copy className="size-3" /> Duplicate
                          </button>
                          <button onClick={() => { setDeleteConfirmId(r._id); setMenuCardId(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted transition hover:bg-line/20 hover:text-rose-600">
                            <TrashIcon className="size-3" /> Delete
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: accent }} />
                      <div className="resume-preview relative size-12 shrink-0 rounded-lg overflow-hidden bg-white text-slate-900">
                        {(() => {
                          const Preview = TEMPLATE_MAP[r.template] || ClassicTemplate;
                          return (
                            <div
                              className="origin-top"
                              style={{
                                transform: "scale(0.07)",
                                width: "calc(100% / 0.07)",
                                transformOrigin: "top left",
                              }}
                            >
                              <Preview
                                data={r}
                                accentColor={accent}
                                styleOptions={{ fontSize: 11, lineSpacing: 1.3, pageSize: "letter" }}
                              />
                            </div>
                          );
                        })()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{r.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted">
                          <span>{templateLabel}</span>
                          <span>·</span>
                          <span>{timeAgo(r.updatedAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {ats && (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums ${atsColor.bg} ${atsColor.text}`}>
                            {ats.atsScore}%
                          </span>
                        )}
                        <div className="hidden sm:flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          <button onClick={(e) => { e.stopPropagation(); setEditResumeId(r._id); setTitle(r.title); }} className="rounded-lg p-1.5 text-muted transition hover:bg-line/30 hover:text-emerald-600" title="Rename">
                            <PencilIcon className="size-3.5" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); duplicateResume(r._id); }} className="rounded-lg p-1.5 text-muted transition hover:bg-line/30 hover:text-teal-600" title="Duplicate">
                            <Copy className="size-3.5" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(r._id); }} className="rounded-lg p-1.5 text-muted transition hover:bg-line/30 hover:text-rose-600" title="Delete">
                            <TrashIcon className="size-3.5" />
                          </button>
                        </div>
                        <div className="relative sm:hidden">
                          <button
                            onClick={(e) => { e.stopPropagation(); setMenuCardId(menuCardId === r._id ? null : r._id); }}
                            className="rounded-lg p-1.5 text-muted transition hover:bg-line/30"
                          >
                            <MoreVertical className="size-4" />
                          </button>
                          {menuCardId === r._id && (
                            <>
                              <div className="fixed inset-0 z-30" onClick={(e) => { e.stopPropagation(); setMenuCardId(null); }} />
                              <div className="absolute right-0 top-full z-40 mt-1 w-32 overflow-hidden rounded-xl border border-line bg-surface shadow-lg">
                                <button onClick={(e) => { e.stopPropagation(); setEditResumeId(r._id); setTitle(r.title); setMenuCardId(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted transition hover:bg-line/20 hover:text-emerald-600">
                                  <PencilIcon className="size-3" /> Rename
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); duplicateResume(r._id); setMenuCardId(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted transition hover:bg-line/20 hover:text-teal-600">
                                  <Copy className="size-3" /> Duplicate
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(r._id); setMenuCardId(null); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted transition hover:bg-line/20 hover:text-rose-600">
                                  <TrashIcon className="size-3" /> Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showCreate && (
          <Modal title="Create a Resume" onClose={() => { setShowCreate(false); setTitle(""); setSelectedTemplate("classic"); }}>
            <form onSubmit={createResume}>
              <input onChange={(e) => setTitle(e.target.value)} value={title} type="text" placeholder="Enter resume title" className={inputClass} required />
              <div className="mt-4">
                <p className="mb-2 text-xs font-medium text-muted uppercase tracking-wide">Template</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "classic", label: "Classic", color: "#6366f1" },
                    { id: "modern", label: "Modern", color: "#10b981" },
                    { id: "minimal", label: "Minimal", color: "#2dd4bf" },
                    { id: "executive", label: "Executive", color: "#2563EB" },
                    { id: "creative", label: "Creative", color: "#E11D48" },
                    { id: "compact", label: "Compact", color: "#D97706" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTemplate(t.id)}
                      className={`rounded-xl border px-2 py-2 text-center text-xs font-medium transition-all ${
                        selectedTemplate === t.id
                          ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                          : "border-line text-muted hover:border-line/80 hover:text-ink"
                      }`}
                    >
                      <span className="mx-auto mb-1 block size-4 rounded-full" style={{ backgroundColor: t.color }} />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn-primary mt-4 w-full">Create Resume</button>
            </form>
          </Modal>
        )}

        {showUpload && (
          <Modal title="Upload Resume" onClose={() => { setShowUpload(false); setTitle(""); setResume(null); }}>
            <form onSubmit={uploadResume}>
              <input onChange={(e) => setTitle(e.target.value)} value={title} type="text" placeholder="Enter resume title" className={inputClass} required />
              <label
                htmlFor="resume-input"
                className="mt-4 block text-sm text-body"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type === "application/pdf") setResume(f); }}
              >
                Select resume file
                <div className="my-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line p-6 text-muted transition-colors hover:border-teal-400 hover:text-teal-600">
                  {resume ? (
                    <div className="text-center">
                      <p className="font-medium text-teal-600">{resume.name}</p>
                      <p className="mt-0.5 text-xs text-muted">{(resume.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="size-10 stroke-[1.5]" />
                      <p className="text-sm">Click or drag & drop a PDF</p>
                    </>
                  )}
                </div>
              </label>
              <input type="file" id="resume-input" accept=".pdf" hidden onChange={(e) => setResume(e.target.files[0])} />
              <button type="submit" disabled={isLoading || !resume} className="btn-primary mt-2 w-full disabled:opacity-60">
                {isLoading ? "Processing..." : "Upload & Continue"}
              </button>
            </form>
          </Modal>
        )}

        {editResumeId && (
          <Modal title="Rename Resume" onClose={() => { setEditResumeId(""); setTitle(""); }}>
            <form onSubmit={editTitle}>
              <input onChange={(e) => setTitle(e.target.value)} value={title} type="text" placeholder="Enter resume title" className={inputClass} required />
              <button type="submit" disabled={isLoading} className="btn-primary mt-4 w-full disabled:opacity-60">
                {isLoading ? "Saving..." : "Update"}
              </button>
            </form>
          </Modal>
        )}

        {deleteConfirmId && (
          <Modal title="Delete Resume" onClose={() => setDeleteConfirmId(null)}>
            <p className="mb-6 text-sm text-muted">Are you sure you want to delete this resume? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-canvas">Cancel</button>
              <button onClick={() => deleteResume(deleteConfirmId)} className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-700">Delete</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dashboard;
