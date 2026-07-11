import { useState } from "react";
import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Mail, ArrowRight, Sparkles, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../Logo";

const sections = [
  {
    title: "Product",
    links: [
      { label: "Resume Builder", href: "/app" },
      { label: "Templates", href: "#templates" },
      { label: "AI Resume Writer", href: "/app" },
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
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubscribed(true);
      setEmail("");
    }, 800);
  };

  return (
    <footer className="relative overflow-hidden border-t border-line px-6 pt-16 pb-8 md:px-10">
      <div className="pointer-events-none absolute inset-0 dot-grid" />

      <div className="relative mx-auto max-w-7xl">
        
        {/* Top Newsletter Card */}
        <div className="relative overflow-hidden rounded-[24px] border border-line/60 bg-gradient-to-r from-surface/40 to-surface/10 backdrop-blur-md p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 mb-12 shadow-xs">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.02),transparent_50%)] blur-xl" />
          
          <div className="text-left max-w-md relative z-10">
            <h4 className="text-sm font-extrabold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-brand-500" />
              <span>Stay Updated</span>
            </h4>
            <p className="text-xs text-muted mt-1 leading-relaxed font-semibold">
              Get resume tips and career advice delivered to your inbox.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="relative z-10 w-full lg:w-auto flex flex-col sm:flex-row items-stretch gap-2.5 max-w-md lg:max-w-none">
            <AnimatePresence mode="wait">
              {!subscribed ? (
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <div className="flex-1 flex flex-col items-start gap-1">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      className="w-full rounded-xl border border-line bg-surface/50 px-4 py-2.5 text-xs font-semibold text-ink placeholder:text-muted/65 outline-none focus:border-brand-500/40 focus:ring-2 focus:ring-brand-500/10 transition duration-200"
                    />
                    {error && <span className="text-[10px] font-bold text-red-500 pl-1">{error}</span>}
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/60 text-white px-5 py-2.5 text-xs font-extrabold shadow-sm active:scale-98 transition duration-200 cursor-pointer h-fit"
                  >
                    {loading ? "Subscribing..." : "Subscribe"}
                  </button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-2.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 w-full"
                >
                  <Check className="size-4 text-emerald-500" />
                  <span>Subscribed successfully!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* 5-Column Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 items-start pb-12">
          
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1 flex flex-col items-start gap-4">
            <Link to="/" aria-label="Resume Builder Home">
              <Logo size="md" />
            </Link>
            <p className="text-xs leading-relaxed text-body font-semibold max-w-xs text-left">
              Create professional, AI-powered resumes that help you land your next role faster. Free to get started with no watermarks.
            </p>
            <Link
              to="/app"
              aria-label="Create Resume Free"
              className="group inline-flex items-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 text-xs font-bold shadow-md shadow-emerald-600/10 hover:shadow-emerald-500/20 hover:-translate-y-0.5 transition-all duration-200 transform-gpu"
            >
              <span>Create Resume Free</span>
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
