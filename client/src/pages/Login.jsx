import { Lock, Mail, User2Icon, ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react";
import React from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../app/features/authSlice";
import { toast } from "react-hot-toast";
import api from "../configs/api.js";
import ThemeToggle from "../components/ThemeToggle";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const query = new URLSearchParams(window.location.search);
  const urlState = query.get("state");
  const [state, setState] = React.useState(urlState || "login");
  const [forgotMode, setForgotMode] = React.useState(false);
  const [forgotEmail, setForgotEmail] = React.useState("");
  const [forgotSent, setForgotSent] = React.useState(false);
  const [forgotLoading, setForgotLoading] = React.useState(false);

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(`/api/users/${state}`, formData);
      dispatch(login(data));
      toast.success(data.message);
      navigate("/app");
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await api.post("/api/users/forgot-password", { email: forgotEmail });
      setForgotSent(true);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong.");
    } finally {
      setForgotLoading(false);
    }
  };

  const isLogin = state === "login";

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-600 to-accent-600 p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 size-72 rounded-full bg-white/10 blur-3xl" />

        <Link to="/" className="relative inline-flex items-center gap-2 text-sm text-white/90 transition hover:text-white">
          <ArrowLeft className="size-4" /> Back to home
        </Link>

        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm text-white">
            <Sparkles className="size-4" /> AI-powered resumes
          </div>
          <h2 className="max-w-sm text-4xl font-bold leading-tight text-white">
            Build a resume that gets you hired.
          </h2>
          <p className="mt-4 max-w-sm text-white/80">
            Create, customize and download a professional resume in minutes.
          </p>
        </div>

        <p className="relative text-sm text-white/70">
          © {new Date().getFullYear()} Resume Builder
        </p>
      </div>

      {/* Form panel */}
      <div className="relative flex items-center justify-center bg-canvas px-6 py-12">
        <ThemeToggle className="absolute right-4 top-4" />

        {/* ── Forgot password flow ── */}
        {forgotMode ? (
          <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8 shadow-sm">
            <button
              type="button"
              onClick={() => { setForgotMode(false); setForgotSent(false); setForgotEmail(""); }}
              className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition hover:text-brand-600"
            >
              <ArrowLeft className="size-4" /> Back to login
            </button>

            {forgotSent ? (
              <div className="text-center">
                <CheckCircle2 className="mx-auto mb-4 size-12 text-teal-500" />
                <h1 className="text-xl font-bold text-ink">Check your inbox</h1>
                <p className="mt-2 text-sm text-muted">
                  If an account with <strong>{forgotEmail}</strong> exists, we've sent a reset link.
                  It expires in 1 hour.
                </p>
                <p className="mt-4 text-xs text-muted">Didn't get it? Check your spam folder.</p>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-ink">Forgot your password?</h1>
                <p className="mt-1 text-sm text-muted">
                  Enter your email and we'll send you a reset link.
                </p>
                <form onSubmit={handleForgotSubmit} className="mt-6 space-y-4">
                  <div className="flex h-12 w-full items-center gap-2 rounded-lg border border-line bg-surface px-4 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200">
                    <Mail size={16} className="text-muted" />
                    <input
                      type="email"
                      placeholder="Email address"
                      className="w-full border-none outline-none ring-0 focus:ring-0"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="btn-brand h-11 w-full disabled:opacity-60"
                  >
                    {forgotLoading ? "Sending…" : "Send reset link"}
                  </button>
                </form>
              </>
            )}
          </div>
        ) : (
          /* ── Login / Register form ── */
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8 shadow-sm"
          >
            <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition hover:text-brand-600 lg:hidden">
              <ArrowLeft className="size-4" /> Back to home
            </Link>

            <h1 className="text-2xl font-bold text-ink">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1 text-sm text-muted">
              {isLogin ? "Log in to continue building." : "Sign up to get started."}
            </p>

            {!isLogin && (
              <div className="mt-6 flex h-12 w-full items-center gap-2 rounded-lg border border-line bg-surface px-4 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200">
                <User2Icon size={16} className="text-muted" />
                <input
                  type="text"
                  name="name"
                  placeholder="Full name"
                  className="w-full border-none outline-none ring-0 focus:ring-0"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="mt-4 flex h-12 w-full items-center gap-2 rounded-lg border border-line bg-surface px-4 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200">
              <Mail size={16} className="text-muted" />
              <input
                type="email"
                name="email"
                placeholder="Email address"
                className="w-full border-none outline-none ring-0 focus:ring-0"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mt-4 flex h-12 w-full items-center gap-2 rounded-lg border border-line bg-surface px-4 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-200">
              <Lock size={16} className="text-muted" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full border-none outline-none ring-0 focus:ring-0"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {isLogin && (
              <div className="mt-3 text-right">
                <button
                  type="button"
                  onClick={() => setForgotMode(true)}
                  className="text-sm text-brand-600 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button type="submit" className="btn-brand mt-5 h-11 w-full">
              {isLogin ? "Log in" : "Sign up"}
            </button>

            <p className="mt-5 text-center text-sm text-muted">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setState((prev) => (prev === "login" ? "register" : "login"))}
                className="font-medium text-brand-600 hover:underline"
              >
                {isLogin ? "Sign up" : "Log in"}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
