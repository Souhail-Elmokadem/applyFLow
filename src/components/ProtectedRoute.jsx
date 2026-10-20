
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getCurrentUser } from "../services/auth";

export default function ProtectedRoute() {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;

    async function checkAuth() {
      const token = sessionStorage.getItem("applyflow_token");

      if (!token) {
        if (active) setStatus("unauthorized");
        return;
      }

      try {
        await getCurrentUser(token);
        if (active) setStatus("authorized");
      } catch {
        sessionStorage.removeItem("applyflow_token");
        if (active) setStatus("unauthorized");
      }
    }

    checkAuth();

    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement de votre espace ApplyFlow...</p>
      </div>
    );
  }

  if (status === "unauthorized") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
