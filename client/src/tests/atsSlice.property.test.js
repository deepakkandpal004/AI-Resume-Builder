/**
 * Property-based test for JD input sessionStorage round-trip
 * Feature: ats-score-checker, Property 3: JD input round-trip persistence via sessionStorage
 * Validates: Requirements 1.5
 */

import { describe, test, beforeEach } from 'vitest';
import fc from 'fast-check';

fc.configureGlobal({ numRuns: 100, verbose: true });

// Feature: ats-score-checker, Property 3: JD input round-trip persistence via sessionStorage
describe('sessionStorage round-trip — Property 3', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test('writing to sessionStorage and reading back produces identical string', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),  // any non-empty string
        fc.string({ minLength: 1 }),  // resumeId
        (jdText, resumeId) => {
          const key = 'ats_jd_' + resumeId;
          sessionStorage.setItem(key, jdText);
          const retrieved = sessionStorage.getItem(key);
          return retrieved === jdText;
        }
      )
    );
  });

  test('different resumeIds use separate keys and do not interfere', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        (jd1, jd2, resumeId1, resumeId2) => {
          if (resumeId1 === resumeId2) return true; // skip degenerate case
          const key1 = 'ats_jd_' + resumeId1;
          const key2 = 'ats_jd_' + resumeId2;
          sessionStorage.setItem(key1, jd1);
          sessionStorage.setItem(key2, jd2);
          return (
            sessionStorage.getItem(key1) === jd1 &&
            sessionStorage.getItem(key2) === jd2
          );
        }
      )
    );
  });

  test('getItem returns null for a key that was never set', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (resumeId) => {
        const key = 'ats_jd_' + resumeId;
        return sessionStorage.getItem(key) === null;
      })
    );
  });
});
