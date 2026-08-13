import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setWards, setIpdPatients, setPendingRequests, setLoading } from "../../admin/state/adminSlice";
import toast from "react-hot-toast";
import { ipdService } from "../service/ipdService";

export const useIPD = () => {
  const dispatch = useDispatch();
  const { wards, ipdPatients: patients, pendingRequests, loading: reduxLoading } = useSelector(state => state.admin);
  const [loading, setLoading] = useState(true);
  
  const [doctors, setDoctors] = useState([]);
  
  
  const [admitting, setAdmitting] = useState(false);
  const [dischargingBedId, setDischargingBedId] = useState(null);

  const fetchWards = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ipdService.getWards();
      dispatch(setWards(data));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load wards.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPendingRequests = useCallback(async () => {
    try {
      const data = await ipdService.getPendingRequests();
      dispatch(setPendingRequests(data));
    } catch (err) {
      console.error("Failed to fetch pending requests", err);
    }
  }, []);

  const fetchDropdownData = useCallback(async () => {
    try {
      const [patientsData, doctorsData] = await Promise.all([
        ipdService.getPatients(),
        ipdService.getDoctors()
      ]);
      dispatch(setIpdPatients(patientsData));
      setDoctors(doctorsData);
    } catch (err) {
      console.error("Failed to fetch dropdown data", err);
    }
  }, []);

  useEffect(() => {
    // Cache-first: only fetch if data not already loaded
    if (wards.length === 0) fetchWards();
    if (pendingRequests.length === 0) fetchPendingRequests();
    if (patients.length === 0) fetchDropdownData();
  }, [fetchWards, fetchPendingRequests, fetchDropdownData]);

  const admitPatient = async (admitForm) => {
    try {
      setAdmitting(true);
      await ipdService.admitPatient(admitForm);
      toast.success("Patient admitted successfully!");
      fetchWards();
      fetchPendingRequests();
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to admit patient");
      return false;
    } finally {
      setAdmitting(false);
    }
  };

  const dischargePatient = async (bedId, admissionId, summary = "Discharged from Admin Portal") => {
    try {
      setDischargingBedId(bedId);
      const response = await ipdService.dischargePatient(admissionId, summary);
      toast.success(response.message || "Patient discharged successfully!");
      fetchWards();
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to discharge patient");
      return false;
    } finally {
      setDischargingBedId(null);
    }
  };

  return {
    wards,
    loading,
    patients,
    doctors,
    pendingRequests,
    admitting,
    dischargingBedId,
    admitPatient,
    dischargePatient,
    refreshWards: fetchWards,
    refreshRequests: fetchPendingRequests
  };
};
