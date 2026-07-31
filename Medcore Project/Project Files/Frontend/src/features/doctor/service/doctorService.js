import apiClient from "../../../shared/service/apiClient";

const doctorService = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await apiClient.get("/analytics/doctor");
    return response.data;
  },

  // Appointments
  getAppointments: async (doctorId, date) => {
    const url = date 
      ? `/appointments?doctorId=${doctorId}&date=${date}` 
      : `/appointments?doctorId=${doctorId}`;
    const response = await apiClient.get(url);
    return response.data;
  },
  
  updateAppointmentStatus: async (id, status) => {
    const response = await apiClient.patch(`/appointments/${id}/status`, { status });
    return response.data;
  },
  
  getAppointmentById: async (id) => {
    const response = await apiClient.get(`/appointments/${id}`);
    return response.data;
  },

  // Encounters & Prescriptions
  getEncounterById: async (id) => {
    const response = await apiClient.get(`/encounters/${id}`);
    return response.data;
  },
  
  getPrescriptionsByEncounter: async (encounterId) => {
    const response = await apiClient.get(`/prescriptions/encounter/${encounterId}`);
    return response.data;
  },
  
  getEncountersByPatient: async (patientId) => {
    const response = await apiClient.get(`/encounters/patient/${patientId}`);
    return response.data;
  },
  
  getPrescriptionsByPatient: async (patientId) => {
    const response = await apiClient.get(`/prescriptions/patient/${patientId}`);
    return response.data;
  },
  
  createEncounter: async (appointmentId) => {
    const response = await apiClient.post("/encounters", { appointmentId });
    return response.data;
  },
  
  updateEncounter: async (encounterId, data) => {
    const response = await apiClient.patch(`/encounters/${encounterId}`, data);
    return response.data;
  },
  
  updateVitals: async (encounterId, vitalsData) => {
    const response = await apiClient.patch(`/encounters/${encounterId}/vitals`, vitalsData);
    return response.data;
  },
  
  signEncounter: async (encounterId) => {
    const response = await apiClient.patch(`/encounters/${encounterId}/sign`);
    return response.data;
  },
  
  createPrescription: async (data) => {
    const response = await apiClient.post("/prescriptions", data);
    return response.data;
  },

  // Pharmacy Inventory (for prescriptions)
  getPharmacyInventory: async () => {
    const response = await apiClient.get("/pharmacy/inventory");
    return response.data;
  },

  // Lab Orders
  createLabOrder: async (data) => {
    const response = await apiClient.post("/lab-orders", data);
    return response.data;
  },

  getLabOrdersByPatient: async (patientId) => {
    const response = await apiClient.get(`/lab-orders?patientId=${patientId}`);
    return response.data;
  },

  // Patients
  getPatients: async () => {
    const response = await apiClient.get("/patients");
    return response.data;
  }
};

export default doctorService;
