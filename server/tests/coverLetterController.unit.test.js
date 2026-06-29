import { beforeEach, describe, expect, test, vi } from 'vitest';
import mongoose from 'mongoose';

vi.mock('../models/resume.js', () => ({
  default: {
    findOne: vi.fn(),
    findById: vi.fn(),
  },
}));

vi.mock('../models/CoverLetter.js', () => ({
  default: {
    countDocuments: vi.fn(),
    create: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    deleteOne: vi.fn(),
  },
}));

vi.mock('../models/User.js', () => ({
  default: {
    findById: vi.fn(),
  },
}));

vi.mock('../config/ai.js', () => ({
  default: vi.fn(),
}));

import {
  deleteCoverLetter,
  generateCoverLetter,
  getCoverLetterHistory,
} from '../controllers/aiController.js';
import CoverLetter from '../models/CoverLetter.js';
import Resume from '../models/resume.js';
import User from '../models/User.js';
import getAI from '../config/ai.js';

function makeRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

function makeGenerateReq(overrides = {}) {
  return {
    userId: new mongoose.Types.ObjectId().toString(),
    body: {
      resumeId: new mongoose.Types.ObjectId().toString(),
      jobDescription:
        'We are looking for a senior engineer to build delightful product experiences, ship quickly, and collaborate with cross-functional teams.',
      companyName: 'Acme Corp',
      positionTitle: 'Senior Engineer',
      tone: 'formal',
      ...overrides,
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('generateCoverLetter', () => {
  test('creates and returns a cover letter with remaining quota info', async () => {
    const req = makeGenerateReq();
    const res = makeRes();

    Resume.findOne.mockResolvedValue({
      _id: req.body.resumeId,
      userId: req.userId,
      personal_info: { full_name: 'Taylor Jordan' },
      professional_summary: 'Experienced software engineer.',
      experience: [
        {
          position: 'Senior Engineer',
          company: 'Beta Co',
          description: 'Built product features and improved reliability.',
        },
      ],
      skills: ['React', 'Node.js'],
    });

    User.findById.mockReturnValue({
      select: vi.fn().mockResolvedValue({ subscriptionTier: 'free' }),
    });

    CoverLetter.countDocuments
      .mockResolvedValueOnce(2) // existing letters for resume
      .mockResolvedValueOnce(1); // letters generated today

    CoverLetter.create.mockResolvedValue({
      _id: 'letter-123',
      content: 'Generated cover letter body.',
      companyName: 'Acme Corp',
      positionTitle: 'Senior Engineer',
      tone: 'formal',
      createdAt: new Date('2026-06-29T12:00:00.000Z'),
    });

    const mockCreate = vi.fn().mockResolvedValue({
      choices: [{ message: { content: 'Generated cover letter body.' } }],
    });
    getAI.mockReturnValue({ chat: { completions: { create: mockCreate } } });

    await generateCoverLetter(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        coverLetterId: 'letter-123',
        content: 'Generated cover letter body.',
        companyName: 'Acme Corp',
        positionTitle: 'Senior Engineer',
        tone: 'formal',
        lettersRemainingToday: 2,
      })
    );

    expect(CoverLetter.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: req.userId,
        resumeId: req.body.resumeId,
        companyName: 'Acme Corp',
        positionTitle: 'Senior Engineer',
        tone: 'formal',
        content: 'Generated cover letter body.',
      })
    );
  });

  test('returns 400 when required fields are missing', async () => {
    const req = makeGenerateReq({ companyName: '' });
    const res = makeRes();

    await generateCoverLetter(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('required') })
    );
  });
});

describe('getCoverLetterHistory', () => {
  test('returns letters for the requested resume in newest-first order', async () => {
    const req = {
      userId: new mongoose.Types.ObjectId().toString(),
      params: { resumeId: new mongoose.Types.ObjectId().toString() },
    };
    const res = makeRes();

    Resume.findById.mockResolvedValue({
      userId: req.userId,
    });

    const mockLetters = [
      {
        _id: 'letter-1',
        companyName: 'Acme Corp',
        positionTitle: 'Engineer',
        tone: 'formal',
        jobDescription: 'JD 1',
        content: 'Letter 1',
        createdAt: new Date('2026-06-29T10:00:00.000Z'),
      },
      {
        _id: 'letter-2',
        companyName: 'Beta Inc',
        positionTitle: 'Developer',
        tone: 'conversational',
        jobDescription: 'JD 2',
        content: 'Letter 2',
        createdAt: new Date('2026-06-29T11:00:00.000Z'),
      },
    ];

    CoverLetter.find.mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue(mockLetters),
    });

    await getCoverLetterHistory(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      letters: [
        expect.objectContaining({
          letterId: 'letter-1',
          companyName: 'Acme Corp',
          positionTitle: 'Engineer',
          tone: 'formal',
          jobDescription: 'JD 1',
          content: 'Letter 1',
        }),
        expect.objectContaining({
          letterId: 'letter-2',
          companyName: 'Beta Inc',
          positionTitle: 'Developer',
          tone: 'conversational',
          jobDescription: 'JD 2',
          content: 'Letter 2',
        }),
      ],
    });
  });
});

describe('deleteCoverLetter', () => {
  test('deletes an owned cover letter', async () => {
    const req = {
      userId: new mongoose.Types.ObjectId().toString(),
      params: { letterId: new mongoose.Types.ObjectId().toString() },
    };
    const res = makeRes();

    CoverLetter.findOne.mockResolvedValue({
      _id: req.params.letterId,
      userId: req.userId,
    });
    CoverLetter.deleteOne.mockResolvedValue({ acknowledged: true, deletedCount: 1 });

    await deleteCoverLetter(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Cover letter deleted successfully.',
    });
    expect(CoverLetter.deleteOne).toHaveBeenCalledWith({ _id: req.params.letterId });
  });
});
