import { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck
} from "lucide-react";
import logo from "../assets/attendpro-logo-login.png";
import {
  Link,
  useLocation,
  useNavigate
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Login = () => {
  const {
    login,
    isAuthenticated,
    employee
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(
        employee?.role === "hr"
          ? "/hr"
          : "/dashboard",
        { replace: true }
      );
    }
  }, [
    isAuthenticated,
    employee,
    navigate
  ]);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.email || !form.password) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await login(form);

      const from =
        location.state?.from?.pathname;

      const destination =
        from ||
        (response.employee?.role === "hr"
          ? "/hr"
          : "/dashboard");

      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">

          <img
            src={logo}
            alt="AttendPro"
            className="login-logo"
          />

          <div className="login-welcome">
            <div className="welcome-icon">
              <ShieldCheck size={18} />
            </div>

            <span>Secure Employee Portal</span>
          </div>

          <h1>Welcome Back</h1>

          <p>
            Sign in to manage your attendance
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
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
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
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
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

          <button
            type="submit"
            className="primary-button full-width"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
