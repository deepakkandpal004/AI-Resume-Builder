/**
 * Property-based test for ATS_Results_Panel suggestion badge rendering
 * Feature: ats-score-checker, Property 11: Suggestion score impact rendered as "+N pts"
 * Validates: Requirements 5.6
 */

import { describe, test, expect } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import fc from 'fast-check';
import ATS_Results_Panel from '../components/ats/ATS_Results_Panel';
import atsReducer from '../app/features/atsSlice';
import authReducer from '../app/features/authSlice';

fc.configureGlobal({ numRuns: 100, verbose: true });

// Helper: create a test Redux store with a given ATS state
function createTestStore(atsState) {
  return configureStore({
    reducer: { ats: atsReducer, auth: authReducer },
    preloadedState: {
      auth: {
        token: 'test-token',
        user: { id: 'test-user' },
        loading: false,
      },
      ats: atsState,
    },
  });
}

// Feature: ats-score-checker, Property 11: Suggestion score impact rendered as "+N pts"
describe('ATS_Results_Panel — Property 11: suggestion "+N pts" badge', () => {
  test('for any scoreImpact in [1,20], renders "+N pts" adjacent to suggestion', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        fc.string({ minLength: 5, maxLength: 50 }).map(t => t.replace(/[<>]/g, '-')),
        (scoreImpact, text) => {
          const suggestion = { text, scoreImpact, section: 'skills' };

          const store = createTestStore({
            scanStatus: 'succeeded',
            error: null,
            quotaExhausted: false,
            scansRemainingToday: null,
            currentScan: {
              scanId: 'test-scan-id',
              atsScore: 75,
              matchedKeywords: [],
              missingKeywords: [],
              skillsGap: [],
              suggestions: [suggestion],
              createdAt: new Date().toISOString(),
              jdSnippet: 'test',
            },
            history: [],
          });

          render(
            <Provider store={store}>
              <MemoryRouter>
                <ATS_Results_Panel resumeId="test-resume-id" />
              </MemoryRouter>
            </Provider>
          );

          // The Suggestions section is collapsed by default — click its header to expand it
          const suggestionsBtn = screen.getByRole('button', { name: /suggestions/i });
          fireEvent.click(suggestionsBtn);

          // Find the badge element with +N pts
          const badge = screen.queryByText(`+${scoreImpact} pts`);
          expect(badge).not.toBeNull();

          // Clean up between runs
          cleanup();
        }
      )
    );
  });
});
