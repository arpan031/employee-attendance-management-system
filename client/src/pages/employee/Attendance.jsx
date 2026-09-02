import { useEffect, useState } from "react";
import {
  CalendarCheck,
  LogIn,
  LogOut,
  RefreshCw
} from "lucide-react";

import api from "../../services/api";

const formatMinutes = (minutes = 0) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hours}h ${mins}m`;
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
};

const Attendance = () => {
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const [todayResponse, historyResponse] =
        await Promise.all([
          api.get("/attendance/today"),
          api.get("/attendance/my")
        ]);

      setToday(
        todayResponse.data.attendance
      );

      setHistory(
        historyResponse.data.attendance || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load attendance."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setError("");
      setMessage("");

      const response = await api.post(
        "/attendance/check-in"
      );

      setToday(response.data.attendance);
      setMessage("Check-in recorded successfully.");

      await loadAttendance();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to check in."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setError("");
      setMessage("");

      const response = await api.post(
        "/attendance/check-out"
      );

      setToday(response.data.attendance);
      setMessage(
        "Check-out recorded successfully."
      );

      await loadAttendance();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to check out."
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" />
        <p>Loading attendance...</p>
      </div>
    );
  }

  const canCheckIn = !today?.checkIn;
  const canCheckOut =
    Boolean(today?.checkIn) &&
    !today?.checkOut;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Attendance</h2>
          <p>
            Track your daily attendance and
            working hours.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={loadAttendance}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      <section className="card attendance-action-card">
        <div className="attendance-action-info">
          <div className="large-icon">
            <CalendarCheck size={30} />
          </div>

          <div>
            <h3>Today's Attendance</h3>
            <p>
              {today?.date ||
                new Date().toLocaleDateString(
                  "en-CA"
                )}
            </p>
          </div>

          <span
            className={`status-badge status-${(
              today?.status || "Absent"
            )
              .toLowerCase()
              .replace(" ", "-")}`}
          >
            {today?.status || "Absent"}
          </span>
        </div>

        <div className="attendance-actions">
          <button
            type="button"
            className="primary-button"
            onClick={handleCheckIn}
            disabled={
              !canCheckIn || actionLoading
            }
          >
            <LogIn size={19} />
            {actionLoading && canCheckIn
              ? "Checking in..."
              : "Check In"}
          </button>

          <button
            type="button"
            className="danger-button"
            onClick={handleCheckOut}
            disabled={
              !canCheckOut || actionLoading
            }
          >
            <LogOut size={19} />
            {actionLoading && canCheckOut
              ? "Checking out..."
              : "Check Out"}
          </button>
        </div>

        <div className="attendance-summary">
          <div>
            <span>Check In</span>
            <strong>
              {today?.checkIn
                ? new Date(
                    today.checkIn
                  ).toLocaleTimeString(
                    "en-IN",
                    {
                      hour: "2-digit",
                      minute: "2-digit"
                    }
                  )
                : "--:--"}
            </strong>
          </div>

          <div>
            <span>Check Out</span>
            <strong>
              {today?.checkOut
                ? new Date(
                    today.checkOut
                  ).toLocaleTimeString(
                    "en-IN",
                    {
                      hour: "2-digit",
                      minute: "2-digit"
                    }
                  )
                : "--:--"}
            </strong>
          </div>

          <div>
            <span>Working Time</span>
            <strong>
              {formatMinutes(
                today?.workingMinutes
              )}
            </strong>
          </div>

          <div>
            <span>Overtime</span>
            <strong>
              {formatMinutes(
                today?.overtimeMinutes
              )}
            </strong>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <div>
            <h3>Attendance History</h3>
            <p>
              Your recent attendance records
            </p>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="empty-state">
            No attendance records found.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Working Hours</th>
                  <th>Overtime</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {history.map((record) => (
                  <tr key={record._id}>
                    <td>
                      {formatDate(record.date)}
                    </td>

                    <td>
                      {record.checkIn
                        ? new Date(
                            record.checkIn
                          ).toLocaleTimeString(
                            "en-IN",
                            {
                              hour: "2-digit",
                              minute: "2-digit"
                            }
                          )
                        : "-"}
                    </td>

                    <td>
                      {record.checkOut
                        ? new Date(
                            record.checkOut
                          ).toLocaleTimeString(
                            "en-IN",
                            {
                              hour: "2-digit",
                              minute: "2-digit"
                            }
                          )
                        : "-"}
                    </td>

                    <td>
                      {formatMinutes(
                        record.workingMinutes
                      )}
                    </td>

                    <td>
                      {formatMinutes(
                        record.overtimeMinutes
                      )}
                    </td>

                    <td>
                      <span
                        className={`status-badge status-${record.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Attendance;