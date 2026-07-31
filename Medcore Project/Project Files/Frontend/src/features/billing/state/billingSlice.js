import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  bills: [],
  isLoading: false,
  error: null,
};

const billingSlice = createSlice({
  name: "billing",
  initialState,
  reducers: {
    setBills: (state, action) => {
      state.bills = action.payload;
    },
    updateBillStatus: (state, action) => {
      const { billId, status, paidAmount, dueAmount } = action.payload;
      const bill = state.bills.find(b => b._id === billId);
      if (bill) {
        bill.status = status;
        if (paidAmount !== undefined) bill.paidAmount = paidAmount;
        if (dueAmount !== undefined) bill.dueAmount = dueAmount;
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setBills, updateBillStatus, setLoading, setError } = billingSlice.actions;
export default billingSlice.reducer;
