import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";
import ModernTemplate from "../templates/ModernTemplate";
import { dummyResumeData } from "../../assets/assets";

const Hero = () => {
  void motion;
  const { user } = useSelector((state) => state.auth);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-24">
      <div className="pointer-events-none absolute inset-0 gradient-glow" />
      <div className="pointer-events-none absolute inset-0 gradient-glow-right" />

      <motion.div
        className="pointer-events-none absolute -top-48 left-1/2 -z-10 -translate-x-1/2 rounded-full bg-emerald-500/10"
        style={{ width: "600px", height: "600px", filter: "blur(130px)" }}
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-40 -right-24 -z-10 rounded-full bg-teal-400/10"
        style={{ width: "400px", height: "400px", filter: "blur(100px)" }}
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="mx-auto flex w-full max-w-7xl flex-col items-center px-6 py-16 md:flex-row md:py-20 md:px-10">
        <div className="flex-1 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-brand-400 md:mx-0">
              Build faster. Apply smarter.
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-3xl text-5xl font-black leading-[1.02] text-ink md:text-6xl xl:text-7xl"
            style={{ letterSpacing: "-0.04em" }}
          >
            Create a resume that gets
            <span className="text-gradient"> interviews</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-body md:mx-0"
          >
            Build ATS-friendly resumes, improve every bullet with AI, and
            share a polished version in minutes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row md:justify-start"
          >
            <Link
              to="/app"
              className="btn-primary px-10 text-base shadow-xl shadow-emerald-500/20"
              style={{ minHeight: "3.25rem" }}
            >
              {user ? "Go to Dashboard" : "Start Building Free"}
              <ArrowRight className="size-4" />
            </Link>
            <a
              href="#product-showcase"
              className="btn-outline px-8 text-base"
              style={{ minHeight: "3.25rem" }}
            >
              <Play className="size-4" />
              Watch Demo
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-5 text-sm text-muted"
          >
            No credit card required &middot; Free forever
          </motion.p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:justify-start">
            {[
              "6 ATS-ready templates",
              "AI suggestions on demand",
              "One-click share links",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-line bg-surface/50 px-4 py-2 text-xs font-semibold tracking-wide text-muted"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-16 flex-1 md:mt-0 md:pl-16">
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="animate-float" style={{ perspective: "1200px" }}>
              <div className="relative overflow-hidden rounded-2xl border border-line bg-surface/30 backdrop-blur-sm shadow-2xl shadow-emerald-500/10 transition-all duration-500 hover:shadow-emerald-500/20 hover:-translate-y-2 group">
                <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
                  <span className="size-2.5 rounded-full bg-red-400/60" />
                  <span className="size-2.5 rounded-full bg-yellow-400/60" />
                  <span className="size-2.5 rounded-full bg-emerald-400/60" />
                  <span className="ml-3 rounded-md bg-surface/50 px-3 py-1 text-[10px] text-muted">
                      Live resume preview
                  </span>
                </div>
                <div className="p-4 bg-canvas/80">
                  <div className="grid grid-cols-5 gap-4">
                    <div className="col-span-2 space-y-3 rounded-lg border border-line bg-surface/30 p-3 text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-emerald-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Resume Editor</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <div className="text-[9px] text-muted font-medium mb-1">Full Name</div>
                          <div className="rounded border border-line bg-surface/30 px-2 py-1 text-[10px] text-ink/80 font-medium font-sans">
                            Alex Smith
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] text-muted font-medium mb-1">Job Title</div>
                          <div className="rounded border border-line bg-surface/30 px-2 py-1 text-[10px] text-emerald-400 font-medium font-sans">
                            Full Stack Developer
                          </div>
                        </div>
                        <div>
                          <div className="text-[9px] text-muted font-medium mb-1">Skills</div>
                          <div className="flex flex-wrap gap-1">
                            {["React", "Node.js", "AI"].map((tag) => (
                              <span key={tag} className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-semibold text-emerald-400">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="rounded border border-emerald-500/10 bg-emerald-500/5 p-2 text-left">
                        <div className="flex items-center gap-1 text-[8px] font-bold text-emerald-300">
                          <span className="size-1 rounded-full bg-emerald-400 animate-pulse-soft" />
                          AI Suggestion
                        </div>
                        <p className="mt-0.5 text-[7.5px] leading-normal text-muted">
                          Strong experience section. Add metrics to impact statement.
                        </p>
                      </div>
                    </div>

                    <div className="col-span-3 flex flex-col rounded-lg border border-line bg-surface/30 p-3">
                      <div className="mb-2 flex items-center gap-1.5 text-left">
                        <span className="size-1.5 rounded-full bg-teal-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Live Preview</span>
                      </div>

                      <div className="relative flex-1 overflow-hidden rounded-md bg-white shadow-inner" style={{ minHeight: "260px" }}>
                        <div 
                          className="absolute left-0 top-0 origin-top-left" 
                          style={{ 
                            transform: "scale(0.42)", 
                            width: "238%", 
                            height: "238%" 
                          }}
                        >
                          <ModernTemplate
                            data={dummyResumeData[0]}
                            accentColor="#10b981"
                            styleOptions={{}}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-left">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
                    <span className="text-[10px] text-emerald-300/80">
                      AI suggests adding more action verbs to your experience section
                    </span>
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-t from-emerald-500/5 to-transparent" />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="absolute -bottom-4 -left-4 rounded-xl border border-line bg-surface/80 backdrop-blur-md px-4 py-2 shadow-lg"
            >
              <div className="flex items-center gap-2 text-xs">
                <span className="text-emerald-400 font-bold">ATS Score: 92</span>
                <span className="text-muted">|</span>
                <span className="text-body">Top 5%</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
