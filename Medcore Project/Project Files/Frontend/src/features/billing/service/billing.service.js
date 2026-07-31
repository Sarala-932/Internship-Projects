import apiClient from "../../../shared/service/apiClient";

export const getBillsService = async (queryParams = "") => {
  const response = await apiClient.get(`/billing${queryParams}`);
  return response.data;
};

export const initializePaymentService = async (billId) => {
  const response = await apiClient.post(`/billing/${billId}/checkout`);
  return response.data;
};

export const verifyPaymentService = async (billId, paymentData) => {
  const response = await apiClient.post(`/billing/${billId}/verify`, paymentData);
  return response.data;
};
