const bcrypt = require("bcryptjs");

const Employee = require("../models/Employee");
const generateToken = require("../utils/generateToken");

/* Public Employee Data */

const getPublicEmployee = (employee) => ({
  id: employee._id,
  name: employee.name,
  email: employee.email,
  employeeId: employee.employeeId,
  department: employee.department,
  designation: employee.designation,
  role: employee.role,
  joiningDate: employee.joiningDate,
  leaveBalance: employee.leaveBalance,
  isActive: employee.isActive
});

/* Register */

const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      employeeId,
      department,
      designation
    } = req.body;

    const normalizedEmail =
      email.toLowerCase().trim();

    const normalizedEmployeeId =
      employeeId.toUpperCase().trim();

    const existingEmployee =
      await Employee.findOne({
        $or: [
          { email: normalizedEmail },
          {
            employeeId:
              normalizedEmployeeId
          }
        ]
      });

    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message:
          existingEmployee.email ===
          normalizedEmail
            ? "Email is already registered"
            : "Employee ID is already registered"
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 12);

    const employee =
      await Employee.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        employeeId: normalizedEmployeeId,
        department: department.trim(),
        designation: designation.trim(),
        role: "employee"
      });

    const token = generateToken(
      employee._id.toString()
    );

    return res.status(201).json({
      success: true,
      message:
        "Employee registered successfully",
      token,
      employee:
        getPublicEmployee(employee)
    });
  } catch (error) {
    next(error);
  }
};

/* Login */

const login = async (req, res, next) => {
  try {
    const {
      email,
      password
    } = req.body;

    const employee =
      await Employee.findOne({
        email: email.toLowerCase().trim()
      }).select("+password");

    if (!employee) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password"
      });
    }

    if (!employee.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Your employee account is inactive"
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        employee.password
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password"
      });
    }

    const token = generateToken(
      employee._id.toString()
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      employee:
        getPublicEmployee(employee)
    });
  } catch (error) {
    next(error);
  }
};

/* Current User */

const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    employee:
      getPublicEmployee(req.employee)
  });
};

module.exports = {
  register,
  login,
  getMe
};