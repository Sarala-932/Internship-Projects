import { createBrowserRouter } from "react-router";
import { commonRoutes } from "./commonRoutes";
import { superAdminRoutes } from "./superAdminRoutes";
import { adminRoutes } from "./adminRoutes";
import { doctorRoutes } from "./doctorRoutes";
import { patientRoutes } from "./patientRoutes";
import { employeeRoutes } from "./employeeRoutes";

export const router = createBrowserRouter([
  ...commonRoutes,
  ...superAdminRoutes,
  ...adminRoutes,
  ...doctorRoutes,
  ...patientRoutes,
  ...employeeRoutes
]);
