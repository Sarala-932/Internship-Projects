import { useState } from "react";
import { useDispatch } from "react-redux";
import { patientService } from "../service/patientService";
import { 
  setActiveProfile, 
  setAppointmentsData,
  setPrescriptionsData,
  setAdmissionsData 
} from "../state/patientSlice";
import toast from "react-hot-toast";

export const usePatient = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await patientService.getPatientProfile();
      const profile = data.patient;
      if (profile) {
        dispatch(setActiveProfile(profile));
      }
      return profile;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getAppointments = async (patientId) => {
    if (!patientId) return [];
    try {
      setLoading(true);
      const data = await patientService.getAppointments(patientId);
      const apps = data.appointments || [];
      dispatch(setAppointmentsData(apps));
      return apps;
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load appointments");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const bookAppointment = async (data) => {
    try {
      setLoading(true);
      await patientService.bookAppointment(data);
      toast.success("Appointment booked successfully");
      return true;
    } catch (err) {
      setError(err.message);
      toast.error(err.response?.data?.message || "Failed to book appointment");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id, reason = "Cancelled by patient") => {
    try {
      setLoading(true);
      await patientService.cancelAppointment(id, reason);
      toast.success("Appointment cancelled");
      return true;
    } catch (err) {
      setError(err.message);
      toast.error(err.response?.data?.message || "Failed to cancel appointment");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getPrescriptions = async (patientId) => {
    if (!patientId) return [];
    try {
      setLoading(true);
      const data = await patientService.getPrescriptions(patientId);
      const prescs = data.prescriptions || [];
      dispatch(setPrescriptionsData(prescs));
      return prescs;
    } catch (err) {
      console.error("Prescription fetch error:", err.response?.data || err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getMyAdmissions = async () => {
    try {
      setLoading(true);
      const data = await patientService.getMyAdmissions();
      const adms = data.admissions || [];
      dispatch(setAdmissionsData(adms));
      return adms;
    } catch (err) {
      console.error("Admission fetch error:", err.response?.data || err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (id, data) => {
    try {
      setLoading(true);
      const res = await patientService.updateProfile(id, data);
      toast.success("Profile updated successfully");
      if (res.patient) {
        dispatch(setActiveProfile(res.patient));
      }
      return true;
    } catch (err) {
      setError(err.message);
      toast.error(err.response?.data?.message || "Failed to update profile");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async (hospitalId) => {
    try {
      const data = await patientService.getDepartments(hospitalId);
      return data.departments || [];
    } catch (err) {
      console.error(err);
      toast.error("Failed to load departments");
      return [];
    }
  };

  const fetchDoctorsByDepartment = async (hospitalId, departmentId) => {
    try {
      const data = await patientService.getDoctorsByDepartment(hospitalId, departmentId);
      return data.doctors || [];
    } catch (err) {
      console.error(err);
      toast.error("Failed to load doctors");
      return [];
    }
  };

  const fetchAvailableSlots = async (doctorId, date) => {
    try {
      const data = await patientService.getAvailableSlots(doctorId, date);
      return data.availableSlots || [];
    } catch (err) {
      console.error(err);
      toast.error("Failed to load available slots");
      return [];
    }
  };

  return {
    fetchProfile,
    getAppointments,
    bookAppointment,
    cancelAppointment,
    getPrescriptions,
    getMyAdmissions,
    updateProfile,
    fetchDepartments,
    fetchDoctorsByDepartment,
    fetchAvailableSlots,
    loading,
    error
  };
};
