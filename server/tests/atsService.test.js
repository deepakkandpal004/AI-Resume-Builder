/**
 * Tests for buildResumeText() and normalizeText() — Task 3.1
 *
 * Validates: Requirements 12.1, 12.2
 * Design: Services § atsService.js — Properties 17 & 18
 */

import { describe, test, expect } from "vitest";
import * as fc from "fast-check";
import { buildResumeText, normalizeText } from "../services/atsService.js";

// ─── fast-check global configuration ──────────────────────────────────────────
fc.configureGlobal({ numRuns: 100, verbose: true });

// ─────────────────────────────────────────────────────────────────────────────
// Unit tests — buildResumeText
// ─────────────────────────────────────────────────────────────────────────────

describe("buildResumeText — unit tests", () => {
  test("returns empty string for null/undefined input", () => {
    expect(buildResumeText(null)).toBe("");
    expect(buildResumeText(undefined)).toBe("");
  });

  test("returns empty string for a fully empty resume document", () => {
    expect(buildResumeText({})).toBe("");
  });

  test("includes personal_info.full_name and personal_info.profession", () => {
    const doc = {
      personal_info: { full_name: "Jane Doe", profession: "Software Engineer" },
    };
    const result = buildResumeText(doc);
    expect(result).toContain("Jane Doe");
    expect(result).toContain("Software Engineer");
  });

  test("includes professional_summary", () => {
    const doc = { professional_summary: "Experienced full-stack developer" };
    expect(buildResumeText(doc)).toContain("Experienced full-stack developer");
  });

  test("includes each skills entry", () => {
    const doc = { skills: ["React", "Node.js", "TypeScript"] };
    const result = buildResumeText(doc);
    expect(result).toContain("React");
    expect(result).toContain("Node.js");
    expect(result).toContain("TypeScript");
  });

  test("includes experience position, company, description", () => {
    const doc = {
      experience: [
        {
          position: "Senior Engineer",
          company: "Acme Corp",
          description: "Led backend redesign",
        },
      ],
    };
    const result = buildResumeText(doc);
    expect(result).toContain("Senior Engineer");
    expect(result).toContain("Acme Corp");
    expect(result).toContain("Led backend redesign");
  });

  test("includes education degree and institution", () => {
    const doc = {
      education: [
        { degree: "B.Sc. Computer Science", institution: "MIT" },
      ],
    };
    const result = buildResumeText(doc);
    expect(result).toContain("B.Sc. Computer Science");
    expect(result).toContain("MIT");
  });

  test("includes project name and description", () => {
    const doc = {
      project: [
        { name: "Resume Builder", description: "SaaS tool for building resumes" },
      ],
    };
    const result = buildResumeText(doc);
    expect(result).toContain("Resume Builder");
    expect(result).toContain("SaaS tool for building resumes");
  });

  test("includes custom_sections content", () => {
    const doc = {
      custom_sections: [
        { id: "cs1", heading: "Certifications", content: "AWS Certified Developer" },
      ],
    };
    expect(buildResumeText(doc)).toContain("AWS Certified Developer");
  });

  test("skips null / undefined / empty-string field values", () => {
    const doc = {
      personal_info: { full_name: "", profession: null },
      professional_summary: undefined,
      skills: ["", null, "Python"],
      experience: [{ position: null, company: "", description: "Built APIs" }],
    };
    const result = buildResumeText(doc);
    // Only non-empty values appear
    expect(result).toBe("Python Built APIs");
  });

  test("uses a single space between non-empty fields", () => {
    const doc = {
      personal_info: { full_name: "Alice", profession: "Designer" },
      professional_summary: "Creative",
    };
    expect(buildResumeText(doc)).toBe("Alice Designer Creative");
  });

  test("handles multiple experience / education / project entries", () => {
    const doc = {
      experience: [
        { position: "Dev", company: "Corp A", description: "Work A" },
        { position: "Lead", company: "Corp B", description: "Work B" },
      ],
      education: [
        { degree: "BSc", institution: "Uni A" },
        { degree: "MSc", institution: "Uni B" },
      ],
    };
    const result = buildResumeText(doc);
    expect(result).toContain("Dev");
    expect(result).toContain("Lead");
    expect(result).toContain("BSc");
    expect(result).toContain("MSc");
    expect(result).toContain("Uni A");
    expect(result).toContain("Uni B");
  });

  test("does not add leading or trailing spaces", () => {
    const doc = { skills: ["JavaScript"] };
    expect(buildResumeText(doc)).toBe("JavaScript");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Unit tests — normalizeText
// ─────────────────────────────────────────────────────────────────────────────

describe("normalizeText — unit tests", () => {
  test("returns empty string for null/undefined/empty input", () => {
    expect(normalizeText(null)).toBe("");
    expect(normalizeText(undefined)).toBe("");
    expect(normalizeText("")).toBe("");
  });

  test("lowercases all letters", () => {
    expect(normalizeText("Hello World")).toBe("hello world");
  });

  test("preserves digits", () => {
    expect(normalizeText("Python 3")).toBe("python 3");
  });

  test("preserves hyphens", () => {
    expect(normalizeText("full-stack developer")).toBe("full-stack developer");
  });

  test("preserves forward slashes", () => {
    expect(normalizeText("React/Redux")).toBe("react/redux");
  });

  test("removes punctuation", () => {
    expect(normalizeText("C++, Java!")).toBe("c java");
  });

  test("removes parentheses and brackets", () => {
    expect(normalizeText("(TypeScript) [Node]")).toBe("typescript node");
  });

  test("removes special symbols", () => {
    expect(normalizeText("@work #hashtag $100")).toBe("work hashtag 100");
  });

  test("preserves spaces between words", () => {
    const result = normalizeText("machine learning");
    expect(result).toBe("machine learning");
  });

  test("strips nothing from already-clean input", () => {
    expect(normalizeText("react node 3 full-stack c/d")).toBe(
      "react node 3 full-stack c/d"
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Property 17: buildResumeText includes all non-empty text fields
// Validates: Requirements 12.1
// ─────────────────────────────────────────────────────────────────────────────

describe("Property 17 — buildResumeText includes all non-empty text fields", () => {
  // Arbitrary generator for a non-empty, non-whitespace-only string
  const nonEmptyStr = fc
    .string({ minLength: 1 })
    .filter((s) => s.trim().length > 0);

  test("every non-empty field value appears as a substring of the result", () => {
    // Feature: ats-score-checker, Property 17: buildResumeText includes all non-empty text fields
    fc.assert(
      fc.property(
        fc.record({
          personal_info: fc.record({
            full_name: fc.oneof(nonEmptyStr, fc.constant("")),
            profession: fc.oneof(nonEmptyStr, fc.constant("")),
          }),
          professional_summary: fc.oneof(nonEmptyStr, fc.constant("")),
          skills: fc.array(fc.oneof(nonEmptyStr, fc.constant("")), { maxLength: 5 }),
          experience: fc.array(
            fc.record({
              position: fc.oneof(nonEmptyStr, fc.constant("")),
              company: fc.oneof(nonEmptyStr, fc.constant("")),
              description: fc.oneof(nonEmptyStr, fc.constant("")),
            }),
            { maxLength: 3 }
          ),
          education: fc.array(
            fc.record({
              degree: fc.oneof(nonEmptyStr, fc.constant("")),
              institution: fc.oneof(nonEmptyStr, fc.constant("")),
            }),
            { maxLength: 3 }
          ),
          project: fc.array(
            fc.record({
              name: fc.oneof(nonEmptyStr, fc.constant("")),
              description: fc.oneof(nonEmptyStr, fc.constant("")),
            }),
            { maxLength: 3 }
          ),
          custom_sections: fc.array(
            fc.record({
              id: fc.string(),
              content: fc.oneof(nonEmptyStr, fc.constant("")),
            }),
            { maxLength: 3 }
          ),
        }),
        (doc) => {
          const result = buildResumeText(doc);

          // Collect every non-empty value we expect to see
          const expected = [];
          if (doc.personal_info.full_name.trim())
            expected.push(doc.personal_info.full_name.trim());
          if (doc.personal_info.profession.trim())
            expected.push(doc.personal_info.profession.trim());
          if (doc.professional_summary.trim())
            expected.push(doc.professional_summary.trim());
          for (const s of doc.skills)
            if (s.trim()) expected.push(s.trim());
          for (const e of doc.experience) {
            if (e.position.trim()) expected.push(e.position.trim());
            if (e.company.trim()) expected.push(e.company.trim());
            if (e.description.trim()) expected.push(e.description.trim());
          }
          for (const e of doc.education) {
            if (e.degree.trim()) expected.push(e.degree.trim());
            if (e.institution.trim()) expected.push(e.institution.trim());
          }
          for (const p of doc.project) {
            if (p.name.trim()) expected.push(p.name.trim());
            if (p.description.trim()) expected.push(p.description.trim());
          }
          for (const cs of doc.custom_sections)
            if (cs.content.trim()) expected.push(cs.content.trim());

          // Every expected value must appear as a substring
          return expected.every((val) => result.includes(val));
        }
      )
    );
  });

  test("empty fields contribute no characters to the output", () => {
    const doc = {
      personal_info: { full_name: "", profession: "" },
      professional_summary: "",
      skills: [],
      experience: [],
      education: [],
      project: [],
      custom_sections: [],
    };
    expect(buildResumeText(doc)).toBe("");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Property 18: normalizeText produces only allowed characters
// Validates: Requirements 12.2
// ─────────────────────────────────────────────────────────────────────────────

describe("Property 18 — normalizeText produces only allowed characters", () => {
  test("output contains only [a-z0-9 \\-\\/] for any string input", () => {
    // Feature: ats-score-checker, Property 18: normalizeText produces only allowed characters
    fc.assert(
      fc.property(fc.string(), (s) => {
        const result = normalizeText(s);
        // 1. All lowercase
        expect(result).toBe(result.toLowerCase());
        // 2. Only allowed characters
        expect(result).toMatch(/^[a-z0-9 \-\/]*$/);
      })
    );
  });

  test("output is always lowercase", () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        const result = normalizeText(s);
        return result === result.toLowerCase();
      })
    );
  });

  test("output never contains disallowed characters", () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        const result = normalizeText(s);
        return /^[a-z0-9 \-\/]*$/.test(result);
      })
    );
  });
});
