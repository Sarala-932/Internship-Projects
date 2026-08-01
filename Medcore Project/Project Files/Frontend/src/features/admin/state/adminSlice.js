import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  departments: [],
  staff: [],
  staffMeta: null,
  patients: [],
  stats: null,
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setDepartments: (state, action) => {
      state.departments = action.payload;
      state.loading = false;
      state.error = null;
    },
    setStaff: (state, action) => {
      state.staff = action.payload.staff;
      state.staffMeta = action.payload.meta;
      state.loading = false;
      state.error = null;
    },
    setPatients: (state, action) => {
      state.patients = action.payload;
      state.loading = false;
      state.error = null;
    },
    setStats: (state, action) => {
      state.stats = action.payload;
      state.loading = false;
      state.error = null;
    },
    clearAdminState: (state) => {
      return initialState;
    }
  }
});

export const { 
  setLoading, 
  setError, 
  setDepartments, 
  setStaff, 
  setPatients, 
  setStats,
  clearAdminState 
} = adminSlice.actions;

export default adminSlice.reducer;
