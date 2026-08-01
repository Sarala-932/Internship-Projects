import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ allowedRoles }) {
  const { user, token } = useSelector((state) => state.auth);

  if (!token || !user) {
    const lastRole = localStorage.getItem("lastRole");
    // If there was a last role and it wasn't patient, go to staff login. Otherwise patient login.
    const redirectUrl = (lastRole && lastRole !== "patient") ? "/login?type=staff" : "/login?type=patient";
    return <Navigate to={redirectUrl} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Logged in but doesn't have required role
    return <Navigate to="/unauthorized" replace />;
  }

  // Authorized, render child routes
  return <Outlet />;
}
