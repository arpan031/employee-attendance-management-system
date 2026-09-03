import { Bell, ChevronDown, LogOut, Menu, Search, UserCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ onMenuClick }) => {
  const { employee, logout, isHR } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button type="button" className="icon-button mobile-menu-button" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={22} />
        </button>
        <div>
          <h1 className="navbar-title">{isHR ? "HR Dashboard" : "My Dashboard"}</h1>
          <p className="navbar-subtitle">{isHR ? "Overview of your organization attendance" : "Your attendance & leave overview"}</p>
        </div>
      </div>

      <div className="navbar-right">
        {isHR && (
          <div className="search-box" style={{ width:220 }}>
            <Search size={16} />
            <input type="search" placeholder="Search employees..." aria-label="Search employees" />
          </div>
        )}
        <button type="button" className="icon-button" style={{ position:"relative", borderRadius:10 }} aria-label="Notifications">
          <Bell size={19} />
          {isHR && <span style={{ position:"absolute", right:2, top:1, width:7, height:7, borderRadius:"50%", background:"#ef5b68", border:"2px solid white" }} />}
        </button>
        <div className="navbar-user">
          <UserCircle size={27} />
          <div className="navbar-user-info">
            <strong>{employee?.name || "User"}</strong>
            <span>{isHR ? "HR Admin" : employee?.employeeId}</span>
          </div>
          <ChevronDown size={15} style={{ color:"#9aa1b1" }} />
        </div>
        <button type="button" className="logout-button" onClick={logout} aria-label="Logout">
          <LogOut size={17} /><span>Logout</span>
        </button>
      </div>
    </header>
  );
};
export default Navbar;
