import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import doctorService from "../service/doctorService";

export const fetchDashboardStats = createAsyncThunk(
  "doctor/fetchDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      return await doctorService.getDashboardStats();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch dashboard stats");
    }
  }
);

export const fetchAppointments = createAsyncThunk(
  "doctor/fetchAppointments",
  async ({ doctorId, date }, { rejectWithValue }) => {
    try {
      return await doctorService.getAppointments(doctorId, date);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch appointments");
    }
  }
);

export const fetchPatients = createAsyncThunk(
  "doctor/fetchPatients",
  async (params = {}, { rejectWithValue }) => {
    try {
      return await doctorService.getPatients(params);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch patients");
    }
  }
);

const initialState = {
  dashboard: {
    stats: null,
    loading: false,
    error: null,
  },
  appointments: {
    list: [],
    loading: false,
    error: null,
  },
  patients: {
    list: [],
    meta: null,
    loading: false,
    error: null,
  }
};

const doctorSlice = createSlice({
  name: "doctor",
  initialState,
  reducers: {
    clearDoctorErrors: (state) => {
      state.dashboard.error = null;
      state.appointments.error = null;
      state.patients.error = null;
    }
  },
  extraReducers: (builder) => {
    // Dashboard Stats
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.dashboard.loading = true;
        state.dashboard.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.dashboard.loading = false;
        state.dashboard.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.dashboard.loading = false;
        state.dashboard.error = action.payload;
      });

    // Appointments
    builder
      .addCase(fetchAppointments.pending, (state) => {
        state.appointments.loading = true;
        state.appointments.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.appointments.loading = false;
        state.appointments.list = action.payload.appointments || [];
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.appointments.loading = false;
        state.appointments.error = action.payload;
      });

    // Patients
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.patients.loading = true;
        state.patients.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.patients.loading = false;
        state.patients.list = action.payload.patients || [];
        state.patients.meta = action.payload.meta || null;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.patients.loading = false;
        state.patients.error = action.payload;
      });
  },
});

export const { clearDoctorErrors } = doctorSlice.actions;
export default doctorSlice.reducer;
