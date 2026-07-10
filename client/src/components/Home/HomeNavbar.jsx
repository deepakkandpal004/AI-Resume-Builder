import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Logo from "../Logo";
import ThemeToggle from "../ThemeToggle";
import { logout } from "../../app/features/authSlice";

const NAV_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features",     href: "#features"     },
  { label: "Templates",    href: "#templates"     },
  { label: "Pricing",      href: "#pricing"       },
];

const HomeNavbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    dispatch(logout());
    navigate("/");
  };

  /* ── Scroll effect tracker ── */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-250 ease-out flex items-center ${
        scrolled
          ? "h-16 bg-surface/75 backdrop-blur-[18px] border-b border-line/45 shadow-sm"
          : "h-20 bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="relative z-10 shrink-0 hover:opacity-90 transition-opacity" aria-label="ResumeAI home">
          <Logo size="md" variant="auto" />
        </Link>

        {/* Desktop nav links with sliding hover indicator */}
        <div className="hidden items-center gap-1 md:flex relative">
          {NAV_LINKS.map((l) => {
            const isActive = l.href === `#${activeSection}`;
            return (
              <a
                key={l.label}
                href={l.href}
                onMouseEnter={() => setHoveredLink(l.label)}
                onMouseLeave={() => setHoveredLink(null)}
                className={`relative px-4 py-2 text-sm font-semibold tracking-tight transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? "text-brand-600 dark:text-brand-400"
                    : "text-body hover:text-brand-600 dark:hover:text-brand-400"
                }`}
              >
                <span>{l.label}</span>
                {isActive && (
                  <motion.span
                    layoutId="activeUnderline"
                    className="absolute bottom-0 inset-x-4 h-0.5 bg-brand-500 dark:bg-brand-400 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {hoveredLink === l.label && !isActive && (
                  <motion.span
                    layoutId="hoverUnderline"
                    className="absolute bottom-0 inset-x-4 h-0.5 bg-line rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </div>

        {/* Desktop CTAs & Theme Toggle */}
        <div className="hidden items-center gap-3.5 md:flex">
          {/* Theme Toggle */}
          <ThemeToggle className="mr-1" />

          {user ? (
            <div className="flex items-center gap-3.5">
              <Link
                to="/app"
                className="nav-cta-primary group px-4.5 py-1.5 text-xs font-bold flex items-center gap-1 bg-brand-600 text-white rounded-full transition-all hover:bg-brand-700 active:scale-95 shadow-md shadow-brand-500/10 cursor-pointer"
              >
                <span>Dashboard</span>
                <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              
              {/* Profile Dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex size-8 items-center justify-center rounded-full border border-line bg-surface/80 hover:bg-canvas transition-colors cursor-pointer active:scale-95"
                >
                  <div className="flex size-7 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20 text-xs font-bold text-brand-700 dark:text-brand-300">
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2.5 w-48 overflow-hidden rounded-xl border border-line bg-surface shadow-xl z-50">
                    <div className="px-3.5 py-2.5 border-b border-line/40">
                      <p className="text-xs font-semibold text-ink truncate">
                        {user?.name || "User"}
                      </p>
                      <p className="text-[10px] text-muted truncate">
                        {user?.email || ""}
                      </p>
                    </div>

                    <Link
                      to="/app"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-xs text-muted hover:bg-line/10 transition-colors"
                    >
                      <span>Go to Dashboard</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-3.5 py-2 text-xs text-muted hover:bg-line/10 hover:text-red-500 transition-colors cursor-pointer border-t border-line/45"
                    >
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/app?state=login"
                className="nav-cta-ghost px-4 py-1.5 text-xs font-bold hover:text-brand-600 transition-colors cursor-pointer"
              >
                Login
              </Link>
              <Link
                to="/app?state=register"
                className="nav-cta-primary group px-4.5 py-2 text-xs font-bold flex items-center gap-1.5 bg-brand-600 text-white rounded-full transition-all hover:bg-brand-700 active:scale-95 shadow-md shadow-brand-500/10 cursor-pointer"
              >
                <span>Get Started Free</span>
                <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
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
            <>
              <Link
                to="/app"
                onClick={() => setMenuOpen(false)}
                className="nav-cta-primary w-full max-w-xs justify-center py-3.5"
              >
                Dashboard <ArrowRight className="size-4" />
              </Link>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="w-full max-w-xs rounded-xl border border-line bg-surface py-3.5 text-center font-medium text-body transition-all hover:border-brand-500/20 hover:text-ink cursor-pointer"
              >
                Logout
              </button>
            </>
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
