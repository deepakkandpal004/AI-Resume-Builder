import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import Title from "./Title";
import { useScrollReveal } from "../../hooks/useScrollReveal";

const faqs = [
  {
    q: "Is the resume builder really free?",
    a: "Yes! The free tier gives you full access to all 7 templates, customization tools, PDF export, and AI features with daily usage limits. No credit card required.",
  },
  {
    q: "What AI features are included?",
    a: "Our AI can enhance your professional summary, rewrite bullet points, suggest skills, score your resume, check ATS compatibility, generate cover letters, create interview questions, and tailor your resume to specific job descriptions.",
  },
  {
    q: "Can I import my existing resume?",
    a: "Absolutely. You can upload your existing resume as a PDF and our AI will parse it into structured, editable content. No need to start from scratch.",
  },
  {
    q: "Are the templates ATS-friendly?",
    a: "Yes, all templates are designed with clean, semantic structure that applicant tracking systems can parse easily. You can also run an ATS score check to see how your resume performs.",
  },
  {
    q: "How does the Premium upgrade work?",
    a: "Premium is a one-time payment of ₹299 (lifetime). It removes all daily usage limits on AI features and gives you priority processing. No subscription, no recurring fees.",
  },
  {
    q: "Can I share my resume with a public link?",
    a: "Yes, you can toggle public sharing on any resume and get a shareable link. Recruiters can view it without needing an account.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const ref = useScrollReveal();

  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-6 py-20">
      <div ref={ref} className="reveal flex flex-col items-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
          <HelpCircle className="size-4" />
          <span>FAQ</span>
        </div>

        <Title
          title="Frequently asked questions"
          description="Everything you need to know about the resume builder."
        />
      </div>

      <div className="mt-10 space-y-3">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="reveal overflow-hidden rounded-2xl border border-line bg-surface transition-all"
            style={{ transitionDelay: `${i * 80}ms` }}
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-canvas"
            >
              <span className="font-medium text-ink">{faq.q}</span>
              <ChevronDown
                className={`size-5 shrink-0 text-muted transition-transform duration-300 ${
                  openIndex === i ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openIndex === i ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <p className="border-t border-line px-6 py-4 text-sm text-muted leading-relaxed">
                {faq.a}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
