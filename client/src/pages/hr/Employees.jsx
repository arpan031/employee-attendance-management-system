import { useEffect, useState } from "react";
import {
  Search,
  UserCheck,
  UserX
} from "lucide-react";

import api from "../../services/api";
import Pagination from "../../components/Pagination";

const Employees = () => {
  const [employees, setEmployees] =
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

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/hr/employees",
        {
          params: {
            page,
            limit: 10,
            search
          }
        }
      );

      setEmployees(
        response.data.employees || []
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
          "Unable to load employees."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(
      loadEmployees,
      350
    );

    return () => clearTimeout(timer);
  }, [page, search]);

  const toggleStatus = async (employee) => {
    try {
      setError("");

      await api.patch(
        `/hr/employees/${employee._id}/status`,
        {
          isActive: !employee.isActive
        }
      );

      await loadEmployees();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update employee status."
      );
    }
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Employees</h2>
          <p>
            Manage employee accounts and status.
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
              placeholder="Search employees..."
              value={search}
              onChange={handleSearch}
            />
          </div>

          <span className="result-count">
            {pagination.total} employees
          </span>
        </div>

        {loading ? (
          <div className="table-loader">
            <div className="spinner" />
          </div>
        ) : employees.length === 0 ? (
          <div className="empty-state">
            No employees found.
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Employee ID</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Leave Balance</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee._id}>
                      <td>
                        <div className="employee-cell">
                          <div className="avatar">
                            {employee.name
                              ?.charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {employee.name}
                            </strong>
                            <span>
                              {employee.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        {employee.employeeId}
                      </td>

                      <td>
                        {employee.department}
                      </td>

                      <td>
                        {employee.designation}
                      </td>

                      <td>
                        {employee.leaveBalance} days
                      </td>

                      <td>
                        <span
                          className={`status-badge ${
                            employee.isActive
                              ? "status-approved"
                              : "status-rejected"
                          }`}
                        >
                          {employee.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className={
                            employee.isActive
                              ? "table-action danger"
                              : "table-action success"
                          }
                          onClick={() =>
                            toggleStatus(
                              employee
                            )
                          }
                        >
                          {employee.isActive ? (
                            <>
                              <UserX size={16} />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck
                                size={16}
                              />
                              Activate
                            </>
                          )}
                        </button>
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

export default Employees;