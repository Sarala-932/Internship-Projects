import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPatients } from '../state/doctorSlice';

export const useDoctorPatients = () => {
  const dispatch = useDispatch();
  const { list: patients, loading, error } = useSelector((state) => state.doctor.patients);

  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

  const refreshPatients = () => {
    dispatch(fetchPatients());
  };

  return {
    patients,
    loading,
    error,
    refreshPatients
  };
};
