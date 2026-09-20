import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/authcontext.js";


const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  console.log(user)

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet/>;
};

export default ProtectedRoute;