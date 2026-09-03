import { useEffect, useState } from "react";
import { ArrowRight, CalendarCheck, Clock3, FileText, Timer } from "lucide-react";
import api from "../../services/api";
import StatCard from "../../components/StatCard";
import { useAuth } from "../../context/AuthContext";

const formatMinutes=(minutes=0)=>`${Math.floor(minutes/60)}h ${minutes%60}m`;
const formatDate=(date)=>date?new Intl.DateTimeFormat("en-IN",{dateStyle:"medium"}).format(new Date(date)):"-";

const EmployeeDashboard=()=>{
  const {employee,refreshUser}=useAuth();
  const [attendance,setAttendance]=useState(null);
  const [leaves,setLeaves]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");

  const loadDashboard=async()=>{
    try{
      setLoading(true);setError("");
      const [a,l]=await Promise.all([api.get("/attendance/today"),api.get("/leaves/my")]);
      setAttendance(a.data.attendance);setLeaves(l.data.leaves||[]);await refreshUser();
    }catch(err){setError(err.response?.data?.message||"Unable to load dashboard.")}
    finally{setLoading(false)}
  };
  useEffect(()=>{loadDashboard()},[]);

  if(loading)return <div className="page-loader"><div className="spinner"/><p>Loading dashboard...</p></div>;

  const approved=leaves.filter(l=>l.status==="Approved");
  const pending=leaves.filter(l=>l.status==="Pending");
  const status=attendance?.status||"Absent";

  return(
    <div className="page-container">
      <div className="dashboard-hero">
        <div>
          <h2>Good morning, {employee?.name?.split(" ")[0]||"there"} 👋</h2>
          <p>Here's your attendance and leave overview for today.</p>
        </div>
        <div className="hero-date">{new Intl.DateTimeFormat("en-IN",{dateStyle:"full"}).format(new Date())}</div>
      </div>

      {error&&<div className="alert alert-error">{error}</div>}

      <div className="stats-grid">
        <StatCard title="Today's Status" value={status} subtitle={attendance?.checkIn?"Attendance recorded":"No check-in yet"} icon={CalendarCheck} variant="blue"/>
        <StatCard title="Working Time" value={formatMinutes(attendance?.workingMinutes)} subtitle={attendance?.checkOut?"Completed today":"Currently working"} icon={Clock3} variant="green"/>
        <StatCard title="Overtime" value={formatMinutes(attendance?.overtimeMinutes)} subtitle="Today's overtime" icon={Timer} variant="purple"/>
        <StatCard title="Leave Balance" value={`${employee?.leaveBalance??0} days`} subtitle={`${pending.length} pending request${pending.length===1?"":"s"}`} icon={FileText} variant="orange"/>
      </div>

      <div className="dashboard-grid">
        <section className="card">
          <div className="card-header">
            <div><h3>Today's Attendance</h3><p>{formatDate(attendance?.createdAt)}</p></div>
            <span className={`status-badge status-${status.toLowerCase().replace(" ","-")}`}>{status}</span>
          </div>
          <div className="attendance-summary">
            <div><span>Check In</span><strong>{attendance?.checkIn?new Date(attendance.checkIn).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}):"--:--"}</strong></div>
            <div><span>Check Out</span><strong>{attendance?.checkOut?new Date(attendance.checkOut).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}):"--:--"}</strong></div>
            <div><span>Working Hours</span><strong>{formatMinutes(attendance?.workingMinutes)}</strong></div>
            <div><span>Overtime</span><strong>{formatMinutes(attendance?.overtimeMinutes)}</strong></div>
          </div>
          <a className="section-link" href="/attendance">Open attendance <ArrowRight size={13}/></a>
        </section>

        <section className="card">
          <div className="card-header">
            <div><h3>Recent Leave Requests</h3><p>Your latest applications</p></div>
          </div>
          {leaves.length?(
            <div className="mini-list">
              {leaves.slice(0,5).map(leave=>(
                <div className="mini-list-item" key={leave._id}>
                  <div><strong>{leave.leaveType}</strong><span>{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</span></div>
                  <span className={`status-badge status-${leave.status.toLowerCase()}`}>{leave.status}</span>
                </div>
              ))}
            </div>
          ):<div className="empty-state">No leave requests found.</div>}
          <a className="section-link" href="/leave">Manage leave <ArrowRight size={13}/></a>
        </section>
      </div>

      <section className="card">
        <div className="card-header">
          <div><h3>Leave Summary</h3><p>Approved leave days: {approved.reduce((sum,l)=>sum+l.totalDays,0)}</p></div>
        </div>
        <div className="summary-strip">
          <div><span>Available Balance</span><strong>{employee?.leaveBalance??0} days</strong></div>
          <div><span>Approved Requests</span><strong>{approved.length}</strong></div>
          <div><span>Pending Requests</span><strong>{pending.length}</strong></div>
          <div><span>Total Requests</span><strong>{leaves.length}</strong></div>
        </div>
      </section>
    </div>
  );
};
export default EmployeeDashboard;
