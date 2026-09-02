import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import api from "../services/api";

const AuthContext =
  createContext(null);

const TOKEN_KEY =
  "attendance_token";

const EMPLOYEE_KEY =
  "attendance_employee";

export const AuthProvider = ({
  children
}) => {
  const [
    employee,
    setEmployee
  ] = useState(() => {
    try {
      const stored =
        localStorage.getItem(
          EMPLOYEE_KEY
        );

      return stored
        ? JSON.parse(stored)
        : null;
    } catch {
      return null;
    }
  });

  const [
    loading,
    setLoading
  ] = useState(true);

  /* Save authentication */

  const saveAuth = (
    token,
    employeeData
  ) => {
    localStorage.setItem(
      TOKEN_KEY,
      token
    );

    localStorage.setItem(
      EMPLOYEE_KEY,
      JSON.stringify(
        employeeData
      )
    );

    setEmployee(
      employeeData
    );
  };

  /* Clear authentication */

  const clearAuth = () => {
    localStorage.removeItem(
      TOKEN_KEY
    );

    localStorage.removeItem(
      EMPLOYEE_KEY
    );

    setEmployee(null);
  };

  /* Login */

  const login = async (
    credentials
  ) => {
    const response =
      await api.post(
        "/auth/login",
        credentials
      );

    const {
      token,
      employee:
        employeeData
    } = response.data;

    saveAuth(
      token,
      employeeData
    );

    return response.data;
  };

  /* Register */

  const register = async (
    employeeData
  ) => {
    const response =
      await api.post(
        "/auth/register",
        employeeData
      );

    const {
      token,
      employee:
        createdEmployee
    } = response.data;

    saveAuth(
      token,
      createdEmployee
    );

    return response.data;
  };

  /* Logout  */

  const logout = () => {
    clearAuth();
  };

  /* Refresh current user  */

  const refreshUser = async () => {
    try {
      const token =
        localStorage.getItem(
          TOKEN_KEY
        );

      if (!token) {
        setLoading(false);
        return null;
      }

      const response =
        await api.get(
          "/auth/me"
        );

      const employeeData =
        response.data.employee;

      localStorage.setItem(
        EMPLOYEE_KEY,
        JSON.stringify(
          employeeData
        )
      );

      setEmployee(
        employeeData
      );

      return employeeData;
    } catch {
      clearAuth();
      return null;
    } finally {
      setLoading(false);
    }
  };

  /* Initial authentication check  */

  useEffect(() => {
    refreshUser();
  }, []);

  /* Context value  */

  const value =
    useMemo(
      () => ({
        employee,
        loading,
        isAuthenticated:
          Boolean(employee),

        isHR:
          employee?.role === "hr",

        login,
        register,
        logout,
        refreshUser
      }),
      [
        employee,
        loading
      ]
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context =
    useContext(
      AuthContext
    );

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};