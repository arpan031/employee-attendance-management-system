import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="main-area">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;