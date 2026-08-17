import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { setCredentials, logout } from '../state/authSlice';
import { authService } from '../service/authService';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    try {
      setLoading(true);
      const data = await authService.login(credentials);
      dispatch(setCredentials(data));
      
      const role = data.user.role;
      toast.success('Login successful!');
      
      // Navigate based on role
      if (role === 'super_admin') navigate("/super-admin/dashboard");
      else if (role === 'admin') navigate("/admin/dashboard");
      else if (role === 'doctor') navigate("/doctor/dashboard");
      else if (role === 'patient') navigate("/patient/dashboard");
      else navigate("/dashboard");
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      
      toast.success('Registration successful. Please verify your email.');
      
      navigate(`/verify-otp?email=${encodeURIComponent(userData.email)}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
  
    let currentRole = "patient";
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        currentRole = JSON.parse(userStr).role;
      }
    } catch(e) {}
    
    try {
      await authService.logout(); 
    } catch (e) {
      console.error("Logout API failed", e);
    }
    
    dispatch(logout());
    
    if (currentRole && currentRole !== "patient") {
      navigate('/login?type=staff');
    } else {
      navigate('/login?type=patient');
    }
  };

  const handleVerifyOtp = async (email, otp) => {
    try {
      setLoading(true);
      const data = await authService.verifyOtp(email, otp);
      
      // Auto login after verification
      dispatch(setCredentials(data));
      const role = data.user.role;
      toast.success('Email verified successfully! Welcome.');
      
      // Navigate based on role
      if (role === 'super_admin') navigate("/super-admin/dashboard");
      else if (role === 'admin') navigate("/admin/dashboard");
      else if (role === 'doctor') navigate("/doctor/dashboard");
      else if (role === 'patient') navigate("/patient/dashboard");
      else navigate("/dashboard");
      
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async (email) => {
    try {
      setLoading(true);
      const response = await authService.resendOtp(email);
      
      toast.success(response.message || 'OTP resent successfully');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, handleRegister, handleLogout, handleVerifyOtp, handleResendOtp, loading };
};
