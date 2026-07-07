import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "../Logo";
import ThemeToggle from "../ThemeToggle";

const NAV_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Templates", href: "#templates" },
  { label: "Pricing", href: "#pricing" },
];

const HomeNavbar = () => {
  const { user } = useSelector((state) => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 md:px-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-line/50 bg-surface/70 px-5 py-3 shadow-lg backdrop-blur-xl dark:border-white/5 dark:bg-[#0d1117]/80">
        <Link to="/" className="relative z-10 shrink-0">
          <Logo className="h-12 w-auto text-ink" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="rounded-lg px-4 py-2 text-sm font-medium text-body transition-colors hover:bg-white/5 hover:text-ink dark:hover:bg-white/5"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {user ? (
            <Link to="/app" className="btn-primary text-sm px-5 py-2">
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/app?state=login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-body transition-colors hover:bg-white/5 hover:text-ink dark:hover:bg-white/5"
              >
                Login
              </Link>
              <Link to="/app?state=register" className="btn-primary text-sm px-5 py-2">
                Start Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMenuOpen((open) => !open)}
          className="relative z-10 text-ink md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <button
          type="button"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-[90] bg-ink/60 backdrop-blur-sm md:hidden"
          aria-label="Close menu overlay"
        />
      )}

      <div
        className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-10 bg-canvas/95 backdrop-blur-2xl transition-all duration-500 md:hidden ${
          menuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
      >
        <button
          onClick={() => setMenuOpen(false)}
          className="absolute right-6 top-6 flex size-10 items-center justify-center rounded-xl border border-line bg-surface text-ink"
          aria-label="Close menu"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center gap-2">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-6 py-3 text-lg text-body transition hover:bg-white/5 hover:text-ink dark:hover:bg-white/5"
            >
              {l.label}
            </a>
          ))}
          <div className="mt-4">
            <ThemeToggle />
          </div>
        </div>

        {user ? (
          <Link
            to="/app"
            onClick={() => setMenuOpen(false)}
            className="btn-primary px-10 py-3"
          >
            Dashboard
          </Link>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Link
              to="/app?state=login"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-10 py-3 text-base font-medium text-body transition hover:bg-white/5 hover:text-ink dark:hover:bg-white/5"
            >
              Login
            </Link>
            <Link
              to="/app?state=register"
              onClick={() => setMenuOpen(false)}
              className="btn-primary px-10 py-3"
            >
              Start Free
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default HomeNavbar;
