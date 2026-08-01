import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPatients } from '../state/doctorSlice';

export const useDoctorPatients = (params = {}) => {
  const dispatch = useDispatch();
  const { list: patients, meta, loading, error } = useSelector((state) => state.doctor.patients);

  // Serialize params to trigger re-fetch when they change
  const paramsString = JSON.stringify(params);

  useEffect(() => {
    dispatch(fetchPatients(JSON.parse(paramsString)));
  }, [dispatch, paramsString]);

  const refreshPatients = () => {
    dispatch(fetchPatients(JSON.parse(paramsString)));
  };

  return {
    patients,
    meta,
    loading,
    error,
    refreshPatients
  };
};
