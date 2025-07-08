import CGPA from "../models/cgpa.model.js";
import Staff from "../models/staff.model.js";
import Student from "../models/student.model.js";

// Add these grade point mappings
const GRADE_POINTS = {
  O: 10,
  "A+": 9,
  A: 8,
  "B+": 7,
  B: 6,
  C: 5,
  F: 0,
  AB: 0,
};

export const uploadCourseDataForDepartment = async (req, res, next) => {
  try {
    const { departmentId, batch_year, regular_courses, verticals } = req.body;
    // Check if a curriculum already exists for this department and batch
    let cgpa = await CGPA.findOne({
      departmentId,
      batch_year,
    });

    if (cgpa) {
      cgpa.regular_courses = regular_courses;
      cgpa.verticals = verticals;
      await cgpa.save();
    } else {
      // Create new curriculum
      cgpa = new CGPA({
        departmentId,
        batch_year,
        regular_courses,
        verticals,
      });
      await cgpa.save();
    }

    res.status(200).json({
      success: true,
      message: "Course data uploaded successfully",
      data: cgpa,
    });
  } catch (error) {
    next(error);
  }
};

export const getCourseDataForDepartment = async (req, res, next) => {
  try {
    const { departmentId } = req.query;
    const cgpa = await CGPA.findOne({
      departmentId,
      batch_year: "2022-26", // You might want to make this dynamic
    });

    if (!cgpa) {
      return res.status(404).json({
        success: false,
        message: "No course data found for this department",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        regular_courses: cgpa.regular_courses,
        verticals: cgpa.verticals,
        open_courses: cgpa.open_courses,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getNormalCoursesForDepartment = async (req, res, next) => {
  try {
    const { departmentId } = req.params;
  } catch (error) {
    next(error);
  }
};

export const getVerticalCoursesForDepartment = async (req, res, next) => {
  try {
    const { departmentId } = req.params;
  } catch (error) {
    next(error);
  }
};

export const editCourseDataUsingCourseId = async (req, res, next) => {
  try {
    const {
      course_code,
      course_name,
      course_credits,
      semester,
      vertical_type,
    } = req.body;

    // Find the CGPA document containing the course
    const cgpa = await CGPA.findOne({
      $or: [
        { "regular_courses.courses.course_code": course_code },
        { "verticals.courses.course_code": course_code },
      ],
    });

    if (!cgpa) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Update in regular courses if found there
    let updated = false;
    cgpa.regular_courses = cgpa.regular_courses.map((semesterGroup) => {
      const updatedCourses = semesterGroup.courses.map((course) => {
        if (course.course_code === course_code) {
          updated = true;
          return {
            ...course.toObject(),
            course_name,
            course_credits,
            semester,
          };
        }
        return course;
      });
      return { ...semesterGroup.toObject(), courses: updatedCourses };
    });

    // Update in verticals if found there
    if (!updated) {
      cgpa.verticals = cgpa.verticals.map((vertical) => {
        const updatedCourses = vertical.courses.map((course) => {
          if (course.course_code === course_code) {
            updated = true;
            return {
              ...course.toObject(),
              course_name,
              course_credits,
              semester,
              vertical_type, // This will update the vertical type
            };
          }
          return course;
        });
        return {
          ...vertical.toObject(),
          courses: updatedCourses,
          // Update vertical type if any course in this vertical was updated
          vertical_type: updatedCourses.some(
            (c) => c.course_code === course_code
          )
            ? vertical_type
            : vertical.vertical_type,
        };
      });
    }

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Course not found in the curriculum",
      });
    }

    // Save the updated document
    await cgpa.save();

    res.status(200).json({
      success: true,
      message: "Course data updated successfully",
      data: cgpa,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    next(error);
  }
};

export const addOpenElectiveCourse = async (req, res, next) => {
  try {
    const { departmentId, course } = req.body;
    const cgpa = await CGPA.findOne({
      departmentId,
      batch_year: "2022-26", // You might want to make this dynamic
    });

    if (!cgpa) {
      return res.status(404).json({
        success: false,
        message: "No curriculum found for this department",
      });
    }

    // Find the semester group or create new one
    let semesterGroup = cgpa.open_courses.find(
      (group) => group.semester_no === course.semester
    );

    if (!semesterGroup) {
      cgpa.open_courses.push({
        semester_no: course.semester,
        courses: [course],
      });
    } else {
      semesterGroup.courses.push(course);
    }

    await cgpa.save();

    res.status(200).json({
      success: true,
      message: "Open elective course added successfully",
      data: cgpa,
    });
  } catch (error) {
    console.error("Error adding open elective course:", error);
    next(error);
  }
};

export const calculateSemesterResults = async (req, res, next) => {
  try {
    const { student_id, department_id, semester_no, course_results } = req.body;

    // Calculate GPA
    let totalGradePoints = 0;
    let totalCredits = 0;
    let earnedCredits = 0;

    const processedCourses = course_results.map((course) => {
      const gradePoint = GRADE_POINTS[course.grade];
      totalGradePoints += gradePoint * course.credits;
      totalCredits += course.credits;
      if (gradePoint > 0) earnedCredits += course.credits;

      return {
        ...course,
        grade: {
          grade: course.grade,
          grade_point: gradePoint,
        },
      };
    });

    const semesterGPA = totalCredits > 0 ? totalGradePoints / totalCredits : 0;

    // Calculate CGPA by including previous semesters
    const previousResults = await SemesterResult.find({
      student_id,
      semester_no: { $lt: semester_no },
    });

    let cumulativePoints = totalGradePoints;
    let cumulativeCredits = totalCredits;

    previousResults.forEach((result) => {
      cumulativePoints += result.gpa * result.total_credits;
      cumulativeCredits += result.total_credits;
    });

    const cgpa =
      cumulativeCredits > 0 ? cumulativePoints / cumulativeCredits : 0;

    // Save the results
    const semesterResult = new SemesterResult({
      student_id,
      department_id,
      semester_no,
      courses: processedCourses,
      gpa: semesterGPA.toFixed(2),
      cgpa: cgpa.toFixed(2),
      total_credits: totalCredits,
      earned_credits: earnedCredits,
    });

    await semesterResult.save();

    res.status(200).json({
      success: true,
      data: semesterResult,
    });
  } catch (error) {
    next(error);
  }
};

export const getSemesterResults = async (req, res, next) => {
  try {
    const { studentId } = req.query;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required",
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      data: student.semester_results || {},
    });
  } catch (error) {
    console.error("Error fetching semester results:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const saveSemesterResults = async (req, res, next) => {
  try {
    const { studentId, semesterNo, results } = req.body;

    if (!studentId || !semesterNo || !results) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Get existing semester results
    const existingResults = student.semester_results || {};

    // Process each course to handle arrears
    const processedCourses = results.courses.map((course) => {
      const courseResult = {
        course_code: course.course_code,
        course_name: course.course_name,
        credits: course.credits,
        grade: course.grade,
        vertical_type: course.vertical_type || "Regular",
        isArrear: false,
        originalSemester: course.originalSemester || semesterNo,
        arrearHistory: course.arrearHistory || [],
      };

      // If this is an arrear attempt (course from previous semester)
      if (course.originalSemester && course.originalSemester < semesterNo) {
        // Add this attempt to arrear history
        courseResult.arrearHistory = [
          ...(course.arrearHistory || []),
          {
            attemptedSemester: semesterNo,
            grade: course.grade,
            date: new Date(),
          },
        ];

        // If passed now, mark as cleared
        if (course.grade !== "F" && course.grade !== "AB") {
          courseResult.arrearCleared = true;
          courseResult.clearedInSemester = semesterNo;
        }

        // Update the original semester's record to mark the arrear
        if (existingResults[course.originalSemester]) {
          const originalSemCourses = existingResults[
            course.originalSemester
          ].courses.map((origCourse) => {
            if (origCourse.course_code === course.course_code) {
              return {
                ...origCourse,
                hasArrear: true,
                arrearHistory: courseResult.arrearHistory,
                arrearCleared: courseResult.arrearCleared,
                clearedInSemester: courseResult.clearedInSemester,
              };
            }
            return origCourse;
          });
          existingResults[course.originalSemester].courses = originalSemCourses;
        }
      }
      // If this is current semester course and got F grade
      else if (course.grade === "F" || course.grade === "AB") {
        courseResult.isArrear = true;
        courseResult.hasArrear = true;
        courseResult.arrearHistory = [
          {
            attemptedSemester: semesterNo,
            grade: course.grade,
            date: new Date(),
          },
        ];
      }

      return courseResult;
    });

    // Update the results for current semester
    const updatedResults = {
      ...existingResults,
      [semesterNo]: {
        courses: processedCourses,
        gpa: results.gpa,
        cgpa: results.cgpa,
        totalCredits: results.totalCredits,
        earnedCredits: results.earnedCredits,
        lastUpdated: new Date(),
      },
    };

    // Update student's semester results
    student.semester_results = updatedResults;
    await student.save();

    res.status(200).json({
      success: true,
      message: "Semester results saved successfully",
      data: student.semester_results,
    });
  } catch (error) {
    console.error("Error saving semester results:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const clearSemesterResults = async (req, res, next) => {
  try {
    const { studentId, semesterNo } = req.body;

    if (!studentId || !semesterNo) {
      return res.status(400).json({
        success: false,
        message: "Student ID and semester number are required",
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Create a copy of the semester results
    const updatedResults = { ...student.semester_results };

    // Delete the specified semester's results
    delete updatedResults[semesterNo];

    // Update the student's semester results
    student.semester_results = updatedResults;

    // Save the changes
    await student.save();

    res.status(200).json({
      success: true,
      message: `Semester ${semesterNo} results cleared successfully`,
      data: student.semester_results,
    });
  } catch (error) {
    console.error("Error clearing semester results:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getStudentResultsByClassInchargeId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const staff = await Staff.findById(userId).select("staff_handle_section");
    const studentResults = await Student.find({
      sectionId: staff.staff_handle_section,
    }).sort({ roll_no: 1 });
    res.status(200).json({
      success: true,
      data: studentResults,
    });
  } catch (error) {
    next(error);
  }
};
