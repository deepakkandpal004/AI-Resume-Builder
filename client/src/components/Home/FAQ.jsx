import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import Title from "./Title";

const faqs = [
  { q: "Is the resume builder free?", a: "Yes. The free tier includes all templates, customization, PDF export, and limited AI usage. No credit card required." },
  { q: "What AI features are included?", a: "You can rewrite bullets, improve summaries, suggest skills, score your resume, tailor it to roles, and generate cover letters or interview questions." },
  { q: "Can I import my existing resume?", a: "Yes. Upload a PDF and the app turns it into editable content so you can keep building from there." },
  { q: "Are the templates ATS-friendly?", a: "Yes. The layouts are built with clean structure so ATS systems can parse them easily." },
  { q: "How does the Pro upgrade work?", a: "It is a one-time ₹299 payment for lifetime access to unlimited AI usage and priority processing." },
  { q: "Can I share my resume with a public link?", a: "Yes. Turn on public sharing and send a view-only link to recruiters." },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const ref = useScrollReveal();

  return (
    <section id="faq" className="relative overflow-hidden px-6 py-28 md:px-10">
      <div className="pointer-events-none absolute inset-0 gradient-glow-left" />
      <div className="pointer-events-none absolute inset-0 dot-grid" />
      <div className="section-line absolute top-0 inset-x-0" />

      <div ref={ref} className="mx-auto max-w-3xl reveal">
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent-200 bg-accent-50 px-4 py-1.5 text-sm font-medium text-accent-700 dark:border-teal-500/20 dark:bg-teal-500/10 dark:text-accent-400">
            <HelpCircle className="size-4" />
            FAQs
          </div>
          <Title
            title="Common questions, answered quickly"
            description="How the product works, what is included, and what Pro adds."
          />
        </div>

        <div className="mt-12 space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-line bg-surface/20 transition-all duration-300"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-line/20"
              >
                <span className="font-medium text-ink/80 pr-4">{faq.q}</span>
                <ChevronDown
                  className={`size-5 shrink-0 text-muted transition-transform duration-300 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <p className="border-t border-line px-6 py-5 text-sm leading-relaxed text-body">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      <div className="section-line absolute bottom-0 inset-x-0" />
    </section>
  );
};

export default FAQ;
