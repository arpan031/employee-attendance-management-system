import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import api from "../../services/api";
import Pagination from "../../components/Pagination";

const AttendanceManagement = () => {
  const [records, setRecords] =
    useState([]);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] =
    useState({
      pages: 1,
      total: 0
    });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/hr/attendance",
        {
          params: {
            page,
            limit: 10,
            search
          }
        }
      );

      setRecords(
        response.data.attendance || []
      );

      setPagination(
        response.data.pagination || {
          pages: 1,
          total: 0
        }
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
    const timer = setTimeout(
      loadAttendance,
      350
    );

    return () => clearTimeout(timer);
  }, [page, search]);

  const formatTime = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  };

  const formatMinutes = (minutes = 0) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return `${hours}h ${mins}m`;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Attendance Management</h2>
          <p>
            Monitor employee attendance records.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <section className="card">
        <div className="toolbar">
          <div className="search-box">
            <Search size={18} />

            <input
              type="search"
              placeholder="Search by employee..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>

          <span className="result-count">
            {pagination.total} records
          </span>
        </div>

        {loading ? (
          <div className="table-loader">
            <div className="spinner" />
          </div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            No attendance records found.
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Working</th>
                    <th>Overtime</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {records.map((record) => (
                    <tr key={record._id}>
                      <td>
                        <div className="employee-cell">
                          <div className="avatar">
                            {record.employeeId?.name
                              ?.charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {record.employeeId?.name}
                            </strong>

                            <span>
                              {
                                record.employeeId
                                  ?.employeeId
                              }
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>{record.date}</td>

                      <td>
                        {formatTime(
                          record.checkIn
                        )}
                      </td>

                      <td>
                        {formatTime(
                          record.checkOut
                        )}
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

            <Pagination
              page={page}
              pages={pagination.pages}
              onPageChange={setPage}
            />
          </>
        )}
      </section>
    </div>
  );
};

export default AttendanceManagement;