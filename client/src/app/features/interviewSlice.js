import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/api";

// POST — generate new questions
export const generateInterviewQuestions = createAsyncThunk(
  "interview/generate",
  async ({ resumeId, targetRole, jobDescription }, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
      const response = await api.post(
        "/api/ai/interview-questions",
        { resumeId, targetRole: targetRole || "", jobDescription: jobDescription || "" },
        { headers: { Authorization: `Bearer ${token}` }, timeout: 40000 }
      );
      return response.data; // { questions: [...] }
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
  async ({ resumeId }, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    try {
      const response = await api.get(`/api/ai/interview-questions/${resumeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data; // { sets: [{ setId, targetRole, questions, createdAt }] }
    } catch (err) {
      return rejectWithValue({ message: err.response?.data?.message || "Failed to load history" });
    }
  }
);

const initialState = {
  status: "idle",         // 'idle' | 'loading' | 'succeeded' | 'failed'
  historyStatus: "idle",  // 'idle' | 'loading' | 'succeeded'
  error: null,
  quotaExhausted: false,
  questions: [],          // currently displayed questions
  history: [],            // [{ setId, targetRole, questions, createdAt }]
};

const interviewSlice = createSlice({
  name: "interview",
  initialState,
  reducers: {
    resetInterview: () => initialState,
    // Load a previously saved set into the active view
    loadSavedSet: (state, action) => {
      state.questions = action.payload.questions;
      state.status = "succeeded";
    },
  },
  extraReducers: (builder) => {
    builder
      // Generate
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
      // Load history
      .addCase(loadInterviewHistory.pending, (state) => {
        state.historyStatus = "loading";
      })
      .addCase(loadInterviewHistory.fulfilled, (state, action) => {
        state.historyStatus = "succeeded";
        state.history = action.payload.sets || [];
        // If no questions are showing yet but we have history, show the latest set
        if (state.questions.length === 0 && state.history.length > 0) {
          state.questions = state.history[0].questions;
          state.status = "succeeded";
        }
      })
      .addCase(loadInterviewHistory.rejected, (state) => {
        state.historyStatus = "succeeded"; // non-fatal
      });
  },
});

export const { resetInterview, loadSavedSet } = interviewSlice.actions;
export default interviewSlice.reducer;
