import {
  Sparkles,
  BarChart3,
  LayoutTemplate,
  Eye,
  ScanLine,
  Link,
  FileText,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import Title from "./Title";
import { Link as RouterLink } from "react-router-dom";

const features = [
  {
    icon: Sparkles,
    title: "AI Resume Optimization",
    desc: "Rewrite bullets, sharpen summaries, and tighten skills for the role you want.",
    gradient: ["rgba(16,185,129,0.95)", "rgba(20,184,166,0.95)"],
  },
  {
    icon: BarChart3,
    title: "ATS Score Checker",
    desc: "Paste a job description and see keyword gaps plus compatibility instantly.",
    gradient: ["rgba(20,184,166,0.95)", "rgba(34,211,238,0.95)"],
  },
  {
    icon: LayoutTemplate,
    title: "Professional Templates",
    desc: "Pick from clean, ATS-safe layouts built for fast screening and easy reading.",
    gradient: ["rgba(16,185,129,0.95)", "rgba(34,197,94,0.95)"],
  },
  {
    icon: Eye,
    title: "Live Resume Preview",
    desc: "Preview every edit in real time so the final PDF never surprises you.",
    gradient: ["rgba(20,184,166,0.95)", "rgba(16,185,129,0.95)"],
  },
  {
    icon: MessageSquare,
    title: "Cover Letter Generator",
    desc: "Generate tailored cover letters in formal, conversational, or enthusiastic tone.",
    gradient: ["rgba(34,211,238,0.95)", "rgba(20,184,166,0.95)"],
  },
  {
    icon: ScanLine,
    title: "Background Removal",
    desc: "Clean up profile photos with automatic background removal and face-crop.",
    gradient: ["rgba(52,211,153,0.95)", "rgba(16,185,129,0.95)"],
  },
  {
    icon: Link,
    title: "Shareable Resume Links",
    desc: "Create a public resume link and send it to recruiters in one click.",
    gradient: ["rgba(34,211,238,0.95)", "rgba(20,184,166,0.95)"],
  },
  {
    icon: FileText,
    title: "PDF Import & Export",
    desc: "Import an existing PDF to edit, or export your finished resume as a clean PDF.",
    gradient: ["rgba(20,184,166,0.95)", "rgba(16,185,129,0.95)"],
  },
];

const Features = () => {
  void motion;
  const ref = useScrollReveal();

  return (
    <section id="features" className="relative overflow-hidden px-6 py-28 md:px-10">
      <div className="pointer-events-none absolute inset-0 gradient-glow" />
      <div className="pointer-events-none absolute inset-0 dot-grid" />
      <div className="section-line absolute top-0 inset-x-0" />

      <div ref={ref} className="mx-auto max-w-7xl reveal">
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-brand-400">
            <Sparkles className="size-4" />
            Core capabilities
          </div>
          <Title
            title="Everything you need to build a stronger resume"
            description="Write faster, score higher, generate cover letters, prep for interviews — all in one place."
          />
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="glass-card group relative overflow-hidden rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1.5"
              >
                <div
                  className="mb-5 inline-flex size-12 items-center justify-center rounded-xl text-white shadow-lg shadow-emerald-500/10"
                  style={{ backgroundImage: `linear-gradient(135deg, ${f.gradient[0]}, ${f.gradient[1]})` }}
                >
                  <Icon className="size-6" />
                </div>
                <h3 className="text-lg font-bold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-body">{f.desc}</p>

                <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div
                    className="absolute inset-0 rounded-2xl"
                    style={{ backgroundImage: `linear-gradient(135deg, ${f.gradient[0]}, ${f.gradient[1]})`, opacity: 0.03 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-14 flex justify-center">
          <RouterLink
            to="/app"
            className="btn-primary shadow-xl shadow-emerald-500/25"
          >
            <Sparkles className="size-4" />
            Try all features free
            <ArrowRight className="size-4" />
          </RouterLink>
        </div>
      </div>

      <div className="section-line absolute bottom-0 inset-x-0" />
    </section>
  );
};

export default Features;
