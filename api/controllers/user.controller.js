import Student from "../models/student.model.js";
import { errorHandler } from "../utils/error.js";
import bcryptjs from "bcryptjs";
import Staff from "../models/staff.model.js";

export const updateUser = async (req, res, next) => {
  const {
    roll_no,
    register_no,
    name,
    email,
    phone,
    departmentId,
    sectionId,
    section_name,
    batchId,
    currentPassword,
    newPassword,
  } = req.body;

  try {
    const user = await Student.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (currentPassword) {
      const isPasswordValid = await bcryptjs.compare(
        currentPassword,
        user.password
      );
      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
      }
    }
    if (newPassword) {
      if (newPassword.length < 8 || newPassword.length > 16) {
        return res.status(400).json({
          message: "Password must be at least 8 and atmosr 16 characters",
        });
      }
      req.body.password = await bcryptjs.hash(newPassword, 10);
    }
    const updatedFields = {
      roll_no,
      register_no,
      name,
      email,
      phone,
      departmentId,
      sectionId,
      section_name,
      batchId,
    };
    const updatedUser = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true }
    );
    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You are not allowed to delete this user"));
  }
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.status(200).json("User has been deleted");
  } catch (error) {
    next(error);
  }
};

export const getStaffProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const staffProfile = await Staff.findById(userId)
      .populate({
        path: "staff_handle_dept",
        select: "dept_name dept_acronym",
        model: "Department",
      })
      .populate({
        path: "staff_handle_batch",
        select: "batch_name",
        model: "Batch",
      })
      .populate({
        path: "staff_handle_section",
        select: "section_name",
        model: "Section",
      })
      .populate({
        path: "mentorHandlingData.handlingBatchId",
        select: "batch_name",
        model: "Batch",
      })
      .populate({
        path: "mentorHandlingData.handlingSectionId",
        select: "section_name",
        model: "Section",
      })
      .select("-password")
      .lean();

    if (!staffProfile) {
      return next(errorHandler(404, "Staff profile not found"));
    }

    // Format the response with correct field names
    const formattedProfile = {
      id: staffProfile._id,
      staffId: staffProfile.staff_id,
      name: staffProfile.staff_name,
      email: staffProfile.staff_mail,
      phone: staffProfile.staff_phone,
      department: {
        id: staffProfile.staff_handle_dept?._id,
        name: staffProfile.staff_handle_dept?.dept_name || "Not Assigned",
        acronym: staffProfile.staff_handle_dept?.dept_acronym,
      },
      batch: {
        id: staffProfile.staff_handle_batch?._id,
        name: staffProfile.staff_handle_batch?.batch_name || "Not Assigned",
      },
      section: {
        id: staffProfile.staff_handle_section?._id,
        name: staffProfile.staff_handle_section?.section_name || "Not Assigned",
      },
      roles: {
        isMentor: staffProfile.isMentor || false,
        isClassIncharge: staffProfile.isClassIncharge || false,
        isPEStaff: staffProfile.isPEStaff || false,
      },
      mentorHandlingData:
        staffProfile.mentorHandlingData?.map((data) => ({
          batch: {
            id: data.handlingBatchId?._id,
            name: data.handlingBatchId?.batch_name,
          },
          section: {
            id: data.handlingSectionId?._id,
            name: data.handlingSectionId?.section_name,
          },
        })) || [],
      sectionName: staffProfile.section_name,
    };

    res.status(200).json(formattedProfile);
  } catch (error) {
    console.error("Error in getStaffProfile:", error);
    next(error);
  }
};

export const getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return next(errorHandler(404, "Student not found"));
    
    const { password, ...rest } = student._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const getStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return next(errorHandler(404, "Staff not found"));
    
    const { password, ...rest } = staff._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};
