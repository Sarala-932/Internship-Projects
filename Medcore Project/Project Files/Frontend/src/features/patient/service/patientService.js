import apiClient from "../../../shared/service/apiClient";

export const patientService = {
  // Fetch own patient profile (for logged-in patient)
  getPatientProfile: async () => {
    const response = await apiClient.get("/patients/me");
    return response.data;
  },

  // Get appointments for the patient
  getAppointments: async (patientId) => {
    const response = await apiClient.get(`/appointments?patientId=${patientId}`);
    return response.data;
  },

  // Book a new appointment
  bookAppointment: async (data) => {
    const response = await apiClient.post("/appointments", data);
    return response.data;
  },

  // Cancel an appointment
  cancelAppointment: async (id, reason) => {
    const response = await apiClient.patch(`/appointments/${id}/cancel`, { reason });
    return response.data;
  },

  // Update profile
  updateProfile: async (id, data) => {
    const response = await apiClient.patch(`/patients/${id}`, data);
    return response.data;
  },
  
  // Get prescriptions
  getPrescriptions: async (patientId) => {
    const response = await apiClient.get(`/prescriptions/patient/${patientId}`);
    return response.data;
  },

  // Fetch departments for booking
  getDepartments: async (hospitalId) => {
    const url = hospitalId ? `/departments?hospitalId=${hospitalId}` : "/departments";
    const response = await apiClient.get(url);
    return response.data;
  },

  // Fetch doctors by department
  getDoctorsByDepartment: async (hospitalId, departmentId) => {
    const url = `/doctors/hospital/${hospitalId}?departmentId=${departmentId}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  // Fetch available slots for a doctor on a specific date
  getAvailableSlots: async (doctorId, date) => {
    const response = await apiClient.get(`/doctors/${doctorId}/slots?date=${date}`);
    return response.data;
  }
};
