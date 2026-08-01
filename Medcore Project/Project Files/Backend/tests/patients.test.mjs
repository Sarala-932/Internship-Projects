import request from "supertest";
import app from "../src/app.mjs";
import User from "../src/models/user.model.mjs";
import Hospital from "../src/models/hospital.model.mjs";
import bcrypt from "bcrypt";

let adminToken;

describe("Patients API", () => {
  beforeAll(async () => {
    const hospital = await Hospital.create({
      name: "Test Hospital",
      location: "Test Location",
      contactNumber: "1234567890",
      email: "hospital@example.com"
    });

    const passwordHash = await bcrypt.hash("password", 12);

    const admin = await User.create({
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      phone: "1234567890",
      passwordHash,
      role: "admin",
      hospitalId: hospital._id,
      isEmailVerified: true
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@example.com",
        password: "password"
      });
    
    adminToken = res.body.accessToken;
  });

  it("should get an empty list of patients with pagination meta", async () => {
    const res = await request(app)
      .get("/api/patients?page=1&limit=10")
      .set("Cookie", [`accessToken=${adminToken}`]) // Send via cookie if using cookie auth
      .set("Authorization", `Bearer ${adminToken}`); // Send via header just in case

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("patients");
    expect(res.body.patients).toBeInstanceOf(Array);
    expect(res.body).toHaveProperty("meta");
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.limit).toBe(10);
  });
});
