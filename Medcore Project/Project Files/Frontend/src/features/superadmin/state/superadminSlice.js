import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  hospitals: [],
  auditLogs: [],
  platformStats: null,
  activeFilter: 'all',
  loading: false,
  error: null,
};

const superadminSlice = createSlice({
  name: 'superadmin',
  initialState,
  reducers: {
    setHospitals: (state, action) => {
      state.hospitals = action.payload;
    },
    setAuditLogs: (state, action) => {
      state.auditLogs = action.payload;
    },
    setPlatformStats: (state, action) => {
      state.platformStats = action.payload;
    },
    setActiveFilter: (state, action) => {
      state.activeFilter = action.payload;
    },
    clearSuperAdminState: (state) => {
      return initialState;
    }
  },
});

export const { 
  setHospitals, 
  setAuditLogs, 
  setPlatformStats, 
  setActiveFilter, 
  clearSuperAdminState 
} = superadminSlice.actions;

export default superadminSlice.reducer;
