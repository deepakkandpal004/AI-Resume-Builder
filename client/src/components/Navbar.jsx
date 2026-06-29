import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../app/features/authSlice";
import { LogOut, Sparkles, Zap } from "lucide-react";
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
    <header className="sticky top-0 z-40 border-b border-line bg-surface/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/app">
          <Logo className="h-9 w-auto text-ink" />
        </Link>

        <div className="flex items-center gap-3 text-sm">
          <ThemeToggle />

          {/* Upgrade button (free users only) */}
          {!isPremium && (
            <Link
              to="/app/upgrade"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-600 to-accent-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:from-brand-500 hover:to-accent-500 active:scale-95"
            >
              <Zap className="size-3.5" />
              Upgrade
            </Link>
          )}

          {/* User avatar + name */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="flex size-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                {initial}
              </div>
              {/* Premium crown indicator */}
              {isPremium && (
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
                  <Sparkles className="size-2.5 text-white" />
                </span>
              )}
            </div>
            <div className="max-sm:hidden flex flex-col leading-none">
              <span className="text-body text-sm">Hi, {user?.name || "there"}</span>
              {isPremium && (
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                  Premium
                </span>
              )}
            </div>
          </div>

          <button
            onClick={logoutUser}
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-5 py-1.5 text-body transition-all hover:bg-canvas active:scale-95"
          >
            <LogOut className="size-4" />
            <span className="max-sm:hidden">Logout</span>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
