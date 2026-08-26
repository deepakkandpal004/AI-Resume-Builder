/**
 * Unit tests for atsRateLimiter middleware (atomic UsageCounter-backed quota)
 * Task 19.2
 *
 * Validates: Requirements 6.1–6.3, 6.7, 6.8, 7.1, 7.2
 * Design: Middlewares § atsRateLimiter.js
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import mongoose from 'mongoose';

// ─── Mock dependencies before importing the middleware ────────────────────────

vi.mock('../models/User.js', () => ({
  default: { findOne: vi.fn() },
}));

vi.mock('../models/UsageCounter.js', () => ({
  default: {
    findOneAndUpdate: vi.fn(),
    updateOne: vi.fn(),
  },
}));

// ─── Import mocked modules after vi.mock declarations ─────────────────────────

import atsRateLimiter from '../middlewares/atsRateLimiter.js';
import User from '../models/User.js';
import UsageCounter from '../models/UsageCounter.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeReqResNext() {
  const req = { userId: new mongoose.Types.ObjectId().toString() };
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
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

    User.findOne.mockReturnValue({
      select: vi.fn().mockResolvedValue({ subscriptionTier: 'premium' }),
    });

    await atsRateLimiter(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(UsageCounter.findOneAndUpdate).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Free-tier user — under quota
// ─────────────────────────────────────────────────────────────────────────────

describe('atsRateLimiter — free-tier user under quota', () => {
  test('2. free-tier user with 0 scans today calls next()', async () => {
    const { req, res, next } = makeReqResNext();

    User.findOne.mockReturnValue({
      select: vi.fn().mockResolvedValue({ subscriptionTier: 'free' }),
    });
    // Atomic claim returns post-increment count of 1 (first scan today)
    UsageCounter.findOneAndUpdate.mockResolvedValue({ count: 1 });

    await atsRateLimiter(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
    expect(UsageCounter.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ feature: 'ats' }),
      expect.objectContaining({ $inc: { count: 1 } }),
      expect.objectContaining({ upsert: true })
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Free-tier user — quota exhausted
// ─────────────────────────────────────────────────────────────────────────────

describe('atsRateLimiter — free-tier user at quota', () => {
  test('3. free-tier user with 1 scan today returns 429 with quotaExhausted', async () => {
    const { req, res, next } = makeReqResNext();

    User.findOne.mockReturnValue({
      select: vi.fn().mockResolvedValue({ subscriptionTier: 'free' }),
    });
    // Claim returns 2 > limit of 1 → over-limit
    UsageCounter.findOneAndUpdate.mockResolvedValue({ count: 2 });

    await atsRateLimiter(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Daily scan limit reached.',
      quotaExhausted: true,
    });
    // The over-limit claim is rolled back
    expect(UsageCounter.updateOne).toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DB errors
// ─────────────────────────────────────────────────────────────────────────────

describe('atsRateLimiter — DB errors', () => {
  test('4. DB error during user fetch returns 503', async () => {
    const { req, res, next } = makeReqResNext();

    User.findOne.mockReturnValue({
      select: vi.fn().mockRejectedValue(new Error('DB error')),
    });

    await atsRateLimiter(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
  });

  test('5. DB error during quota claim returns 503', async () => {
    const { req, res, next } = makeReqResNext();

    User.findOne.mockReturnValue({
      select: vi.fn().mockResolvedValue({ subscriptionTier: 'free' }),
    });
    UsageCounter.findOneAndUpdate.mockRejectedValue(new Error('claim error'));

    await atsRateLimiter(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Refund on failed generations
// ─────────────────────────────────────────────────────────────────────────────

describe('atsRateLimiter — refund on error responses', () => {
  test('6. error response triggers a quota refund via res finish hook', async () => {
    const { req, res, next } = makeReqResNext();

    User.findOne.mockReturnValue({
      select: vi.fn().mockResolvedValue({ subscriptionTier: 'free' }),
    });
    UsageCounter.findOneAndUpdate.mockResolvedValue({ count: 1 });

    await atsRateLimiter(req, res, next);

    expect(next).toHaveBeenCalledOnce();

    // Simulate the downstream controller failing (e.g. AI timeout → 504)
    expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
    const finishHandler = res.on.mock.calls[0][1];
    res.statusCode = 504;
    await finishHandler();

    expect(UsageCounter.updateOne).toHaveBeenCalledWith(
      expect.objectContaining({ feature: 'ats', count: { $gt: 0 } }),
      expect.objectContaining({ $inc: { count: -1 } })
    );
  });

  test('7. success response does not refund the claim', async () => {
    const { req, res, next } = makeReqResNext();

    User.findOne.mockReturnValue({
      select: vi.fn().mockResolvedValue({ subscriptionTier: 'free' }),
    });
    UsageCounter.findOneAndUpdate.mockResolvedValue({ count: 1 });

    await atsRateLimiter(req, res, next);

    const finishHandler = res.on.mock.calls[0][1];
    res.statusCode = 200;
    await finishHandler();

    expect(UsageCounter.updateOne).not.toHaveBeenCalled();
  });
});
