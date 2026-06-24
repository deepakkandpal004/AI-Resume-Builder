/**
 * Unit tests for runAtsScan — HTTP error paths
 * Task 19.1
 *
 * Validates: Requirements 2.6, 6.6, 8.5, 10.2–10.7, 12.3–12.4
 * Design: Error Handling table
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import mongoose from 'mongoose';

// ─── Mock all dependencies before importing the controller ────────────────────

vi.mock('../models/resume.js', () => ({
  default: { findById: vi.fn() },
}));

vi.mock('../models/AtsScore.js', () => ({
  default: {
    countDocuments: vi.fn(),
    findOne: vi.fn(),
    deleteOne: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock('../models/User.js', () => ({
  default: { findById: vi.fn() },
}));

vi.mock('../config/ai.js', () => ({
  default: vi.fn(),
}));

vi.mock('../services/atsService.js', () => ({
  buildResumeText: vi.fn(),
  normalizeText: vi.fn(),
  buildAtsPrompt: vi.fn(),
  parseAtsResponse: vi.fn(),
  AtsParseError: class AtsParseError extends Error {
    constructor(msg) {
      super(msg);
      this.name = 'AtsParseError';
    }
  },
}));

// ─── Import mocked modules after vi.mock declarations ────────────────────────

import { runAtsScan, getScanHistory } from '../controllers/atsController.js';
import Resume from '../models/resume.js';
import AtsScore from '../models/AtsScore.js';
import User from '../models/User.js';
import getAI from '../config/ai.js';
import {
  buildResumeText,
  normalizeText,
  buildAtsPrompt,
  parseAtsResponse,
  AtsParseError,
} from '../services/atsService.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VALID_JD =
  'This is a valid job description that is definitely more than fifty characters long for testing.';

function makeReqRes(bodyOverrides = {}) {
  const userId = new mongoose.Types.ObjectId().toString();
  const req = {
    userId,
    body: {
      resumeId: new mongoose.Types.ObjectId().toString(),
      jobDescription: VALID_JD,
      ...bodyOverrides,
    },
  };
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return { req, res, userId };
}

/** Set up the "happy path" mocks up to (but not including) the AI call */
function setupHappyPathUpToAI(userId) {
  Resume.findById.mockResolvedValue({ userId, _id: new mongoose.Types.ObjectId() });
  buildResumeText.mockReturnValue('some resume text');
  normalizeText.mockReturnValue('some resume text');
  buildAtsPrompt.mockReturnValue([{ role: 'user', content: 'prompt' }]);
}

/** A minimal valid parsed ATS result */
const PARSED_RESULT = {
  atsScore: 75,
  matchedKeywords: ['react'],
  missingKeywords: ['docker'],
  skillsGap: ['kubernetes'],
  suggestions: ['Add Docker experience'],
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// Validation errors (400)
// ─────────────────────────────────────────────────────────────────────────────

describe('runAtsScan — input validation errors', () => {
  test('1. missing resumeId → 400', async () => {
    const { req, res } = makeReqRes({ resumeId: undefined });
    await runAtsScan(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
  });

  test('2. missing jobDescription → 400', async () => {
    const { req, res } = makeReqRes({ jobDescription: undefined });
    await runAtsScan(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('3. invalid ObjectId for resumeId → 400', async () => {
    const { req, res } = makeReqRes({ resumeId: 'not-an-objectid' });
    await runAtsScan(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('4. jobDescription shorter than 50 chars → 400', async () => {
    const { req, res } = makeReqRes({ jobDescription: 'Too short' });
    await runAtsScan(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('5. jobDescription longer than 10000 chars → 400', async () => {
    const { req, res } = makeReqRes({ jobDescription: 'x'.repeat(10001) });
    await runAtsScan(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Database / ownership errors
// ─────────────────────────────────────────────────────────────────────────────

describe('runAtsScan — database and ownership errors', () => {
  test('6. DB error fetching resume → 503', async () => {
    const { req, res } = makeReqRes();
    Resume.findById.mockRejectedValue(new Error('connection timeout'));
    await runAtsScan(req, res);
    expect(res.status).toHaveBeenCalledWith(503);
  });

  test('7. resume not found → 404', async () => {
    const { req, res } = makeReqRes();
    Resume.findById.mockResolvedValue(null);
    await runAtsScan(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('8. resume belongs to a different user → 403', async () => {
    const { req, res } = makeReqRes();
    // Return a resume owned by a *different* userId
    Resume.findById.mockResolvedValue({
      userId: new mongoose.Types.ObjectId(), // different from req.userId
    });
    await runAtsScan(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Resume content error
// ─────────────────────────────────────────────────────────────────────────────

describe('runAtsScan — resume content errors', () => {
  test('9. empty resume text after normalization → 422', async () => {
    const { req, res, userId } = makeReqRes();
    Resume.findById.mockResolvedValue({ userId });
    buildResumeText.mockReturnValue('');
    normalizeText.mockReturnValue('   '); // whitespace-only
    await runAtsScan(req, res);
    expect(res.status).toHaveBeenCalledWith(422);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AI / Groq errors
// ─────────────────────────────────────────────────────────────────────────────

describe('runAtsScan — AI service errors', () => {
  test('10. Groq timeout (AbortError) → 504', async () => {
    const { req, res, userId } = makeReqRes();
    setupHappyPathUpToAI(userId);

    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';

    const mockCreate = vi.fn().mockRejectedValue(abortError);
    getAI.mockReturnValue({ chat: { completions: { create: mockCreate } } });

    await runAtsScan(req, res);
    expect(res.status).toHaveBeenCalledWith(504);
  });

  test('11. Groq AI generic error → 503', async () => {
    const { req, res, userId } = makeReqRes();
    setupHappyPathUpToAI(userId);

    const mockCreate = vi.fn().mockRejectedValue(new Error('Internal server error'));
    getAI.mockReturnValue({ chat: { completions: { create: mockCreate } } });

    await runAtsScan(req, res);
    expect(res.status).toHaveBeenCalledWith(503);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Parse errors
// ─────────────────────────────────────────────────────────────────────────────

describe('runAtsScan — AI response parse errors', () => {
  test('12. AtsParseError (invalid JSON / invalid response) → 500', async () => {
    const { req, res, userId } = makeReqRes();
    setupHappyPathUpToAI(userId);

    const mockCreate = vi.fn().mockResolvedValue({
      choices: [{ message: { content: '{bad json}' } }],
    });
    getAI.mockReturnValue({ chat: { completions: { create: mockCreate } } });

    parseAtsResponse.mockImplementation(() => {
      throw new AtsParseError('Invalid JSON returned');
    });

    await runAtsScan(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DB write failure
// ─────────────────────────────────────────────────────────────────────────────

describe('runAtsScan — DB write failure', () => {
  test('13. DB write failure at scan-cap deletion step → 500', async () => {
    // When the resume already has 10 scans, the controller tries to delete the
    // oldest before saving the new one.  If that deleteOne throws, the controller
    // must return 500.  This exercises the same "failed to save" 500 branch.
    const { req, res, userId } = makeReqRes();
    setupHappyPathUpToAI(userId);

    const mockCreate = vi.fn().mockResolvedValue({
      choices: [{ message: { content: '{"atsScore":80}' } }],
    });
    getAI.mockReturnValue({ chat: { completions: { create: mockCreate } } });

    parseAtsResponse.mockReturnValue(PARSED_RESULT);

    // At the scan cap — triggers the delete-oldest branch
    AtsScore.countDocuments.mockResolvedValue(10);

    // findOne().sort() chain: return a query object with a sort() that resolves
    const oldestDoc = { _id: new mongoose.Types.ObjectId() };
    AtsScore.findOne.mockReturnValue({
      sort: vi.fn().mockResolvedValue(oldestDoc),
    });

    // deleteOne rejects → controller returns 500
    AtsScore.deleteOne.mockRejectedValue(new Error('DB write failed'));

    await runAtsScan(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Cross-cutting: AtsScore.save is NOT called on early error paths
// ─────────────────────────────────────────────────────────────────────────────

describe('runAtsScan — save() is never invoked on error paths', () => {
  // For all the paths that exit before step 11 (save), AtsScore.countDocuments
  // should not have been called (it happens in step 10, right before save).
  // We use countDocuments as a proxy since save() is on an instance.

  test('validation error exits before any DB calls', async () => {
    const { req, res } = makeReqRes({ resumeId: undefined });
    await runAtsScan(req, res);
    expect(Resume.findById).not.toHaveBeenCalled();
    expect(AtsScore.countDocuments).not.toHaveBeenCalled();
  });

  test('resume not found exits before AI call and save', async () => {
    const { req, res } = makeReqRes();
    Resume.findById.mockResolvedValue(null);
    await runAtsScan(req, res);
    expect(AtsScore.countDocuments).not.toHaveBeenCalled();
  });

  test('wrong owner exits before AI call and save', async () => {
    const { req, res } = makeReqRes();
    Resume.findById.mockResolvedValue({ userId: new mongoose.Types.ObjectId() });
    await runAtsScan(req, res);
    expect(AtsScore.countDocuments).not.toHaveBeenCalled();
  });

  test('AI timeout exits before save', async () => {
    const { req, res, userId } = makeReqRes();
    setupHappyPathUpToAI(userId);
    const abortError = new Error('aborted');
    abortError.name = 'AbortError';
    getAI.mockReturnValue({
      chat: { completions: { create: vi.fn().mockRejectedValue(abortError) } },
    });
    await runAtsScan(req, res);
    expect(AtsScore.countDocuments).not.toHaveBeenCalled();
  });

  test('AtsParseError exits before save', async () => {
    const { req, res, userId } = makeReqRes();
    setupHappyPathUpToAI(userId);
    getAI.mockReturnValue({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{ message: { content: '{}' } }],
          }),
        },
      },
    });
    parseAtsResponse.mockImplementation(() => {
      throw new AtsParseError('bad');
    });
    await runAtsScan(req, res);
    expect(AtsScore.countDocuments).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getScanHistory — HTTP error paths and 10-cap limit
// Task 19.3
//
// Validates: Requirements 11.1–11.4
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Helper that builds a minimal req/res pair for getScanHistory tests.
 * paramsOverrides lets individual tests swap out resumeId or add extra params.
 */
function makeHistoryReqRes(paramsOverrides = {}) {
  const userId = new mongoose.Types.ObjectId().toString();
  const req = {
    userId,
    params: {
      resumeId: new mongoose.Types.ObjectId().toString(),
      ...paramsOverrides,
    },
  };
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return { req, res, userId };
}

describe('getScanHistory — input validation errors', () => {
  test('1. invalid ObjectId for resumeId → 400', async () => {
    const { req, res } = makeHistoryReqRes({ resumeId: 'not-valid' });
    await getScanHistory(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
  });
});

describe('getScanHistory — resource not found / ownership errors', () => {
  test('2. valid ObjectId but resume does not exist → 404', async () => {
    const { req, res } = makeHistoryReqRes();
    Resume.findById.mockResolvedValue(null);
    await getScanHistory(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
  });

  test('3. resume owned by a different user → 403', async () => {
    const { req, res } = makeHistoryReqRes();
    // Return a resume whose userId differs from req.userId
    Resume.findById.mockResolvedValue({
      userId: new mongoose.Types.ObjectId(), // deliberate mismatch
    });
    await getScanHistory(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
  });
});

describe('getScanHistory — successful responses', () => {
  test('4. valid owner with 0 scans → 200 with { scans: [] }', async () => {
    const { req, res, userId } = makeHistoryReqRes();
    Resume.findById.mockResolvedValue({ userId });
    AtsScore.find.mockReturnValue({
      sort: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue([]),
      }),
    });

    await getScanHistory(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ scans: [] });
  });

  test('5. valid owner with 12 stored scans → 200 with at most 10 records (sorted newest-first)', async () => {
    const { req, res, userId } = makeHistoryReqRes();
    Resume.findById.mockResolvedValue({ userId });

    // Create 12 mock scan documents; the controller should cap at 10
    const mockDocs = Array.from({ length: 12 }, (_, i) => ({
      _id: new mongoose.Types.ObjectId(),
      atsScore: 80 - i,
      jdSnippet: `snippet ${i}`,
      matchedKeywords: ['react'],
      missingKeywords: ['docker'],
      skillsGap: [],
      suggestions: [],
      createdAt: new Date(Date.now() - i * 1000),
    }));

    // Simulate: AtsScore.find({ resumeId }).sort({ createdAt: -1 }).limit(10)
    // returns only the first 10 (newest) docs
    AtsScore.find.mockReturnValue({
      sort: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue(mockDocs.slice(0, 10)),
      }),
    });

    await getScanHistory(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    const { scans } = res.json.mock.calls[0][0];
    expect(scans).toHaveLength(10);

    // Verify the find chain was called with the correct resumeId
    expect(AtsScore.find).toHaveBeenCalledWith(
      expect.objectContaining({ resumeId: expect.anything() })
    );

    // Verify that .sort and .limit were called (newest-first, capped at 10)
    const sortFn = AtsScore.find.mock.results[0].value.sort;
    expect(sortFn).toHaveBeenCalledWith({ createdAt: -1 });

    const limitFn = sortFn.mock.results[0].value.limit;
    expect(limitFn).toHaveBeenCalledWith(10);
  });
});
