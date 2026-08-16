import { Lock, Mail, User2Icon, ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import ThemeToggle from "../components/ThemeToggle";
import { setUser } from "../app/features/authSlice";
import { auth, googleProvider } from "../config/firebase";
import { setCachedToken } from "../configs/api";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import api from "../configs/api";

const stagger = {
  initial: { opacity: 0, y: 10 },
  animate: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.04 * i, duration: 0.3 } }),
};

const Login = () => {
  void motion;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const query = new URLSearchParams(window.location.search);
  const urlState = query.get("state");
  const [state, setState] = React.useState(urlState || "login");
  const [forgotMode, setForgotMode] = React.useState(false);
  const [forgotEmail, setForgotEmail] = React.useState("");
  const [forgotSent, setForgotSent] = React.useState(false);
  const [forgotLoading, setForgotLoading] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
  });

  const syncUserWithBackend = React.useCallback(async (firebaseUser) => {
    const idToken = await firebaseUser.getIdToken();
    setCachedToken(idToken);
    const { data } = await api.post("/api/users/sync", {
      name: firebaseUser.displayName || formData.name || firebaseUser.email?.split("@")[0],
      email: firebaseUser.email,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
    }, {
      headers: { Authorization: `Bearer ${idToken}` }
    });
    dispatch(setUser(data.user));
    return data.user;
  }, [formData, dispatch]);

  const sendLoginNotification = React.useCallback(async (firebaseUser, via) => {
    try {
      await api.post("/api/users/send-login-notification", {
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        via,
      });
    } catch (err) {
      console.log("Login notification failed:", err.message);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let userCredential;
      if (state === "register") {
        try {
          userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        } catch (createError) {
          if (createError.code === "auth/email-already-in-use") {
            toast.error("An account with this email already exists. Please log in instead.");
          } else {
            toast.error(createError.message || "Registration failed");
          }
          setLoading(false);
          return;
        }
        try {
          await api.post("/api/users/send-verification", { email: formData.email });
          toast.success("Verification email sent! Please check your inbox.");
        } catch {
          // Brevo may be down — don't block registration, user can still use Google or request resend
        }
      } else {
        userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      }

      await syncUserWithBackend(userCredential.user);
      if (state === "login") {
        sendLoginNotification(userCredential.user, "email/password");
      }
      toast.success(state === "register" ? "Account created!" : "Welcome back!");
      navigate("/app");
    } catch (error) {
      let message = error.message;
      if (error.code === "auth/user-not-found") message = "No account found with this email";
      else if (error.code === "auth/wrong-password") message = "Invalid password";
      else if (error.code === "auth/email-already-in-use") message = "Email already in use";
      else if (error.code === "auth/weak-password") message = "Password must be at least 6 characters";
      else if (error.code === "auth/invalid-email") message = "Invalid email address";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncUserWithBackend(result.user);
      sendLoginNotification(result.user, "Google");
      toast.success("Welcome!");
      navigate("/app");
    } catch (error) {
      if (error.code === "auth/popup-closed-by-user" || error.code === "auth/cancelled-popup-request") {
        toast.error("Google login was cancelled.");
      } else {
        toast.error("Google login failed: " + (error.message || "Unknown error"));
      }
    } finally {
      setLoading(false);
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
      const { data } = await api.post("/api/users/forgot-password", { email: forgotEmail });
      if (data.provider === "google") {
        // Google users → Firebase handles the reset email natively
        await sendPasswordResetEmail(auth, forgotEmail);
      }
      setForgotSent(true);
    } catch (error) {
      let message = error.message;
      if (error.code === "auth/user-not-found") message = "No account found with this email";
      toast.error(message);
    } finally {
      setForgotLoading(false);
    }
  };

  const isLogin = state === "login";

  const inputClass = "flex h-12 w-full items-center gap-3 rounded-xl border border-line bg-surface px-4 transition-all duration-200 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/15";
  const inputInner = "h-full w-full border-none bg-transparent text-sm text-ink outline-none placeholder:text-muted focus:ring-0";

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
                <button type="submit" disabled={loading} className="btn-primary mt-6 h-11 w-full text-sm disabled:opacity-60">
                  {loading ? "Please wait…" : isLogin ? "Log in" : "Sign up"}
                </button>
              </motion.div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-line"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-surface px-2 text-muted">or continue with</span>
                </div>
              </div>

              {/* Google Login */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-line bg-surface text-sm font-medium text-ink transition hover:bg-canvas disabled:opacity-60"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
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
