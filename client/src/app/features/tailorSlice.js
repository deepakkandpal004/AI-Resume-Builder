import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/api";

// Thunk: POST /api/ai/tailor-resume
export const tailorResume = createAsyncThunk(
  "tailor/generate",
  async ({ resumeId, jobDescription }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        "/api/ai/tailor-resume",
        { resumeId, jobDescription },
        { timeout: 45000 }
      );
      return response.data;
    } catch (err) {
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        return rejectWithValue({ message: "Tailoring timed out. Please try again." });
      }
      return rejectWithValue({
        message: err.response?.data?.message || err.message || "Failed to tailor resume",
      });
    }
  }
);

const initialState = {
  status: "idle",
  error: null,
  original: null,
  tailored: null,
  applied: false,
};

const tailorSlice = createSlice({
  name: "tailor",
  initialState,
  reducers: {
    resetTailor: () => initialState,
    markApplied: (state) => {
      state.applied = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(tailorResume.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.original = null;
        state.tailored = null;
        state.applied = false;
      })
      .addCase(tailorResume.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.original = action.payload.original;
        state.tailored = action.payload.tailored;
      })
      .addCase(tailorResume.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || "Tailoring failed";
      });
  },
});

export const { resetTailor, markApplied } = tailorSlice.actions;
export default tailorSlice.reducer;
