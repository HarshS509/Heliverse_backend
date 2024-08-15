import { cookieOptions } from "../constants.js";
import Principal from "../models/principal.model.js";
import Student from "../models/student.model.js";
import Teacher from "../models/Teacher.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const loginHandler = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    throw new ApiError(400, "Please provide all required fields");
  }
  if (role === "Principal") {
    const user = await Principal.findOne({ email: email }).select("+password");
    if (!user) {
      throw new ApiError(400, "User not found!");
    }
    const isCorrectPassword = await user.isPasswordCorrect(password);
    if (!isCorrectPassword) {
      throw new ApiError(401, "The password provided is invalid!");
    }
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();
    user.password = undefined;
    res
      .status(200)
      .cookie("access_token", accessToken, cookieOptions)
      .cookie("refresh_token", refreshToken, cookieOptions)
      .cookie("role", role, cookieOptions)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken,
            user,
          },
          "User successfully logged in."
        )
      );
    // console.log("Set-Cookie header:", res.getHeader("Set-Cookie"));
  }
  if (role === "Teacher") {
    const user = await Teacher.findOne({ email: email }).select("+password");
    if (!user) {
      throw new ApiError(400, "User not found!");
    }
    const isCorrectPassword = await user.isPasswordCorrect(password);
    if (!isCorrectPassword) {
      throw new ApiError(401, "The password provided is invalid!");
    }
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();
    user.password = undefined;
    res
      .status(200)
      .cookie("access_token", accessToken, cookieOptions)
      .cookie("refresh_token", refreshToken, cookieOptions)
      .cookie("role", role, cookieOptions)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken,
            user,
          },
          "User successfully logged in."
        )
      );
  }
  if (role === "Student") {
    const student = await Student.findOne({ email: email }).select("+password");
    if (!student) {
      throw new ApiError(400, "student not found!");
    }
    const isCorrectPassword = await student.isPasswordCorrect(password);
    if (!isCorrectPassword) {
      throw new ApiError(401, "The password provided is invalid!");
    }
    const accessToken = await student.generateAccessToken();
    const refreshToken = await student.generateRefreshToken();

    student.refreshToken = refreshToken;
    await student.save();
    student.password = undefined;
    res
      .status(200)
      .cookie("access_token", accessToken, cookieOptions)
      .cookie("refresh_token", refreshToken, cookieOptions)
      .cookie("role", role, cookieOptions)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken,
            user: student,
          },
          "Student successfully logged in."
        )
      );
  }
});

export const registerPrincipalHandler = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Please provide all required fields");
  }
  const existingUser = await Principal.findOne({ email: email });
  if (existingUser) {
    throw new ApiError(400, "Email already in use");
  }
  const user = new Principal({ email, password });
  try {
    await user.validate();
  } catch (error) {
    const validationErrors = [];
    for (const key in error.errors) {
      validationErrors.push(error.errors[key].message);
    }
    throw new ApiError(400, validationErrors.join(", "));
  }
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();
  user.refreshToken = refreshToken;

  await user.save();
  user.password = undefined;
  res
    .status(200)
    .cookie("access_token", accessToken, cookieOptions)
    .cookie("refresh_token", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          accessToken,
          refreshToken,
          user,
        },
        "New Principal profile created successfully."
      )
    );
});

export const logoutHandler = asyncHandler(async (req, res) => {
  const { role } = req.user;
  // console.log("logged");
  if (!role) {
    throw new ApiError(400, "Please provide role");
  }
  if (role === "Principal") {
    await Principal.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          refreshToken: "",
        },
      },
      {
        new: true,
      }
    );
  }
  if (role === "Teacher") {
    await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          refreshToken: "",
        },
      },
      {
        new: true,
      }
    );
  }
  res
    .status(200)
    .clearCookie("access_token", cookieOptions)
    .clearCookie("refresh_token", cookieOptions)
    .clearCookie("role", cookieOptions)
    .json(new ApiResponse(200, {}, "User successfully logged out."));
});
