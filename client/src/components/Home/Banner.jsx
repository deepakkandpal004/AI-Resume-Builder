import React from "react";
import { Sparkles } from "lucide-react";

const Banner = () => {
  return (
    <div className="w-full bg-gradient-to-r from-brand-600 to-accent-600 py-2.5 text-center text-sm font-medium text-white">
      <p className="inline-flex items-center justify-center gap-2">
        <span className="rounded-md bg-white/20 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide">
          New
        </span>
        <Sparkles className="size-4" />
        Enhance your resume with AI-powered writing
      </p>
    </div>
  );
};

export default Banner;
