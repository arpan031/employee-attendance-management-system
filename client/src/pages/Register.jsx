import { useState } from "react";
import {
  CalendarCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User
} from "lucide-react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    employeeId: "",
    department: "",
    designation: ""
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const requiredFields = Object.values(form);

    if (requiredFields.some((value) => !value.trim())) {
      setError(
        "Please complete all required fields."
      );
      return;
    }

    if (form.password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    try {
      setLoading(true);

      await register(form);

      navigate("/dashboard", {
        replace: true
      });
    } catch (err) {
      const validationErrors =
        err.response?.data?.errors;

      if (
        Array.isArray(validationErrors) &&
        validationErrors.length
      ) {
        setError(
          validationErrors
            .map((item) => item.message)
            .join(" ")
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Registration failed."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <CalendarCheck size={30} />
          </div>

          <h1>Create Account</h1>

          <p>
            Register as an employee
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">
                Full Name
              </label>

              <div className="input-with-icon">
                <User size={18} />

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email Address
              </label>

              <div className="input-with-icon">
                <Mail size={18} />

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="employeeId">
                Employee ID
              </label>

              <input
                id="employeeId"
                name="employeeId"
                type="text"
                placeholder="EMP001"
                value={form.employeeId}
                onChange={handleChange}
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
                placeholder="Engineering"
                value={form.department}
                onChange={handleChange}
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
                placeholder="Software Developer"
                value={form.designation}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <div className="input-with-icon">
                <Lock size={18} />

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="primary-button full-width"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;