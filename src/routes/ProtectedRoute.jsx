import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, booting } = useAuth();
  const loc = useLocation();

  if (booting) {
    return <div className="p-6 text-slate-600">Loading…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }

  return children;
}