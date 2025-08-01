import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ApprovedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/dashboard" />;
  if (!user.isApproved) return <Navigate to="/create-or-join" />;

  return <Outlet />;
};

export default ApprovedRoute;
