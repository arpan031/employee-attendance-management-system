import { useEffect, useState } from "react";
import {
  Check,
  X
} from "lucide-react";

import api from "../../services/api";

const LeaveRequests = () => {
  const [leaves, setLeaves] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadLeaves = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/leaves/all"
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

  const handleAction = async (
    id,
    action
  ) => {
    let rejectionReason = "";

    if (action === "reject") {
      rejectionReason =
        window.prompt(
          "Enter rejection reason:"
        ) || "";

      if (!rejectionReason.trim()) {
        return;
      }
    }

    try {
      setActionLoading(id);
      setError("");
      setMessage("");

      await api.patch(
        `/leaves/${id}/${action}`,
        action === "reject"
          ? { rejectionReason }
          : {}
      );

      setMessage(
        action === "approve"
          ? "Leave request approved."
          : "Leave request rejected."
      );

      await loadLeaves();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Unable to ${action} leave request.`
      );
    } finally {
      setActionLoading(null);
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
          <h2>Leave Requests</h2>
          <p>
            Review and manage employee leave
            applications.
          </p>
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

      <section className="card">
        <div className="card-header">
          <div>
            <h3>All Leave Requests</h3>
            <p>
              Approve or reject pending
              applications.
            </p>
          </div>
        </div>

        {leaves.length === 0 ? (
          <div className="empty-state">
            No leave requests found.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave._id}>
                    <td>
                      <div className="employee-cell">
                        <div className="avatar">
                          {leave.employeeId?.name
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {leave.employeeId?.name}
                          </strong>

                          <span>
                            {
                              leave.employeeId
                                ?.employeeId
                            }
                          </span>
                        </div>
                      </div>
                    </td>

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
                      "Pending" ? (
                        <div className="action-group">
                          <button
                            type="button"
                            className="table-action success"
                            disabled={
                              actionLoading ===
                              leave._id
                            }
                            onClick={() =>
                              handleAction(
                                leave._id,
                                "approve"
                              )
                            }
                          >
                            <Check size={16} />
                            Approve
                          </button>

                          <button
                            type="button"
                            className="table-action danger"
                            disabled={
                              actionLoading ===
                              leave._id
                            }
                            onClick={() =>
                              handleAction(
                                leave._id,
                                "reject"
                              )
                            }
                          >
                            <X size={16} />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="muted">
                          {leave.status ===
                          "Approved"
                            ? "Completed"
                            : leave.rejectionReason ||
                              "Rejected"}
                        </span>
                      )}
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

export default LeaveRequests;