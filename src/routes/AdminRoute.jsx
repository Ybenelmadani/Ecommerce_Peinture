import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {

  const { user, booting } = useAuth();

  if (booting) return null;

  if (!user) return <Navigate to="/login" />;

  if (user.role !== "admin") return <Navigate to="/" />;

  return children;
}