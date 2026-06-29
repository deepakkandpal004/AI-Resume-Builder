/**
 * ImageKit URL transformation utility
 *
 * Builds an ImageKit CDN URL with the requested transformation parameters.
 * All transforms are applied server-side by ImageKit — no re-uploads needed.
 *
 * @param {string} url   - The base ImageKit CDN URL stored in the DB
 * @param {Object} opts  - Transformation options
 * @param {number}  [opts.width]   - Output width in px
 * @param {number}  [opts.height]  - Output height in px
 * @param {string}  [opts.crop]    - Crop strategy: "maintain_ratio" | "force" | "at_max" | "at_least"
 * @param {string}  [opts.focus]   - Focus point: "face" | "center" | "top" | "auto"
 * @param {string}  [opts.radius]  - Border radius: "max" for circle, or px value
 * @param {string}  [opts.effect]  - Image effect: "grayscale" | "contrast" | "sharpen" | "blur-2"
 * @returns {string} Transformed URL
 */
export const getImageKitUrl = (url, opts = {}) => {
  if (!url || typeof url !== "string") return url;

  const { width, height, crop, focus, radius, effect } = opts;

  const parts = [];
  if (width)  parts.push(`w-${width}`);
  if (height) parts.push(`h-${height}`);
  if (crop)   parts.push(`c-${crop}`);
  if (focus)  parts.push(`fo-${focus}`);
  if (radius) parts.push(`r-${radius}`);
  if (effect) parts.push(`e-${effect}`);

  if (parts.length === 0) return url;

  const tr = `tr=${parts.join(",")}`;

  // Strip any existing tr= param so we don't stack duplicate transforms
  const cleaned = url.replace(/[?&]tr=[^&]*/g, "").replace(/[?&]$/, "");

  return cleaned.includes("?") ? `${cleaned}&${tr}` : `${cleaned}?${tr}`;
};

// ─── Preset helpers used directly by templates ───────────────────────────────

/** Circle-cropped face thumbnail — used in MinimalImageTemplate sidebar */
export const getCircleAvatarUrl = (url, size = 280) =>
  getImageKitUrl(url, {
    width: size,
    height: size,
    crop: "maintain_ratio",
    focus: "face",
    radius: "max",
  });

/** Portrait crop — suitable for formal/modern templates */
export const getPortraitUrl = (url) =>
  getImageKitUrl(url, {
    width: 200,
    height: 260,
    crop: "maintain_ratio",
    focus: "face",
  });

/** Small thumbnail for preview panel — saves bandwidth */
export const getPreviewThumbUrl = (url) =>
  getImageKitUrl(url, {
    width: 150,
    height: 150,
    crop: "maintain_ratio",
    focus: "face",
  });

/** Full quality for print / PDF export */
export const getPrintQualityUrl = (url) =>
  getImageKitUrl(url, {
    width: 400,
    height: 400,
    crop: "maintain_ratio",
    focus: "face",
  });

/**
 * Apply a style effect to a URL.
 * effect can be one of: "grayscale" | "contrast" | "sharpen" | "blur-2"
 */
export const applyPhotoEffect = (url, effect) => {
  if (!effect || effect === "none") return url;
  return getImageKitUrl(url, { effect });
};
