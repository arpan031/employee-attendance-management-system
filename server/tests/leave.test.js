
const request = require("supertest");

const bcrypt = require("bcryptjs");

const app = require("../app");

const Employee =
  require("../models/Employee");

const Leave =
  require("../models/Leave");

const Attendance =
  require("../models/Attendance");

describe(
  "Leave API",
  () => {
    let employee;
    let hr;

    let employeeToken;
    let hrToken;

    beforeEach(
      async () => {
        const password =
          await bcrypt.hash(
            "Password123",
            12
          );

        employee =
          await Employee.create({
            name:
              "Leave Employee",

            email:
              "leave@example.com",

            password,

            employeeId:
              "EMP300",

            department:
              "Engineering",

            designation:
              "Developer",

            leaveBalance: 10
          });

        hr =
          await Employee.create({
            name:
              "HR User",

            email:
              "hrtest@example.com",

            password,

            employeeId:
              "HR300",

            department:
              "Human Resources",

            designation:
              "HR Manager",

            role: "hr",

            leaveBalance: 18
          });

        const employeeLogin =
          await request(app)
            .post(
              "/api/auth/login"
            )
            .send({
              email:
                "leave@example.com",
              password:
                "Password123"
            });

        employeeToken =
          employeeLogin.body.token;

        const hrLogin =
          await request(app)
            .post(
              "/api/auth/login"
            )
            .send({
              email:
                "hrtest@example.com",
              password:
                "Password123"
            });

        hrToken =
          hrLogin.body.token;
      }
    );

    test(
      "should create leave request",
      async () => {
        const response =
          await request(app)
            .post(
              "/api/leaves"
            )
            .set(
              "Authorization",
              `Bearer ${employeeToken}`
            )
            .send({
              leaveType:
                "Casual Leave",

              startDate:
                "2026-09-10",

              endDate:
                "2026-09-11",

              reason:
                "Personal work"
            });

        expect(
          response.status
        ).toBe(201);

        expect(
          response.body.success
        ).toBe(true);

        expect(
          response.body.leave.totalDays
        ).toBe(2);
      }
    );

    test(
      "HR should approve leave and deduct balance",
      async () => {
        const createResponse =
          await request(app)
            .post(
              "/api/leaves"
            )
            .set(
              "Authorization",
              `Bearer ${employeeToken}`
            )
            .send({
              leaveType:
                "Casual Leave",

              startDate:
                "2026-09-15",

              endDate:
                "2026-09-16",

              reason:
                "Personal work"
            });

        const leaveId =
          createResponse.body
            .leave._id;

        const approveResponse =
          await request(app)
            .patch(
              `/api/leaves/${leaveId}/approve`
            )
            .set(
              "Authorization",
              `Bearer ${hrToken}`
            );

        expect(
          approveResponse.status
        ).toBe(200);

        expect(
          approveResponse.body.success
        ).toBe(true);

        expect(
          approveResponse.body
            .remainingLeaveBalance
        ).toBe(8);

        const updatedEmployee =
          await Employee.findById(
            employee._id
          );

        expect(
          updatedEmployee.leaveBalance
        ).toBe(8);

        const leave =
          await Leave.findById(
            leaveId
          );

        expect(
          leave.status
        ).toBe("Approved");

        const attendance =
          await Attendance.find({
            employeeId:
              employee._id,

            status: "Leave"
          });

        expect(
          attendance.length
        ).toBe(2);
      }
    );

    test(
      "employee should not approve leave",
      async () => {
        const createResponse =
          await request(app)
            .post(
              "/api/leaves"
            )
            .set(
              "Authorization",
              `Bearer ${employeeToken}`
            )
            .send({
              leaveType:
                "Sick Leave",

              startDate:
                "2026-09-20",

              endDate:
                "2026-09-20",

              reason:
                "Medical appointment"
            });

        const leaveId =
          createResponse.body
            .leave._id;

        const response =
          await request(app)
            .patch(
              `/api/leaves/${leaveId}/approve`
            )
            .set(
              "Authorization",
              `Bearer ${employeeToken}`
            );

        expect(
          response.status
        ).toBe(403);
      }
    );
  }
);