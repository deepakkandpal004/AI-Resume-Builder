/**
 * Unit tests for atsRateLimiter middleware
 * Task 19.2
 *
 * Validates: Requirements 6.1–6.3, 6.7, 6.8, 7.1, 7.2
 * Design: Middlewares § atsRateLimiter.js
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import mongoose from 'mongoose';

// ─── Mock dependencies before importing the middleware ────────────────────────

vi.mock('../models/User.js', () => ({
  default: { findById: vi.fn() },
}));

vi.mock('../models/AtsScore.js', () => ({
  default: { countDocuments: vi.fn() },
}));

// ─── Import mocked modules after vi.mock declarations ─────────────────────────

import atsRateLimiter from '../middlewares/atsRateLimiter.js';
import User from '../models/User.js';
import AtsScore from '../models/AtsScore.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeReqResNext() {
  const req = { userId: new mongoose.Types.ObjectId().toString() };
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  const next = vi.fn();
  return { req, res, next };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// Premium user
// ─────────────────────────────────────────────────────────────────────────────

describe('atsRateLimiter — premium user', () => {
  test('1. premium user bypasses quota check and calls next()', async () => {
    const { req, res, next } = makeReqResNext();

    User.findById.mockReturnValue({
      select: vi.fn().mockResolvedValue({ subscriptionTier: 'premium' }),
    });

    await atsRateLimiter(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(AtsScore.countDocuments).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Free-tier user — under quota
// ─────────────────────────────────────────────────────────────────────────────

describe('atsRateLimiter — free-tier user under quota', () => {
  test('2. free-tier user with 0 scans today calls next()', async () => {
    const { req, res, next } = makeReqResNext();

    User.findById.mockReturnValue({
      select: vi.fn().mockResolvedValue({ subscriptionTier: 'free' }),
    });
    AtsScore.countDocuments.mockResolvedValue(0);

    await atsRateLimiter(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Free-tier user — quota exhausted
// ─────────────────────────────────────────────────────────────────────────────

describe('atsRateLimiter — free-tier user at quota', () => {
  test('3. free-tier user with 1 scan today returns 429 with quotaExhausted', async () => {
    const { req, res, next } = makeReqResNext();

    User.findById.mockReturnValue({
      select: vi.fn().mockResolvedValue({ subscriptionTier: 'free' }),
    });
    AtsScore.countDocuments.mockResolvedValue(1);

    await atsRateLimiter(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Daily scan limit reached.',
      quotaExhausted: true,
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DB errors
// ─────────────────────────────────────────────────────────────────────────────

describe('atsRateLimiter — DB errors', () => {
  test('4. DB error during User fetch returns 503', async () => {
    const { req, res, next } = makeReqResNext();

    User.findById.mockReturnValue({
      select: vi.fn().mockRejectedValue(new Error('DB error')),
    });

    await atsRateLimiter(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
  });

  test('5. DB error during AtsScore count returns 503', async () => {
    const { req, res, next } = makeReqResNext();

    User.findById.mockReturnValue({
      select: vi.fn().mockResolvedValue({ subscriptionTier: 'free' }),
    });
    AtsScore.countDocuments.mockRejectedValue(new Error('count error'));

    await atsRateLimiter(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
  });
});
