import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth.route.mjs";
import hospitalRouter from "./routes/hospital.route.mjs";
import departmentRouter from "./routes/department.route.mjs";
import userRouter from "./routes/user.route.mjs";
import doctorRouter from "./routes/doctor.route.mjs";
import patientRouter from "./routes/patient.route.mjs";
import appointmentRouter from "./routes/appointment.route.mjs";
import encounterRouter from "./routes/encounter.route.mjs";
import prescriptionRouter from "./routes/prescription.route.mjs";
import labRouter from "./routes/lab.route.mjs";
import pharmacyRouter from "./routes/pharmacy.route.mjs";
import billingRouter from "./routes/billing.route.mjs";
import analyticsRoutes from "./routes/analytics.route.mjs";
import masterRouter from "./routes/master.route.mjs";
import ticketRouter from "./routes/ticket.route.mjs";
import notificationRouter from "./routes/notification.route.mjs";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.mjs";

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cache-Control"]
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
    res.status(200).json({message: "Server is running..."});
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRouter);
app.use("/api/hospitals", hospitalRouter);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/master", masterRouter);
app.use("/api/tickets", ticketRouter);
app.use("/api/departments", departmentRouter);
app.use("/api/users", userRouter);
app.use("/api/doctors", doctorRouter);
app.use("/api/patients", patientRouter);
app.use("/api/appointments", appointmentRouter);
app.use("/api/encounters", encounterRouter);
app.use("/api/prescriptions", prescriptionRouter);
app.use("/api/lab-orders", labRouter);
app.use("/api/pharmacy", pharmacyRouter);
app.use("/api/billing", billingRouter);
app.use("/api/notifications", notificationRouter);

export default app;

