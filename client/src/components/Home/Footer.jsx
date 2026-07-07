import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";
import Logo from "../Logo";

const sections = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Templates", href: "#templates" },
      { label: "Pricing", href: "#pricing" },
      { label: "How It Works", href: "#how-it-works" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Contact", href: "#cta" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

const socialLinks = [
  { icon: Github, href: "https://github.com/deepakkandpal004", label: "GitHub" },
  { icon: Twitter, href: "https://x.com/deepakkandpal", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com/in/deepakkandpal", label: "LinkedIn" },
  { icon: Mail, href: "mailto:deepak@example.com", label: "Email" },
];

const Footer = () => (
  <footer className="relative overflow-hidden border-t border-line">
    <div className="pointer-events-none absolute inset-0 dot-grid" />

    <div className="relative mx-auto flex max-w-7xl flex-col justify-between gap-12 px-6 py-16 md:flex-row md:px-10">
      <div className="max-w-xs">
        <Link to="/">
          <Logo className="h-9 w-auto text-ink" />
        </Link>
        <p className="mt-4 text-sm leading-relaxed text-body">
          Create professional, AI-powered resumes that help you land your
          next role faster. 100% free, no watermarks.
        </p>

        <div className="mt-6 flex items-center gap-3">
          {socialLinks.map((s) => {
            const Icon = s.icon;
            return (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex size-9 items-center justify-center rounded-full border border-line text-muted transition-all hover:border-emerald-500/30 hover:text-emerald-400"
              >
                <Icon className="size-4" />
              </a>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 md:gap-16">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-sm font-semibold text-ink/70">{section.title}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {section.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-muted transition hover:text-emerald-400"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>

    <div className="relative border-t border-line py-6 text-center text-xs text-muted">
      &copy; {new Date().getFullYear()} Resume Builder. Built with React, Node.js &amp; AI.
    </div>
  </footer>
);

export default Footer;
