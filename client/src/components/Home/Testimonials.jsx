import React from "react";
import { Star, MessageCircle } from "lucide-react";
import Title from "./Title";
import { useScrollReveal } from "../../hooks/useScrollReveal";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Software Engineer at Google",
    avatar: "SC",
    quote: "The ATS score checker helped me optimize my resume for a specific role. I got an interview call within a week! The AI suggestions were spot-on.",
    rating: 5,
    color: "bg-brand-600",
  },
  {
    name: "Marcus Johnson",
    role: "Product Manager at Stripe",
    avatar: "MJ",
    quote: "I love how easy it is to switch between templates and customize colors. The cover letter generator saved me hours of writing. Highly recommend!",
    rating: 5,
    color: "bg-accent-600",
  },
  {
    name: "Priya Patel",
    role: "Data Analyst at Netflix",
    avatar: "PP",
    quote: "The interview prep feature is a game-changer. The questions were incredibly relevant to my field and the suggested answers gave me a great framework.",
    rating: 5,
    color: "bg-brand-600",
  },
];

const Testimonials = () => {
  const ref = useScrollReveal();

  return (
    <section id="testimonials" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
      <div ref={ref} className="reveal flex flex-col items-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
          <MessageCircle className="size-4" />
          <span>Testimonials</span>
        </div>

        <Title
          title="Loved by job seekers"
          description="Hear from people who landed their dream roles using our resume builder."
        />
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <div
            key={t.name}
            className="reveal rounded-2xl border border-line bg-surface p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
            style={{ transitionDelay: `${i * 150}ms` }}
          >
            {/* Rating */}
            <div className="mb-4 flex gap-1">
              {Array.from({ length: t.rating }).map((_, j) => (
                <Star key={j} className="size-4 fill-amber-400 text-amber-400" />
              ))}
            </div>

            {/* Quote */}
            <p className="text-sm text-body leading-relaxed">&ldquo;{t.quote}&rdquo;</p>

            {/* Author */}
            <div className="mt-5 flex items-center gap-3">
              <div className={`flex size-10 items-center justify-center rounded-full text-sm font-semibold text-white ${t.color}`}>
                {t.avatar}
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">{t.name}</p>
                <p className="text-xs text-muted">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
