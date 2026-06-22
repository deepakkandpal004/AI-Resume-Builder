import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../app/features/authSlice";
import { LogOut } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import Logo from "./Logo";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutUser = () => {
    navigate("/");
    dispatch(logout());
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/app">
          <Logo className="h-9 w-auto text-ink" />
        </Link>

        <div className="flex items-center gap-3 text-sm">
          <ThemeToggle />
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
              {initial}
            </div>
            <span className="text-body max-sm:hidden">
              Hi, {user?.name || "there"}
            </span>
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
