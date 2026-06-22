import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const sections = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Templates", href: "#features" },
        { label: "How it works", href: "#how" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Get started", href: "/app" },
        { label: "Support", href: "#" },
        { label: "Blog", href: "#" },
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

  return (
    <footer className="border-t border-line bg-canvas">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-12 px-6 py-14 md:flex-row md:px-10">
        <div className="max-w-xs">
          <img src="/logo.svg" alt="logo" className="h-10 w-auto" />
          <p className="mt-4 text-sm text-muted">
            Create professional, AI-powered resumes that help you land your next
            role faster.
          </p>
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
        © {new Date().getFullYear()} Resume Builder. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
