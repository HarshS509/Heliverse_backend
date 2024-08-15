import Student from "../models/student.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMyClassInfoHandler = asyncHandler(async (req, res) => {
  try {
    const student = await Student.findById(req.user._id).populate("classroom");
    console.log(student);
    if (!student || !student.classroom) {
      throw new ApiError(404, "Class not found");
    }
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { classroom: student.classroom },
          "classroom fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "error while fetching classroom");
  }
});
export const getMyTimetableHandler = asyncHandler(async (req, res) => {
  try {
    const student = await Student.findById(req.user._id).populate("classroom");
    if (!student || !student.classroom) {
      throw new ApiError(404, "Class not found");
    }
    const { weekdaySchedule, saturdaySchedule } = student.classroom;
    res.status(200).json(
      new ApiResponse(200, {
        weekdaySchedule,
        saturdaySchedule,
        message: "Timetable fetched successfully",
      })
    );
  } catch (error) {
    throw new ApiError(500, "error while fetching timetable");
  }
});
