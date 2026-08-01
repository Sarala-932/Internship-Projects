import request from "supertest";
import app from "../src/app.mjs";
import User from "../src/models/user.model.mjs";
import Hospital from "../src/models/hospital.model.mjs";
import { jest } from '@jest/globals';

describe("Auth Flow", () => {
  jest.setTimeout(15000);

  it("should register a user, require email verification, and then login successfully", async () => {
    // 1. Create hospital
    const hospital = await Hospital.create({
      name: "Test Hospital",
      location: "Test Location",
      contactNumber: "1234567890",
      email: "hospital@example.com"
    });

    // 2. Register
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "1234567890",
        password: "Password123",
        role: "patient",
        hospitalId: hospital._id,
        dob: "1990-01-01",
        bloodGroup: "O+"
      });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body).toHaveProperty("message", "Account created. Check your email for the OTP.");
    expect(registerRes.body.email).toBe("john@example.com");

    const user = await User.findOne({ email: "john@example.com" });
    expect(user).toBeTruthy();
    expect(user.isEmailVerified).toBe(false);

    // 3. Login fails before verification
    const loginFailRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "john@example.com",
        password: "Password123"
      });

    expect(loginFailRes.status).toBe(403);
    expect(loginFailRes.body.message).toMatch(/Verify OTP first/i);

    // 4. Manual verification
    await User.updateOne({ email: "john@example.com" }, { isEmailVerified: true });

    // 5. Login succeeds
    const loginSuccessRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "john@example.com",
        password: "Password123"
      });

    expect(loginSuccessRes.status).toBe(200);
    expect(loginSuccessRes.body).toHaveProperty("accessToken");
    expect(loginSuccessRes.body.user.email).toBe("john@example.com");
  });
});
