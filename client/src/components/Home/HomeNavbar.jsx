import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import ThemeToggle from "../ThemeToggle";
import Logo from "../Logo";

const HomeNavbar = () => {
  const { user } = useSelector((state) => state.auth);
  const [menuOpen, setMenuOpen] = React.useState(false);

  const links = [
    { label: "Home", href: "#" },
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how" },
    { label: "Contact", href: "#cta" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-line/70 bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 md:px-10">
        <Link to="/">
          <Logo className="h-9 w-auto text-ink" />
        </Link>

        <div className="hidden items-center gap-8 text-sm text-body md:flex">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="transition hover:text-brand-600">
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {user ? (
            <Link to="/app" className="btn-brand px-7 py-2 text-sm">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/app?state=login" className="btn-outline px-6 py-2 text-sm">
                Login
              </Link>
              <Link to="/app?state=register" className="btn-brand px-6 py-2 text-sm">
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMenuOpen(true)}
          className="text-ink transition active:scale-90 md:hidden"
          aria-label="Open menu"
        >
          <Menu size={26} />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-surface text-lg transition-transform duration-300 md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          onClick={() => setMenuOpen(false)}
          className="absolute right-6 top-6 text-ink"
          aria-label="Close menu"
        >
          <X size={28} />
        </button>

        <ThemeToggle />

        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            onClick={() => setMenuOpen(false)}
            className="text-ink transition hover:text-brand-600"
          >
            {l.label}
          </a>
        ))}

        {user ? (
          <Link to="/app" onClick={() => setMenuOpen(false)} className="btn-brand">
            Dashboard
          </Link>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Link to="/app?state=login" onClick={() => setMenuOpen(false)} className="btn-outline">
              Login
            </Link>
            <Link to="/app?state=register" onClick={() => setMenuOpen(false)} className="btn-brand">
              Get started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default HomeNavbar;
