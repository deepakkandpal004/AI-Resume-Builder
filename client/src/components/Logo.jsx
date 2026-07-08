// Logo with smart dark-mode adaptation.
//
// The logo.png has a white background with dark navy "Resume" text and green AI/icon.
//
// Dark mode filter strategy (variant="dark" or .dark .logo-auto):
//   Step 1 — invert(1):          white bg → black, navy "Resume" → near-white, green → magenta
//   Step 2 — hue-rotate(120deg): magenta icon/AI → rotates back toward green
//   Step 3 — brightness(0.9):    slight tone-down to avoid blown-out whites
//
// This makes:
//   - "Resume" text → white ✓
//   - background → black (invisible on dark surface) ✓
//   - green icon/AI → stays green (hue-rotated back) ✓
//
// Light mode: no filter — original white bg, navy "Resume", green AI.
//
// Green in logo ≈ hsl(160°). After invert(1): hue becomes 160+180=340° (red).
// hue-rotate(145deg) shifts 340° → 340+145=485°→125°... let's use 150deg for emerald recovery.
const DARK_FILTER = "invert(1) hue-rotate(150deg) brightness(0.9) saturate(1.5)";

const Logo = ({ className = "", size = "md", variant = "auto" }) => {
  const widths = { sm: 100, md: 130, lg: 160 };
  const w = widths[size] || widths.md;

  const inlineStyle = {
    width: `${w}px`,
    height: "auto",
    display: "block",
    objectFit: "contain",
  };

  // "dark" variant: hardcode the dark filter directly in the style
  if (variant === "dark") {
    inlineStyle.filter = DARK_FILTER;
  }

  return (
    <img
      src="/logo.png"
      alt="ResumeAI"
      draggable={false}
      style={inlineStyle}
      // "auto" variant: CSS class activates dark filter only inside .dark context
      className={`logo-adaptive select-none ${variant === "auto" ? "logo-auto" : ""} ${className}`}
      onError={(e) => {
        e.currentTarget.style.display = "none";
        const span = document.createElement("span");
        span.textContent = "ResumeAI";
        span.style.cssText =
          "font-family:'Space Grotesk',sans-serif;font-weight:800;font-size:1.1rem;letter-spacing:-0.03em;color:currentColor";
        e.currentTarget.parentNode.appendChild(span);
      }}
    />
  );
};

export default Logo;
