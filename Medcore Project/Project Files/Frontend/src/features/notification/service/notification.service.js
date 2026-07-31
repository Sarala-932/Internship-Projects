import apiClient from "../../../shared/service/apiClient";

const notificationService = {
  fetchNotifications: async () => {
    const res = await apiClient.get("/notifications");
    return res.data;
  },
  
  markAsRead: async (id) => {
    const res = await apiClient.patch(`/notifications/${id}/read`);
    return res.data;
  }
};

export default notificationService;
