import { useEffect, useState } from "react";
import {
  CalendarCheck,
  Clock3,
  FileText,
  Timer
} from "lucide-react";

import api from "../../services/api";
import StatCard from "../../components/StatCard";
import { useAuth } from "../../context/AuthContext";

const formatMinutes = (minutes = 0) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hours}h ${mins}m`;
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium"
  }).format(new Date(date));
};

const EmployeeDashboard = () => {
  const { employee, refreshUser } = useAuth();

  const [attendance, setAttendance] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [attendanceResponse, leaveResponse] =
        await Promise.all([
          api.get("/attendance/today"),
          api.get("/leaves/my")
        ]);

      setAttendance(
        attendanceResponse.data.attendance
      );

      setLeaves(
        leaveResponse.data.leaves || []
      );

      await refreshUser();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const approvedLeaves = leaves.filter(
    (leave) => leave.status === "Approved"
  );

  const pendingLeaves = leaves.filter(
    (leave) => leave.status === "Pending"
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Good to see you, {employee?.name}</h2>
          <p>
            Here's an overview of your attendance
            and leave information.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="stats-grid">
        <StatCard
          title="Today's Status"
          value={attendance?.status || "Absent"}
          subtitle={
            attendance?.checkIn
              ? "Attendance recorded"
              : "No check-in yet"
          }
          icon={CalendarCheck}
          variant="blue"
        />

        <StatCard
          title="Working Time"
          value={formatMinutes(
            attendance?.workingMinutes
          )}
          subtitle={
            attendance?.checkOut
              ? "Completed today"
              : "Currently working"
          }
          icon={Clock3}
          variant="green"
        />

        <StatCard
          title="Overtime"
          value={formatMinutes(
            attendance?.overtimeMinutes
          )}
          subtitle="Today's overtime"
          icon={Timer}
          variant="purple"
        />

        <StatCard
          title="Leave Balance"
          value={`${employee?.leaveBalance ?? 0} days`}
          subtitle={`${pendingLeaves.length} pending request${
            pendingLeaves.length === 1 ? "" : "s"
          }`}
          icon={FileText}
          variant="orange"
        />
      </div>

      <div className="content-grid">
        <section className="card">
          <div className="card-header">
            <div>
              <h3>Today's Attendance</h3>
              <p>
                {formatDate(attendance?.createdAt)}
              </p>
            </div>

            <span
              className={`status-badge status-${(
                attendance?.status || "Absent"
              )
                .toLowerCase()
                .replace(" ", "-")}`}
            >
              {attendance?.status || "Absent"}
            </span>
          </div>

          <div className="attendance-summary">
            <div>
              <span>Check In</span>
              <strong>
                {attendance?.checkIn
                  ? new Date(
                      attendance.checkIn
                    ).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })
                  : "--:--"}
              </strong>
            </div>

            <div>
              <span>Check Out</span>
              <strong>
                {attendance?.checkOut
                  ? new Date(
                      attendance.checkOut
                    ).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })
                  : "--:--"}
              </strong>
            </div>

            <div>
              <span>Working Hours</span>
              <strong>
                {formatMinutes(
                  attendance?.workingMinutes
                )}
              </strong>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <div>
              <h3>Recent Leave Requests</h3>
              <p>Your latest leave applications</p>
            </div>
          </div>

          {leaves.length === 0 ? (
            <div className="empty-state">
              No leave requests found.
            </div>
          ) : (
            <div className="mini-list">
              {leaves.slice(0, 5).map((leave) => (
                <div
                  className="mini-list-item"
                  key={leave._id}
                >
                  <div>
                    <strong>
                      {leave.leaveType}
                    </strong>

                    <span>
                      {formatDate(leave.startDate)}{" "}
                      -{" "}
                      {formatDate(leave.endDate)}
                    </span>
                  </div>

                  <span
                    className={`status-badge status-${leave.status.toLowerCase()}`}
                  >
                    {leave.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="card">
        <div className="card-header">
          <div>
            <h3>Leave Summary</h3>
            <p>
              Approved leave days:
              {" "}
              {approvedLeaves.reduce(
                (sum, leave) =>
                  sum + leave.totalDays,
                0
              )}
            </p>
          </div>
        </div>

        <div className="summary-strip">
          <div>
            <span>Available Balance</span>
            <strong>
              {employee?.leaveBalance ?? 0} days
            </strong>
          </div>

          <div>
            <span>Approved Requests</span>
            <strong>
              {approvedLeaves.length}
            </strong>
          </div>

          <div>
            <span>Pending Requests</span>
            <strong>
              {pendingLeaves.length}
            </strong>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EmployeeDashboard;