import { Lock, Mail, User2Icon, ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react";
import React from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { login } from "../app/features/authSlice";
import { toast } from "react-hot-toast";
import api from "../configs/api.js";
import ThemeToggle from "../components/ThemeToggle";


const stagger = {
  initial: { opacity: 0, y: 10 },
  animate: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.04 * i, duration: 0.3 } }),
};

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

  const inputClass = "flex h-12 w-full items-center gap-3 rounded-xl border border-line bg-surface px-4 transition-all duration-200 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/15";
  const inputInner = "h-full w-full border-none bg-transparent text-sm text-ink outline-none placeholder:text-muted focus:ring-0";

  const form = (state === "login" ? "Log in" : "Sign up");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative flex min-h-screen items-center justify-center bg-canvas px-4 py-12"
    >
      <ThemeToggle className="absolute right-6 top-6" />

      <AnimatePresence mode="wait">
        {forgotMode ? (
          <motion.div
            key="forgot"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-sm"
          >
            <div className="rounded-2xl border border-line bg-surface p-8 shadow-sm">
              <button
                type="button"
                onClick={() => { setForgotMode(false); setForgotSent(false); setForgotEmail(""); }}
                className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition hover:text-emerald-600"
              >
                <ArrowLeft className="size-4" /> Back to login
              </button>

              {forgotSent ? (
                <div className="text-center">
                  <CheckCircle2 className="mx-auto mb-4 size-12 text-teal-500" />
                  <h1 className="text-xl font-bold text-ink">Check your inbox</h1>
                  <p className="mt-2 text-sm text-muted">
                    If an account with <strong>{forgotEmail}</strong> exists, we&apos;ve sent a reset link.
                  </p>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-ink">Forgot your password?</h1>
                  <p className="mt-1.5 text-sm text-muted">Enter your email and we&apos;ll send you a reset link.</p>
                  <form onSubmit={handleForgotSubmit} className="mt-6 space-y-4">
                    <div className={inputClass}>
                      <Mail size={16} className="shrink-0 text-muted" />
                      <input type="email" placeholder="Email address" className={inputInner} value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
                    </div>
                    <button type="submit" disabled={forgotLoading} className="btn-primary h-11 w-full text-sm disabled:opacity-60">
                      {forgotLoading ? "Sending…" : "Send reset link"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={state}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-sm"
          >
            {/* Header */}
            <div className="mb-8 text-center">
              <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-emerald-600">
                <ArrowLeft className="size-4" /> Back to home
              </Link>
              <motion.h1 custom={0} variants={stagger} initial="initial" animate="animate" className="mt-6 text-2xl font-bold text-ink">
                {isLogin ? "Welcome back" : "Create your account"}
              </motion.h1>
              <motion.p custom={1} variants={stagger} initial="initial" animate="animate" className="mt-1.5 text-sm text-muted">
                {isLogin ? "Log in to continue building your resume." : "Sign up to get started with AI-powered resumes."}
              </motion.p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-surface p-8 shadow-sm">
              {!isLogin && (
                <motion.div custom={2} variants={stagger} initial="initial" animate="animate" className={inputClass}>
                  <User2Icon size={16} className="shrink-0 text-muted" />
                  <input type="text" name="name" placeholder="Full name" className={inputInner} value={formData.name} onChange={handleChange} required />
                </motion.div>
              )}

              <motion.div custom={isLogin ? 2 : 3} variants={stagger} initial="initial" animate="animate" className={`${inputClass} ${!isLogin ? "mt-4" : ""}`}>
                <Mail size={16} className="shrink-0 text-muted" />
                <input type="email" name="email" placeholder="Email address" className={inputInner} value={formData.email} onChange={handleChange} required />
              </motion.div>

              <motion.div custom={isLogin ? 3 : 4} variants={stagger} initial="initial" animate="animate" className={`${inputClass} mt-4`}>
                <Lock size={16} className="shrink-0 text-muted" />
                <input type="password" name="password" placeholder="Password" className={inputInner} value={formData.password} onChange={handleChange} required />
              </motion.div>

              {isLogin && (
                <motion.div custom={4} variants={stagger} initial="initial" animate="animate" className="mt-2 text-right">
                  <button type="button" onClick={() => setForgotMode(true)} className="text-sm text-emerald-600 hover:underline">
                    Forgot password?
                  </button>
                </motion.div>
              )}

              <motion.div custom={isLogin ? 5 : 5} variants={stagger} initial="initial" animate="animate">
                <button type="submit" className="btn-primary mt-6 h-11 w-full text-sm">
                  {isLogin ? "Log in" : "Sign up"}
                </button>
              </motion.div>
            </form>

            {/* Toggle */}
            <motion.p custom={6} variants={stagger} initial="initial" animate="animate" className="mt-6 text-center text-sm text-muted">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button type="button" onClick={() => setState((prev) => (prev === "login" ? "register" : "login"))} className="font-semibold text-emerald-600 hover:underline">
                {isLogin ? "Sign up" : "Log in"}
              </button>
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Login;
