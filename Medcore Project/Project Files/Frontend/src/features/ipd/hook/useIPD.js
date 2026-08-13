import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { ipdService } from "../service/ipdService";

export const useIPD = () => {
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  
  const [admitting, setAdmitting] = useState(false);
  const [dischargingBedId, setDischargingBedId] = useState(null);

  const fetchWards = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ipdService.getWards();
      setWards(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load wards.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDropdownData = useCallback(async () => {
    try {
      const [patientsData, doctorsData] = await Promise.all([
        ipdService.getPatients(),
        ipdService.getDoctors()
      ]);
      setPatients(patientsData);
      setDoctors(doctorsData);
    } catch (err) {
      console.error("Failed to fetch dropdown data", err);
    }
  }, []);

  useEffect(() => {
    fetchWards();
    fetchDropdownData();
  }, [fetchWards, fetchDropdownData]);

  const admitPatient = async (admitForm) => {
    try {
      setAdmitting(true);
      await ipdService.admitPatient(admitForm);
      toast.success("Patient admitted successfully!");
      fetchWards();
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
      await ipdService.dischargePatient(admissionId, summary);
      toast.success("Patient discharged successfully!");
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
    admitting,
    dischargingBedId,
    admitPatient,
    dischargePatient,
    refreshWards: fetchWards
  };
};
