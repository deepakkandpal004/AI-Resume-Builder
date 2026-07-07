import React from "react";
import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";
import Logo from "../Logo";

const Footer = () => {
  const sections = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Templates", href: "#templates" },
        { label: "How it works", href: "#how" },
        { label: "Pricing", href: "#pricing" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Get started", href: "/app" },
        { label: "FAQ", href: "#faq" },
        { label: "Support", href: "#" },
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
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Mail, href: "mailto:support@resumebuilder.com", label: "Email" },
  ];

  return (
    <footer className="border-t border-line bg-canvas">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-12 px-6 py-14 md:flex-row md:px-10">
        <div className="max-w-xs">
          <Link to="/">
            <Logo className="h-9 w-auto text-ink" />
          </Link>
          <p className="mt-4 text-sm text-muted">
            Create professional, AI-powered resumes that help you land your next
            role faster.
          </p>

          {/* Social links */}
          <div className="mt-5 flex items-center gap-3">
            {socialLinks.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex size-9 items-center justify-center rounded-full border border-line text-muted transition-all hover:border-brand-400 hover:text-brand-600 hover:shadow-sm"
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
              <p className="text-sm font-semibold text-ink">{section.title}</p>
              <ul className="mt-3 space-y-2 text-sm">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("/") ? (
                      <Link to={link.href} className="text-muted transition hover:text-brand-600">
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className="text-muted transition hover:text-brand-600">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-line py-6 text-center text-sm text-muted">
        © {new Date().getFullYear()} Resume Builder. Built with React, Node.js & Groq AI.
      </div>
    </footer>
  );
};

export default Footer;
