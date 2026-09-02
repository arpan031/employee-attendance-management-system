
const request = require("supertest");

const bcrypt = require("bcryptjs");

const app = require("../app");

const Employee =
  require("../models/Employee");

const Attendance =
  require("../models/Attendance");

describe(
  "Attendance API",
  () => {
    let employee;
    let token;

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
              "Attendance Employee",

            email:
              "attendance@example.com",

            password,

            employeeId:
              "EMP200",

            department:
              "Engineering",

            designation:
              "Developer"
          });

        const loginResponse =
          await request(app)
            .post(
              "/api/auth/login"
            )
            .send({
              email:
                "attendance@example.com",
              password:
                "Password123"
            });

        token =
          loginResponse.body.token;
      }
    );

    test(
      "should check in employee",
      async () => {
        const response =
          await request(app)
            .post(
              "/api/attendance/check-in"
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            );

        expect(
          response.status
        ).toBe(200);

        expect(
          response.body.success
        ).toBe(true);

        expect(
          response.body.attendance.checkIn
        ).toBeDefined();

        const records =
          await Attendance.find({
            employeeId:
              employee._id
          });

        expect(
          records.length
        ).toBe(1);
      }
    );

    test(
      "should reject duplicate check-in",
      async () => {
        await request(app)
          .post(
            "/api/attendance/check-in"
          )
          .set(
            "Authorization",
            `Bearer ${token}`
          );

        const response =
          await request(app)
            .post(
              "/api/attendance/check-in"
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            );

        expect(
          response.status
        ).toBe(409);
      }
    );

    test(
      "should check out after check-in",
      async () => {
        const checkIn =
          await request(app)
            .post(
              "/api/attendance/check-in"
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            );

        expect(
          checkIn.status
        ).toBe(200);

        const response =
          await request(app)
            .post(
              "/api/attendance/check-out"
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            );

        expect(
          response.status
        ).toBe(200);

        expect(
          response.body.attendance.checkOut
        ).toBeDefined();

        expect(
          response.body.attendance.workingMinutes
        ).toBeGreaterThanOrEqual(0);
      }
    );
  }
);