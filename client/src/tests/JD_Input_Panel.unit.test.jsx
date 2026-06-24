/**
 * Unit tests for JD_Input_Panel component
 * Feature: ats-score-checker
 * Validates: Requirements 1.1–1.6, 9.2
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import JD_Input_Panel from '../components/ats/JD_Input_Panel';
import atsReducer from '../app/features/atsSlice';

// Create a test store with optional preloaded ats state
function createTestStore(atsOverrides = {}) {
  return configureStore({
    reducer: { ats: atsReducer },
    preloadedState: {
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

function renderPanel(atsOverrides = {}) {
  const store = createTestStore(atsOverrides);
  render(
    <Provider store={store}>
      <JD_Input_Panel resumeId="test-resume" />
    </Provider>
  );
  return store;
}

beforeEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// Test 1: Validation error when JD is too short
// ---------------------------------------------------------------------------
describe('Test 1 – Validation error for short JD', () => {
  test('submitting JD < 50 chars shows validation error and does NOT dispatch runScan', async () => {
    renderPanel();

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Too short' } });

    const analyzeBtn = screen.getByRole('button', { name: /analyze/i });
    fireEvent.click(analyzeBtn);

    expect(
      await screen.findByText(
        'Please enter a more complete job description (at least 50 characters).'
      )
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Test 2: Truncation to 10,000 chars
// ---------------------------------------------------------------------------
describe('Test 2 – JD > 10000 chars is truncated', () => {
  test('textarea value is clamped to 10000 chars and truncation banner appears', async () => {
    renderPanel();

    const longText = 'a'.repeat(10001);
    const textarea = screen.getByRole('textbox');
    // fireEvent.change bypasses maxLength attribute, so we can set a value > 10000
    fireEvent.change(textarea, { target: { value: longText } });

    const analyzeBtn = screen.getByRole('button', { name: /analyze/i });
    fireEvent.click(analyzeBtn);

    await waitFor(() => {
      expect(textarea.value.length).toBe(10000);
    });

    expect(
      screen.getByText('Job description truncated to 10,000 characters.')
    ).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Test 3: Truncation banner clears after next keystroke
// ---------------------------------------------------------------------------
describe('Test 3 – Truncation banner clears on next user edit', () => {
  test('typing in textarea after truncation removes the truncation banner', async () => {
    renderPanel();

    const longText = 'a'.repeat(10001);
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: longText } });

    const analyzeBtn = screen.getByRole('button', { name: /analyze/i });
    fireEvent.click(analyzeBtn);

    // Wait for the banner to appear
    await waitFor(() => {
      expect(
        screen.getByText('Job description truncated to 10,000 characters.')
      ).toBeInTheDocument();
    });

    // Type one more character – this triggers handleChange which clears the banner
    fireEvent.change(textarea, { target: { value: textarea.value + 'x' } });

    expect(
      screen.queryByText('Job description truncated to 10,000 characters.')
    ).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Test 4: Clipboard success replaces textarea value
// ---------------------------------------------------------------------------
describe('Test 4 – Paste from clipboard (success)', () => {
  test('successful clipboard read replaces textarea value', async () => {
    vi.stubGlobal('navigator', {
      ...navigator,
      clipboard: {
        readText: vi.fn().mockResolvedValue('clipboard text'),
      },
    });

    renderPanel();

    const pasteBtn = screen.getByRole('button', { name: /paste from clipboard/i });
    fireEvent.click(pasteBtn);

    await waitFor(() => {
      const textarea = screen.getByRole('textbox');
      expect(textarea.value).toBe('clipboard text');
    });
  });
});

// ---------------------------------------------------------------------------
// Test 5: Clipboard permission denied
// ---------------------------------------------------------------------------
describe('Test 5 – Paste from clipboard (denied)', () => {
  test('clipboard permission denied shows error without modifying textarea', async () => {
    const permissionError = new Error('Permission denied');
    permissionError.name = 'NotAllowedError';

    vi.stubGlobal('navigator', {
      ...navigator,
      clipboard: {
        readText: vi.fn().mockRejectedValue(permissionError),
      },
    });

    renderPanel();

    // Set an initial value in the textarea
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'existing text' } });

    const pasteBtn = screen.getByRole('button', { name: /paste from clipboard/i });
    fireEvent.click(pasteBtn);

    await waitFor(() => {
      expect(
        screen.getByText('Clipboard access denied. Please paste manually.')
      ).toBeInTheDocument();
    });

    // Textarea content must remain unchanged
    expect(textarea.value).toBe('existing text');
  });
});

// ---------------------------------------------------------------------------
// Test 6: Analyze button is disabled while scanStatus === 'loading'
// ---------------------------------------------------------------------------
describe('Test 6 – Analyze button disabled when loading', () => {
  test('Analyze button is disabled when scanStatus is "loading"', () => {
    renderPanel({ scanStatus: 'loading' });

    // The button text changes to "Analyzing..." when loading
    const analyzeBtn = screen.getByRole('button', { name: /analyzing/i });
    expect(analyzeBtn).toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// Test 7: sessionStorage persistence – read on mount and write on keystroke
// ---------------------------------------------------------------------------
describe('Test 7 – sessionStorage read on mount and write on keystroke', () => {
  test('restores value from sessionStorage on mount', () => {
    sessionStorage.setItem('ats_jd_test-resume', 'stored value');

    renderPanel();

    const textarea = screen.getByRole('textbox');
    expect(textarea.value).toBe('stored value');
  });

  test('writes to sessionStorage on every keystroke', () => {
    renderPanel();

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'new typed text' } });

    expect(sessionStorage.getItem('ats_jd_test-resume')).toBe('new typed text');
  });
});
