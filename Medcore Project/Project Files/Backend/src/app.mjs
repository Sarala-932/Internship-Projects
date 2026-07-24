import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.mjs";
import hospitalRouter from "./routes/hospital.route.mjs";
import departmentRouter from "./routes/department.route.mjs";
import userRouter from "./routes/user.route.mjs";
import doctorRouter from "./routes/doctor.route.mjs";
import patientRouter from "./routes/patient.route.mjs";
import appointmentRouter from "./routes/appointment.route.mjs";
import encounterRouter from "./routes/encounter.route.mjs";
import prescriptionRouter from "./routes/prescription.route.mjs";

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
    res.status(200).json({message: "Server is running..."});
});

app.use("/api/auth", authRouter);
app.use("/api/hospitals", hospitalRouter);
app.use("/api/departments", departmentRouter);
app.use("/api/users", userRouter);
app.use("/api/doctors", doctorRouter);
app.use("/api/patients", patientRouter);
app.use("/api/appointments", appointmentRouter);
app.use("/api/encounters", encounterRouter);
app.use("/api/prescriptions", prescriptionRouter);

export default app;

