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
  Clock,
  Award,
  Layout,
  Download,
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
        <button onClick={onClose} className="rounded-lg p-1.5 text-muted transition hover:bg-line/30 hover:text-ink focus-visible:ring-2 focus-visible:ring-emerald-500/35 outline-none" aria-label="Close">
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

  const inputClass = "w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-all duration-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-muted focus-visible:outline-none";

  // Calculations for Welcome Stats Row
  const totalResumes = allResumes.length;
  const resumesWithAts = allResumes.filter((r) => r.lastAts?.atsScore);
  const avgAts = resumesWithAts.length > 0 
    ? Math.round(resumesWithAts.reduce((sum, r) => sum + r.lastAts.atsScore, 0) / resumesWithAts.length)
    : 0;

  const lastUpdatedResume = allResumes.length > 0
    ? [...allResumes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0]
    : null;
  const lastActiveStr = lastUpdatedResume ? timeAgo(lastUpdatedResume.updatedAt) : "N/A";
  const uniqueTemplatesCount = new Set(allResumes.map((r) => r.template || "classic")).size;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-7xl px-4 py-10 md:px-6"
    >
      
      {/* Top Segment: Welcome, Actions & Sidebar grid row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-stretch">
        
        {/* Left Column (Spans 2/3): Welcome Header, Stats & Quick Actions */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Header & Stats Cards */}
          <div className="flex flex-col gap-5 text-left">
            <div>
              <h1 className="text-2xl font-bold text-ink flex items-center gap-2">
                <span>Welcome back, {user?.name || "there"}</span>
                <span className="animate-wave origin-[70%_75%] inline-block">👋</span>
              </h1>
              <p className="mt-1 text-sm text-muted">
                Create a new resume or pick up where you left off.
              </p>
            </div>

            {/* Stats Cards Row */}
            {loadingResumes ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3 p-3.5 rounded-xl border border-line/60 bg-surface/50">
                    <div className="size-9 rounded-lg bg-line shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2 w-16 bg-line rounded" />
                      <div className="h-3.5 w-10 bg-line rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : allResumes.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Total Resumes", value: totalResumes, icon: FileTextIcon, color: "text-emerald-600 bg-emerald-500/10" },
                  { label: "Average ATS", value: avgAts > 0 ? `${avgAts}%` : "N/A", icon: Award, color: "text-blue-600 bg-blue-500/10" },
                  { label: "Last Active", value: lastActiveStr, icon: Clock, color: "text-purple-600 bg-purple-500/10" },
                  { label: "Templates Used", value: uniqueTemplatesCount, icon: Layout, color: "text-amber-600 bg-amber-500/10" },
                ].map((stat) => {
                  const StatIcon = stat.icon;
                  return (
                    <div key={stat.label} className="flex items-center gap-3 p-3.5 rounded-xl border border-line/65 bg-surface/50 transition-all hover:bg-surface/75 hover:border-emerald-500/10 duration-200">
                      <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${stat.color}`}>
                        <StatIcon className="size-4.5" />
                      </span>
                      <div className="min-w-0">
                        <span className="block text-[9px] font-extrabold text-muted uppercase tracking-wide truncate">{stat.label}</span>
                        <span className="block text-sm font-extrabold text-ink leading-tight mt-0.5">{stat.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>

          {/* Quick Action Tiles */}
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              onClick={() => { setShowCreate(true); setSelectedTemplate("classic"); }}
              className="group flex items-center gap-4 rounded-2xl border border-dashed border-line bg-surface p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-md hover:shadow-emerald-500/[0.04] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-emerald-500/35 outline-none"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:group-hover:bg-emerald-500/20">
                <PlusIcon className="size-6" />
              </span>
              <div className="min-w-0">
                <span className="block font-bold text-ink">Create Resume</span>
                <span className="block text-xs sm:text-sm text-muted leading-snug mt-0.5">Start building a new document with our A4 layouts.</span>
              </div>
            </button>

            <button
              onClick={() => setShowUpload(true)}
              className="group flex items-center gap-4 rounded-2xl border border-dashed border-line bg-surface p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-500/40 hover:shadow-md hover:shadow-teal-500/[0.04] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-emerald-500/35 outline-none"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 transition-colors group-hover:bg-teal-100 dark:bg-teal-500/10 dark:text-teal-300 dark:group-hover:bg-teal-500/20">
                <UploadCloudIcon className="size-6" />
              </span>
              <div className="min-w-0">
                <span className="block font-bold text-ink">Upload Existing</span>
                <span className="block text-xs sm:text-sm text-muted leading-snug mt-0.5">Import an existing PDF resume to auto-fill fields.</span>
              </div>
            </button>
          </div>

        </div>

        {/* Right Column (Spans 1/3): ATS Insights & Resume Tips sidebar */}
        <div className="lg:col-span-1 flex">
          <div className="w-full rounded-2xl border border-line bg-surface/40 backdrop-blur-md p-5 flex flex-col justify-between shadow-xs text-left">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="size-4 text-emerald-500 animate-pulse" />
                <h3 className="text-sm font-bold text-ink uppercase tracking-wider">ATS Insights & Tips</h3>
              </div>
              
              {/* Best ATS gauge */}
              <div className="mb-5 p-3 rounded-xl border border-line/65 bg-surface/50">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted font-bold">Best ATS Target</span>
                  <span className="text-emerald-600 font-extrabold">{avgAts > 0 ? `${Math.max(avgAts, 80)}%` : "Ready"}</span>
                </div>
                <div className="w-full h-1.5 bg-line rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                    style={{ width: `${avgAts > 0 ? Math.max(avgAts, 80) : 0}%` }}
                  />
                </div>
                <span className="block text-[10px] text-muted font-semibold mt-1.5 leading-normal">
                  Resumes matching 80%+ scores have a 3x higher interview rate.
                </span>
              </div>

              {/* Tips items */}
              <ul className="space-y-3.5">
                {[
                  { text: "Keep layouts to a single page for max parser impact.", title: "Page Constraint" },
                  { text: "Quantify metrics (e.g., 'Improved load speeds by 40%').", title: "Metrics Count" },
                  { text: "Avoid complex multi-column structures or custom graphics.", title: "Clean Structure" },
                ].map((tip, idx) => (
                  <li key={idx} className="flex gap-2.5 text-left">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-extrabold mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <span className="block text-xs font-bold text-ink leading-tight">{tip.title}</span>
                      <span className="block text-[10px] leading-normal text-muted mt-0.5 font-semibold">{tip.text}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 border-t border-line/45 pt-4 flex items-center justify-between text-[10px] font-extrabold text-muted">
              <span>Need more templates?</span>
              <a href="#templates" className="text-brand-600 hover:text-brand-500 hover:underline transition-colors">Browse layout list &rarr;</a>
            </div>
          </div>
        </div>

      </div>

      {/* Section label + Search & sort */}
      <div className="my-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-line/45 pt-6">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Your Resumes</h2>
          <span className="rounded-full bg-line/30 px-2 py-0.5 text-xs text-muted font-bold">{filtered.length}</span>
        </div>
        <div className="flex items-center gap-2">
          
          {/* Grid/List Toggle */}
          <div className="hidden sm:flex items-center rounded-xl border border-line overflow-hidden p-0.5 bg-canvas/30">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all duration-150 ${viewMode === "grid" ? "bg-surface text-emerald-600 shadow-xs" : "bg-transparent text-muted hover:text-ink"}`}
              title="Grid view"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all duration-150 ${viewMode === "list" ? "bg-surface text-emerald-600 shadow-xs" : "bg-transparent text-muted hover:text-ink"}`}
              title="List view"
            >
              <List className="size-4" />
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search resumes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-line bg-surface py-2 pl-9 pr-8 text-sm text-ink outline-none transition-all duration-200 placeholder:text-muted focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 sm:w-48 focus-visible:outline-none"
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

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSort(!showSort)}
              className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-sm text-muted transition hover:border-emerald-500 hover:text-ink"
            >
              <ArrowUpDown className="size-3.5" />
              <span>{sortOptions.find((o) => o.value === sortBy)?.label}</span>
              <ChevronDown className="size-3.5" />
            </button>
            {showSort && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowSort(false)} />
                <div className="absolute right-0 z-40 mt-1 w-40 overflow-hidden rounded-xl border border-line bg-surface shadow-lg py-1">
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setShowSort(false); }}
                      className={`w-full px-3 py-2 text-left text-sm font-semibold transition hover:bg-line/20 ${sortBy === opt.value ? "text-emerald-600" : "text-muted"}`}
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
            {Array.from({ length: 4 }).map((_, i) => (
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
            <p className="text-sm font-bold text-ink">No resumes yet</p>
            <p className="mt-1 text-sm text-muted">Create a new resume or upload a PDF to get started.</p>
            <button
              onClick={() => { setShowCreate(true); setSelectedTemplate("classic"); }}
              className="btn-primary mt-6 px-6 py-2.5 text-sm"
            >
              <PlusIcon className="size-4" />
              <span>Create your first resume</span>
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
                  className={viewMode === "grid"
                    ? "group relative flex h-72 cursor-pointer flex-col overflow-hidden rounded-2xl border border-line bg-surface p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-emerald-500/[0.03]"
                    : "group relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-xl border border-line bg-surface px-4 py-3 transition-all duration-200 hover:bg-line/10"
                  }
                >
                  {viewMode === "grid" ? (
                    <>
                      {/* Top rounded accent stripe */}
                      <span className="absolute inset-x-0 top-0 h-1.5 rounded-t-2xl" style={{ backgroundColor: accent }} />
                      
                      <div className="relative flex-1 min-h-0 rounded-lg overflow-hidden bg-canvas/30 flex items-center justify-center p-2">
                        <div className="resume-preview relative w-full h-full bg-white shadow-sm rounded overflow-hidden border border-line/10 text-slate-900 transition-transform duration-300 ease-out group-hover:scale-[1.02] transform-gpu">
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
                      
                      {/* Title & Metadata Layout */}
                      <div className="mt-2 flex items-start gap-2.5 min-w-0">
                        <span className="flex size-7.5 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: accent + "1A", color: accent }}>
                          <FileTextIcon className="size-3.5" />
                        </span>
                        <div className="min-w-0 flex-1 text-left">
                          <p className="truncate text-xs font-bold text-ink leading-tight">{r.title}</p>
                          <div className="flex items-center gap-1.5 flex-wrap mt-1">
                            <span className="rounded-full bg-line/20 px-1.5 py-0.5 text-[9px] font-bold text-muted border border-line/50">{templateLabel}</span>
                            <span className="text-[9px] font-semibold text-muted">{timeAgo(r.updatedAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Footer: ATS Score & Dropdown Menu */}
                      <div className="mt-2 flex items-center justify-between pt-2 border-t border-line/40">
                        <div>
                          {ats && (
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${atsColor.bg} ${atsColor.text}`}>
                              ATS {ats.atsScore}%
                            </span>
                          )}
                        </div>
                        
                        {/* Overflow Dropdown Actions */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuCardId(menuCardId === r._id ? null : r._id);
                            }}
                            className="rounded-lg p-1 text-muted hover:bg-line/45 hover:text-ink transition duration-200 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/35"
                            title="Menu Actions"
                          >
                            <MoreVertical className="size-4" />
                          </button>
                          
                          <AnimatePresence>
                            {menuCardId === r._id && (
                              <>
                                <div 
                                  className="fixed inset-0 z-30" 
                                  onClick={(e) => { e.stopPropagation(); setMenuCardId(null); }} 
                                />
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                  transition={{ duration: 0.15, ease: "easeOut" }}
                                  className="absolute right-0 bottom-full z-40 mb-1.5 w-36 overflow-hidden rounded-xl border border-line bg-surface shadow-xl py-1 text-left"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {[
                                    { label: "Edit Resume", icon: PencilIcon, color: "hover:text-emerald-600", action: () => navigate(`/app/builder/${r._id}`) },
                                    { label: "Duplicate", icon: Copy, color: "hover:text-teal-600", action: () => duplicateResume(r._id) },
                                    { label: "Rename", icon: FileTextIcon, color: "hover:text-purple-600", action: () => { setEditResumeId(r._id); setTitle(r.title); } },
                                    { label: "Download PDF", icon: Download, color: "hover:text-blue-600", action: () => navigate(`/view/${r._id}`) },
                                  ].map((opt) => {
                                    const OptIcon = opt.icon;
                                    return (
                                      <button
                                        key={opt.label}
                                        onClick={() => { opt.action(); setMenuCardId(null); }}
                                        className={`flex w-full items-center gap-2.5 px-3 py-2 text-xs font-bold text-muted transition hover:bg-line/25 ${opt.color}`}
                                      >
                                        <OptIcon className="size-3.5" />
                                        <span>{opt.label}</span>
                                      </button>
                                    );
                                  })}
                                  <div className="h-px bg-line my-1" />
                                  <button
                                    onClick={() => { deleteResume(r._id); setMenuCardId(null); }}
                                    className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 transition"
                                  >
                                    <TrashIcon className="size-3.5" />
                                    <span>Delete</span>
                                  </button>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Left accent line */}
                      <span className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: accent }} />
                      
                      <div className="resume-preview relative size-12 shrink-0 rounded-lg overflow-hidden bg-white text-slate-900 border border-line/10">
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
                      
                      <div className="min-w-0 flex-1 text-left">
                        <p className="truncate text-sm font-bold text-ink leading-tight">{r.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted mt-1.5">
                          <span className="font-bold">{templateLabel}</span>
                          <span>·</span>
                          <span className="font-semibold">{timeAgo(r.updatedAt)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2.5 shrink-0">
                        {ats && (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${atsColor.bg} ${atsColor.text}`}>
                            {ats.atsScore}%
                          </span>
                        )}
                        
                        {/* List View Overflow Dropdown Actions */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuCardId(menuCardId === r._id ? null : r._id);
                            }}
                            className="rounded-lg p-1 text-muted hover:bg-line/45 hover:text-ink transition duration-200 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/35"
                            title="Menu Actions"
                          >
                            <MoreVertical className="size-4" />
                          </button>
                          
                          <AnimatePresence>
                            {menuCardId === r._id && (
                              <>
                                <div 
                                  className="fixed inset-0 z-30" 
                                  onClick={(e) => { e.stopPropagation(); setMenuCardId(null); }} 
                                />
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: 4 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: 4 }}
                                  transition={{ duration: 0.15, ease: "easeOut" }}
                                  className="absolute right-0 top-full z-40 mt-1.5 w-36 overflow-hidden rounded-xl border border-line bg-surface shadow-xl py-1 text-left"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {[
                                    { label: "Edit Resume", icon: PencilIcon, color: "hover:text-emerald-600", action: () => navigate(`/app/builder/${r._id}`) },
                                    { label: "Duplicate", icon: Copy, color: "hover:text-teal-600", action: () => duplicateResume(r._id) },
                                    { label: "Rename", icon: FileTextIcon, color: "hover:text-purple-600", action: () => { setEditResumeId(r._id); setTitle(r.title); } },
                                    { label: "Download PDF", icon: Download, color: "hover:text-blue-600", action: () => navigate(`/view/${r._id}`) },
                                  ].map((opt) => {
                                    const OptIcon = opt.icon;
                                    return (
                                      <button
                                        key={opt.label}
                                        onClick={() => { opt.action(); setMenuCardId(null); }}
                                        className={`flex w-full items-center gap-2.5 px-3 py-2 text-xs font-bold text-muted transition hover:bg-line/25 ${opt.color}`}
                                      >
                                        <OptIcon className="size-3.5" />
                                        <span>{opt.label}</span>
                                      </button>
                                    );
                                  })}
                                  <div className="h-px bg-line my-1" />
                                  <button
                                    onClick={() => { deleteResume(r._id); setMenuCardId(null); }}
                                    className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 transition"
                                  >
                                    <TrashIcon className="size-3.5" />
                                    <span>Delete</span>
                                  </button>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
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
                <p className="mb-2 text-xs font-bold text-muted uppercase tracking-wide text-left">Template</p>
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
                      className={`rounded-xl border px-2 py-2.5 text-center text-xs font-bold transition-all focus-visible:ring-2 focus-visible:ring-emerald-500/35 focus-visible:border-emerald-500 outline-none ${
                        selectedTemplate === t.id
                          ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                          : "border-line text-muted hover:border-line/80 hover:text-ink"
                      }`}
                    >
                      <span className="mx-auto mb-1.5 block size-4.5 rounded-full border border-line/10 shadow-xs" style={{ backgroundColor: t.color }} />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn-primary mt-5 w-full focus-visible:ring-2 focus-visible:ring-emerald-500/35 outline-none">Create Resume</button>
            </form>
          </Modal>
        )}

        {showUpload && (
          <Modal title="Upload Resume" onClose={() => { setShowUpload(false); setTitle(""); setResume(null); }}>
            <form onSubmit={uploadResume}>
              <input onChange={(e) => setTitle(e.target.value)} value={title} type="text" placeholder="Enter resume title" className={inputClass} required />
              <label
                htmlFor="resume-input"
                className="mt-4 block text-sm text-body font-semibold text-left"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type === "application/pdf") setResume(f); }}
              >
                Select resume file
                <div className="my-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line p-6 text-muted transition-colors hover:border-teal-400 hover:text-teal-600 focus-within:border-teal-400 focus-within:text-teal-600">
                  {resume ? (
                    <div className="text-center">
                      <p className="font-bold text-teal-600">{resume.name}</p>
                      <p className="mt-0.5 text-xs text-muted font-semibold">{(resume.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="size-10 stroke-[1.5]" />
                      <p className="text-sm font-semibold">Click or drag & drop a PDF</p>
                    </>
                  )}
                </div>
              </label>
              <input type="file" id="resume-input" accept=".pdf" hidden onChange={(e) => setResume(e.target.files[0])} />
              <button type="submit" disabled={isLoading || !resume} className="btn-primary mt-2 w-full disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-emerald-500/35 outline-none">
                {isLoading ? "Processing..." : "Upload & Continue"}
              </button>
            </form>
          </Modal>
        )}

        {editResumeId && (
          <Modal title="Rename Resume" onClose={() => { setEditResumeId(""); setTitle(""); }}>
            <form onSubmit={editTitle}>
              <input onChange={(e) => setTitle(e.target.value)} value={title} type="text" placeholder="Enter resume title" className={inputClass} required />
              <button type="submit" disabled={isLoading} className="btn-primary mt-4 w-full disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-emerald-500/35 outline-none">
                {isLoading ? "Saving..." : "Update"}
              </button>
            </form>
          </Modal>
        )}

        {deleteConfirmId && (
          <Modal title="Delete Resume" onClose={() => setDeleteConfirmId(null)}>
            <p className="mb-6 text-sm font-semibold text-muted text-left">Are you sure you want to delete this resume? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-bold text-ink transition hover:bg-canvas focus-visible:ring-2 focus-visible:ring-emerald-500/35 outline-none">Cancel</button>
              <button onClick={() => deleteResume(deleteConfirmId)} className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700 focus-visible:ring-2 focus-visible:ring-rose-500/35 outline-none">Delete</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Dashboard;
