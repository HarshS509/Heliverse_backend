import { timeToMinutes } from "../constants.js";
import Classroom from "../models/classroom.model.js";
import Student from "../models/student.model.js";
import Teacher from "../models/Teacher.model.js";
import Timetable from "../models/timetable.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMyClassroomHandler = asyncHandler(async (req, res) => {
  try {
    // console.log(req.user._id, "user id");
    const teacher = await Teacher.findById(req.user._id)
      .populate("students", "firstName lastName email")
      .populate({
        path: "classroom",
        select: "name timetable", // Include the fields you need from Classroom
        populate: {
          path: "timetable",
          select: "schedule", // Include the fields you need from Timetable
        },
      });
    // console.log(teacher, "teacher");
    if (!teacher) {
      throw new ApiError(404, "Teacher not found");
    }
    res
      .status(200)
      .json(
        new ApiResponse(200, { teacher }, "Classroom successfully Fetched")
      );
  } catch (error) {
    throw new ApiError(500, "Error while fetching classroom");
  }
});
export const getMyStudentsHandler = asyncHandler(async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.user._id).populate("classroom");
    if (!teacher || !teacher.classroom) {
      throw new ApiError(404, "Classroom not found");
    }
    const students = await Student.find({
      classroom: teacher.classroom._id,
    }).select("-password -refreshToken");
    res
      .status(200)
      .json(
        new ApiResponse(200, { students }, "Students successfully Fetched")
      );
  } catch (error) {
    throw new ApiError(500, "Error while fetching students");
  }
});
export const createTimetableHandler = asyncHandler(async (req, res) => {
  const { timetableData } = req.body;
  const teacher = await Teacher.findById(req.user._id).populate("classroom");
  if (!teacher || !teacher.classroom) {
    throw new ApiError(404, "Classroom not found");
  }
  const classroom = teacher.classroom;

  // console.log("timeeeeee", timetableData, "timmmmmm");
  // Validate the timetable data
  timetableData.schedule.forEach((entry) => {
    const { day, periods } = entry;

    periods.forEach((period) => {
      const { startTime, endTime } = period;

      if (day === "Saturday") {
        if (
          timeToMinutes(startTime) <
            timeToMinutes(classroom.saturdayTimings.startTime) ||
          timeToMinutes(endTime) >
            timeToMinutes(classroom.saturdayTimings.endTime)
        ) {
          throw new ApiError(
            400,
            "Saturday lectures must be within the allowed time range"
          );
        }
      } else {
        if (
          timeToMinutes(startTime) <
            timeToMinutes(classroom.weekdayTimings.startTime) ||
          timeToMinutes(endTime) >
            timeToMinutes(classroom.weekdayTimings.endTime)
        ) {
          throw new ApiError(
            400,
            "Weekday lectures must be within the allowed time range"
          );
        }
      }
    });
  });
  // Create and save the new timetable
  const timetable = new Timetable(timetableData);
  await timetable.save();

  // Link the timetable to the classroom
  classroom.timetable = timetable._id;
  await classroom.save();

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { classroom: classroom, timetable: timetable },
        "Timetable created successfully"
      )
    );
});
export const updateTimetableHandler = asyncHandler(async (req, res) => {
  const { updateData } = req.body;
  // console.log("updateeee", updateData);
  const teacher = await Teacher.findById(req.user._id).populate("classroom");

  if (!teacher || !teacher.classroom) {
    throw new ApiError(404, "Classroom not found");
  }

  const classroom = teacher.classroom;
  // Find the timetable
  const timetable = await Timetable.findById(classroom.timetable);
  if (!timetable) {
    throw new ApiError("Timetable not found");
  }
  // Update specific fields in the schedule
  updateData.schedule.forEach((updateEntry) => {
    const { day, periods } = updateEntry;

    // Find the entry for the specified day
    const dayEntry = timetable.schedule.find((entry) => entry.day === day);
    if (dayEntry) {
      periods.forEach((periodUpdate) => {
        const periodIndex = dayEntry.periods.findIndex(
          (period) => period.startTime === periodUpdate.startTime
        );
        if (periodIndex >= 0) {
          // Update existing period
          Object.assign(dayEntry.periods[periodIndex], periodUpdate);
        } else {
          // Add a new period if not found
          dayEntry.periods.push(periodUpdate);
        }
      });
    } else {
      // Add a new day entry if not found
      timetable.schedule.push(updateEntry);
    }
  });
  // Save the updated timetable
  await timetable.save();
  res
    .status(200)
    .json(
      new ApiResponse(200, { timetable }, "Timetable updated successfully!")
    );
});
export const deleteStudentHandler = asyncHandler(async (req, res) => {
  try {
    // Find and delete the student
    const student = await Student.findByIdAndDelete(req.params.id);
    // console.log("hiiiiiiiiiiiiiiiiii");
    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    // Remove student reference from associated classroom
    if (student.classroom) {
      await Classroom.updateOne(
        { _id: student.classroom },
        { $pull: { students: student._id } }
      );
    }

    // Remove student reference from associated teacher
    if (student.teacher) {
      await Teacher.updateOne(
        { _id: student.teacher },
        { $pull: { students: student._id } }
      );
    }

    // Respond with success message
    res
      .status(200)
      .json(new ApiResponse(200, {}, "Student deleted successfully"));
  } catch (error) {
    // Handle errors
    throw new ApiError(500, "Error while deleting student");
  }
});
export const getTeacherTimetableHandler = asyncHandler(async (req, res) => {
  try {
    // Find the teacher by their ID and populate the classroom field
    const teacher = await Teacher.findById(req.user._id).populate("classroom");

    // Check if the teacher or classroom is not found
    if (!teacher || !teacher.classroom) {
      throw new ApiError(404, "Classroom not found");
    }

    // Destructure timetable from the populated classroom
    const { weekdaySchedule, saturdaySchedule } = teacher.classroom;

    // Send the timetable as a response
    res.status(200).json(
      new ApiResponse(200, {
        weekdaySchedule,
        saturdaySchedule,
        message: "Timetable fetched successfully",
      })
    );
  } catch (error) {
    // Handle any errors that occur
    throw new ApiError(500, "Error while fetching timetable");
  }
});
export const deleteTimetableHandler = asyncHandler(async (req, res) => {
  console.log("hiii");
  console.log(req.params);
  const { id } = req.params; // Get the timetable ID from the request parameters
  console.log("idddddddddddddddddddddddddddddddddddddddd", id);
  try {
    // Step 1: Find the teacher who has this timetable
    const teacher = await Teacher.findById(req.user._id).populate("classroom");

    if (!teacher) {
      return res.status(404).json(new ApiError(404, "Teacher not found"));
    }

    // Step 2: Remove the timetable from the teacher's reference
    await Teacher.findByIdAndUpdate(
      teacher._id,
      { $pull: { timetables: { _id: id } } } // Remove the timetable from the timetables array
    );

    // Step 3: Find the associated classroom using the timetable ID
    const classroom = await Classroom.findOne({ "timetables._id": id });

    if (classroom) {
      // Remove the timetable from the classroom
      await Classroom.findByIdAndUpdate(
        classroom._id,
        { $pull: { timetables: { _id: id } } } // Remove the timetable from the timetables array
      );
    }
    await Timetable.findByIdAndDelete(id);
    // Respond with a success message
    res
      .status(200)
      .json(
        new ApiResponse(200, { message: "Timetable deleted successfully" })
      );
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error deleting timetable:", error);
    res.status(500).json(new ApiError(500, "Error deleting timetable"));
  }
});
