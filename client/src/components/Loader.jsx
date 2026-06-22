import React from "react";

const Loader = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-canvas">
      <div className="size-12 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" />
      <p className="text-sm text-muted">Loading…</p>
    </div>
  );
};

export default Loader;
