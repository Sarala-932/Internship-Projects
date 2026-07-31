import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setNotificationsData: (state, action) => {
      state.notifications = action.payload.notifications;
      state.unreadCount = action.payload.meta.unreadCount;
    },
    addLiveNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    markReadLocally: (state, action) => {
      const id = action.payload;
      if (id === "all") {
        state.notifications.forEach(n => n.isRead = true);
        state.unreadCount = 0;
      } else {
        const notification = state.notifications.find(n => n._id === id);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    }
  }
});

export const { 
  setLoading, 
  setError, 
  setNotificationsData, 
  addLiveNotification, 
  markReadLocally 
} = notificationSlice.actions;

export default notificationSlice.reducer;
