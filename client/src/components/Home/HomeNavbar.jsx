import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Logo from "../Logo";
import ThemeToggle from "../ThemeToggle";



const NAV_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features",     href: "#features"     },
  { label: "Templates",    href: "#templates"     },
  { label: "Pricing",      href: "#pricing"       },
];

const HomeNavbar = () => {
  const { user } = useSelector((state) => state.auth);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const rafRef = useRef(null);

  /* ── Scroll detection for header shrink ───────────────────────── */
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

  /* ── IntersectionObserver for active section tracking ─────────── */
  useEffect(() => {
    const sections = NAV_LINKS.map(link => document.querySelector(link.href)).filter(Boolean);
    
    const observerOptions = {
      root: null,
      rootMargin: "-25% 0px -55% 0px", // Trigger when section occupies the primary viewport space
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  /* ── Escape key ── */
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  /* ── Body scroll lock ── */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 px-4 pt-6 sm:px-6 md:px-10">
      {/* ── Pill ──────────────────────────────────────────────────── */}
      <div
        className="nav-glass-app mx-auto flex max-w-7xl items-center justify-between rounded-full border px-5 py-2.5 transition-all duration-500 ease-out shadow-md"
      >
        {/* Logo */}
        <Link to="/" className="relative z-10 shrink-0" aria-label="ResumeAI home">
          <Logo size="md" variant="auto" />
        </Link>

        {/* Desktop nav links with dynamic active indicator & sliding hover */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l, index) => {
            const isActive = l.href === `#${activeSection}`;
            return (
              <a
                key={l.label}
                href={l.href}
                className={`rounded-full px-4 py-1.5 text-sm font-medium tracking-tight transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                    : "text-body hover:text-emerald-600 dark:hover:text-emerald-400"
                }`}
              >
                {l.label}
              </a>
            );
          })}
        </div>

        {/* Desktop CTAs & Theme Toggle */}
        <div className="hidden items-center gap-2 md:flex">
          {/* Theme Toggle */}
          <ThemeToggle className="mr-1" />

          {user ? (
            <Link to="/app" className="btn-primary text-sm px-4 py-0.5">
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/app?state=login"
                className="nav-cta-ghost px-4 py-0.5"
              >
                Login
              </Link>
              <Link
                to="/app?state=register"
                className="nav-cta-primary group px-4 py-0.5 text-sm"
              >
                Start Free
                <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu trigger + Theme Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="relative z-10 flex size-10 items-center justify-center rounded-xl border border-line bg-surface text-body transition-all duration-200 hover:border-brand-500/30 hover:text-ink"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span className={`absolute transition-all duration-200 ${menuOpen ? "opacity-100 rotate-0" : "opacity-0 rotate-90"}`}>
              <X size={19} />
            </span>
            <span className={`absolute transition-all duration-200 ${menuOpen ? "opacity-0 -rotate-90" : "opacity-100 rotate-0"}`}>
              <Menu size={19} />
            </span>
          </button>
        </div>
      </div>

      {/* ── Mobile backdrop ───────────────────────────────────────── */}
      {menuOpen && (
        <button
          type="button"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm md:hidden"
          aria-label="Close menu overlay"
        />
      )}

      {/* ── Mobile drawer ─────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-canvas/98 backdrop-blur-2xl transition-all duration-300 ease-out md:hidden ${
          menuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={() => setMenuOpen(false)}
          className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-xl border border-line bg-surface text-body transition-all hover:border-brand-500/30 hover:text-ink"
          aria-label="Close menu"
        >
          <X size={19} />
        </button>

        <Link to="/" onClick={() => setMenuOpen(false)} className="mb-2">
          <Logo size="md" variant="auto" />
        </Link>

        <motion.div
          initial="hidden"
          animate={menuOpen ? "visible" : "hidden"}
          variants={{ visible: { transition: { staggerChildren: 0.06 } }, hidden: {} }}
          className="flex w-full flex-col items-center gap-1 px-8"
        >
          {NAV_LINKS.map((l) => (
            <motion.a
              key={l.label}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="w-full rounded-xl px-6 py-3.5 text-center font-medium text-body transition-all duration-200 hover:scale-105 hover:bg-ink/5 hover:text-ink"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1.1rem", letterSpacing: "-0.01em" }}
            >
              {l.label}
            </motion.a>
          ))}
        </motion.div>

        <div className="flex w-full flex-col items-center gap-3 px-8 pt-2">
          {user ? (
            <Link
              to="/app"
              onClick={() => setMenuOpen(false)}
              className="nav-cta-primary w-full max-w-xs justify-center py-3.5"
            >
              Dashboard <ArrowRight className="size-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/app?state=register"
                onClick={() => setMenuOpen(false)}
                className="nav-cta-primary w-full max-w-xs justify-center py-3.5"
              >
                Start Free <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/app?state=login"
                onClick={() => setMenuOpen(false)}
                className="w-full max-w-xs rounded-xl border border-line bg-surface py-3.5 text-center font-medium text-body transition-all hover:border-brand-500/20 hover:text-ink"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default HomeNavbar;
