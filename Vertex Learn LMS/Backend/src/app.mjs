import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

app.get("/", (_req, res) => {
    res.status(200).json({message: "Server is running..."});
});

export default app