/**
 * Shared utility helpers for all resume template components.
 * Import these instead of duplicating the logic in each template.
 */

/**
 * Maps the stored fontFamily value to the full CSS font-family string.
 */
export const FONT_FAMILY_MAP = {
  inter:        "Inter, sans-serif",
  georgia:      "Georgia, serif",
  merriweather: "Merriweather, serif",
  courier:      "'Courier New', monospace",
};

/**
 * Returns the inline style object for the outermost resume container div.
 * Applies safe fallbacks for every property.
 *
 * @param {object} styleOptions - The style_options object from resume data.
 * @returns {{ fontFamily: string, fontSize: string, lineHeight: number }}
 */
export const getContainerStyle = (styleOptions = {}) => ({
  fontFamily: FONT_FAMILY_MAP[styleOptions.fontFamily] ?? "Inter, sans-serif",
  fontSize: `${
    styleOptions.fontSize >= 11 && styleOptions.fontSize <= 16
      ? styleOptions.fontSize
      : 14
  }px`,
  lineHeight: [1.2, 1.5, 1.8].includes(styleOptions.lineSpacing)
    ? styleOptions.lineSpacing
    : 1.5,
});

/**
 * The default section render order used when no sectionOrder is stored.
 */
export const DEFAULT_ORDER = [
  "summary",
  "experience",
  "education",
  "projects",
  "skills",
];

/**
 * Returns the full resolved section render order.
 *
 * - If styleOptions.sectionOrder is non-empty, it is used as the base order.
 * - Otherwise DEFAULT_ORDER is used.
 * - Any keys present in DEFAULT_ORDER or customSections that are not already
 *   in the resolved order are appended at the end, preserving their relative
 *   order so no section is silently dropped.
 *
 * @param {object} styleOptions   - The style_options object from resume data.
 * @param {Array}  customSections - The custom_sections array from resume data.
 * @returns {string[]} The full ordered array of section keys.
 */
export const buildSectionOrder = (styleOptions, customSections) => {
  const order =
    styleOptions?.sectionOrder?.length > 0
      ? styleOptions.sectionOrder
      : DEFAULT_ORDER;

  const customIds = (customSections || []).map((s) => s.id);
  const allKnown = new Set(order);
  const extra = [...DEFAULT_ORDER, ...customIds].filter((k) => !allKnown.has(k));

  return [...order, ...extra];
};
