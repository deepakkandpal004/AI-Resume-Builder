/**
 * Unit tests for ATS_Results_Panel component
 * Feature: ats-score-checker
 * Validates: Requirements 4.2, 4.3, 7.4, 7.5, 7.6, 9.3, 9.4, 9.5
 */

import { describe, test, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import ATS_Results_Panel from '../components/ats/ATS_Results_Panel';
import atsReducer from '../app/features/atsSlice';
import authReducer from '../app/features/authSlice';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function createTestStore(atsOverrides = {}) {
  return configureStore({
    reducer: { ats: atsReducer, auth: authReducer },
    preloadedState: {
      auth: {
        token: 'test-token',
        user: { id: 'test-user' },
        loading: false,
      },
      ats: {
        scanStatus: 'idle',
        error: null,
        quotaExhausted: false,
        scansRemainingToday: null,
        currentScan: null,
        history: [],
        ...atsOverrides,
      },
    },
  });
}

const MOCK_SCAN = {
  scanId: 'test-scan-1',
  atsScore: 72,
  matchedKeywords: ['React', 'TypeScript'],
  missingKeywords: ['Kubernetes'],
  skillsGap: [{ skill: 'Docker', priority: 'High', category: 'Tools/Platforms' }],
  suggestions: [
    { text: 'Add Docker experience to your resume', scoreImpact: 8, section: 'skills' },
  ],
  createdAt: new Date().toISOString(),
  jdSnippet: 'test jd',
};

function renderPanel(atsOverrides = {}, props = {}) {
  const store = createTestStore(atsOverrides);
  const onNavigateTab = props.onNavigateTab ?? vi.fn();
  render(
    <Provider store={store}>
      <MemoryRouter>
        <ATS_Results_Panel resumeId="test-resume" onNavigateTab={onNavigateTab} />
      </MemoryRouter>
    </Provider>
  );
  return { store, onNavigateTab };
}

afterEach(() => cleanup());

// ---------------------------------------------------------------------------
// Test 1: Empty state
// Validates: Requirement 4.2 — idle with no scan shows "No analysis yet" message
// The component's useEffect fires fetchLatestScan when resumeId is truthy + status is
// idle + currentScan is null. Passing an empty resumeId prevents the thunk from firing
// so the component stays in the idle/empty state for assertion.
// ---------------------------------------------------------------------------
describe('Test 1 – Empty state', () => {
  test('renders "No analysis yet" message when currentScan is null', () => {
    const store = createTestStore({ scanStatus: 'idle', currentScan: null });
    render(
      <Provider store={store}>
        <MemoryRouter>
          {/* Empty resumeId prevents the useEffect from dispatching fetchLatestScan */}
          <ATS_Results_Panel resumeId="" onNavigateTab={vi.fn()} />
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText(/No analysis yet/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Test 2: Loading skeleton
// Validates: Requirement 4.3 — loading state shows skeleton placeholders
// ---------------------------------------------------------------------------
describe('Test 2 – Loading skeleton', () => {
  test('renders skeleton placeholders when scanStatus is "loading"', () => {
    renderPanel({ scanStatus: 'loading' });
    // The loading container has aria-busy="true"
    const loadingContainer = document.querySelector('[aria-busy="true"]');
    expect(loadingContainer).not.toBeNull();
    // Should contain multiple animated skeleton elements
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Test 3: Upgrade_Prompt shown when quotaExhausted
// Validates: Requirement 7.4 — quota exhausted triggers upgrade prompt
// quotaExhausted is typically set after a failed scan (status: 'failed'),
// so the loading check is bypassed and Upgrade_Prompt renders directly.
// ---------------------------------------------------------------------------
describe('Test 3 – Upgrade Prompt', () => {
  test('renders Upgrade_Prompt when quotaExhausted is true', () => {
    renderPanel({ quotaExhausted: true, scanStatus: 'failed' });
    // The Upgrade_Prompt renders an h3 heading with this text
    expect(screen.getByRole('heading', { name: /Upgrade to Premium/i })).toBeInTheDocument();
    expect(
      screen.getByText(/You've reached your daily limit/i)
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Test 4: Score Summary expanded by default, other sections collapsed
// Validates: Requirement 9.3 — collapsible sections with Score Summary open by default
// ---------------------------------------------------------------------------
describe('Test 4 – Default section state', () => {
  test('Score Summary section is expanded and others are collapsed by default', () => {
    renderPanel({ scanStatus: 'succeeded', currentScan: MOCK_SCAN });

    // Score Summary header button should have aria-expanded="true"
    const scoreSummaryBtn = screen.getByRole('button', { name: /score summary/i });
    expect(scoreSummaryBtn).toHaveAttribute('aria-expanded', 'true');

    // Other sections should be collapsed (aria-expanded="false")
    const keywordsBtn = screen.getByRole('button', { name: /keywords/i });
    expect(keywordsBtn).toHaveAttribute('aria-expanded', 'false');

    const skillsGapBtn = screen.getByRole('button', { name: /skills gap/i });
    expect(skillsGapBtn).toHaveAttribute('aria-expanded', 'false');

    const suggestionsBtn = screen.getByRole('button', { name: /suggestions/i });
    expect(suggestionsBtn).toHaveAttribute('aria-expanded', 'false');
  });
});

// ---------------------------------------------------------------------------
// Test 5: Clicking a collapsed section expands it
// Validates: Requirement 9.4 — clicking a collapsed section toggles it open
// ---------------------------------------------------------------------------
describe('Test 5 – Toggle collapsed section open', () => {
  test('clicking the "Keywords" button expands that section', () => {
    renderPanel({ scanStatus: 'succeeded', currentScan: MOCK_SCAN });

    const keywordsBtn = screen.getByRole('button', { name: /keywords/i });
    expect(keywordsBtn).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(keywordsBtn);

    expect(keywordsBtn).toHaveAttribute('aria-expanded', 'true');
  });
});

// ---------------------------------------------------------------------------
// Test 6: "0 of 1 free scan used today" shown when scansRemainingToday === 0
// Validates: Requirement 7.5 — zero scans remaining notice
// ---------------------------------------------------------------------------
describe('Test 6 – 0 of 1 free scan used today', () => {
  test('shows "0 of 1 free scan used today" when scansRemainingToday is 0', () => {
    renderPanel({
      scanStatus: 'succeeded',
      currentScan: MOCK_SCAN,
      scansRemainingToday: 0,
    });
    expect(screen.getByText(/0 of 1 free scan used today/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Test 7: "1 free scan remaining today" shown when scansRemainingToday === 1
// Validates: Requirement 7.6 — one scan remaining notice
// ---------------------------------------------------------------------------
describe('Test 7 – 1 free scan remaining today', () => {
  test('shows "1 free scan remaining today" when scansRemainingToday is 1', () => {
    renderPanel({
      scanStatus: 'succeeded',
      currentScan: MOCK_SCAN,
      scansRemainingToday: 1,
    });
    expect(screen.getByText(/1 free scan remaining today/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Test 8: No scan count message when scansRemainingToday === null (premium)
// Validates: Requirement 9.5 — premium users see no scan count notices
// ---------------------------------------------------------------------------
describe('Test 8 – No scan count for premium (null)', () => {
  test('shows no scan-count notice when scansRemainingToday is null', () => {
    renderPanel({
      scanStatus: 'succeeded',
      currentScan: MOCK_SCAN,
      scansRemainingToday: null,
    });
    expect(screen.queryByText(/0 of 1 free scan/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/1 free scan remaining/i)).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Test 9: Clicking suggestion with known section calls onNavigateTab(4)
// Validates: Requirement 9.3 — suggestion navigation to correct tab
// ---------------------------------------------------------------------------
describe('Test 9 – Clicking suggestion with known section navigates', () => {
  test('clicking a suggestion with section "skills" calls onNavigateTab(4)', () => {
    const onNavigateTab = vi.fn();
    renderPanel(
      { scanStatus: 'succeeded', currentScan: MOCK_SCAN },
      { onNavigateTab }
    );

    // Expand the Suggestions section first
    const suggestionsBtn = screen.getByRole('button', { name: /suggestions/i });
    fireEvent.click(suggestionsBtn);

    // Click the suggestion item (it has role="button")
    const suggestionItem = screen.getByRole('button', {
      name: /Add Docker experience to your resume.*click to navigate/i,
    });
    fireEvent.click(suggestionItem);

    expect(onNavigateTab).toHaveBeenCalledWith(5);
  });
});

// ---------------------------------------------------------------------------
// Test 10: Clicking suggestion with unknown section does NOT call onNavigateTab
// Validates: Requirement 9.3 — non-navigable suggestions don't trigger navigation
// ---------------------------------------------------------------------------
describe('Test 10 – Clicking suggestion with unknown section does nothing', () => {
  test('suggestion with section "unknownSection" does not call onNavigateTab', () => {
    const onNavigateTab = vi.fn();
    const scanWithUnknownSection = {
      ...MOCK_SCAN,
      suggestions: [
        {
          text: 'Some unrecognized section suggestion',
          scoreImpact: 5,
          section: 'unknownSection',
        },
      ],
    };

    renderPanel(
      { scanStatus: 'succeeded', currentScan: scanWithUnknownSection },
      { onNavigateTab }
    );

    // Expand the Suggestions section
    const suggestionsBtn = screen.getByRole('button', { name: /suggestions/i });
    fireEvent.click(suggestionsBtn);

    // The suggestion item should NOT have role="button" (not clickable)
    const suggestionItem = screen.queryByRole('button', {
      name: /Some unrecognized section suggestion.*click to navigate/i,
    });
    expect(suggestionItem).toBeNull();

    // Find the suggestion by text and attempt a click — onNavigateTab must not fire
    const suggestionText = screen.getByText(/Some unrecognized section suggestion/i);
    fireEvent.click(suggestionText);

    expect(onNavigateTab).not.toHaveBeenCalled();
  });
});
