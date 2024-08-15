import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "../src/routes/auth.route.js";
import principalRouter from "../src/routes/principal.route.js";

import teacherRouter from "../src/routes/teacher.route.js";

import studentRouter from "../src/routes/student.route.js";

// import { FRONTEND_URL } from "../src/constants.js";
import compression from "compression";
import { ApiResponse } from "../src/utils/ApiResponse.js";

import errorMiddleware from "../src/middlewares/error.middleware.js";

export const app = express();
const corsOptions = {
  credentials: true,
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3000/",
  ],
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.use(
  express.urlencoded({
    extended: true,
    limit: "5mb",
  })
);
app.use(compression());

//auth routes
app.use("/api/auth", authRouter);
// principal routes
app.use("/api/principal", principalRouter);
// teacher  routes
app.use("/api/teacher", teacherRouter);
// student routes
app.use("/api/student", studentRouter);
app.get("/", (req, res) => {
  res.send("Yay!! Backend of MySchool app is now accessible");
});

app.all("*", (req, res) => {
  res
    .status(404)
    .json(
      new ApiResponse(
        404,
        {},
        "Oops! The page you're looking for could not be found."
      )
    );
});
app.use(errorMiddleware);
