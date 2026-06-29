import React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../app/features/authSlice';
import coverLetterReducer from '../app/features/coverLetterSlice';

vi.mock('../configs/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import api from '../configs/api';
import CoverLetterPanel from '../components/coverLetter/CoverLetterPanel';

function createStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      coverLetter: coverLetterReducer,
    },
    preloadedState: {
      auth: {
        token: 'test-token',
        user: { id: 'user-1' },
        loading: false,
      },
      coverLetter: {
        genStatus: 'idle',
        historyStatus: 'idle',
        error: null,
        quotaExhausted: false,
        lettersRemainingToday: null,
        current: null,
        history: [],
      },
    },
  });
}

function renderPanel() {
  const store = createStore();
  render(
    <Provider store={store}>
      <CoverLetterPanel resumeId="resume-123" />
    </Provider>
  );
  return store;
}

beforeEach(() => {
  vi.clearAllMocks();
  api.get.mockResolvedValue({ data: { letters: [] } });
  api.post.mockResolvedValue({
    data: {
      coverLetterId: 'letter-123',
      content: 'Generated cover letter body.',
      companyName: 'Acme Corp',
      positionTitle: 'Senior Engineer',
      tone: 'formal',
      createdAt: '2026-06-29T12:00:00.000Z',
      lettersRemainingToday: 2,
    },
  });
  api.delete.mockResolvedValue({ data: { message: 'Cover letter deleted successfully.' } });
});

afterEach(() => {
  cleanup();
});

describe('CoverLetterPanel', () => {
  test('loads history, generates a letter, and deletes it from the UI', async () => {
    renderPanel();

    expect(api.get).toHaveBeenCalledWith(
      '/api/ai/cover-letter/resume-123',
      expect.objectContaining({
        headers: { Authorization: 'Bearer test-token' },
      })
    );

    await screen.findByText('No cover letters yet. Generate one above.');

    fireEvent.change(screen.getByPlaceholderText(/Acme Corp/i), { target: { value: 'Acme Corp' } });
    fireEvent.change(screen.getByPlaceholderText(/Senior Engineer/i), {
      target: { value: 'Senior Engineer' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Paste the job description here/i), {
      target: {
        value:
          'We are looking for a senior engineer to build delightful product experiences, ship quickly, and collaborate with cross-functional teams.',
      },
    });

    fireEvent.click(screen.getByRole('button', { name: /Generate Cover Letter/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/api/ai/generate-cover-letter',
        expect.objectContaining({
          resumeId: 'resume-123',
          companyName: 'Acme Corp',
          positionTitle: 'Senior Engineer',
          tone: 'formal',
        }),
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token' },
        })
      );
    });

    expect(
      await screen.findByRole('heading', { name: /Acme Corp.*Senior Engineer/ })
    ).toBeInTheDocument();

    const editable = screen.getByLabelText(/Generated cover letter \(editable\)/i);
    expect(editable.value).toBe('Generated cover letter body.');

    fireEvent.click(screen.getByRole('button', { name: /Delete cover letter/i }));

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith(
        '/api/ai/cover-letter/letter-123',
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token' },
        })
      );
    });

    await waitFor(() => {
      expect(screen.queryByText(/Acme Corp — Senior Engineer/)).not.toBeInTheDocument();
    });
  });
});
