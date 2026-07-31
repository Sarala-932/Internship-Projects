import { useDispatch, useSelector } from "react-redux";
import adminService from "../service/admin.service";
import { setPatients, setLoading, setError } from "../state/adminSlice";
import { useCallback } from "react";
import toast from "react-hot-toast";

export const useAdminPatients = () => {
  const dispatch = useDispatch();
  const { patients, loading, error } = useSelector((state) => state.admin);

  const fetchPatients = useCallback(async (searchQuery = "") => {
    try {
      dispatch(setLoading(true));
      const data = await adminService.fetchPatients(searchQuery);
      dispatch(setPatients(data.patients || []));
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Failed to load patients"));
      toast.error("Error loading patient directory");
    }
  }, [dispatch]);

  const registerPatient = async (payload) => {
    try {
      const res = await adminService.registerPatient(payload);
      toast.success(res.message || "Patient registered successfully");
      await fetchPatients();
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to register patient");
      return false;
    }
  };

  return {
    patients,
    loading,
    error,
    fetchPatients,
    registerPatient
  };
};
