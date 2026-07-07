import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutTemplate, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ClassicTemplate from "../templates/ClassicTemplate";
import ModernTemplate from "../templates/ModernTemplate";
import MinimalTemplate from "../templates/MinimalTemplate";
import ExecutiveTemplate from "../templates/ExecutiveTemplate";
import CreativeTemplate from "../templates/CreativeTemplate";
import CompactTemplate from "../templates/CompactTemplate";
import { dummyResumeData } from "../../assets/assets";
import { useScrollReveal } from "../../hooks/useScrollReveal";

const templates = [
  {
    id: "modern",
    name: "Modern",
    tag: "Best for tech",
    accent: "#10b981",
    desc: "Clean two-column layout with a colored sidebar. Ideal for showcasing skills and experience side by side.",
    component: ModernTemplate,
  },
  {
    id: "classic",
    name: "Classic",
    tag: "Traditional",
    accent: "#6366f1",
    desc: "Single-column format with clear section headers. Works well for conservative industries and senior roles.",
    component: ClassicTemplate,
  },
  {
    id: "minimal",
    name: "Minimal",
    tag: "Clean",
    accent: "#2dd4bf",
    desc: "Light, airy design with plenty of whitespace. Makes content easy to scan quickly.",
    component: MinimalTemplate,
  },
  {
    id: "executive",
    name: "Executive",
    tag: "Leadership",
    accent: "#2563EB",
    desc: "Dark header with a refined layout. Designed for senior positions and executive applications.",
    component: ExecutiveTemplate,
  },
  {
    id: "creative",
    name: "Creative",
    tag: "Stand out",
    accent: "#E11D48",
    desc: "Bold accent colors and asymmetric layout. Great for design, marketing, and media roles.",
    component: CreativeTemplate,
  },
  {
    id: "compact",
    name: "Compact",
    tag: "Dense",
    accent: "#D97706",
    desc: "Space-efficient layout that fits more content per page. Useful for extensive experience.",
    component: CompactTemplate,
  },
];

const TemplateShowcase = () => {
  const [hovered, setHovered] = useState(null);
  const ref = useScrollReveal();
  const data = dummyResumeData[0];

  return (
    <section id="templates" className="relative overflow-hidden px-6 py-28 md:px-10">
      <div className="pointer-events-none absolute inset-0 gradient-glow-right" />
      <div className="pointer-events-none absolute inset-0 dot-grid" />
      <div className="section-line absolute top-0 inset-x-0" />

      <div ref={ref} className="mx-auto max-w-7xl reveal">
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent-200 bg-accent-50 px-4 py-1.5 text-sm font-medium text-accent-700 dark:border-teal-500/20 dark:bg-teal-500/10 dark:text-accent-400">
            <LayoutTemplate className="size-4" />
            Templates
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl leading-[1.1]">
            Professional templates that pass ATS scans
          </h2>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t, i) => {
            const Template = t.component;
            const isHovered = hovered === t.id;
            return (
              <Link
                to={`/app?template=${t.id}`}
                key={t.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10"
                onMouseEnter={() => setHovered(t.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <div
                  className="absolute top-0 inset-x-0 h-1 z-10 transition-all duration-300"
                  style={{ backgroundColor: t.accent, opacity: isHovered ? 1 : 0.5 }}
                />

                <div
                  className="absolute top-3 right-3 z-20 rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-sm"
                  style={{ backgroundColor: t.accent }}
                >
                  {t.tag}
                </div>

                <div className="relative h-72 w-full overflow-hidden bg-white">
                  <div
                    className="origin-top"
                    style={{
                      transform: "scale(0.35)",
                      width: "calc(100% / 0.35)",
                      transformOrigin: "top left",
                    }}
                  >
                    <Template
                      data={data}
                      accentColor={t.accent}
                      styleOptions={{ fontSize: 11, lineSpacing: 1.3, pageSize: "letter" }}
                    />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />

                  <div
                    className="absolute inset-0 flex items-center justify-center transition-all duration-300"
                    style={{ opacity: isHovered ? 1 : 0 }}
                  >
                    <motion.div
                      initial={false}
                      animate={{ y: isHovered ? 0 : 10, opacity: isHovered ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="rounded-full border border-line bg-white/80 px-4 py-2 text-xs font-semibold text-ink backdrop-blur-md shadow-lg"
                    >
                      Use this template
                    </motion.div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-line px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-3 rounded-full ring-2 ring-canvas"
                      style={{ backgroundColor: t.accent }}
                    />
                    <h3 className="font-semibold text-ink">{t.name}</h3>
                  </div>
                  <span className="text-[10px] font-semibold text-muted">{t.tag}</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center reveal" style={{ transitionDelay: "0.3s" }}>
          <Link
            to="/app"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/20 px-6 py-2.5 text-sm font-semibold text-body transition-all hover:border-emerald-500/30 hover:text-ink hover:-translate-y-0.5 backdrop-blur-sm"
          >
            Explore all templates
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="section-line absolute bottom-0 inset-x-0" />
    </section>
  );
};

export default TemplateShowcase;
