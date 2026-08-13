import ProtectedRoute from "../../shared/components/ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../../features/admin/pages/AdminDashboard";
import AdminDepartments from "../../features/admin/pages/AdminDepartments";
import AdminStaff from "../../features/admin/pages/AdminStaff";
import AdminProfile from "../../features/admin/pages/AdminProfile";
import AdminSettings from "../../features/admin/pages/AdminSettings";
import AdminAppointments from "../../features/admin/pages/AdminAppointments";
import AdminPatients from "../../features/admin/pages/AdminPatients";
import AdminPharmacy from "../../features/admin/pages/AdminPharmacy";
import AdminBilling from "../../features/admin/pages/AdminBilling";
import AdminLab from "../../features/admin/pages/AdminLab";
import BedManagement from "../../features/ipd/pages/BedManagement";

export const adminRoutes = [
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
          { path: "/admin/ipd", element: <BedManagement /> },
        ]
      }
    ]
  }
];
