import apiClient from "../../../shared/service/apiClient";

export const ipdService = {
  getWards: async () => {
    const { data } = await apiClient.get("/ipd/wards");
    return data.wards || [];
  },
  
  getPatients: async () => {
    const { data } = await apiClient.get("/patients?limit=500");
    return data.patients || [];
  },
  
  getDoctors: async () => {
    const { data } = await apiClient.get("/users?role=doctor&limit=100");
    return data.users || [];
  },
  
  admitPatient: async (admitForm) => {
    const { data } = await apiClient.post("/ipd/admit", admitForm);
    return data;
  },
  
  dischargePatient: async (admissionId, dischargeSummary) => {
    const { data } = await apiClient.post(`/ipd/discharge/${admissionId}`, { dischargeSummary });
    return data;
  },

  getPendingRequests: async () => {
    const { data } = await apiClient.get("/ipd/requests/pending");
    return data.requests || [];
  }
};
