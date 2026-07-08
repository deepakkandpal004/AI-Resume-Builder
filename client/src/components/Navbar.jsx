import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../app/features/authSlice";
import { LogOut, Sparkles, Zap, Home } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const rafRef = useRef(null);

  /* ── Scroll detection ─────────────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => setScrolled(window.scrollY > 24));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const logoutUser = () => {
    navigate("/");
    dispatch(logout());
  };

  const isPremium = user?.subscriptionTier === "premium";
  const initial   = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-40 px-3 pt-4 sm:px-4 md:px-6">
      <nav
        className="nav-glass-app mx-auto flex max-w-7xl items-center justify-between rounded-full px-4 py-0.5 transition-all duration-500 ease-out md:px-5"
      >
        {/* Logo */}
        <Link to="/app" className="shrink-0 transition-opacity hover:opacity-80">
          <Logo size="md" />
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-1 sm:gap-1.5">

          {/* Back to Home */}
          <Link
            to="/"
            className="nav-pill-btn group gap-1.5"
            aria-label="Back to home"
          >
            <Home className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>

          {/* Theme toggle */}
          <ThemeToggle className="bg-surface hover:border-brand-500/30" />

          {/* Upgrade button — free users only */}
          {!isPremium && (
            <Link
              to="/app/upgrade"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white shadow-sm shadow-emerald-500/25 transition-all duration-200 hover:from-emerald-400 hover:to-teal-400 hover:shadow-md hover:shadow-emerald-500/40 hover:-translate-y-px active:scale-95"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <Zap className="size-3" />
              <span className="hidden sm:inline">Upgrade</span>
            </Link>
          )}

          {/* User avatar + name pill */}
          <div className="flex items-center gap-2 rounded-full border border-line bg-surface px-2 py-0.5 transition-colors duration-200 hover:border-brand-500/25">
            <div className="relative">
              <div className="flex size-7 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                {initial}
              </div>
              {isPremium && (
                <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-500 border border-white/25 dark:border-black/30 shadow-md">
                  <Sparkles className="size-2.5 text-white animate-pulse" />
                </span>
              )}
            </div>
            <div className="hidden flex-col leading-none sm:flex">
              <span className="text-ink text-xs font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Hi, {user?.name?.split(" ")[0] || "there"}
              </span>
              {isPremium ? (
                <span className="text-[9px] font-semibold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent dark:from-amber-400 dark:to-orange-400">
                  ✦ Premium
                </span>
              ) : (
                <Link
                  to="/app/upgrade"
                  className="text-[9px] font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400 transition-colors"
                >
                  Upgrade ↑
                </Link>
              )}
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logoutUser}
            className="nav-pill-btn group gap-1.5 hover:border-red-400/30 hover:text-red-500"
            aria-label="Logout"
          >
            <LogOut className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
