import apiClient from "../../../shared/service/apiClient";

const adminService = {
  // --- Departments ---
  fetchDepartments: async () => {
    const res = await apiClient.get("/departments");
    return res.data;
  },

  createDepartment: async (payload) => {
    const res = await apiClient.post("/departments", payload);
    return res.data;
  },

  // --- Staff ---
  fetchStaff: async () => {
    const res = await apiClient.get("/users?role=doctor,nurse,receptionist,pharmacist,accountant");
    return res.data;
  },

  createStaff: async (payload) => {
    const res = await apiClient.post("/users/staff", payload);
    return res.data;
  },

  toggleStaffStatus: async (id) => {
    const res = await apiClient.patch(`/users/${id}/status`);
    return res.data;
  },

  // --- Patients ---
  fetchPatients: async (search = "") => {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    const res = await apiClient.get(`/patients${query}`);
    return res.data;
  },

  registerPatient: async (payload) => {
    const res = await apiClient.post("/patients", payload);
    return res.data;
  },

  // --- Dashboard ---
  fetchDashboardStats: async () => {
    const res = await apiClient.get("/analytics/hospital");
    return res.data;
  }
};

export default adminService;
