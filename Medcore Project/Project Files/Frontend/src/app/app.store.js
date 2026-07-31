import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/state/authSlice';
import superadminReducer from '../features/superadmin/state/superadminSlice';
import patientReducer from '../features/patient/state/patientSlice';
import doctorReducer from '../features/doctor/state/doctorSlice';
import adminReducer from '../features/admin/state/adminSlice';
import notificationReducer from '../features/notification/state/notificationSlice';
import billingReducer from '../features/billing/state/billingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    superadmin: superadminReducer,
    patient: patientReducer,
    doctor: doctorReducer,
    admin: adminReducer,
    notifications: notificationReducer,
    billing: billingReducer,
  },
});
