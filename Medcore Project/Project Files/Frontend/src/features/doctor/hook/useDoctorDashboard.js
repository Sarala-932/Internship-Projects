import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from '../state/doctorSlice';

export const useDoctorDashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector((state) => state.doctor.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const refreshStats = () => {
    dispatch(fetchDashboardStats());
  };

  return {
    stats,
    loading,
    error,
    refreshStats
  };
};
