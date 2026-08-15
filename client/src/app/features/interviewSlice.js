import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/api";

// POST — generate new questions
export const generateInterviewQuestions = createAsyncThunk(
  "interview/generate",
  async ({ resumeId, targetRole, jobDescription }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        "/api/ai/interview-questions",
        { resumeId, targetRole: targetRole || "", jobDescription: jobDescription || "" },
        { timeout: 40000 }
      );
      return response.data;
    } catch (err) {
      if (err.response?.status === 429) {
        return rejectWithValue({
          message: err.response?.data?.message || "Daily limit reached.",
          quotaExhausted: true,
        });
      }
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        return rejectWithValue({ message: "Generation timed out. Please try again." });
      }
      return rejectWithValue({
        message: err.response?.data?.message || err.message || "Failed to generate questions",
      });
    }
  }
);

// GET — load persisted history for a resume
export const loadInterviewHistory = createAsyncThunk(
  "interview/loadHistory",
  async ({ resumeId }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/ai/interview-questions/${resumeId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue({ message: err.response?.data?.message || "Failed to load history" });
    }
  }
);

const initialState = {
  status: "idle",
  historyStatus: "idle",
  error: null,
  quotaExhausted: false,
  questions: [],
  history: [],
};

const interviewSlice = createSlice({
  name: "interview",
  initialState,
  reducers: {
    resetInterview: () => initialState,
    loadSavedSet: (state, action) => {
      state.questions = action.payload.questions;
      state.status = "succeeded";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateInterviewQuestions.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.quotaExhausted = false;
      })
      .addCase(generateInterviewQuestions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.questions = action.payload.questions || [];
      })
      .addCase(generateInterviewQuestions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || "Generation failed";
        if (action.payload?.quotaExhausted) state.quotaExhausted = true;
      })
      .addCase(loadInterviewHistory.pending, (state) => {
        state.historyStatus = "loading";
      })
      .addCase(loadInterviewHistory.fulfilled, (state, action) => {
        state.historyStatus = "succeeded";
        state.history = action.payload.sets || [];
        if (state.questions.length === 0 && state.history.length > 0) {
          state.questions = state.history[0].questions;
          state.status = "succeeded";
        }
      })
      .addCase(loadInterviewHistory.rejected, (state) => {
        state.historyStatus = "succeeded";
      });
  },
});

export const { resetInterview, loadSavedSet } = interviewSlice.actions;
export default interviewSlice.reducer;
