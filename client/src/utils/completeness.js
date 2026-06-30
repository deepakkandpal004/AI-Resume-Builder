/**
 * Calculates how complete a resume is as a percentage (0–100).
 * Each section is weighted by its importance to a strong resume.
 */

const CHECKS = [
  // Personal info — 30 pts total
  { label: "Full name",       weight: 8,  test: (r) => !!r.personal_info?.full_name?.trim() },
  { label: "Email",           weight: 8,  test: (r) => !!r.personal_info?.email?.trim() },
  { label: "Phone",           weight: 5,  test: (r) => !!r.personal_info?.phone?.trim() },
  { label: "Location",        weight: 4,  test: (r) => !!r.personal_info?.location?.trim() },
  { label: "Profession",      weight: 5,  test: (r) => !!r.personal_info?.profession?.trim() },
  // Summary — 15 pts
  { label: "Professional summary", weight: 15, test: (r) => r.professional_summary?.trim().length > 50 },
  // Experience — 25 pts
  { label: "Work experience", weight: 25, test: (r) => r.experience?.length > 0 },
  // Education — 10 pts
  { label: "Education",       weight: 10, test: (r) => r.education?.length > 0 },
  // Skills — 10 pts
  { label: "Skills",          weight: 10, test: (r) => r.skills?.length >= 3 },
  // Projects — 5 pts (bonus)
  { label: "Projects",        weight: 5,  test: (r) => r.project?.length > 0 },
  // Certifications — 5 pts (bonus)
  { label: "Certifications",  weight: 5,  test: (r) => r.certifications?.length > 0 },
  // Languages — 3 pts (bonus)
  { label: "Languages",       weight: 3,  test: (r) => r.languages?.length > 0 },
];

/**
 * @param {object} resumeData
 * @returns {{ score: number, missing: string[] }}
 *   score  — integer 0–100
 *   missing — labels of incomplete sections sorted by weight descending
 */
export function getCompleteness(resumeData) {
  let earned = 0;
  const missing = [];

  for (const check of CHECKS) {
    if (check.test(resumeData)) {
      earned += check.weight;
    } else {
      missing.push({ label: check.label, weight: check.weight });
    }
  }

  missing.sort((a, b) => b.weight - a.weight);

  return {
    score: Math.min(100, earned),
    missing: missing.map((m) => m.label),
  };
}

export function getCompletenessColor(score) {
  if (score >= 80) return { bar: "bg-teal-500", text: "text-teal-600 dark:text-teal-400" };
  if (score >= 50) return { bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" };
  return { bar: "bg-rose-500", text: "text-rose-600 dark:text-rose-400" };
}
