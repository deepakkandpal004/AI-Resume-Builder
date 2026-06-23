/**
 * Shared utility helpers for all resume template components.
 */

export const FONT_FAMILY_MAP = {
  inter:        "Inter, sans-serif",
  georgia:      "Georgia, serif",
  merriweather: "Merriweather, serif",
  courier:      "'Courier New', monospace",
};

/**
 * Returns the inline style object for the outermost resume container div.
 * fontSize is set in px on the root; all child sizes should use em so they
 * scale proportionally with this base value.
 */
export const getContainerStyle = (styleOptions = {}) => {
  const fontSize =
    styleOptions.fontSize >= 11 && styleOptions.fontSize <= 16
      ? styleOptions.fontSize
      : 14;

  const lineHeight = [1.2, 1.5, 1.8].includes(styleOptions.lineSpacing)
    ? styleOptions.lineSpacing
    : 1.5;

  const fontFamily =
    FONT_FAMILY_MAP[styleOptions.fontFamily] ?? "Inter, sans-serif";

  return { fontFamily, fontSize: `${fontSize}px`, lineHeight };
};

export const DEFAULT_ORDER = [
  "summary",
  "experience",
  "education",
  "projects",
  "skills",
];

/**
 * Returns the full resolved section render order.
 * Stored sectionOrder is used as the base; any missing keys are appended.
 */
export const buildSectionOrder = (styleOptions, customSections) => {
  const stored = styleOptions?.sectionOrder ?? [];
  const base = stored.length > 0 ? stored : DEFAULT_ORDER;

  const customIds = (customSections || []).map((s) => s.id);
  const allKnown = new Set(base);
  // Append any built-in or custom keys not already present
  const extra = [...DEFAULT_ORDER, ...customIds].filter((k) => !allKnown.has(k));

  return [...base, ...extra];
};
