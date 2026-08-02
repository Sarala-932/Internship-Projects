import ProtectedRoute from "../../shared/components/ProtectedRoute";
import AppLayout from "../layouts/AppLayout";
import Dashboard from "../../features/dashboard/pages/Dashboard";

export const employeeRoutes = [
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
  }
];
