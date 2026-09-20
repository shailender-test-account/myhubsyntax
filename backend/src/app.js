import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/userroutes.js";
import striperouter from "./routes/striperoutes.js";
// import authRoutes from "./routes/authRoutes.js";
// import stripeRoutes from "./routes/stripeRoutes.js";
// import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

// CORS — must allow credentials so cookies are sent
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use("/api/v1/auth",userRouter)

app.use("/api/v1/stripe",striperouter)


export default app;