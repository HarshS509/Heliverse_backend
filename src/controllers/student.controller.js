import Student from "../models/student.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMyClassInfoHandler = asyncHandler(async (req, res) => {
  try {
    const student = await Student.findById(req.user._id).populate({
      path: "teacher", // Populate the teacher field
      select: "firstName lastName classroom", // Select relevant fields
      populate: {
        path: "classroom", // Populate the teacher's classroom
        select: "name students timetable", // Select relevant fields in classroom
        populate: [
          {
            path: "students", // Populate students in the classroom
            select: "firstName lastName", // Select relevant fields in students
          },
          {
            path: "timetable", // Populate timetable in the classroom
            select: "schedule", // Adjust fields to match your schema
          },
        ],
      },
    });

    // .populate({
    //   path: "classroom",
    //   populate: [
    //     {
    //       path: "teacher",
    //       select: "firstName lastName", // Select only the fields you need from the teacher
    //     },
    //     {
    //       path: "students",
    //       select: "firstName lastName email", // Select the fields you need from the students
    //     },
    //   ],
    // });

    // console.log(student);

    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { classroom: student?.teacher?.classroom, student },
          "Classroom fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error while fetching classroom");
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
