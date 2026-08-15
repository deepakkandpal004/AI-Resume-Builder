import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: true,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.loading = false;
    },

    logout: (state) => {
      state.user = null;
      state.loading = false;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setPremium: (state) => {
      if (state.user) {
        state.user = { ...state.user, subscriptionTier: "premium" };
      }
    },
  },
});

export const { setUser, logout, setLoading, setPremium } = authSlice.actions;
export default authSlice.reducer;
