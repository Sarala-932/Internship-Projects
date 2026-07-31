import { useDispatch, useSelector } from "react-redux";
import adminService from "../service/admin.service";
import { setStats, setLoading, setError } from "../state/adminSlice";
import { useCallback } from "react";
import toast from "react-hot-toast";

export const useAdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector((state) => state.admin);

  const fetchDashboardStats = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const data = await adminService.fetchDashboardStats();
      dispatch(setStats(data));
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Failed to load dashboard stats"));
      toast.error("Error loading dashboard");
    }
  }, [dispatch]);

  return {
    stats,
    loading,
    error,
    fetchDashboardStats
  };
};
