import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/api";

export const scoreResume = createAsyncThunk(
  "resumeScore/score",
  async ({ resumeId }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await api.post(
        "/api/ai/score-resume",
        { resumeId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    } catch (error) {
      if (error.response?.data?.quotaExhausted) {
        return rejectWithValue({ quotaExhausted: true, message: error.response.data.message });
      }
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const resumeScoreSlice = createSlice({
  name: "resumeScore",
  initialState: {
    status: "idle",
    error: null,
    quotaExhausted: false,
    scores: null,
    suggestions: [],
  },
  reducers: {
    resetScore: (state) => {
      state.status = "idle";
      state.error = null;
      state.quotaExhausted = false;
      state.scores = null;
      state.suggestions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(scoreResume.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.quotaExhausted = false;
      })
      .addCase(scoreResume.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.scores = action.payload.scores;
        state.suggestions = action.payload.suggestions;
      })
      .addCase(scoreResume.rejected, (state, action) => {
        state.status = "failed";
        if (action.payload?.quotaExhausted) {
          state.quotaExhausted = true;
          state.error = action.payload.message;
        } else {
          state.error = action.payload || "Failed to score resume";
        }
      });
  },
});

export const { resetScore } = resumeScoreSlice.actions;
export default resumeScoreSlice.reducer;
