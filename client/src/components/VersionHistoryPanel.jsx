import { Clock, History, Loader2, RotateCcw, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import api from "../configs/api";

const VersionHistoryPanel = ({ resumeId, onRestore, onClose }) => {
  const { token } = useSelector((state) => state.auth);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(null);

  useEffect(() => {
    if (!resumeId) return;
    (async () => {
      try {
        const { data } = await api.get(`/api/resumes/versions/${resumeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVersions(data.versions);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load versions");
      } finally {
        setLoading(false);
      }
    })();
  }, [resumeId, token]);

  const handleRestore = async (versionId) => {
    setRestoring(versionId);
    try {
      const { data } = await api.post(
        `/api/resumes/restore/${resumeId}/${versionId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onRestore(data.resume);
      toast.success("Version restored");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Restore failed");
    } finally {
      setRestoring(null);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-surface shadow-2xl border border-line max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <div className="flex items-center gap-2">
            <History className="size-5 text-brand-600" />
            <h2 className="text-lg font-semibold text-ink">Version History</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-canvas text-muted transition-colors">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted" />
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-12 text-muted">
              <Clock className="size-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No saved versions yet.</p>
              <p className="text-xs mt-1">Versions are saved automatically on each manual save.</p>
            </div>
          ) : (
            versions.map((v) => (
              <div
                key={v._id}
                className="flex items-center justify-between rounded-lg border border-line px-4 py-3 hover:bg-canvas transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Clock className="size-4 text-muted shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {formatDate(v.createdAt)}
                    </p>
                    {v.label && (
                      <p className="text-xs text-muted">{v.label}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleRestore(v._id)}
                  disabled={restoring === v._id}
                  className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 transition-colors disabled:opacity-50"
                >
                  {restoring === v._id ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <RotateCcw className="size-3" />
                  )}
                  Restore
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VersionHistoryPanel;
