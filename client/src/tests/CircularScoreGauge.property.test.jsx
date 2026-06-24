/**
 * Property-based test for CircularScoreGauge color correctness
 * Feature: ats-score-checker, Property 16: CircularScoreGauge color matches score range
 * Validates: Requirements 9.1
 */

import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import fc from 'fast-check';
import CircularScoreGauge from '../components/ats/CircularScoreGauge';

fc.configureGlobal({ numRuns: 100, verbose: true });

// Feature: ats-score-checker, Property 16: CircularScoreGauge color matches score range
describe('CircularScoreGauge — Property 16: color correctness', () => {
  test('score 0–49 renders red stroke #EF4444', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 49 }), (score) => {
        const { container } = render(<CircularScoreGauge score={score} />);
        const circles = container.querySelectorAll('circle');
        // The second circle is the progress ring
        const progressRing = circles[1];
        expect(progressRing.getAttribute('stroke')).toBe('#EF4444');
      })
    );
  });

  test('score 50–74 renders amber stroke #F59E0B', () => {
    fc.assert(
      fc.property(fc.integer({ min: 50, max: 74 }), (score) => {
        const { container } = render(<CircularScoreGauge score={score} />);
        const circles = container.querySelectorAll('circle');
        const progressRing = circles[1];
        expect(progressRing.getAttribute('stroke')).toBe('#F59E0B');
      })
    );
  });

  test('score 75–100 renders green stroke #22C55E', () => {
    fc.assert(
      fc.property(fc.integer({ min: 75, max: 100 }), (score) => {
        const { container } = render(<CircularScoreGauge score={score} />);
        const circles = container.querySelectorAll('circle');
        const progressRing = circles[1];
        expect(progressRing.getAttribute('stroke')).toBe('#22C55E');
      })
    );
  });
});
