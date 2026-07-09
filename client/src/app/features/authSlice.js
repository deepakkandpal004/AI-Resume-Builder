import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: null,
    user: null,
    loading: false,
  },
  reducers: {
    login: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.loading = false;
    },

    logout: (state) => {
      state.token = null;
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

export const { login, logout, setLoading, setPremium } = authSlice.actions;
export default authSlice.reducer;
