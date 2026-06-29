import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/api";

// Thunk: POST /api/ai/interview-questions
export const generateInterviewQuestions = createAsyncThunk(
  "interview/generate",
  async ({ resumeId, targetRole, jobDescription }, { getState, rejectWithValue }) => {
    const token = getState().auth.token;

    try {
      const response = await api.post(
        "/api/ai/interview-questions",
        { resumeId, targetRole: targetRole || "", jobDescription: jobDescription || "" },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 40000,
        }
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
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to generate questions",
      });
    }
  }
);

const initialState = {
  status: "idle",       // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  quotaExhausted: false,
  questions: [],        // [{ category, question, suggestedAnswer }]
};

const interviewSlice = createSlice({
  name: "interview",
  initialState,
  reducers: {
    resetInterview: () => initialState,
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
        if (action.payload?.quotaExhausted) {
          state.quotaExhausted = true;
        }
      });
  },
});

export const { resetInterview } = interviewSlice.actions;
export default interviewSlice.reducer;
