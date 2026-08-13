import { useDispatch, useSelector } from "react-redux";
import adminService from "../service/admin.service";
import { setDepartments, setLoading, setError } from "../state/adminSlice";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import apiClient from "../../../shared/service/apiClient";

export const useAdminDepartments = () => {
  const dispatch = useDispatch();
  const { departments, loading, error } = useSelector((state) => state.admin);

  const [masterSpecialities, setMasterSpecialities] = useState([]);

  const fetchDepartments = useCallback(async (force = false) => {
    // Cache-first: skip fetch if data already loaded and not forced
    if (!force && departments.length > 0) return;
    try {
      dispatch(setLoading(true));
      const [deptData, masterRes] = await Promise.all([
        adminService.fetchDepartments(),
        apiClient.get("/master/specialities?activeOnly=true")
      ]);
      dispatch(setDepartments(deptData.departments || []));
      setMasterSpecialities(masterRes.data.specialities || []);
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Failed to load data"));
      toast.error("Error loading data");
    }
  }, [dispatch]);

  const createDepartment = async (payload) => {
    try {
      dispatch(setLoading(true));
      await adminService.createDepartment(payload);
      toast.success("Department added successfully");
      await fetchDepartments();
      return true;
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Failed to create department"));
      toast.error(err.response?.data?.message || "Failed to create department");
      return false;
    }
  };

  return {
    departments,
    masterSpecialities,
    loading,
    error,
    fetchDepartments,
    createDepartment
  };
};
