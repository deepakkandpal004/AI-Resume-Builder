/**
 * Property-based tests for atsService.js
 *
 * Uses fast-check for property testing and Vitest as the test runner.
 */

import { describe, test } from "vitest";
import fc from "fast-check";
import { clampScore, checkKeywordMatch, normalizeText, parseAtsResponse } from "../services/atsService.js";

// Configure fast-check: at least 100 runs per property
fc.configureGlobal({ numRuns: 100, verbose: true });

// ─── Property 4: clampScore always returns an integer in [0, 100] ────────────
// Feature: ats-score-checker, Property 4: clampScore always returns an integer in [0, 100]
// Validates: Requirements 2.1, 13.4
describe("clampScore", () => {
  test("Property 4 — always returns an integer in [0, 100] for any finite number", () => {
    fc.assert(
      fc.property(fc.double({ noNaN: true, noDefaultInfinity: true }), (n) => {
        const result = clampScore(n);
        return Number.isInteger(result) && result >= 0 && result <= 100;
      })
    );
  });

  test("Property 4 — values below 0 clamp to 0", () => {
    fc.assert(
      fc.property(fc.double({ max: -0.5, noNaN: true, noDefaultInfinity: true }), (n) => {
        return clampScore(n) === 0;
      })
    );
  });

  test("Property 4 — values above 100 clamp to 100", () => {
    fc.assert(
      fc.property(fc.double({ min: 100.5, noNaN: true, noDefaultInfinity: true }), (n) => {
        return clampScore(n) === 100;
      })
    );
  });

  test("Property 4 — in-range integers are returned unchanged", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), (n) => {
        return clampScore(n) === n;
      })
    );
  });

  test("Property 4 — 0.5 rounds up to 1 (JS Math.round behavior)", () => {
    fc.assert(
      fc.property(
        // integers + 0.5 in range (0.5 → 100.5 is out of range, so test 0.5–99.5)
        fc.integer({ min: 0, max: 99 }).map((n) => n + 0.5),
        (n) => {
          return clampScore(n) === Math.round(n);
        }
      )
    );
  });
});

// ─── Property 5: checkKeywordMatch ───────────────────────────────────────────
// Feature: ats-score-checker, Property 5: Keyword matching is case-insensitive
// and requires consecutive word order
// Validates: Requirements 3.2, 3.6
describe("checkKeywordMatch", () => {
  // Helper: build alphabetic words for clean keyword/resume generation
  const alphaWord = fc.stringMatching(/^[a-z]{3,10}$/);

  test("Property 5 — keyword found verbatim returns true", () => {
    fc.assert(
      fc.property(
        alphaWord,
        alphaWord,
        alphaWord,
        (prefix, kw, suffix) => {
          // normalizedResumeText already lowercase; keyword present verbatim
          const normalizedResume = normalizeText(`${prefix} ${kw} ${suffix}`);
          return checkKeywordMatch(kw, normalizedResume) === true;
        }
      )
    );
  });

  test("Property 5 — keyword with uppercase variant still matches (case-insensitive)", () => {
    fc.assert(
      fc.property(
        alphaWord,
        alphaWord,
        alphaWord,
        (prefix, kw, suffix) => {
          const normalizedResume = normalizeText(`${prefix} ${kw} ${suffix}`);
          // Pass keyword in uppercase — normalizeText inside checkKeywordMatch lowercases it
          return checkKeywordMatch(kw.toUpperCase(), normalizedResume) === true;
        }
      )
    );
  });

  test("Property 5 — multi-word keyword found consecutively returns true", () => {
    fc.assert(
      fc.property(
        alphaWord,
        alphaWord,
        alphaWord,
        alphaWord,
        (prefix, word1, word2, suffix) => {
          // Ensure distinct words so the pair is unambiguous
          if (word1 === word2) return true; // skip degenerate case
          const normalizedResume = normalizeText(`${prefix} ${word1} ${word2} ${suffix}`);
          const keyword = `${word1} ${word2}`;
          return checkKeywordMatch(keyword, normalizedResume) === true;
        }
      )
    );
  });

  test("Property 5 — keyword absent from resume returns false", () => {
    fc.assert(
      fc.property(
        alphaWord,
        alphaWord,
        (kw, resumeWord) => {
          // Guarantee keyword does NOT appear in resume by making them different
          if (kw === resumeWord) return true; // skip degenerate case
          const normalizedResume = normalizeText(resumeWord);
          // Only assert false when kw is not a substring of resumeWord
          if (resumeWord.includes(kw)) return true; // skip — kw is substring of resumeWord
          return checkKeywordMatch(kw, normalizedResume) === false;
        }
      )
    );
  });

  test("Property 5 — reversed multi-word keyword order returns false", () => {
    fc.assert(
      fc.property(
        alphaWord,
        alphaWord,
        (word1, word2) => {
          if (word1 === word2) return true; // skip degenerate — reversed = same
          // resume has "word2 word1"; keyword is "word1 word2"
          // They should NOT match because order differs
          const normalizedResume = normalizeText(`${word2} ${word1}`);
          const keyword = `${word1} ${word2}`;
          // Only meaningful when the pair reversed doesn't accidentally contain the forward pair
          if (normalizedResume.includes(normalizeText(keyword))) return true; // edge — skip
          return checkKeywordMatch(keyword, normalizedResume) === false;
        }
      )
    );
  });

  test("Property 5 — empty keyword returns false", () => {
    fc.assert(
      fc.property(fc.string(), (resumeText) => {
        const normalized = normalizeText(resumeText);
        return checkKeywordMatch("", normalized) === false;
      })
    );
  });
});

// ─── Property 19: parseAtsResponse — markdown fence stripping is transparent ─
// Feature: ats-score-checker, Property 19: parseAtsResponse markdown fence stripping is transparent
// Validates: Requirements 13.1, 13.5

describe("parseAtsResponse — Property 19: markdown fence stripping is transparent", () => {
  // Generator for a valid ATS response object
  const validAtsObject = fc.record({
    ats_score: fc.integer({ min: 0, max: 100 }),
    matched_keywords: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
    missing_keywords: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
    skills_gap: fc.constant([]),
    suggestions: fc.constant([]),
  });

  test("Property 19 — ```json fence-wrapped JSON produces same atsScore as plain JSON", () => {
    fc.assert(
      fc.property(validAtsObject, (obj) => {
        const plain = JSON.stringify(obj);
        const fencedJson = "```json\n" + plain + "\n```";

        const resultPlain = parseAtsResponse(plain);
        const resultFenced = parseAtsResponse(fencedJson);

        return resultFenced.atsScore === resultPlain.atsScore;
      })
    );
  });

  test("Property 19 — plain ``` fence-wrapped JSON produces same atsScore as plain JSON", () => {
    fc.assert(
      fc.property(validAtsObject, (obj) => {
        const plain = JSON.stringify(obj);
        const fencedPlain = "```\n" + plain + "\n```";

        const resultPlain = parseAtsResponse(plain);
        const resultFenced = parseAtsResponse(fencedPlain);

        return resultFenced.atsScore === resultPlain.atsScore;
      })
    );
  });

  test("Property 19 — atsScore equals clampScore(obj.ats_score) for plain JSON", () => {
    fc.assert(
      fc.property(validAtsObject, (obj) => {
        const plain = JSON.stringify(obj);
        const result = parseAtsResponse(plain);
        return result.atsScore === clampScore(obj.ats_score);
      })
    );
  });

  test("Property 19 — atsScore equals clampScore(obj.ats_score) for ```json fence-wrapped JSON", () => {
    fc.assert(
      fc.property(validAtsObject, (obj) => {
        const fenced = "```json\n" + JSON.stringify(obj) + "\n```";
        const result = parseAtsResponse(fenced);
        return result.atsScore === clampScore(obj.ats_score);
      })
    );
  });

  test("Property 19 — fence wrapping and plain parsing yield identical matchedKeywords", () => {
    fc.assert(
      fc.property(validAtsObject, (obj) => {
        const plain = JSON.stringify(obj);
        const fenced = "```json\n" + plain + "\n```";

        const resultPlain = parseAtsResponse(plain);
        const resultFenced = parseAtsResponse(fenced);

        return (
          JSON.stringify(resultPlain.matchedKeywords) ===
          JSON.stringify(resultFenced.matchedKeywords)
        );
      })
    );
  });
});

// ─── Property 20: parseAtsResponse — absent array fields default to [] ────────
// Feature: ats-score-checker, Property 20: parseAtsResponse substitutes empty arrays for absent fields
// Validates: Requirements 13.6
describe("parseAtsResponse — Property 20: absent array fields default to empty arrays", () => {
  /** Assert that all four camelCase array fields exist and are arrays */
  const allArrayFields = (result) =>
    Array.isArray(result.matchedKeywords) &&
    Array.isArray(result.missingKeywords) &&
    Array.isArray(result.skillsGap) &&
    Array.isArray(result.suggestions);

  test("Property 20 — only ats_score present: all four array fields are arrays", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), (score) => {
        const raw = JSON.stringify({ ats_score: score });
        const result = parseAtsResponse(raw);
        return allArrayFields(result);
      })
    );
  });

  test("Property 20 — matched_keywords absent: matchedKeywords is array", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.array(fc.string({ minLength: 1 }), { maxLength: 5 }),
        (score, missing) => {
          const raw = JSON.stringify({
            ats_score: score,
            missing_keywords: missing,
            skills_gap: [],
            suggestions: [],
          });
          const result = parseAtsResponse(raw);
          return Array.isArray(result.matchedKeywords) && result.matchedKeywords.length === 0;
        }
      )
    );
  });

  test("Property 20 — missing_keywords absent: missingKeywords is array", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.array(fc.string({ minLength: 1 }), { maxLength: 5 }),
        (score, matched) => {
          const raw = JSON.stringify({
            ats_score: score,
            matched_keywords: matched,
            skills_gap: [],
            suggestions: [],
          });
          const result = parseAtsResponse(raw);
          return Array.isArray(result.missingKeywords) && result.missingKeywords.length === 0;
        }
      )
    );
  });

  test("Property 20 — skills_gap absent: skillsGap is array", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), (score) => {
        const raw = JSON.stringify({
          ats_score: score,
          matched_keywords: [],
          missing_keywords: [],
          suggestions: [],
        });
        const result = parseAtsResponse(raw);
        return Array.isArray(result.skillsGap) && result.skillsGap.length === 0;
      })
    );
  });

  test("Property 20 — suggestions absent: suggestions is array", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), (score) => {
        const raw = JSON.stringify({
          ats_score: score,
          matched_keywords: [],
          missing_keywords: [],
          skills_gap: [],
        });
        const result = parseAtsResponse(raw);
        return Array.isArray(result.suggestions) && result.suggestions.length === 0;
      })
    );
  });

  test("Property 20 — all four array fields absent: every result field is an empty array", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 100 }), (score) => {
        const raw = JSON.stringify({ ats_score: score });
        const result = parseAtsResponse(raw);
        return (
          allArrayFields(result) &&
          result.matchedKeywords.length === 0 &&
          result.missingKeywords.length === 0 &&
          result.skillsGap.length === 0 &&
          result.suggestions.length === 0
        );
      })
    );
  });

  test("Property 20 — arbitrary subset of array fields absent: all result arrays still exist", () => {
    // Generator: randomly include or exclude each of the four array fields
    const arrayKeys = ["matched_keywords", "missing_keywords", "skills_gap", "suggestions"];

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        // bitmask: which of the 4 keys to include (0 = exclude, 1 = include)
        fc.integer({ min: 0, max: 15 }),
        (score, mask) => {
          const obj = { ats_score: score };
          arrayKeys.forEach((key, idx) => {
            if ((mask >> idx) & 1) {
              obj[key] = [];
            }
          });
          const result = parseAtsResponse(JSON.stringify(obj));
          return allArrayFields(result);
        }
      )
    );
  });
});

// ─── Shared helpers for Properties 6–10 ─────────────────────────────────────

/**
 * Build a valid raw AI response JSON string.
 * Individual properties override the defaults.
 */
function makeRawResponse(overrides = {}) {
  const base = {
    ats_score: 75,
    matched_keywords: [],
    missing_keywords: [],
    skills_gap: [],
    suggestions: [],
    ...overrides,
  };
  return JSON.stringify(base);
}

// ─── Property 6: Keyword list is capped at 30 and preserves order ────────────
// Feature: ats-score-checker, Property 6: Keyword list capped at 30, preserves order
// Validates: Requirements 3.4, 3.5
describe("parseAtsResponse — keyword cap and order", () => {
  // Arbitraries ---------------------------------------------------------------
  // Unique lowercase alpha strings of length 3–12
  const keyword = fc
    .stringMatching(/^[a-z]{3,12}$/)
    .filter((s) => s.length >= 3);

  // Unique array of up to 50 distinct keywords
  const uniqueKeywords = (maxLen) =>
    fc.uniqueArray(keyword, { minLength: 0, maxLength: maxLen });

  test("Property 6 — combined keyword count never exceeds 30", () => {
    fc.assert(
      fc.property(
        uniqueKeywords(50),
        uniqueKeywords(50),
        (matched, missing) => {
          const raw = makeRawResponse({
            matched_keywords: matched,
            missing_keywords: missing,
          });
          const result = parseAtsResponse(raw);
          return result.matchedKeywords.length + result.missingKeywords.length <= 30;
        }
      )
    );
  });

  test("Property 6 — matched keywords are taken first (up to 30)", () => {
    fc.assert(
      fc.property(
        uniqueKeywords(50),
        uniqueKeywords(50),
        (matched, missing) => {
          const raw = makeRawResponse({
            matched_keywords: matched,
            missing_keywords: missing,
          });
          const result = parseAtsResponse(raw);
          const expectedMatchedCount = Math.min(matched.length, 30);
          return result.matchedKeywords.length === expectedMatchedCount;
        }
      )
    );
  });

  test("Property 6 — matched keywords preserve original order", () => {
    fc.assert(
      fc.property(
        uniqueKeywords(50),
        uniqueKeywords(50),
        (matched, missing) => {
          const raw = makeRawResponse({
            matched_keywords: matched,
            missing_keywords: missing,
          });
          const result = parseAtsResponse(raw);
          const expectedMatched = matched.slice(0, Math.min(matched.length, 30));
          return expectedMatched.every((kw, i) => result.matchedKeywords[i] === kw);
        }
      )
    );
  });

  test("Property 6 — missing keywords fill remaining slots after matched", () => {
    fc.assert(
      fc.property(
        uniqueKeywords(30),
        uniqueKeywords(30),
        (matched, missing) => {
          const raw = makeRawResponse({
            matched_keywords: matched,
            missing_keywords: missing,
          });
          const result = parseAtsResponse(raw);
          const remainingSlots = 30 - Math.min(matched.length, 30);
          const expectedMissingCount = Math.min(missing.length, remainingSlots);
          return result.missingKeywords.length === expectedMissingCount;
        }
      )
    );
  });
});

// ─── Property 7: Skills gap items never exceed 15 and preserve ordering ──────
// Feature: ats-score-checker, Property 7: Skills gap items never exceed 15
// Validates: Requirements 4.4
describe("parseAtsResponse — skills gap cap and order", () => {
  const priority = fc.constantFrom("High", "Medium", "Low");
  const category = fc.constantFrom("Technical", "Soft Skills", "Tools/Platforms");
  const skillName = fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9 ]{2,20}$/);

  const skillsGapItem = fc.record({
    skill: skillName,
    priority,
    category,
  });

  test("Property 7 — skillsGap length never exceeds 15", () => {
    fc.assert(
      fc.property(
        fc.array(skillsGapItem, { minLength: 0, maxLength: 20 }),
        (items) => {
          const raw = makeRawResponse({ skills_gap: items });
          const result = parseAtsResponse(raw);
          return result.skillsGap.length <= 15;
        }
      )
    );
  });

  test("Property 7 — skillsGap takes exactly min(items.length, 15) entries", () => {
    fc.assert(
      fc.property(
        fc.array(skillsGapItem, { minLength: 0, maxLength: 20 }),
        (items) => {
          const raw = makeRawResponse({ skills_gap: items });
          const result = parseAtsResponse(raw);
          return result.skillsGap.length === Math.min(items.length, 15);
        }
      )
    );
  });

  test("Property 7 — skillsGap preserves original order (first 15)", () => {
    fc.assert(
      fc.property(
        fc.array(skillsGapItem, { minLength: 0, maxLength: 20 }),
        (items) => {
          const raw = makeRawResponse({ skills_gap: items });
          const result = parseAtsResponse(raw);
          const expected = items.slice(0, 15);
          return expected.every((item, i) => result.skillsGap[i].skill === item.skill);
        }
      )
    );
  });
});

// ─── Property 8: Skills gap priority is preserved exactly ────────────────────
// Feature: ats-score-checker, Property 8: Skills gap priority preserved
// Validates: Requirements 4.5
describe("parseAtsResponse — skills gap priority preservation", () => {
  const priority = fc.constantFrom("High", "Medium", "Low");
  const category = fc.constantFrom("Technical", "Soft Skills", "Tools/Platforms");
  const skillName = fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9 ]{2,20}$/);

  test("Property 8 — each skill's priority is preserved exactly", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({ skill: skillName, priority, category }),
          { minLength: 1, maxLength: 15 }
        ),
        (items) => {
          const raw = makeRawResponse({ skills_gap: items });
          const result = parseAtsResponse(raw);
          return result.skillsGap.every(
            (resultItem, i) => resultItem.priority === items[i].priority
          );
        }
      )
    );
  });

  test("Property 8 — High priority items are not downgraded", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({ skill: skillName, priority: fc.constant("High"), category }),
          { minLength: 1, maxLength: 10 }
        ),
        (items) => {
          const raw = makeRawResponse({ skills_gap: items });
          const result = parseAtsResponse(raw);
          return result.skillsGap.every((item) => item.priority === "High");
        }
      )
    );
  });

  test("Property 8 — Low priority items are not upgraded", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({ skill: skillName, priority: fc.constant("Low"), category }),
          { minLength: 1, maxLength: 10 }
        ),
        (items) => {
          const raw = makeRawResponse({ skills_gap: items });
          const result = parseAtsResponse(raw);
          return result.skillsGap.every((item) => item.priority === "Low");
        }
      )
    );
  });
});

// ─── Property 9: Suggestions list is capped at 7 and preserves order ─────────
// Feature: ats-score-checker, Property 9: Suggestions list capped at 7
// Validates: Requirements 5.1
describe("parseAtsResponse — suggestions cap and order", () => {
  const suggestionItem = fc.record({
    text: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9 .,]{5,50}$/),
    score_impact: fc.integer({ min: 1, max: 20 }),
    section: fc.constantFrom("summary", "experience", "education", "projects", "skills"),
  });

  test("Property 9 — suggestions length never exceeds 7", () => {
    fc.assert(
      fc.property(
        fc.array(suggestionItem, { minLength: 0, maxLength: 15 }),
        (items) => {
          const raw = makeRawResponse({ suggestions: items });
          const result = parseAtsResponse(raw);
          return result.suggestions.length <= 7;
        }
      )
    );
  });

  test("Property 9 — suggestions takes exactly min(items.length, 7) entries", () => {
    fc.assert(
      fc.property(
        fc.array(suggestionItem, { minLength: 0, maxLength: 15 }),
        (items) => {
          const raw = makeRawResponse({ suggestions: items });
          const result = parseAtsResponse(raw);
          return result.suggestions.length === Math.min(items.length, 7);
        }
      )
    );
  });

  test("Property 9 — suggestions preserve original text order (first 7)", () => {
    fc.assert(
      fc.property(
        fc.array(suggestionItem, { minLength: 0, maxLength: 15 }),
        (items) => {
          const raw = makeRawResponse({ suggestions: items });
          const result = parseAtsResponse(raw);
          const expected = items.slice(0, 7);
          return expected.every((item, i) => result.suggestions[i].text === item.text);
        }
      )
    );
  });
});

// ─── Property 10: Suggestions preserve input order (no re-sorting) ───────────
// Feature: ats-score-checker, Property 10: Suggestions preserve input order
// Validates: Requirements 5.4
describe("parseAtsResponse — suggestions order not altered", () => {
  /**
   * Generate suggestions with strictly descending score_impact values.
   * This lets us verify that parseAtsResponse does NOT re-sort them
   * (a re-sort in either direction would still match, but the test checks
   * positional identity — original order is always preserved).
   */
  const descendingImpactSuggestions = fc
    .uniqueArray(fc.integer({ min: 1, max: 20 }), { minLength: 2, maxLength: 7 })
    .map((impacts) =>
      [...impacts]
        .sort((a, b) => b - a) // descending
        .map((score_impact, idx) => ({
          text: `suggestion-${idx}-impact-${score_impact}`,
          score_impact,
          section: "skills",
        }))
    );

  test("Property 10 — descending scoreImpact order is preserved", () => {
    fc.assert(
      fc.property(descendingImpactSuggestions, (items) => {
        const raw = makeRawResponse({ suggestions: items });
        const result = parseAtsResponse(raw);
        return result.suggestions.every((s, i) => s.scoreImpact === items[i].score_impact);
      })
    );
  });

  test("Property 10 — arbitrary input order is not changed by parseAtsResponse", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            text: fc.stringMatching(/^[a-zA-Z][a-zA-Z0-9 .,]{5,50}$/),
            score_impact: fc.integer({ min: 1, max: 20 }),
            section: fc.constantFrom("summary", "experience", "education", "projects", "skills"),
          }),
          { minLength: 1, maxLength: 7 }
        ),
        (items) => {
          const raw = makeRawResponse({ suggestions: items });
          const result = parseAtsResponse(raw);
          // Every item's scoreImpact must match the original position
          return result.suggestions.every((s, i) => s.scoreImpact === items[i].score_impact);
        }
      )
    );
  });
});
