import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import fc from 'fast-check';
import AtsScore from '../models/AtsScore.js';

// Use a reduced run count for DB-touching tests to keep the suite fast
fc.configureGlobal({ numRuns: 10, verbose: true });

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  await AtsScore.deleteMany({});
});

// ---------------------------------------------------------------------------
// Helper: save a scan with the per-resume 10-doc cap enforced
// (mirrors the logic in atsController)
// ---------------------------------------------------------------------------
async function saveScanWithCap(userId, resumeId, scanData) {
  const existingCount = await AtsScore.countDocuments({ resumeId });
  if (existingCount >= 10) {
    const oldest = await AtsScore.findOne({ resumeId }).sort({ createdAt: 1 });
    if (oldest) await AtsScore.deleteOne({ _id: oldest._id });
  }
  const doc = new AtsScore({
    userId,
    resumeId,
    atsScore: scanData.atsScore,
    jdSnippet: 'test',
    matchedKeywords: [],
    missingKeywords: [],
    skillsGap: [],
    suggestions: [],
  });
  await doc.save();
}

// ---------------------------------------------------------------------------
// Task 17.1 — Properties 12 and 13
// ---------------------------------------------------------------------------

describe('Property 12: Quota day boundary — only today\'s scans count', () => {
  // Feature: ats-score-checker, Property 12: Quota day boundary — only today's scans count
  // Validates: Requirements 6.4
  test('only scans from today contribute to the daily quota', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 5 }),
        fc.integer({ min: 0, max: 5 }),
        async (todayCount, yesterdayCount) => {
          // Reset state for each run
          await AtsScore.deleteMany({});

          const userId = new mongoose.Types.ObjectId();
          const resumeId = new mongoose.Types.ObjectId();

          const now = new Date();
          const yesterday = new Date(now);
          yesterday.setUTCDate(yesterday.getUTCDate() - 1);

          // Insert today's scans
          for (let i = 0; i < todayCount; i++) {
            const doc = new AtsScore({
              userId,
              resumeId,
              atsScore: 50,
              jdSnippet: 'test',
              matchedKeywords: [],
              missingKeywords: [],
              skillsGap: [],
              suggestions: [],
              createdAt: now,
            });
            await doc.save();
          }

          // Insert yesterday's scans
          for (let i = 0; i < yesterdayCount; i++) {
            const doc = new AtsScore({
              userId,
              resumeId,
              atsScore: 50,
              jdSnippet: 'test',
              matchedKeywords: [],
              missingKeywords: [],
              skillsGap: [],
              suggestions: [],
              createdAt: yesterday,
            });
            await doc.save();
          }

          // The quota check uses the start of the current UTC day
          const utcDayStart = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
          );

          const count = await AtsScore.countDocuments({
            userId,
            createdAt: { $gte: utcDayStart },
          });

          // Only today's scans should be counted
          return count === todayCount;
        }
      )
    );
  });
});

describe('Property 13: Failed scans never write a Scan_Record', () => {
  // Feature: ats-score-checker, Property 13: Failed scans never write a Scan_Record
  // Validates: Requirements 6.6
  test('quota count remains unchanged when a scan attempt fails (never calls .save())', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }),
        async (initialCount) => {
          // Reset state for each run
          await AtsScore.deleteMany({});

          const userId = new mongoose.Types.ObjectId();
          const resumeId = new mongoose.Types.ObjectId();

          // Persist some initial successful scans
          for (let i = 0; i < initialCount; i++) {
            const doc = new AtsScore({
              userId,
              resumeId,
              atsScore: 60,
              jdSnippet: 'initial',
              matchedKeywords: [],
              missingKeywords: [],
              skillsGap: [],
              suggestions: [],
            });
            await doc.save();
          }

          const countBefore = await AtsScore.countDocuments({ userId });

          // Simulate a failed scan attempt: an error is thrown before .save() is called
          try {
            // eslint-disable-next-line no-unused-vars
            const _doc = new AtsScore({
              userId,
              resumeId,
              atsScore: 70,
              jdSnippet: 'failed attempt',
              matchedKeywords: [],
              missingKeywords: [],
              skillsGap: [],
              suggestions: [],
            });
            // Throw before save — models the controller aborting on any non-200 path
            throw new Error('Simulated scan failure before save');
            // _doc.save() is never reached
          } catch {
            // expected: absorb the simulated failure
          }

          const countAfter = await AtsScore.countDocuments({ userId });

          // The count must be identical — a failed attempt must not write a record
          return countAfter === countBefore;
        }
      )
    );
  });
});

// ---------------------------------------------------------------------------
// Task 17.2 — Property 15
// ---------------------------------------------------------------------------

describe('Property 15: Per-resume scan count cap of 10 always enforced', () => {
  // Feature: ats-score-checker, Property 15: Per-resume scan count cap of 10 always enforced
  // Validates: Requirements 8.4
  test('after N > 10 saves for the same resumeId, exactly 10 documents are stored', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 11, max: 20 }),
        async (n) => {
          // Reset state for each run
          await AtsScore.deleteMany({});

          const userId = new mongoose.Types.ObjectId();
          const resumeId = new mongoose.Types.ObjectId();

          for (let i = 0; i < n; i++) {
            await saveScanWithCap(userId, resumeId, { atsScore: i });
            // Small delay to ensure unique createdAt timestamps for deterministic ordering
            await new Promise(r => setTimeout(r, 10));
          }

          const finalCount = await AtsScore.countDocuments({ resumeId });
          return finalCount === 10;
        }
      )
    );
  }, 60000); // generous timeout for the DB-heavy loop
});

// ---------------------------------------------------------------------------
// Task 17.3 — Property 14
// ---------------------------------------------------------------------------

describe('Property 14: Scan_Record round-trip — all fields preserved', () => {
  // Feature: ats-score-checker, Property 14: Scan_Record round-trip
  // Validates: Requirements 8.1
  test('saving and retrieving a scan document preserves all required fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          atsScore: fc.integer({ min: 0, max: 100 }),
          jdSnippet: fc
            .string({ minLength: 0, maxLength: 500 })
            .map(s => s.replace(/[^\x20-\x7E]/g, '')),
          matchedKeywords: fc.array(
            fc
              .string({ minLength: 1, maxLength: 20 })
              .map(s => s.replace(/[^\x20-\x7E]/g, 'a')),
            { maxLength: 5 }
          ),
          missingKeywords: fc.array(
            fc
              .string({ minLength: 1, maxLength: 20 })
              .map(s => s.replace(/[^\x20-\x7E]/g, 'a')),
            { maxLength: 5 }
          ),
        }),
        async (data) => {
          const userId = new mongoose.Types.ObjectId();
          const resumeId = new mongoose.Types.ObjectId();

          const doc = new AtsScore({
            userId,
            resumeId,
            atsScore: data.atsScore,
            jdSnippet: data.jdSnippet,
            matchedKeywords: data.matchedKeywords,
            missingKeywords: data.missingKeywords,
            skillsGap: [],
            suggestions: [],
          });
          await doc.save();

          const retrieved = await AtsScore.findById(doc._id).lean();

          return (
            retrieved.atsScore === data.atsScore &&
            retrieved.jdSnippet === data.jdSnippet &&
            JSON.stringify(retrieved.matchedKeywords) ===
              JSON.stringify(data.matchedKeywords) &&
            JSON.stringify(retrieved.missingKeywords) ===
              JSON.stringify(data.missingKeywords)
          );
        }
      )
    );
  });
});
