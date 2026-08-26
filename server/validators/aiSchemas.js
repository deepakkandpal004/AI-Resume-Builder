import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID format");

export const enhanceSummarySchema = z.object({
  userContent: z.string().min(1).max(5000),
});

export const enhanceJobDescSchema = z.object({
  userContent: z.string().min(1).max(5000),
});

export const rewriteBulletsSchema = z.object({
  text: z.string().min(1).max(5000),
  position: z.string().max(200).optional(),
  company: z.string().max(200).optional(),
});

export const uploadResumeSchema = z.object({
  resumeText: z.string().min(1).max(20000),
  title: z.string().max(200).optional(),
});

export const tailorResumeSchema = z.object({
  resumeId: objectId,
  jobDescription: z.string().min(50).max(10000),
});

export const suggestSkillsSchema = z.object({
  targetRole: z.string().min(1).max(200),
  currentSkills: z.array(z.string().max(100)).max(50).optional(),
});

export const scoreResumeSchema = z.object({
  resumeId: objectId,
});

export const coverLetterSchema = z.object({
  resumeId: objectId,
  jobDescription: z.string().min(50).max(10000),
  companyName: z.string().min(1).max(200),
  positionTitle: z.string().min(1).max(200),
  tone: z.enum(["formal", "conversational", "enthusiastic"]).optional(),
});

export const interviewQuestionsSchema = z.object({
  resumeId: objectId,
  targetRole: z.string().max(200).optional(),
  jobDescription: z.string().max(5000).optional(),
});

export const atsScanSchema = z.object({
  resumeId: objectId,
  jobDescription: z.string().min(50).max(10000),
});

export const updateResumeSchema = z
  .object({
    resumeId: objectId,
    resumeData: z.any().optional(),
    removeBackground: z.any().optional(),
  })
  .passthrough();

export const createResumeSchema = z.object({
  title: z.string().max(200).optional(),
});
