import { Navigate } from "react-router";
import ProtectedRoute from "../../shared/components/ProtectedRoute";
import PatientLayout from "../layouts/PatientLayout";
import PatientDashboard from "../../features/patient/pages/PatientDashboard";
import PatientAppointments from "../../features/patient/pages/PatientAppointments";
import PatientPrescriptions from "../../features/patient/pages/PatientPrescriptions";
import PatientProfile from "../../features/patient/pages/PatientProfile";
import PatientRecords from "../../features/patient/pages/PatientRecords";
import PatientBills from "../../features/billing/components/PatientBills";

export const patientRoutes = [
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
  }
];
