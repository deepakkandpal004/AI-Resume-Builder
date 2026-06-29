/**
 * Shared utility helpers for all resume template components.
 */

// Maps stored fontFamily value → CSS font-family string
export const FONT_FAMILY_MAP = {
  inter:          "Inter, sans-serif",
  georgia:        "Georgia, serif",
  merriweather:   "Merriweather, serif",
  courier:        "'Courier New', monospace",
  playfair:       "'Playfair Display', serif",
  lato:           "Lato, sans-serif",
  raleway:        "Raleway, sans-serif",
  sourceserif:    "'Source Serif 4', serif",
  nunitosans:     "'Nunito Sans', sans-serif",
  garamond:       "'EB Garamond', serif",
  ibmplexserif:   "'IBM Plex Serif', serif",
};

/**
 * Returns the inline style object for the outermost resume container div.
 * Sets fontFamily, fontSize (px), and lineHeight so all children inherit.
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

/**
 * Returns extra inline styles to apply to section heading elements.
 * Merges with whatever base heading style the template already uses.
 */
export const getHeadingStyle = (styleOptions = {}) => ({
  fontWeight: styleOptions.headingBold !== false ? 700 : 400,
  fontStyle:  styleOptions.headingItalic ? "italic" : "normal",
});

/**
 * Returns extra inline styles to apply to body/content text elements.
 */
export const getContentStyle = (styleOptions = {}) => ({
  fontWeight: styleOptions.contentBold   ? 700 : 400,
  fontStyle:  styleOptions.contentItalic ? "italic" : "normal",
});

export const DEFAULT_ORDER = [
  "summary",
  "experience",
  "education",
  "projects",
  "skills",
  "certifications",
  "languages",
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
  const extra = [...DEFAULT_ORDER, ...customIds].filter((k) => !allKnown.has(k));

  return [...base, ...extra];
};
