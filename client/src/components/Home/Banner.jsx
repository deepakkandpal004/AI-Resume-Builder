import { Sparkles } from "lucide-react";

const Banner = () => (
  <div className="w-full bg-slate-800 py-2.5 text-center text-sm font-medium text-white backdrop-blur-sm">
    <p className="inline-flex items-center justify-center gap-2">
      <span className="rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
        New
      </span>
      <Sparkles className="size-3.5" />
      Build professional resumes that pass ATS filters — get started in minutes
    </p>
  </div>
);

export default Banner;
