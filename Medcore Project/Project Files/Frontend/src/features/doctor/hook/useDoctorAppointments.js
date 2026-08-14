import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAppointments } from '../state/doctorSlice';
import doctorService from '../service/doctorService';
import toast from 'react-hot-toast';

export const useDoctorAppointments = (doctorId, filterDate) => {
  const dispatch = useDispatch();
  const { list: appointments, loading, error } = useSelector((state) => state.doctor.appointments);
  // Track what was last fetched to avoid redundant calls
  const lastFetchKey = useRef(null);

  const getAppointments = useCallback(() => {
    if (doctorId) {
      return dispatch(fetchAppointments({ doctorId, date: filterDate }));
    }
  }, [doctorId, filterDate, dispatch]);

  useEffect(() => {
    if (!doctorId) return;
    const fetchKey = `${doctorId}_${filterDate}`;
    // Only skip if same fetch key was already run (regardless of data length)
    if (lastFetchKey.current === fetchKey) return;
    lastFetchKey.current = fetchKey;
    const timer = setTimeout(() => {
      getAppointments();
    }, 0);
    return () => clearTimeout(timer);
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
