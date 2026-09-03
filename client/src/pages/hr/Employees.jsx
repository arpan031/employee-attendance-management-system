import { useEffect, useState } from "react";
import {
  Search,
  Trash2,
  UserCheck,
  UserPlus,
  UserX,
  X
} from "lucide-react";

import api from "../../services/api";
import Pagination from "../../components/Pagination";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  employeeId: "",
  department: "",
  designation: "",
  role: "employee",
  leaveBalance: 18
};

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

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] =
    useState(false);

  const [deleteTarget, setDeleteTarget] =
    useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] =
    useState("");

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

  const openAddModal = () => {
    setForm(emptyForm);
    setFormError("");
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setFormError("");
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddEmployee = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setFormError("");

      await api.post("/hr/employees", {
        ...form,
        leaveBalance: Number(
          form.leaveBalance
        )
      });

      setShowAddModal(false);
      setPage(1);
      await loadEmployees();
    } catch (err) {
      setFormError(
        err.response?.data?.errors?.[0]
          ?.message ||
          err.response?.data?.message ||
          "Unable to add employee."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteConfirm = (employee) => {
    setDeleteTarget(employee);
    setDeleteError("");
  };

  const closeDeleteConfirm = () => {
    setDeleteTarget(null);
    setDeleteError("");
  };

  const confirmDeleteEmployee = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setDeleting(true);
      setDeleteError("");

      await api.delete(
        `/hr/employees/${deleteTarget._id}`
      );

      setDeleteTarget(null);

      const isLastRowOnPage =
        employees.length === 1 &&
        page > 1;

      if (isLastRowOnPage) {
        setPage((prev) => prev - 1);
      } else {
        await loadEmployees();
      }
    } catch (err) {
      setDeleteError(
        err.response?.data?.message ||
          "Unable to delete employee."
      );
    } finally {
      setDeleting(false);
    }
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

        <button
          type="button"
          className="primary-button"
          onClick={openAddModal}
        >
          <UserPlus size={16} />
          Add Employee
        </button>
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
                        <div className="action-group">
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

                          <button
                            type="button"
                            className="table-action danger"
                            onClick={() =>
                              openDeleteConfirm(
                                employee
                              )
                            }
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
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

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h3>Add Employee</h3>
                <p>
                  Create a new employee account
                  directly from HR.
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeAddModal}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {formError && (
              <div className="alert alert-error">
                {formError}
              </div>
            )}

            <form
              className="auth-form"
              onSubmit={handleAddEmployee}
            >
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">
                    Full name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="employeeId">
                    Employee ID
                  </label>
                  <input
                    id="employeeId"
                    name="employeeId"
                    type="text"
                    required
                    value={form.employeeId}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">
                    Temporary password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    value={form.password}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="department">
                    Department
                  </label>
                  <input
                    id="department"
                    name="department"
                    type="text"
                    required
                    value={form.department}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="designation">
                    Designation
                  </label>
                  <input
                    id="designation"
                    name="designation"
                    type="text"
                    required
                    value={form.designation}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={form.role}
                    onChange={handleFormChange}
                  >
                    <option value="employee">
                      Employee
                    </option>
                    <option value="hr">HR</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="leaveBalance">
                    Leave balance (days)
                  </label>
                  <input
                    id="leaveBalance"
                    name="leaveBalance"
                    type="number"
                    min={0}
                    max={365}
                    value={form.leaveBalance}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeAddModal}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={submitting}
                >
                  {submitting
                    ? "Adding..."
                    : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h3>Delete Employee</h3>
                <p>
                  This action cannot be undone.
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeDeleteConfirm}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {deleteError && (
              <div className="alert alert-error">
                {deleteError}
              </div>
            )}

            <p style={{ margin: "0 0 20px" }}>
              Are you sure you want to delete{" "}
              <strong>
                {deleteTarget.name}
              </strong>{" "}
              ({deleteTarget.employeeId})? Their
              attendance and leave records will
              also be permanently removed.
            </p>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={closeDeleteConfirm}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="danger-button"
                onClick={confirmDeleteEmployee}
                disabled={deleting}
              >
                {deleting
                  ? "Deleting..."
                  : "Delete Employee"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;