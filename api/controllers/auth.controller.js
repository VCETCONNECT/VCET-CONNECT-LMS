import bcryptjs from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import Staff from "../models/staff.model.js";
import Student from "../models/student.model.js";
import { errorHandler } from "../utils/error.js";
import { sendEmail } from "./email.service.js";

dotenv.config();

export const changePassword = async (req, res, next) => {
  const { userType, id } = req.params;
  const { oldPassword, newPassword } = req.body;
  if (userType === "Staff") {
    const staff = await Staff.findById(id);
    const isMatch = await bcryptjs.compare(oldPassword, staff.password);
    if (!isMatch) {
      return next(errorHandler(400, "Invalid Old Password"));
    }
    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    staff.password = hashedPassword;
    await staff.save();
    res.status(200).json({ message: "Password changed successfully" });
  } else if (userType === "Student") {
    const student = await Student.findById(id);
    const isMatch = await bcryptjs.compare(oldPassword, student.password);
    if (!isMatch) {
      return next(errorHandler(400, "Invalid Old Password"));
    }
    const hashedPassword = await bcryptjs.hash(newPassword.toString(), 10);
    student.password = hashedPassword;
    await student.save();
    res.status(200).json({ message: "Password changed successfully" });
  } else {
    return next(errorHandler(400, "Invalid User Type"));
  }
};

export const studentsignin = async (req, res, next) => {
  let { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  identifier = identifier.toUpperCase();
  try {
    const student = await Student.findOne({
      $or: [{ roll_no: identifier }, { register_no: identifier }],
    });

    if (!student) {
      return res.status(404).json({ message: "User not found" });
    }

    // console.log(student);

    const isMatch = await bcryptjs.compare(password, student.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Spread student properties directly into the response
    const {
      _id,
      name,
      roll_no,
      register_no,
      email,
      phone,
      parent_phone,
      departmentId,
      mentorId,
      sectionId,
      section_name,
      batchId,
      userType,
    } = student;

    res
      .status(200)
      .cookie("access_token", token, {
        httpOnly: true,
        maxAge: 30 * 60 * 1000,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      })
      .json({
        token,
        id: _id,
        name,
        roll_no,
        register_no,
        email,
        phone,
        parent_phone,
        departmentId,
        mentorId,
        batchId,
        sectionId,
        section_name,
        userType,
      });
  } catch (error) {
    next(error);
  }
};

export const staffsignin = async (req, res, next) => {
  try {
    let { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    identifier = identifier.toUpperCase();

    const staff = await Staff.findOne({ staff_id: identifier });
    // console.log(staff);
    if (!staff) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcryptjs.compare(password, staff.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: staff._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const {
      _id,
      staff_name,
      staff_mail,
      staff_phone,
      staff_handle_dept,
      isClassIncharge,
      classInchargeBatchId,
      classInchargeSectionId,
      isMentor,
      isHod,
      numberOfClassesHandledAsMentor,
      mentorHandlingData,
      userType,
      isPEStaff, // Include the new field
    } = staff;

    res
      .status(200)
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .json({
        token,
        id: identifier,
        name: staff_name,
        userId: _id,
        mail: staff_mail,
        phone: staff_phone,
        departmentId: staff_handle_dept,
        isClassIncharge,
        isMentor,
        isHod,
        classInchargeBatchId,
        classInchargeSectionId,
        numberOfClassesHandledAsMentor,
        mentorHandlingData,
        userType,
        isPEStaff, // Return the new field
      });
  } catch (error) {
    next(error);
  }
};

export const signout = (req, res, next) => {
  try {
    res
      .clearCookie("access_token")
      .status(200)
      .json("User has been signed out");
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  const { userType, id } = req.params;
  const {
    email,
    phone,
    portfolio_url,
    resume_url,
    linkedin_url,
    github_url,
    hackerrank_url,
    leetcode_url,
  } = req.body;
  try {
    if (userType === "Staff") {
      const staff = await Staff.findById(id);
      if (email) staff.staff_mail = email;
      if (phone) staff.staff_phone = phone;
      await staff.save();
      res.status(200).json({
        message: "Profile updated successfully",
        user: {
          email: staff.staff_mail,
          phone: staff.staff_phone,
        },
      });
    } else if (userType === "Student") {
      const student = await Student.findById({ _id: id });
      if (email) student.email = email;
      if (phone) student.phone = phone;
      if (portfolio_url) student.portfolio_url = portfolio_url;
      if (resume_url) student.resume_url = resume_url;
      if (linkedin_url) student.linkedin_url = linkedin_url;
      if (github_url) student.github_url = github_url;
      if (hackerrank_url) student.hackerrank_url = hackerrank_url;
      if (leetcode_url) student.leetcode_url = leetcode_url;
      await student.save();
      res.status(200).json({
        message: "Profile updated successfully",
        user: {
          email: student.email,
          phone: student.phone,
          portfolio_url: student.portfolio_url,
          resume_url: student.resume_url,
          linkedin_url: student.linkedin_url,
          github_url: student.github_url,
          hackerrank_url: student.hackerrank_url,
          leetcode_url: student.leetcode_url,
        },
      });
    } else {
      return next(errorHandler(400, "Invalid User Type"));
    }
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  const { email, regno } = req.body;
  try {
    let user = await Student.findOne({ email, register_no: regno });

    if (!user) {
      const staff = await Staff.findOne({ staff_mail: email });
      if (staff) {
        return res.status(403).json({
          message: "Unauthorized to Perform",
        });
      }
      return next(errorHandler(404, "No account found with this email"));
    }

    const tempPassword = Math.random().toString(36).slice(-8);

    const hashedPassword = await bcryptjs.hash(tempPassword, 10);

    user.password = hashedPassword;
    await user.save();

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
        <h2 style="color: #2c3e50; text-align: center; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Password Reset</h2>
        <p style="color: #34495e; line-height: 1.6;">You requested a password reset for your VCET Connect account.</p>
        <p style="color: #34495e; line-height: 1.6;">Your temporary password is: <strong style="background-color: #f1f1f1; padding: 5px 10px; border-radius: 4px; color: #e74c3c;">${tempPassword}</strong></p>
        <p style="color: #34495e; line-height: 1.6;">Please use this temporary password to login and change your password immediately.</p>
        <p style="color: #e74c3c; font-weight: bold;">If you didn't request this, please contact support immediately.</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #bdc3c7; color: #7f8c8d;">
          <p style="margin: 0;">Best regards,<br>VCET Connect Team</p>
        </div>
      </div>
    `;

    await sendEmail(user.email, "Password Reset - VCET Connect", emailContent);

    res.status(200).json({
      message: "A temporary password has been sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    next(errorHandler(500, "Error resetting password. Please try again."));
  }
};
