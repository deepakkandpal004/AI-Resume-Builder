import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Mail, ArrowRight } from "lucide-react";
import Logo from "../Logo";

const sections = [
  {
    title: "Product",
    links: [
      { label: "Resume Builder", href: "/app" },
      { label: "Templates", href: "#templates" },
      { label: "Resume Writer", href: "/app" },
      { label: "ATS Checker", href: "/app" },
      { label: "Resume Examples", href: "#templates" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "#" },
      { label: "Career Tips", href: "#" },
      { label: "Interview Guide", href: "#" },
      { label: "FAQ", href: "#faq" },
      { label: "Documentation", href: "#" },
      { label: "Help Center", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Contact", href: "#cta" },
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Cookie Policy", href: "#" },
    ],
  },
];

const socialLinks = [
  { icon: Github, href: "https://github.com/deepakkandpal004", label: "GitHub" },
  { icon: Twitter, href: "https://x.com/deepakkandpal", label: "Twitter/X" },
  { icon: Linkedin, href: "https://linkedin.com/in/deepakkandpal", label: "LinkedIn" },
  { icon: Mail, href: "mailto:deepak@example.com", label: "Email" },
];

const Footer = () => {
  return (
    <footer className="relative overflow-hidden border-t border-line px-6 pt-16 pb-8 md:px-10">

      <div className="relative mx-auto max-w-7xl">
        
        {/* 5-Column Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 items-start pb-12">
          
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1 flex flex-col items-start gap-4">
            <Link to="/" aria-label="Resume Builder Home">
              <Logo size="md" />
            </Link>
            <p className="text-xs leading-relaxed text-body font-semibold max-w-xs text-left">
              Create professional resumes that help you land your next role. Free to get started with no watermarks.
            </p>
            <Link
              to="/app"
              aria-label="Build Resume"
              className="group inline-flex items-center gap-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 text-xs font-bold shadow-md hover:-translate-y-0.5 transition-all duration-200 transform-gpu"
            >
              <span>Build Resume</span>
              <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Product, Resources, Company columns */}
          {sections.map((section) => (
            <div key={section.title} className="text-left">
              <p className="text-sm font-bold text-ink/75 uppercase tracking-wider">{section.title}</p>
              <ul className="mt-4 space-y-2.5 text-xs sm:text-sm">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("#") ? (
                      <a
                        href={link.href}
                        className="text-muted font-semibold transition hover:text-brand-600"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-muted font-semibold transition hover:text-brand-600"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Connect (Social Links Column) */}
          <div className="text-left">
            <p className="text-sm font-bold text-ink/75 uppercase tracking-wider">Connect</p>
            <ul className="mt-4 space-y-3.5 text-xs sm:text-sm">
              {socialLinks.map((s) => {
                const Icon = s.icon;
                return (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2.5 text-muted hover:text-brand-600 transition-colors"
                    >
                      <div className="flex size-7 items-center justify-center rounded-lg border border-line bg-surface group-hover:border-brand-500/30 group-hover:bg-brand-500/10 transition-all duration-200">
                        <Icon className="size-3.5" />
                      </div>
                      <span className="font-semibold">{s.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & Status Bar */}
        <div className="relative border-t border-line/45 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-muted select-none">
          <div>
            &copy; {new Date().getFullYear()} Resume Builder. Made with ❤️ using React.
          </div>
          <div className="flex items-center flex-wrap gap-4">
            <Link to="#" className="hover:text-brand-600 transition-colors">Privacy Policy</Link>
            <span className="text-line">|</span>
            <Link to="#" className="hover:text-brand-600 transition-colors">Terms of Service</Link>
            <span className="text-line">|</span>
            <span className="text-[10.5px]">Version 1.0.0</span>
            <span className="text-line">|</span>
            <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded text-[10px]">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Operational</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
