import apiClient from "../../../shared/service/apiClient";

export const patientService = {

  getPatientProfile: async () => {
    const response = await apiClient.get("/patients/me");
    return response.data;
  },

  getAppointments: async (patientId) => {
    const response = await apiClient.get(`/appointments?patientId=${patientId}`);
    return response.data;
  },

  bookAppointment: async (data) => {
    const response = await apiClient.post("/appointments", data);
    return response.data;
  },

  cancelAppointment: async (id, reason) => {
    const response = await apiClient.patch(`/appointments/${id}/cancel`, { reason });
    return response.data;
  },

  updateProfile: async (id, data) => {
    const response = await apiClient.patch(`/patients/${id}`, data);
    return response.data;
  },

  getPrescriptions: async (patientId) => {
    const response = await apiClient.get(`/prescriptions/patient/${patientId}`);
    return response.data;
  },

  getMyAdmissions: async () => {
    const response = await apiClient.get("/ipd/my-admissions");
    return response.data;
  },

  getDepartments: async (hospitalId) => {
    const url = hospitalId ? `/departments?hospitalId=${hospitalId}` : "/departments";
    const response = await apiClient.get(url);
    return response.data;
  },

  getDoctorsByDepartment: async (hospitalId, departmentId) => {
    const url = `/doctors/hospital/${hospitalId}?departmentId=${departmentId}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  getAvailableSlots: async (doctorId, date) => {
    const response = await apiClient.get(`/doctors/${doctorId}/slots?date=${date}`);
    return response.data;
  }
};
