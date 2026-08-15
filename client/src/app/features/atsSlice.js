import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../configs/api";

// Thunk: POST /api/ai/ats-score
export const runScan = createAsyncThunk(
  "ats/runScan",
  async ({ resumeId, jobDescription }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        "/api/ai/ats-score",
        { resumeId, jobDescription },
        { timeout: 35000 }
      );
      return response.data;
    } catch (err) {
      if (err.response?.status === 429) {
        return rejectWithValue({
          message: "Daily scan limit reached.",
          quotaExhausted: true,
        });
      }
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        return rejectWithValue({
          message: "Analysis timed out. Please try again.",
        });
      }
      return rejectWithValue({
        message: err.response?.data?.message || err.message || "Scan failed",
      });
    }
  }
);

// Thunk: GET /api/ai/ats-score/:resumeId
export const fetchLatestScan = createAsyncThunk(
  "ats/fetchLatestScan",
  async (resumeId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/ai/ats-score/${resumeId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue({
        message: err.response?.data?.message || err.message || "Failed to load history",
      });
    }
  }
);

const initialState = {
  scanStatus: "idle",
  historyStatus: "idle",
  error: null,
  quotaExhausted: false,
  scansRemainingToday: null,
  currentScan: null,
  history: [],
};

const atsSlice = createSlice({
  name: "ats",
  initialState,
  reducers: {
    resetAts: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(runScan.pending, (state) => {
        state.scanStatus = "loading";
        state.error = null;
      })
      .addCase(runScan.fulfilled, (state, action) => {
        const {
          scanId,
          atsScore,
          matchedKeywords,
          missingKeywords,
          skillsGap,
          suggestions,
          scansRemainingToday,
        } = action.payload;

        state.scanStatus = "succeeded";
        state.quotaExhausted = false;
        state.scansRemainingToday = scansRemainingToday ?? state.scansRemainingToday;
        state.currentScan = {
          scanId,
          atsScore,
          matchedKeywords,
          missingKeywords,
          skillsGap,
          suggestions,
          createdAt: new Date().toISOString(),
        };
      })
      .addCase(runScan.rejected, (state, action) => {
        state.scanStatus = "failed";
        state.error = action.payload?.message || "Scan failed";
        if (action.payload?.quotaExhausted) {
          state.quotaExhausted = true;
        }
      })
      .addCase(fetchLatestScan.pending, (state) => {
        state.historyStatus = "loading";
        state.error = null;
      })
      .addCase(fetchLatestScan.fulfilled, (state, action) => {
        const { scans } = action.payload;
        state.historyStatus = "idle";
        state.history = scans;

        if (scans.length > 0) {
          const s = scans[0];
          state.currentScan = {
            scanId: s.scanId,
            atsScore: s.atsScore,
            matchedKeywords: s.matchedKeywords,
            missingKeywords: s.missingKeywords,
            skillsGap: s.skillsGap,
            suggestions: s.suggestions,
            createdAt: s.createdAt,
            jdSnippet: s.jdSnippet,
          };
        } else {
          state.currentScan = null;
        }
      })
      .addCase(fetchLatestScan.rejected, (state, action) => {
        state.historyStatus = "failed";
        state.error = action.payload?.message || "Failed to load history";
      });
  },
});

export const { resetAts } = atsSlice.actions;

export default atsSlice.reducer;
