import React from "react";
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

  const logoutUser = () => {
    navigate("/");
    dispatch(logout());
  };

  const isPremium = user?.subscriptionTier === "premium";
  const initial   = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4 md:px-6">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-line/70 bg-surface/90 px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.08)] backdrop-blur-xl md:px-5">
        <Link to="/app">
          <Logo className="h-8 w-auto text-ink" />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 text-sm">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas/40 px-3 py-2 text-body transition-all hover:bg-canvas active:scale-95"
            aria-label="Home"
          >
            <Home className="size-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <ThemeToggle className="bg-canvas/40 hover:bg-canvas" />

          {/* Upgrade button (free users only) */}
          {!isPremium && (
            <Link
              to="/app/upgrade"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-brand-600 to-accent-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:from-brand-500 hover:to-accent-500 hover:shadow-md active:scale-95"
            >
              <Zap className="size-3.5" />
              Upgrade
            </Link>
          )}

          {/* User avatar + name */}
          <div className="flex items-center gap-2 rounded-full border border-line bg-canvas/40 px-2 py-1.5">
            <div className="relative">
              <div className="flex size-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                {initial}
              </div>
              {/* Premium crown indicator */}
              {isPremium && (
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-linear-to-br from-amber-400 to-orange-500 shadow-sm">
                  <Sparkles className="size-2.5 text-white" />
                </span>
              )}
            </div>
            <div className="hidden flex-col leading-none sm:flex">
              <span className="text-body text-sm font-medium">Hi, {user?.name || "there"}</span>
              {isPremium && (
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                  Premium
                </span>
              )}
            </div>
          </div>

          <button
            onClick={logoutUser}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas/40 px-4 py-2 text-body transition-all hover:bg-canvas active:scale-95 md:px-5"
            aria-label="Logout"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
