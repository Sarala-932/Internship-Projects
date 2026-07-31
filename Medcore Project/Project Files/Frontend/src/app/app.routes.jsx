import { createBrowserRouter, Navigate } from "react-router";
import AppLayout from "./layouts/AppLayout";
import AuthLayout from "./layouts/AuthLayout";
import SuperAdminLayout from "./layouts/SuperAdminLayout";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "../features/dashboard/pages/Dashboard";
import Login from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";
import VerifyOtp from "../features/auth/pages/VerifyOtp";
import ForgotPassword from "../features/auth/pages/ForgotPassword";
import ResetPassword from "../features/auth/pages/ResetPassword";
import Home from "../features/public/pages/Home";
import ProtectedRoute from "../shared/components/ProtectedRoute";
import SuperAdminDashboard from "../features/superadmin/pages/SuperAdminDashboard";
import Hospitals from "../features/superadmin/pages/Hospitals";
import SuperAdminProfile from "../features/superadmin/pages/SuperAdminProfile";
import SuperAdminSettings from "../features/superadmin/pages/SuperAdminSettings";
import SuperAdminAuditLogs from "../features/superadmin/pages/SuperAdminAuditLogs";
import SuperAdminSpecialities from "../features/superadmin/pages/SuperAdminSpecialities";
import SuperAdminUsers from "../features/superadmin/pages/SuperAdminUsers";
import SuperAdminTickets from "../features/superadmin/pages/SuperAdminTickets";
import AdminDashboard from "../features/admin/pages/AdminDashboard";
import AdminDepartments from "../features/admin/pages/AdminDepartments";
import AdminStaff from "../features/admin/pages/AdminStaff";
import AdminProfile from "../features/admin/pages/AdminProfile";
import AdminSettings from "../features/admin/pages/AdminSettings";
import AdminAppointments from "../features/admin/pages/AdminAppointments";
import AdminPatients from "../features/admin/pages/AdminPatients";
import AdminPharmacy from "../features/admin/pages/AdminPharmacy";
import AdminBilling from "../features/admin/pages/AdminBilling";
import AdminLab from "../features/admin/pages/AdminLab";

// Doctor Imports
import DoctorLayout from "./layouts/DoctorLayout";
import DoctorDashboard from "../features/doctor/pages/DoctorDashboard";
import DoctorAppointments from "../features/doctor/pages/DoctorAppointments";
import DoctorPatients from "../features/doctor/pages/DoctorPatients";
import DoctorEncounter from "../features/doctor/pages/DoctorEncounter";
import DoctorProfile from "../features/doctor/pages/DoctorProfile";

// Patient Imports
import PatientLayout from "./layouts/PatientLayout";
import PatientDashboard from "../features/patient/pages/PatientDashboard";
import PatientAppointments from "../features/patient/pages/PatientAppointments";
import PatientPrescriptions from "../features/patient/pages/PatientPrescriptions";
import PatientProfile from "../features/patient/pages/PatientProfile";
import PatientRecords from "../features/patient/pages/PatientRecords";
import PatientBills from "../features/billing/components/PatientBills";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/verify-otp", element: <VerifyOtp /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/reset-password", element: <ResetPassword /> }
    ]
  },

  // --- Super Admin Routes ---
  {
    element: <ProtectedRoute allowedRoles={["super_admin"]} />,
    children: [
      {
        element: <SuperAdminLayout />,
        children: [
          { path: "/super-admin/dashboard", element: <SuperAdminDashboard /> },
          { path: "/super-admin/hospitals", element: <Hospitals /> },
          { path: "/super-admin/specialities", element: <SuperAdminSpecialities /> },
          { path: "/super-admin/users", element: <SuperAdminUsers /> },
          { path: "/super-admin/tickets", element: <SuperAdminTickets /> },
          { path: "/super-admin/audit-logs", element: <SuperAdminAuditLogs /> },
          { path: "/super-admin/profile", element: <SuperAdminProfile /> },
          { path: "/super-admin/settings", element: <SuperAdminSettings /> },
        ]
      }
    ]
  },

  // --- Hospital Admin Routes ---
  {
    element: <ProtectedRoute allowedRoles={["admin"]} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "/admin/dashboard", element: <AdminDashboard /> },
          { path: "/admin/departments", element: <AdminDepartments /> },
          { path: "/admin/staff", element: <AdminStaff /> },
          { path: "/admin/profile", element: <AdminProfile /> },
          { path: "/admin/settings", element: <AdminSettings /> },
          { path: "/admin/appointments", element: <AdminAppointments /> },
          { path: "/admin/patients", element: <AdminPatients /> },
          { path: "/admin/pharmacy", element: <AdminPharmacy /> },
          { path: "/admin/billing", element: <AdminBilling /> },
          { path: "/admin/lab", element: <AdminLab /> },
        ]
      }
    ]
  },

  // --- Doctor Routes ---
  {
    element: <ProtectedRoute allowedRoles={["doctor", "super_admin"]} />,
    children: [
      {
        element: <DoctorLayout />,
        children: [
          { path: "/doctor/dashboard", element: <DoctorDashboard /> },
          { path: "/doctor/appointments", element: <DoctorAppointments /> },
          { path: "/doctor/appointments/:id", element: <DoctorEncounter /> },
          { path: "/doctor/patients", element: <DoctorPatients /> },
          { path: "/doctor/profile", element: <DoctorProfile /> },
        ]
      }
    ]
  },

  // --- Patient Routes ---
  {
    element: <ProtectedRoute allowedRoles={["patient"]} />,
    children: [
      {
        element: <PatientLayout />,
        children: [
          { path: "/patient/dashboard", element: <PatientDashboard /> },
          { path: "/patient/appointments", element: <PatientAppointments /> },
          { path: "/patient/prescriptions", element: <PatientPrescriptions /> },
          { path: "/patient/records", element: <PatientRecords /> },
          { path: "/patient/bills", element: <PatientBills /> },
          { path: "/patient/profile", element: <PatientProfile /> },
          // Alias /patient to /patient/dashboard
          { path: "/patient", element: <Navigate to="/patient/dashboard" replace /> }
        ]
      }
    ]
  },

  // --- Staff Routes (nurse, pharmacist, etc.) ---
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: <Dashboard /> }
        ]
      }
    ]
  },

  // Catch-all unauthorized
  {
    path: "/unauthorized",
    element: (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-2">403</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-4">You don't have permission to access this page.</p>
          <a href="/login" className="text-hospital-blue hover:underline text-sm">Go to Login</a>
        </div>
      </div>
    )
  }
]);
