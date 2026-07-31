import { useState } from 'react';
import { superadminService } from '../service/superadminService';
import toast from 'react-hot-toast';

export const useSuperAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPlatformStats = async () => {
    try {
      setLoading(true);
      return await superadminService.getPlatformStats();
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load stats');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getHospitals = async (status = "all") => {
    try {
      setLoading(true);
      return await superadminService.getHospitals(status);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load hospitals');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getAuditLogs = async (page = 1, limit = 15, action = "") => {
    try {
      setLoading(true);
      return await superadminService.getAuditLogs(page, limit, action);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load logs');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const verifyHospital = async (id) => {
    try {
      setLoading(true);
      await superadminService.verifyHospital(id);
      toast.success(`Hospital verified successfully`);
      return true;
    } catch (err) {
      setError(err.message);
      toast.error(err.response?.data?.message || 'Verification failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getSpecialities = async () => {
    try {
      setLoading(true);
      return await superadminService.getSpecialities();
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load specialities');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateSpecialityStatus = async (id) => {
    try {
      setLoading(true);
      await superadminService.updateSpecialityStatus(id);
      toast.success('Status updated successfully');
      return true;
    } catch (err) {
      setError(err.message);
      toast.error(err.response?.data?.message || 'Failed to update status');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createSpeciality = async (data) => {
    try {
      setLoading(true);
      await superadminService.createSpeciality(data);
      toast.success('Speciality created');
      return true;
    } catch (err) {
      setError(err.message);
      toast.error(err.response?.data?.message || 'Failed to create speciality');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getTickets = async (statusFilter = "") => {
    try {
      setLoading(true);
      return await superadminService.getTickets(statusFilter);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load tickets');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (id, status) => {
    try {
      setLoading(true);
      await superadminService.updateTicketStatus(id, status);
      toast.success('Ticket status updated');
      return true;
    } catch (err) {
      setError(err.message);
      toast.error(err.response?.data?.message || 'Failed to update ticket');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getUsers = async () => {
    try {
      setLoading(true);
      return await superadminService.getUsers();
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load users');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (id) => {
    try {
      setLoading(true);
      const res = await superadminService.updateUserStatus(id);
      toast.success(res.message || 'User status updated');
      return true;
    } catch (err) {
      setError(err.message);
      toast.error(err.response?.data?.message || 'Failed to update user status');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (data) => {
    try {
      setLoading(true);
      const res = await superadminService.updatePassword(data);
      toast.success(res.message || 'Password changed successfully');
      return true;
    } catch (err) {
      setError(err.message);
      toast.error(err.response?.data?.message || 'Failed to change password');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data) => {
    try {
      setLoading(true);
      const res = await superadminService.updateProfile(data);
      toast.success(res.message || 'Profile updated');
      return true;
    } catch (err) {
      setError(err.message);
      toast.error(err.response?.data?.message || 'Failed to update profile');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { 
    getPlatformStats, 
    getHospitals, 
    verifyHospital, 
    getAuditLogs,
    getSpecialities,
    updateSpecialityStatus,
    createSpeciality,
    getTickets,
    updateTicketStatus,
    getUsers,
    updateUserStatus,
    updatePassword,
    updateProfile,
    loading, 
    error 
  };
};
