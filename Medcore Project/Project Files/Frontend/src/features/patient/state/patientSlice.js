import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activeProfile: null, // Stores the specific Patient Profile matching the User
  appointments: [],
  prescriptions: [],
  admissions: [],
  labRecords: [],
};

const patientSlice = createSlice({
  name: "patient",
  initialState,
  reducers: {
    setActiveProfile: (state, action) => {
      state.activeProfile = action.payload;
    },
    setAppointmentsData: (state, action) => {
      state.appointments = action.payload;
    },
    setPrescriptionsData: (state, action) => {
      state.prescriptions = action.payload;
    },
    setAdmissionsData: (state, action) => {
      state.admissions = action.payload;
    },
    setLabRecordsData: (state, action) => {
      state.labRecords = action.payload;
    },
    clearPatientData: (state) => {
      return initialState;
    }
  }
});

export const { 
  setActiveProfile, 
  setAppointmentsData,
  setPrescriptionsData,
  setAdmissionsData,
  setLabRecordsData,
  clearPatientData 
} = patientSlice.actions;

export default patientSlice.reducer;
