import React, { useEffect, useState } from "react";

const messages = [
  "Loading your data…",
  "Almost there…",
  "Polishing things up…",
];

const Loader = () => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 50);
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 3000);
    return () => { clearTimeout(show); clearInterval(interval); };
  }, []);

  return (
    <div
      className={`flex h-screen flex-col items-center justify-center gap-5 bg-canvas transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
    >
      <div className="relative">
        <div className="size-12 animate-spin rounded-full border-[3px] border-brand-100 border-t-brand-600 dark:border-brand-500/20 dark:border-t-brand-400" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-3 rounded-full bg-brand-500 animate-pulse" />
        </div>
      </div>
      <p className="text-sm text-muted transition-all duration-500" key={index}>
        {messages[index]}
      </p>
    </div>
  );
};

export default Loader;
