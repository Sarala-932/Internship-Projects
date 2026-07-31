import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAppointments } from '../state/doctorSlice';
import doctorService from '../service/doctorService';
import toast from 'react-hot-toast';

export const useDoctorAppointments = (doctorId, filterDate) => {
  const dispatch = useDispatch();
  const { list: appointments, loading, error } = useSelector((state) => state.doctor.appointments);

  const getAppointments = () => {
    if (doctorId) {
      dispatch(fetchAppointments({ doctorId, date: filterDate }));
    }
  };

  useEffect(() => {
    getAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, filterDate, dispatch]);

  const updateStatus = async (id, newStatus) => {
    try {
      await doctorService.updateAppointmentStatus(id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      getAppointments(); // Refresh list
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
      return false;
    }
  };

  return {
    appointments,
    loading,
    error,
    refreshAppointments: getAppointments,
    updateStatus
  };
};
