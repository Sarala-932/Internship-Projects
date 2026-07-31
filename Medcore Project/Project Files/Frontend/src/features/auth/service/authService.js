import apiClient from "../../../shared/service/apiClient";

export const authService = {
  login: async (credentials) => {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  },

  verifyOtp: async (email, otp) => {
    const response = await apiClient.post("/auth/verify-otp", { email, code: otp });
    return response.data;
  },

  resendOtp: async (email) => {
    const response = await apiClient.post("/auth/resend-otp", { email });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (email, code, newPassword) => {
    const response = await apiClient.post("/auth/reset-password", { email, code, newPassword });
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  }
};
