import logo from "../assets/attendpro-logo.png";
import { BarChart3, CalendarCheck, ClipboardList, Clock3, LayoutDashboard, Users, X, Settings2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ open, onClose }) => {
  const { isHR, employee } = useAuth();
  const links = isHR
    ? [
      { to: "/hr", label: "Dashboard", icon: LayoutDashboard },
      { to: "/hr/employees", label: "Employees", icon: Users },
      { to: "/hr/attendance", label: "Attendance", icon: Clock3 },
      { to: "/hr/leaves", label: "Leave Requests", icon: ClipboardList },
      { to: "/hr/analytics", label: "Analytics", icon: BarChart3 },
    ]
    : [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/attendance", label: "Attendance", icon: CalendarCheck },
      { to: "/leave", label: "Leave Management", icon: ClipboardList },
    ];

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <div className="brand">
            <img
              src={logo}
              alt="AttendPro"
              className="brand-logo"
            />
          </div>
          <button
            type="button"
            className="icon-button sidebar-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-section-title">{isHR ? "Workspace" : "My Workspace"}</p>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/dashboard" || to === "/hr"}
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
              onClick={onClose}
            >
              <Icon size={18} /><span>{label}</span>
            </NavLink>
          ))}
          {!isHR && (
            <div className="sidebar-link" style={{ opacity: .5, cursor: "default" }}>
              <Settings2 size={18} /><span>Settings</span>
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="avatar" style={{ background: "rgba(255,255,255,.16)", color: "#fff" }}>
              {(employee?.name || "U").charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <strong style={{ display: "block", fontSize: 12, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {employee?.name || "User"}
              </strong>
              <span style={{ display: "block", fontSize: 10 }}>
                {isHR ? "HR Administrator" : employee?.employeeId || "Employee"}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
