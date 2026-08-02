import ProtectedRoute from "../../shared/components/ProtectedRoute";
import SuperAdminLayout from "../layouts/SuperAdminLayout";
import SuperAdminDashboard from "../../features/superadmin/pages/SuperAdminDashboard";
import Hospitals from "../../features/superadmin/pages/Hospitals";
import SuperAdminProfile from "../../features/superadmin/pages/SuperAdminProfile";
import SuperAdminSettings from "../../features/superadmin/pages/SuperAdminSettings";
import SuperAdminAuditLogs from "../../features/superadmin/pages/SuperAdminAuditLogs";
import SuperAdminSpecialities from "../../features/superadmin/pages/SuperAdminSpecialities";
import SuperAdminUsers from "../../features/superadmin/pages/SuperAdminUsers";
import SuperAdminTickets from "../../features/superadmin/pages/SuperAdminTickets";

export const superAdminRoutes = [
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
  }
];
