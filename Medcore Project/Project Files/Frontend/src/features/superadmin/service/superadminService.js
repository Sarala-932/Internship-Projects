import apiClient from "../../../shared/service/apiClient";

export const superadminService = {
  getPlatformStats: async () => {
    const response = await apiClient.get("/analytics/platform");
    return response.data;
  },

  getAuditLogs: async (page = 1, limit = 20, action = "") => {
    let url = `/analytics/audit-logs?page=${page}&limit=${limit}`;
    if (action) {
      url += `&action=${action}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  },

  getHospitals: async (status = "all") => {
    const url = status === "all" ? "/hospitals" : `/hospitals?status=${status}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  verifyHospital: async (id) => {
    const response = await apiClient.patch(`/hospitals/${id}/verify`);
    return response.data;
  },

  getSpecialities: async () => {
    const response = await apiClient.get("/master/specialities");
    return response.data;
  },

  updateSpecialityStatus: async (id) => {
    const response = await apiClient.patch(`/master/specialities/${id}/status`);
    return response.data;
  },

  createSpeciality: async (data) => {
    const response = await apiClient.post("/master/specialities", data);
    return response.data;
  },

  getTickets: async (statusFilter = "") => {
    let url = "/tickets";
    if (statusFilter) url += `?status=${statusFilter}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  updateTicketStatus: async (id, status) => {
    const response = await apiClient.patch(`/tickets/${id}/status`, { status });
    return response.data;
  },

  getUsers: async () => {
    const response = await apiClient.get("/users");
    return response.data;
  },

  updateUserStatus: async (id) => {
    const response = await apiClient.patch(`/users/${id}/status`);
    return response.data;
  },

  updatePassword: async (data) => {
    const response = await apiClient.patch("/users/password", data);
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await apiClient.patch("/users/profile", data);
    return response.data;
  }
};
