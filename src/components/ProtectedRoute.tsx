import { Navigate } from "react-router-dom";
import { auth } from "@/lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  if (!auth.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !auth.isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
