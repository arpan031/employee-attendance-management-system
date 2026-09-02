import { useEffect, useState } from "react";
import {
  CalendarDays,
  Plus
} from "lucide-react";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const Leave = () => {
  const { employee, refreshUser } = useAuth();

  const [leaves, setLeaves] = useState([]);
  const [showForm, setShowForm] =
    useState(false);

  const [form, setForm] = useState({
    leaveType: "Casual Leave",
    startDate: "",
    endDate: "",
    reason: ""
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
    useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadLeaves = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/leaves/my"
      );

      setLeaves(response.data.leaves || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load leave requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (
      !form.startDate ||
      !form.endDate ||
      !form.reason.trim()
    ) {
      setError(
        "Please complete all leave fields."
      );
      return;
    }

    if (form.endDate < form.startDate) {
      setError(
        "End date cannot be before start date."
      );
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/leaves", form);

      setMessage(
        "Leave request submitted successfully."
      );

      setForm({
        leaveType: "Casual Leave",
        startDate: "",
        endDate: "",
        reason: ""
      });

      setShowForm(false);

      await loadLeaves();
      await refreshUser();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to submit leave request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC"
      }
    );
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" />
        <p>Loading leave requests...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Leave Management</h2>
          <p>
            Apply for leave and track your requests.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={() =>
            setShowForm((current) => !current)
          }
        >
          <Plus size={18} />
          Apply Leave
        </button>
      </div>

      <div className="leave-balance-card">
        <div className="large-icon">
          <CalendarDays size={28} />
        </div>

        <div>
          <span>Available Leave Balance</span>
          <strong>
            {employee?.leaveBalance ?? 0} days
          </strong>
        </div>
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

      {showForm && (
        <section className="card">
          <div className="card-header">
            <div>
              <h3>Apply for Leave</h3>
              <p>
                Submit a new leave request.
              </p>
            </div>
          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="leaveType">
                  Leave Type
                </label>

                <select
                  id="leaveType"
                  name="leaveType"
                  value={form.leaveType}
                  onChange={handleChange}
                >
                  <option>
                    Casual Leave
                  </option>
                  <option>
                    Sick Leave
                  </option>
                  <option>
                    Annual Leave
                  </option>
                  <option>
                    Emergency Leave
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="startDate">
                  Start Date
                </label>

                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate">
                  End Date
                </label>

                <input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group form-group-full">
                <label htmlFor="reason">
                  Reason
                </label>

                <textarea
                  id="reason"
                  name="reason"
                  rows="4"
                  maxLength="500"
                  placeholder="Enter reason for leave..."
                  value={form.reason}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setShowForm(false)
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={submitting}
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Request"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="card">
        <div className="card-header">
          <div>
            <h3>My Leave Requests</h3>
            <p>
              View the status of your applications.
            </p>
          </div>
        </div>

        {leaves.length === 0 ? (
          <div className="empty-state">
            You haven't submitted any leave
            requests yet.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>

              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave._id}>
                    <td>{leave.leaveType}</td>

                    <td>
                      {formatDate(
                        leave.startDate
                      )}{" "}
                      -{" "}
                      {formatDate(
                        leave.endDate
                      )}
                    </td>

                    <td>{leave.totalDays}</td>

                    <td>
                      <span className="reason-text">
                        {leave.reason}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`status-badge status-${leave.status.toLowerCase()}`}
                      >
                        {leave.status}
                      </span>
                    </td>

                    <td>
                      {leave.status ===
                      "Rejected"
                        ? leave.rejectionReason ||
                          "-"
                        : leave.status ===
                          "Approved"
                        ? "Approved"
                        : "Awaiting HR review"}
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

export default Leave;