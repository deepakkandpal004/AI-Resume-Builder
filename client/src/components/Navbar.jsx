import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../app/features/authSlice";
import { LogOut, Sparkles, Zap, Settings } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const rafRef = useRef(null);
  const menuRef = useRef(null);

  const isBuilder = location.pathname.includes("/app/builder/");

  useEffect(() => {
    if (isBuilder) return;
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => setScrolled(window.scrollY > 24));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isBuilder]);

  useEffect(() => {
    if (isBuilder) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isBuilder]);

  const logoutUser = () => {
    setMenuOpen(false);
    navigate("/");
    dispatch(logout());
  };

  const isPremium = user?.subscriptionTier === "premium";
  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";

  if (isBuilder) {
    return null;
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-4 pt-6 sm:px-6 md:px-10">
      <nav
        className={`nav-glass-app mx-auto flex w-full max-w-7xl items-center justify-between rounded-full border px-7 py-3 shadow-md transition-all duration-500 ease-out ${
          scrolled ? "shadow-lg" : ""
        }`}
      >
        {/* Logo */}
        <Link to="/" className="shrink-0 transition-opacity hover:opacity-80">
          <Logo size="md" />
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <ThemeToggle className="bg-surface hover:border-brand-500/30" />

          {/* User pill with dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex size-9 items-center justify-center rounded-full border border-line bg-surface/80 backdrop-blur-md shadow-sm transition-all duration-200 hover:border-emerald-500/30 active:scale-95"
            >
              {isPremium ? (
                <div className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-500 text-[10px] font-bold text-white">
                  {initial}
                </div>
              ) : (
                <div className="flex size-7 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                  {initial}
                </div>
              )}
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-line bg-surface shadow-lg">
                <div className="px-3 py-2.5 border-b border-line/40">
                  <p className="text-xs font-semibold text-ink truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-[10px] text-muted truncate">
                    {user?.email || ""}
                  </p>
                </div>

                {!isPremium && (
                  <Link
                    to="/app/upgrade"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-ink transition hover:bg-line/10"
                  >
                    <Zap className="size-3.5 text-emerald-500" />
                    <span className="font-medium">Upgrade to Premium</span>
                  </Link>
                )}

                <Link
                  to="/"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-muted transition hover:bg-line/10"
                >
                  <Settings className="size-3.5" />
                  Landing Page
                </Link>

                <button
                  onClick={logoutUser}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted transition hover:bg-line/10 hover:text-red-500"
                >
                  <LogOut className="size-3.5" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;