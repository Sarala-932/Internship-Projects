import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activeProfile: null, // Stores the specific Patient Profile matching the User
};

const patientSlice = createSlice({
  name: "patient",
  initialState,
  reducers: {
    setActiveProfile: (state, action) => {
      state.activeProfile = action.payload;
    },
    clearPatientData: (state) => {
      state.activeProfile = null;
    }
  }
});

export const { setActiveProfile, clearPatientData } = patientSlice.actions;
export default patientSlice.reducer;
