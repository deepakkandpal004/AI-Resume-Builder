import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

const ThemeToggle = ({ className = "" }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`inline-flex size-9 items-center justify-center rounded-full border border-line bg-surface text-body transition-all hover:border-brand-500/30 hover:text-ink active:scale-95 ${className}`}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
};

export default ThemeToggle;
