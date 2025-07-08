import bcrypt from "bcryptjs";
import xlsx from "xlsx";
import fs from "fs";
import Student from "../models/student.model.js";
import Staff from "../models/staff.model.js";
import Department from "../models/department.model.js";
import Batch from "../models/batch.model.js";
import Section from "../models/section.model.js";

export const uploadStudentData = async (req, res) => {
  const filePath = req.file.path;

  try {
    const result = await processStudentExcelFile(filePath);
    fs.unlinkSync(filePath);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: error.message });
  }
};

async function processStudentExcelFile(filePath) {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1,
      raw: false,
    });

    // Skip header row if it exists
    const dataRows = sheetData.slice(1);

    const results = {
      success: [],
      duplicates: [],
      errors: [],
      summary: {
        total: 0,
        successful: 0,
        duplicates: 0,
        errors: 0,
      },
    };

    for (const row of dataRows) {
      try {
        // Skip empty rows
        if (!row[0]) continue;

        results.summary.total++;

        const [
          roll_no,
          register_no,
          name,
          email,
          phone,
          parent_phone,
          department,
          batch,
          section,
          mentor,
        ] = row;

        // Skip if essential data is missing
        if (!roll_no || !register_no || !name) {
          results.errors.push({
            roll_no: roll_no || "N/A",
            register_no: register_no || "N/A",
            name: name || "N/A",
            error: "Missing essential data",
          });
          results.summary.errors++;
          continue;
        }

        // Check for duplicates
        const existingStudent = await Student.findOne({
          $or: [{ roll_no }, { register_no }, { email }],
        });

        if (existingStudent) {
          // Check if mentor is different
          const mentorDoc = await Staff.findOne({
            staff_id: mentor,
            isMentor: true,
          });

          if (!mentorDoc) {
            throw new Error(`Mentor not found: ${mentor}`);
          }

          if (!existingStudent.mentorId.equals(mentorDoc._id)) {
            existingStudent.mentorId = mentorDoc._id;
            await existingStudent.save();

            results.success.push({
              roll_no,
              name,
              department,
              batch,
              section,
              updatedField: "Mentor",
            });
            results.summary.successful++;
          } else {
            results.duplicates.push({
              roll_no,
              register_no,
              name,
              email,
              duplicateField:
                existingStudent.roll_no === roll_no
                  ? "Roll No"
                  : existingStudent.register_no === register_no
                  ? "Register No"
                  : "Email",
            });
            results.summary.duplicates++;
          }

          continue;
        }

        // Find department
        const departmentDoc = await Department.findOne({
          dept_acronym: department,
        });
        if (!departmentDoc) {
          throw new Error(`Department not found: ${department}`);
        }

        // Find batch
        const batchDoc = await Batch.findOne({
          department: departmentDoc._id,
          batch_name: batch,
        });
        if (!batchDoc) {
          throw new Error(`Batch not found: ${batch}`);
        }

        // Find section
        const sectionDoc = await Section.findOne({
          Batch: batchDoc._id,
          section_name: section,
        });
        if (!sectionDoc) {
          throw new Error(`Section not found: ${section}`);
        }

        // Find mentor
        const mentorDoc = await Staff.findOne({
          staff_id: mentor,
          isMentor: true,
        });
        if (!mentorDoc) {
          throw new Error(`Mentor not found: ${mentor}`);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(register_no.toString(), 10);

        // Create student record
        const studentData = {
          roll_no: roll_no.trim(),
          register_no: register_no.trim(),
          password: hashedPassword,
          name,
          email: email.trim(),
          phone: phone.trim(),
          parent_phone: parent_phone.trim(),
          departmentId: departmentDoc._id,
          batchId: batchDoc._id,
          sectionId: sectionDoc._id,
          section_name: section,
          mentorId: mentorDoc._id,
          userType: "Student",
          status: "active",
        };

        await Student.create(studentData);
        results.success.push({
          roll_no,
          name,
          department,
          batch,
          section,
        });
        results.summary.successful++;
      } catch (error) {
        results.errors.push({
          roll_no: row[0] || "N/A",
          register_no: row[1] || "N/A",
          name: row[2] || "N/A",
          error: error.message,
        });
        results.summary.errors++;
      }
    }

    return {
      message: "File processing completed",
      summary: results.summary,
      details: {
        successful: results.success,
        duplicates: results.duplicates,
        errors: results.errors,
      },
    };
  } catch (error) {
    console.error("Error processing Excel file:", error);
    throw error;
  }
}

export const uploadStaffData = async (req, res) => {
  const filePath = req.file.path;

  try {
    const result = await processStaffExcelFile(filePath);
    fs.unlinkSync(filePath);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: error.message });
  }
};

async function processStaffExcelFile(filePath) {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1,
      raw: false,
    });

    const results = {
      success: [],
      updated: [],
      duplicates: [],
      errors: [],
      summary: {
        total: 0,
        successful: 0,
        updated: 0,
        duplicates: 0,
        errors: 0,
      },
    };

    for (const row of sheetData) {
      try {
        if (!row[0]) continue;

        results.summary.total++;

        const [
          staff_id,
          staff_name,
          staff_mail,
          staff_phone,
          department,
          batch,
          section,
          isClassIncharge,
          isMentor,
          isHOD,
        ] = row;

        if (!staff_id || !staff_name) {
          results.errors.push({
            staff_id: staff_id || "N/A",
            staff_name: staff_name || "N/A",
            error: "Missing essential data",
          });
          results.summary.errors++;
          continue;
        }

        // Lookup Department first
        const departmentDoc = await Department.findOne({
          dept_acronym: department,
        });
        if (!departmentDoc) {
          throw new Error(`Department not found: ${department}`);
        }

        // Prepare for Batch/Section resolution
        let batchDoc = null;
        let sectionDoc = null;
        let resolvedSectionName = section || "Pending Assignment";

        if (isHOD?.toUpperCase() !== "YES") {
          if (batch) {
            batchDoc = await Batch.findOne({
              department: departmentDoc._id,
              batch_name: batch,
            });
            if (!batchDoc) {
              results.errors.push({
                staff_id,
                staff_name,
                error: `Batch not found: ${batch}`,
              });
              results.summary.errors++;
              continue;
            }

            if (section) {
              sectionDoc = await Section.findOne({
                Batch: batchDoc._id,
                section_name: section,
              });
              if (!sectionDoc) {
                results.errors.push({
                  staff_id,
                  staff_name,
                  error: `Section not found: ${section}`,
                });
                results.summary.errors++;
                continue;
              }
            }
          }
        } else {
          resolvedSectionName = null; // HODs don't need section_name
        }

        // Check for existing staff
        const existingStaff = await Staff.findOne({
          $or: [{ staff_id }, { staff_mail: staff_mail || "" }],
        });

        if (existingStaff) {
          const isSameData =
            existingStaff.staff_name === staff_name &&
            existingStaff.staff_mail === staff_mail &&
            existingStaff.staff_phone === staff_phone &&
            existingStaff.staff_handle_dept?.toString() ===
              departmentDoc._id.toString() &&
            existingStaff.staff_handle_batch?.toString() ===
              (batchDoc?._id?.toString() || "") &&
            existingStaff.staff_handle_section?.toString() ===
              (sectionDoc?._id?.toString() || "") &&
            existingStaff.section_name === resolvedSectionName &&
            existingStaff.isClassIncharge ===
              (isClassIncharge?.toUpperCase() === "YES") &&
            existingStaff.isMentor === (isMentor?.toUpperCase() === "YES") &&
            existingStaff.isHod === (isHOD?.toUpperCase() === "YES");

          if (isSameData) {
            results.duplicates.push({
              staff_id,
              staff_name,
              staff_mail,
              note: "Already exists with identical data",
            });
            results.summary.duplicates++;
            continue;
          }

          const updatedData = {
            staff_name,
            staff_mail,
            staff_phone,
            staff_handle_dept: departmentDoc._id,
            staff_handle_batch: batchDoc?._id || null,
            staff_handle_section: sectionDoc?._id || null,
            section_name: resolvedSectionName,
            isClassIncharge: isClassIncharge?.toUpperCase() === "YES",
            isMentor: isMentor?.toUpperCase() === "YES",
            isHod: isHOD?.toUpperCase() === "YES",
            staff_role: isHOD?.toUpperCase() === "YES" ? "HOD" : "Staff",
          };

          await Staff.updateOne(
            { _id: existingStaff._id },
            { $set: updatedData }
          );

          results.updated.push({
            staff_id,
            staff_name,
            note: "Data updated for existing staff",
          });
          results.summary.updated++;
          continue;
        }

        // Hash password for new staff
        const hashedPassword = await bcrypt.hash(staff_id.toString(), 10);

        // Prepare new staff data
        const staffData = {
          staff_id,
          staff_name,
          staff_mail,
          staff_phone,
          staff_handle_dept: departmentDoc._id,
          staff_handle_batch: batchDoc?._id || null,
          staff_handle_section: sectionDoc?._id || null,
          section_name: resolvedSectionName,
          isClassIncharge: isClassIncharge?.toUpperCase() === "YES",
          isMentor: isMentor?.toUpperCase() === "YES",
          isHod: isHOD?.toUpperCase() === "YES",
          password: hashedPassword,
          userType: "Staff",
          staff_role: isHOD?.toUpperCase() === "YES" ? "HOD" : "Staff",
        };

        await Staff.create(staffData);

        results.success.push({
          staff_id,
          staff_name,
          department,
          batch: batch || "Pending Assignment",
          section: resolvedSectionName || "Pending Assignment",
          roles: [
            isClassIncharge?.toUpperCase() === "YES" ? "Class Incharge" : "",
            isMentor?.toUpperCase() === "YES" ? "Mentor" : "",
            isHOD?.toUpperCase() === "YES" ? "HOD" : "",
          ]
            .filter(Boolean)
            .join(", "),
        });
        results.summary.successful++;
      } catch (error) {
        results.errors.push({
          staff_id: row[0] || "N/A",
          staff_name: row[1] || "N/A",
          error: error.message,
        });
        results.summary.errors++;
      }
    }

    return {
      message: "File processing completed",
      summary: results.summary,
      details: {
        successful: results.success,
        updated: results.updated,
        duplicates: results.duplicates,
        errors: results.errors,
      },
    };
  } catch (error) {
    console.error("Error processing Excel file:", error);
    throw error;
  }
}
