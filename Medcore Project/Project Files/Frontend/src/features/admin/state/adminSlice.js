import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  departments: [],
  staff: [],
  staffMeta: null,
  patients: [],
  appointments: [],
  bills: [],
  labOrders: [],
  pharmacyInventory: [],
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
    setAppointments: (state, action) => {
      state.appointments = action.payload;
      state.loading = false;
      state.error = null;
    },
    setBills: (state, action) => {
      state.bills = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLabOrders: (state, action) => {
      state.labOrders = action.payload;
      state.loading = false;
      state.error = null;
    },
    setPharmacyInventory: (state, action) => {
      state.pharmacyInventory = action.payload;
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
  setAppointments,
  setBills,
  setLabOrders,
  setPharmacyInventory,
  setStats,
  clearAdminState 
} = adminSlice.actions;

export default adminSlice.reducer;
