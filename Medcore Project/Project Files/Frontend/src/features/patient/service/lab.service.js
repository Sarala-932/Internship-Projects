import apiClient from "../../../shared/service/apiClient";

export const getMyLabRecordsService = async (patientId) => {
    const response = await apiClient.get(`/lab-orders?patientId=${patientId}`);
    return response.data.orders;
};
