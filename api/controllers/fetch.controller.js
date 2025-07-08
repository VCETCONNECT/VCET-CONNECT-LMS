import Staff from "../models/staff.model.js";
import Student from "../models/student.model.js";
import Leave from "../models/leave.model.js";
import OD from "../models/od.model.js";
import Defaulter from "../models/defaulter.model.js";

export const getClassInchargeBySectionId = async (req, res, next) => {
  try {
    const { sectionId } = req.params;
    const classIncharge = await Staff.findOne({
      staff_handle_section: sectionId,
      isClassIncharge: true,
    });

    if (!classIncharge) {
      return res.status(404).json({ message: "Class incharge not found" });
    }
    res.status(200).json(classIncharge); // Wrap in array to maintain consistency
  } catch (error) {
    next(error);
  }
};

export const getMentorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mentor = await Staff.findOne({ _id: id });

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }
    res.status(200).json(mentor); // Wrap in array to maintain consistency
  } catch (error) {
    next(error);
  }
};

export const getMenteeByMentorId = async (req, res, next) => {
  try {
    const { mentorId } = req.params;

    if (!mentorId) {
      return res.status(400).json({ message: "Mentor ID is required" });
    }

    const mentees = await Student.find(
      { mentorId: mentorId },
      {
        name: 1,
        roll_no: 1,
        register_no: 1,
        email: 1,
        phone: 1,
        parent_phone: 1,
        section_name: 1,
        status: 1,
        _id: 1,
      }
    ).lean();

    res.status(200).json(mentees);
  } catch (error) {
    console.error("Error in getMenteeByMentorId:", error);
    next(error);
  }
};

export const getWardDetailsByRollNumber = async (req, res, next) => {
  try {
    const { rollNo } = req.params;

    // First get the student ID from roll number
    const student = await Student.findOne({ roll_no: rollNo });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Fetch leaves, ODs and defaulters in parallel
    const [leaves, ods, defaulters] = await Promise.all([
      Leave.find({ userId: student._id }),
      OD.find({ studentId: student._id }),
      Defaulter.find({ studentId: student._id }),
    ]);

    // Combine and format all records
    const allRecords = [
      ...leaves.map((leave) => ({
        ...leave.toObject(),
        type: "Leave",
        status: leave.approvals.classIncharge.status,
      })),
      ...ods.map((od) => ({
        ...od.toObject(),
        type: "OD",
        status: od.approvals.classIncharge.status,
      })),
      ...defaulters.map((defaulter) => ({
        ...defaulter.toObject(),
        type: "Defaulter",
        status: "Marked",
        fromDate: defaulter.entryDate,
        toDate: defaulter.entryDate,
        noOfDays: 1,
      })),
    ];

    // Sort by date (most recent first)
    allRecords.sort((a, b) => new Date(b.fromDate) - new Date(a.fromDate));

    res.status(200).json(allRecords);
  } catch (error) {
    next(error);
  }
};
