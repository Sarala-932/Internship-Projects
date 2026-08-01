import { useDispatch, useSelector } from "react-redux";
import adminService from "../service/admin.service";
import { setStaff, setLoading, setError } from "../state/adminSlice";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";

export const useAdminStaff = (params = {}) => {
  const dispatch = useDispatch();
  const { staff, staffMeta: meta, loading, error } = useSelector((state) => state.admin);
  const [departments, setDepartments] = useState([]);

  // Serialize params to trigger re-fetch when they change
  const paramsString = JSON.stringify(params);

  const fetchStaff = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const parsedParams = JSON.parse(paramsString);
      const [staffData, deptData] = await Promise.all([
        adminService.fetchStaff(parsedParams),
        adminService.fetchDepartments()
      ]);
      dispatch(setStaff({ staff: staffData.users || [], meta: staffData.meta || null }));
      setDepartments(deptData.departments || []);
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Failed to fetch staff"));
      toast.error("Error loading staff directory");
    }
  }, [dispatch, paramsString]);

  const toggleStaffStatus = async (id) => {
    try {
      const res = await adminService.toggleStaffStatus(id);
      toast.success(res.message || "Status updated");
      await fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const createStaff = async (payload) => {
    try {
      await adminService.createStaff(payload);
      toast.success("Staff account created successfully");
      await fetchStaff();
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create account");
      return false;
    }
  };

  return {
    staff,
    meta,
    departments,
    loading,
    error,
    fetchStaff,
    toggleStaffStatus,
    createStaff
  };
};
