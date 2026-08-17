import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ allowedRoles }) {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    const lastRole = localStorage.getItem("lastRole");

    const redirectUrl = (lastRole && lastRole !== "patient") ? "/login?type=staff" : "/login?type=patient";
    
    return <Navigate to={redirectUrl} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
