import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../../shared/service/apiClient";

// Helper to safely parse user from localStorage
const getUserFromStorage = () => {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

const initialState = {
  user: getUserFromStorage(),
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      if (state.user?.role) {
        localStorage.setItem("lastRole", state.user.role);
      }
      state.user = null;
      state.status = "idle";
      state.error = null;
      localStorage.removeItem("user");
    },
    setCredentials: (state, action) => {
      state.status = "succeeded";
      state.user = action.payload.user;
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const { logout, clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;
