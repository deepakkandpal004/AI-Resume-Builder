import React, { useId } from "react";

// Inline logo so the wordmark adapts to light/dark (currentColor) and the
// brand-gradient badge stays consistent. Color is driven by `text-*` classes.
const Logo = ({ className = "h-9 w-auto text-ink" }) => {
  // useId ensures each Logo instance gets a unique gradient id —
  // duplicate ids in the same document cause SVG fill references to fail.
  const uid = useId().replace(/:/g, "");
  const gradId = `logo-grad-${uid}`;

  return (
    <svg
      viewBox="0 0 132 36"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Resume Builder"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4F46E5" />
          <stop offset="1" stopColor="#0D9488" />
        </linearGradient>
      </defs>

      {/* Badge */}
      <rect width="36" height="36" rx="9" fill={`url(#${gradId})`} />
      {/* Document */}
      <rect x="10.5" y="7.5" width="15" height="21" rx="2.5" fill="#ffffff" />
      <rect x="13.5" y="12" width="9" height="1.8" rx="0.9" fill="#4F46E5" />
      <rect x="13.5" y="16" width="9" height="1.8" rx="0.9" fill="#94A3B8" />
      <rect x="13.5" y="20" width="6" height="1.8" rx="0.9" fill="#94A3B8" />

      {/* Wordmark — inherits theme text color */}
      <text
        x="44"
        y="24.5"
        fontFamily="var(--font-display)"
        fontSize="18"
        fontWeight="700"
        letterSpacing="-0.5"
        fill="currentColor"
      >
        Resume
      </text>
      <circle cx="126" cy="22" r="3" fill="#0D9488" />
    </svg>
  );
};

export default Logo;
