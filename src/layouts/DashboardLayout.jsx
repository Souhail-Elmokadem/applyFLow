import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout() {
  return (
    <div className="dashboardLayout">
      <Sidebar />

      <main className="dashboardMain">
        <Outlet />
      </main>
    </div>
  );
}