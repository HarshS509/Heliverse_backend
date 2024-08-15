import { cookieOptions } from "../constants.js";
import Classroom from "../models/classroom.model.js";
import Principal from "../models/principal.model.js";
import Student from "../models/student.model.js";
import Teacher from "../models/teacher.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export async function a(req, res) {}
export const createClassroomHandler = asyncHandler(async (req, res) => {
  try {
    // console.log("hi therrrrrrrr", req.body);
    const { name, weekdayTimings, saturdayTimings } = req.body;
    const classroom = new Classroom({
      name,
      weekdayTimings,
      saturdayTimings,
    });
    await classroom.save();
    res.status(201).json(
      new ApiResponse(
        200,
        {
          classroom,
        },
        "Classroom Created Successfully!"
      )
    );
  } catch (error) {
    throw new ApiError(400, "Unable to create classroom :(");
  }
});
export const updateClassroomHandler = asyncHandler(async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "weekdaySchedule", "saturdaySchedule"];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      throw new ApiError(400, "Invalid updates!");
    }

    const classroom = await Classroom.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!classroom) {
      throw new ApiError(404, "Classroom not found");
    }

    res.status(200).json(new ApiResponse(200, { classroom }));
  } catch (error) {
    throw new ApiError(400, "Unable to update classroom :(");
  }
});
export const deleteClassroomHandler = asyncHandler(async (req, res) => {
  try {
    const classroom = await Classroom.findByIdAndDelete(req.params.id);

    if (!classroom) {
      throw new ApiError(404, "Classroom not found");
    }

    // Remove classroom reference from associated teachers and students
    await Teacher.updateMany(
      { classroom: classroom._id },
      { $unset: { classroom: 1 } }
    );
    await Student.updateMany(
      { classroom: classroom._id },
      { $unset: { classroom: 1 } }
    );
    res
      .status(201)
      .json(new ApiResponse(201, {}, "Classroom deleted successfully!"));
    // res.json({ message: "Classroom deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Teacher Handlers
export const registerTeacherHandler = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  // console.log("hi");
  if (!email || !password || !firstName || !lastName) {
    throw new ApiError(400, "Please provide all required fields");
  }
  const existingUser = await Teacher.findOne({ email: email });
  if (existingUser) {
    throw new ApiError(400, "Email already in use");
  }
  const user = new Teacher({ email, password, firstName, lastName });
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
    // .cookie("access_token", accessToken, cookieOptions)
    // .cookie("refresh_token", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          accessToken,
          refreshToken,
          user,
        },
        "New Teacher profile created successfully."
      )
    );
});

export const updateTeacherHandler = asyncHandler(async (req, res) => {
  try {
    // console.log("aa gya maal");
    const updates = Object.keys(req.body);
    const allowedUpdates = ["email", "firstName", "lastName", "password"];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      throw new ApiError(400, "Invalid updates!");
    }

    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      throw new ApiError(404, "Teacher not found");
    }

    // Check if password is being updated
    if (req.body.password) {
      // Update password only if provided
      teacher.password = req.body.password;
    }

    // Update other fields
    updates.forEach((update) => {
      if (update !== "password") {
        teacher[update] = req.body[update];
      }
    });

    await teacher.save();
    res
      .status(200)
      .json(new ApiResponse(200, { teacher }, "Teacher profile updated!"));
  } catch (error) {
    throw new ApiError(400, "Unable to update teacher profile :(");
  }
});

export const deleteTeacherHandler = asyncHandler(async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);

    if (!teacher) {
      throw new ApiError(404, "Teacher not found");
    }

    // Remove teacher reference from associated classroom
    if (teacher.classroom) {
      await Classroom.updateOne(
        { _id: teacher.classroom },
        { $unset: { teacher: 1 } }
      );
    }
    res
      .status(200)
      .json(new ApiResponse(200, {}, "Teacher deleted successfully"));
  } catch (error) {
    throw new ApiError(500, "Error while deleting teacher");
  }
});

// Student Handlers
export const registerStudentHandler = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  // console.log("student here", email);
  if (!email || !password || !firstName || !lastName) {
    throw new ApiError(400, "Please provide all required fields");
  }
  const existingUser = await Student.findOne({ email: email });
  if (existingUser) {
    throw new ApiError(400, "Email already in use");
  }
  const user = new Student({ email, password, firstName, lastName });
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
    // .cookie("access_token", accessToken, cookieOptions)
    // .cookie("refresh_token", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          accessToken,
          refreshToken,
          user,
        },
        "New Student profile created successfully."
      )
    );
});

export const updateStudentHandler = asyncHandler(async (req, res) => {
  try {
    // console.log("aa gya maal");
    const updates = Object.keys(req.body);
    const allowedUpdates = ["email", "firstName", "lastName", "password"];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      throw new ApiError(400, "Invalid updates!");
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    // Check if password is being updated
    if (req.body.password) {
      // Update password only if provided
      student.password = req.body.password;
    }

    // Update other fields
    updates.forEach((update) => {
      if (update !== "password") {
        student[update] = req.body[update];
      }
    });

    await student.save();
    res
      .status(200)
      .json(new ApiResponse(200, { student }, "Student profile updated!"));
  } catch (error) {
    throw new ApiError(400, "Unable to update student profile :(");
  }
});
export const deleteStudentHandler = asyncHandler(async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

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
    res
      .status(200)
      .json(new ApiResponse(200, {}, "Student deleted successfully"));
  } catch (error) {
    throw new ApiError(500, "Error while deleting student");
  }
});
// Assignment Handlers

export const assignTeacherToClassroomHandler = asyncHandler(
  async (req, res) => {
    try {
      const { teacherId, classroomId } = req.body;

      // Find the classroom and teacher by their IDs
      const classroom = await Classroom.findById(classroomId).populate(
        "students"
      );
      const teacher = await Teacher.findById(teacherId).populate("students");

      // Check if both classroom and teacher exist
      if (!classroom || !teacher) {
        throw new ApiError(404, "Classroom or Teacher not found");
      }

      // Remove the teacher from the previous classroom if assigned
      if (teacher.classroom) {
        const previousClassroom = await Classroom.findById(teacher.classroom);
        if (previousClassroom) {
          // Remove the teacher from the previous classroom
          previousClassroom.teacher = null;
          previousClassroom.students = previousClassroom.students.filter(
            (student) => !teacher.students.includes(student._id)
          );
          await previousClassroom.save();
        }
      }

      // Remove the previous teacher from the classroom if there was one
      if (classroom.teacher) {
        const previousTeacher = await Teacher.findById(classroom.teacher);
        if (previousTeacher) {
          // Remove the classroom reference from the previous teacher
          previousTeacher.classroom = null;
          await previousTeacher.save();
        }
      }

      // Assign the teacher to the new classroom
      classroom.teacher = teacherId;
      teacher.classroom = classroomId;

      // Add the teacher's students to the classroom's students array
      classroom.students = [
        ...new Set([
          ...classroom.students,
          ...teacher.students.map((student) => student._id),
        ]),
      ];

      // Save the updated classroom and teacher records
      await classroom.save();
      await teacher.save();

      // Optionally, update students' classroom reference if necessary
      await Student.updateMany(
        { _id: { $in: teacher.students.map((student) => student._id) } },
        { classroom: classroomId }
      );

      res
        .status(201)
        .json(
          new ApiResponse(
            201,
            { classroom, teacher },
            "Teacher assigned to classroom and students updated successfully"
          )
        );
    } catch (error) {
      // Handle any errors that occurred during the assignment process
      throw new ApiError(400, error.message);
    }
  }
);
export const assignStudentToClassroomHandler = asyncHandler(
  async (req, res) => {
    try {
      const { studentId, classroomId } = req.body;
      const classroom = await Classroom.findById(classroomId);
      const student = await Student.findById(studentId);

      if (!classroom || !student) {
        throw new ApiError(404, "Classroom or Student not found");
      }

      if (classroom.students.includes(studentId)) {
        throw new ApiError(400, "Student already assigned to this classroom");
      }

      // Remove student from previous classroom if any
      if (student.classroom) {
        await Classroom.updateOne(
          { _id: student.classroom },
          { $pull: { students: studentId } }
        );
      }

      classroom.students.push(studentId);
      student.classroom = classroomId;

      await classroom.save();
      await student.save();

      res
        .status(201)
        .json(
          new ApiResponse(
            201,
            { classroom, student },
            "Student assigned to classroom successfully"
          )
        );
    } catch (error) {
      throw new ApiError(400, "Error assigning student to classroom");
    }
  }
);
export const assignStudentToTeacherHandler = asyncHandler(async (req, res) => {
  try {
    const { studentId, teacherId } = req.body;

    // Find the teacher, student, and their associated classroom
    const teacher = await Teacher.findById(teacherId).populate("classroom");
    const student = await Student.findById(studentId).populate("classroom");

    if (!teacher || !student) {
      throw new ApiError(404, "Teacher or Student not found");
    }

    // Ensure the student is not already assigned to the teacher
    if (student.teacher && student.teacher.toString() === teacherId) {
      throw new ApiError(400, "Student already assigned to this teacher");
    }

    // Remove student from previous teacher's students array if needed
    if (student.teacher) {
      const previousTeacher = await Teacher.findById(student.teacher);
      if (previousTeacher) {
        // Remove student from previous teacher's students array
        await Teacher.updateOne(
          { _id: student.teacher },
          { $pull: { students: studentId } }
        );

        // Remove student from previous classroom's students array if needed
        if (previousTeacher.classroom) {
          const previousClassroom = await Classroom.findById(
            previousTeacher.classroom
          );
          if (previousClassroom) {
            await Classroom.updateOne(
              { _id: previousTeacher.classroom },
              { $pull: { students: studentId } }
            );
          }
        }
      }
    }

    // Assign student to the new teacher
    teacher.students.push(studentId);
    student.teacher = teacherId;

    // Find the classroom associated with the new teacher
    const newClassroom = await Classroom.findById(teacher.classroom);

    // Add student to the new classroom's students array if the classroom exists
    if (newClassroom) {
      if (!newClassroom.students.includes(studentId)) {
        newClassroom.students.push(studentId);
        await newClassroom.save();
      }
    }

    // Save the updated teacher and student records
    await teacher.save();
    await student.save();

    // Assign the teacher to the new classroom if necessary
    if (newClassroom && !newClassroom.teachers.includes(teacherId)) {
      await Classroom.updateOne(
        { _id: newClassroom._id },
        { $push: { teachers: teacherId } }
      );
    }

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { teacher, student },
          "Student assigned to teacher and classroom updated successfully"
        )
      );
  } catch (error) {
    // Handle any errors that occurred during the assignment process
    throw new ApiError(400, error.message);
  }
});
export const getClassroomsHandler = asyncHandler(async (req, res) => {
  try {
    const classrooms = await Classroom.find({})
      .populate("teacher", "firstName lastName")
      .exec();

    res
      .status(200)
      .json(
        new ApiResponse(200, { classrooms }, "classrooms fetched successfully")
      );
  } catch (error) {
    throw new ApiError(500, "error fetching classrooms");
  }
});
export const getClassroomByIdHandler = asyncHandler(async (req, res) => {
  try {
    // console.log("iddd", req.params.id);
    const classroom = await Classroom.findById(req.params.id);
    // console.log(classroom);
    if (!classroom) {
      throw new ApiError(404, "Classroom not found");
    }
    res
      .status(200)
      .json(
        new ApiResponse(200, { classroom }, "Success while loading classroom")
      );
  } catch (error) {
    throw new ApiError(500, "error fetching classroom");
  }
});
export const getTeachersHandler = asyncHandler(async (req, res) => {
  try {
    const teachers = await Teacher.find({})
      .populate("classroom", "name students")
      .select("-password -refreshToken")
      .exec();
    res.status(200).json(
      new ApiResponse(
        200,
        {
          teachers,
        },
        "Teachers fetched successfully"
      )
    );
  } catch (error) {
    throw new ApiError(500, "error fetching teacher profile");
  }
});
export const getStudentsHandler = asyncHandler(async (req, res) => {
  try {
    const students = await Student.find({})
      .populate("classroom", "name")
      .populate({
        path: "teacher", // Populate teacher field
        select: "firstName lastName classroom", // Select fields from Teacher
        populate: {
          path: "classroom", // Populate classroom field in Teacher
          select: "name", // Select fields from Classroom
        },
      })
      .select("-password -refreshToken")
      .exec();
    res
      .status(200)
      .json(
        new ApiResponse(200, { students }, "students fetched successfully")
      );
  } catch (error) {
    throw new ApiError(500, "error fetching students ");
  }
});
export const getTeacherById = asyncHandler(async (req, res) => {
  try {
    // console.log("iddd", req.params.id);
    const teacher = await Teacher.findById(req.params.id);
    // console.log(teacher);
    if (!teacher) {
      throw new ApiError(404, "Teacher not found");
    }
    res
      .status(200)
      .json(new ApiResponse(200, { teacher }, "Success while loading Teacher"));
  } catch (error) {
    throw new ApiError(500, "error fetching teacher");
  }
});
export const getStudentById = asyncHandler(async (req, res) => {
  try {
    // console.log("iddd", req.params.id);
    const student = await Student.findById(req.params.id);
    // console.log(student);
    if (!student) {
      throw new ApiError(404, "Student not found");
    }
    res
      .status(200)
      .json(new ApiResponse(200, { student }, "Success while loading Student"));
  } catch (error) {
    throw new ApiError(500, "error fetching student");
  }
});

// export const = asyncHandler(async(req,res)=>{

// })
//     res.status(200).json(new ApiResponse(200,{},"Teacher deleted successfully"))

//     throw new ApiError(500,"Error while deleting teacher" )
