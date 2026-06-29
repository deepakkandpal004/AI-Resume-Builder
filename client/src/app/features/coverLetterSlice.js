import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/api";

// Thunk: POST /api/ai/generate-cover-letter
export const generateCoverLetter = createAsyncThunk(
  "coverLetter/generate",
  async ({ resumeId, jobDescription, companyName, positionTitle, tone }, { getState, rejectWithValue }) => {
    const token = getState().auth.token;

    try {
      const response = await api.post(
        "/api/ai/generate-cover-letter",
        { resumeId, jobDescription, companyName, positionTitle, tone },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 35000,
        }
      );
      return response.data;
    } catch (err) {
      if (err.response?.status === 429) {
        return rejectWithValue({
          message: "Daily cover letter limit reached.",
          quotaExhausted: true,
        });
      }
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        return rejectWithValue({
          message: "Generation timed out. Please try again.",
        });
      }
      return rejectWithValue({
        message:
          err.response?.data?.message ||
          err.message ||
          "Generation failed",
      });
    }
  }
);

// Thunk: GET /api/ai/cover-letter/:resumeId
export const fetchCoverLetters = createAsyncThunk(
  "coverLetter/fetch",
  async (resumeId, { getState, rejectWithValue }) => {
    const token = getState().auth.token;

    try {
      const response = await api.get(`/api/ai/cover-letter/${resumeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data; // { letters: [...] }
    } catch (err) {
      return rejectWithValue({
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to load cover letters",
      });
    }
  }
);

// Thunk: DELETE /api/ai/cover-letter/:letterId
export const deleteCoverLetter = createAsyncThunk(
  "coverLetter/delete",
  async (letterId, { getState, rejectWithValue }) => {
    const token = getState().auth.token;

    try {
      await api.delete(`/api/ai/cover-letter/${letterId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { letterId };
    } catch (err) {
      return rejectWithValue({
        message:
          err.response?.data?.message ||
          err.message ||
          "Failed to delete cover letter",
      });
    }
  }
);

const initialState = {
  genStatus: "idle",      // 'idle' | 'loading' | 'succeeded' | 'failed' — tracks generateCoverLetter
  historyStatus: "idle",  // 'idle' | 'loading' | 'failed' — tracks fetchCoverLetters
  error: null,
  quotaExhausted: false,
  lettersRemainingToday: null,
  current: null,          // most recently generated/selected letter
  history: [],
};

const coverLetterSlice = createSlice({
  name: "coverLetter",
  initialState,
  reducers: {
    resetCoverLetter: () => initialState,
    selectLetter: (state, action) => {
      state.current = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // generateCoverLetter
      .addCase(generateCoverLetter.pending, (state) => {
        state.genStatus = "loading";
        state.error = null;
      })
      .addCase(generateCoverLetter.fulfilled, (state, action) => {
        const {
          coverLetterId,
          content,
          companyName,
          positionTitle,
          tone,
          createdAt,
          lettersRemainingToday,
        } = action.payload;

        state.genStatus = "succeeded";
        state.quotaExhausted = false;
        state.lettersRemainingToday =
          lettersRemainingToday ?? state.lettersRemainingToday;

        const letter = {
          letterId: coverLetterId,
          content,
          companyName,
          positionTitle,
          tone,
          createdAt: createdAt || new Date().toISOString(),
        };
        state.current = letter;
        state.history = [letter, ...state.history];
      })
      .addCase(generateCoverLetter.rejected, (state, action) => {
        state.genStatus = "failed";
        state.error = action.payload?.message || "Generation failed";
        if (action.payload?.quotaExhausted) {
          state.quotaExhausted = true;
        }
      })

      // fetchCoverLetters
      .addCase(fetchCoverLetters.pending, (state) => {
        state.historyStatus = "loading";
        state.error = null;
      })
      .addCase(fetchCoverLetters.fulfilled, (state, action) => {
        state.historyStatus = "idle";
        state.history = action.payload.letters;
      })
      .addCase(fetchCoverLetters.rejected, (state, action) => {
        state.historyStatus = "failed";
        state.error = action.payload?.message || "Failed to load cover letters";
      })

      // deleteCoverLetter
      .addCase(deleteCoverLetter.fulfilled, (state, action) => {
        const { letterId } = action.payload;
        state.history = state.history.filter((l) => l.letterId !== letterId);
        if (state.current?.letterId === letterId) {
          state.current = null;
        }
      })
      .addCase(deleteCoverLetter.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to delete cover letter";
      });
  },
});

export const { resetCoverLetter, selectLetter } = coverLetterSlice.actions;

export default coverLetterSlice.reducer;
