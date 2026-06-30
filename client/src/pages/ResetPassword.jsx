import { ArrowLeft, CheckCircle2, Lock, XCircle } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../configs/api.js";
import ThemeToggle from "../components/ThemeToggle";

const ResetPassword = () => {
  const navigate = useNavigate();

  // Pull token + email from the URL query string
  const params = new URLSearchParams(window.location.search);
  const token  = params.get("token")  || "";
  const email  = params.get("email")  || "";

  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);
  const [showPass, setShowPass]     = useState(false);

  // Basic strength indicators
  const hasMin    = password.length >= 8;
  const hasUpper  = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isStrong  = hasMin && hasUpper && hasNumber;
  const matches   = password === confirm && confirm.length > 0;

  const Indicator = ({ met, label }) => (
    <span className={`flex items-center gap-1 text-[11px] ${met ? "text-teal-600" : "text-muted"}`}>
      {met ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
      {label}
    </span>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token || !email) {
      toast.error("Invalid reset link. Please request a new one.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match.");
      return;
    }
    if (!isStrong) {
      toast.error("Please meet all password requirements.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/api/users/reset-password", { token, email, password });
      toast.success(data.message);
      setSuccess(true);
      // Redirect to login after 2.5 seconds
      setTimeout(() => navigate("/login"), 2500);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  // Invalid link guard
  if (!token || !email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-6">
        <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8 text-center shadow-sm">
          <XCircle className="mx-auto mb-4 size-12 text-rose-500" />
          <h1 className="text-xl font-bold text-ink">Invalid reset link</h1>
          <p className="mt-2 text-sm text-muted">
            This link is missing required parameters. Please request a new password reset.
          </p>
          <Link to="/login" className="btn-brand mt-6 inline-flex items-center gap-2">
            <ArrowLeft className="size-4" /> Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-6 py-12">
      <ThemeToggle className="absolute right-4 top-4" />

      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8 shadow-sm">
        <Link
          to="/login"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition hover:text-brand-600"
        >
          <ArrowLeft className="size-4" /> Back to login
        </Link>

        {success ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto mb-4 size-12 text-teal-500" />
            <h1 className="text-xl font-bold text-ink">Password updated</h1>
            <p className="mt-2 text-sm text-muted">
              Your password has been reset. Redirecting you to login…
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-ink">Set new password</h1>
            <p className="mt-1 text-sm text-muted">
              Resetting password for <strong className="text-body">{email}</strong>
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* New password */}
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">New password</label>
                <div className="flex h-12 w-full items-center gap-2 rounded-lg border border-line bg-surface px-4 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200">
                  <Lock size={16} className="text-muted" />
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="New password"
                    className="w-full border-none outline-none ring-0 focus:ring-0"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    className="shrink-0 text-xs text-muted hover:text-ink"
                  >
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>

                {/* Strength indicators */}
                {password.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                    <Indicator met={hasMin}    label="8+ characters" />
                    <Indicator met={hasUpper}  label="Uppercase letter" />
                    <Indicator met={hasNumber} label="Number" />
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="mb-1 block text-xs font-medium text-muted">Confirm password</label>
                <div className={`flex h-12 w-full items-center gap-2 rounded-lg border px-4 focus-within:ring-2 focus-within:ring-brand-200 ${
                  confirm.length > 0
                    ? matches
                      ? "border-teal-400 bg-surface"
                      : "border-rose-400 bg-surface"
                    : "border-line bg-surface"
                }`}>
                  <Lock size={16} className="text-muted" />
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Confirm password"
                    className="w-full border-none outline-none ring-0 focus:ring-0"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </div>
                {confirm.length > 0 && !matches && (
                  <p className="mt-1 text-[11px] text-rose-500">Passwords don't match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !isStrong || !matches}
                className="btn-brand h-11 w-full disabled:opacity-50"
              >
                {loading ? "Updating…" : "Reset password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
