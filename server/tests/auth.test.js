
const request = require("supertest");

const app = require("../app");

const Employee = require("../models/Employee");

const bcrypt = require("bcryptjs");

describe(
  "Authentication API",
  () => {
    test(
      "should register a new employee",
      async () => {
        const response =
          await request(app)
            .post(
              "/api/auth/register"
            )
            .send({
              name: "Test Employee",
              email:
                "test@example.com",
              password:
                "Password123",
              employeeId:
                "EMP100",
              department:
                "Engineering",
              designation:
                "Developer"
            });

        expect(
          response.status
        ).toBe(201);

        expect(
          response.body.success
        ).toBe(true);

        expect(
          response.body.token
        ).toBeDefined();

        expect(
          response.body.employee.email
        ).toBe(
          "test@example.com"
        );

        expect(
          response.body.employee.role
        ).toBe(
          "employee"
        );
      }
    );

    test(
      "should login an existing employee",
      async () => {
        const password =
          await bcrypt.hash(
            "Password123",
            12
          );

        await Employee.create({
          name: "Login Employee",
          email:
            "login@example.com",
          password,
          employeeId:
            "EMP101",
          department:
            "Engineering",
          designation:
            "Developer"
        });

        const response =
          await request(app)
            .post(
              "/api/auth/login"
            )
            .send({
              email:
                "login@example.com",
              password:
                "Password123"
            });

        expect(
          response.status
        ).toBe(200);

        expect(
          response.body.success
        ).toBe(true);

        expect(
          response.body.token
        ).toBeDefined();
      }
    );

    test(
      "should reject invalid password",
      async () => {
        const password =
          await bcrypt.hash(
            "CorrectPassword123",
            12
          );

        await Employee.create({
          name: "Secure Employee",
          email:
            "secure@example.com",
          password,
          employeeId:
            "EMP102",
          department:
            "Engineering",
          designation:
            "Developer"
        });

        const response =
          await request(app)
            .post(
              "/api/auth/login"
            )
            .send({
              email:
                "secure@example.com",
              password:
                "WrongPassword"
            });

        expect(
          response.status
        ).toBe(401);

        expect(
          response.body.success
        ).toBe(false);
      }
    );
  }
);