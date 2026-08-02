import ProtectedRoute from "../../shared/components/ProtectedRoute";
import DoctorLayout from "../layouts/DoctorLayout";
import DoctorDashboard from "../../features/doctor/pages/DoctorDashboard";
import DoctorAppointments from "../../features/doctor/pages/DoctorAppointments";
import DoctorPatients from "../../features/doctor/pages/DoctorPatients";
import DoctorEncounter from "../../features/doctor/pages/DoctorEncounter";
import DoctorProfile from "../../features/doctor/pages/DoctorProfile";

export const doctorRoutes = [
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
  }
];
