import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from '../state/doctorSlice';

export const useDoctorDashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector((state) => state.doctor.dashboard);

  useEffect(() => {
    if (!stats) {
      dispatch(fetchDashboardStats());
    }
  }, [dispatch, stats]);

  const refreshStats = () => {
    return dispatch(fetchDashboardStats());
  };

  return {
    stats,
    loading,
    error,
    refreshStats
  };
};
