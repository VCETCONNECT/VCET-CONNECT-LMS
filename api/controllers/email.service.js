import nodemailer from "nodemailer";
import schedule from "node-schedule";
import LeaveRequest from "../models/leave.model.js";
import transporter from "../utils/transporter.js";
import ODRequest from "../models/od.model.js";
import Staff from "../models/staff.model.js";
import Batch from "../models/batch.model.js";
import { jsPDF } from "jspdf";
import Defaulter from "../models/defaulter.model.js";
import "jspdf-autotable";

export const changeMailSendTiming = (req, res) => {
  const { time } = req.body;
  if (!time) {
    return res.status(400).json({
      success: false,
      message: "Time is required",
    });
  }

  try {
    const [hours, minutes] = time.split(":");

    res.status(200).json({
      success: true,
      message: "Time changed successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "An error occurred while processing the time.",
    });
  }
};

export const sendEmail = async (to, subject, htmlContent) => {
  try {
    await transporter.sendMail({
      from: `"VCET CONNECT" <${process.env.EMAIL}>`,
      to,
      subject,
      html: htmlContent,
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        Importance: "high",
      },
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

const sendEmailWithAttachments = async (to, subject, htmlContent) => {
  try {
    await transporter.sendMail({
      from: `"VCET Connect" <${process.env.EMAIL}>`,
      to,
      subject,
      html: htmlContent,
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        Importance: "high",
      },
    });
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear().toString().slice(-2); // Get last two digits of the year
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month in two digits
  const day = date.getDate().toString().padStart(2, "0"); // Day in two digits
  return `${day}-${month}-${year}`;
};

const generateRequestsSection = (requests, isOd, isDefaulter) => {
  if (!Array.isArray(requests) || requests.length === 0) {
    return `
      <div style="text-align: center; padding: 15px; color: #666; background: #f8f9fa; border-radius: 4px;">
        No requests available at this time
      </div>
    `;
  }

  const getStatusStyle = (status) => {
    const colors = {
      approved: "#4CAF50",
      pending: "#FFA000",
      rejected: "#F44336",
    };
    return colors[status.toLowerCase()] || "#757575";
  };

  const requestsList = requests
    .map(
      (req) => `
    <div style="border: 1px solid #e0e0e0; border-radius: 4px; margin-bottom: 10px; background: white;">
      <!-- Header Section -->
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f8f9fa; border-bottom: 1px solid #e0e0e0;">
        <div style="font-weight: 500;">${
          req.name || req.studentName || "-"
        } <span style="color: #666; font-size: 12px; font-weight: normal;">${
        isDefaulter ? req.roll_no : req.rollNo || "-"
      }</span></div>
        ${
          !isDefaulter
            ? `<span style="font-size: 11px; padding: 3px 8px; border-radius: 12px; background: ${getStatusStyle(
                req.status
              )}15; color: ${getStatusStyle(req.status)};">
            ${req.status || "Pending"}
          </span>`
            : ""
        }
      </div>

      <!-- Content Section -->
      <div style="padding: 8px 12px;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; font-size: 12px;">
          <!-- Date Info -->
          <div>
            <span style="color: #666;">Date:</span>
            <span style="margin-left: 4px;">
              ${
                !isDefaulter
                  ? `${formatDate(req.fromDate)}${
                      req.toDate && req.fromDate !== req.toDate
                        ? ` - ${formatDate(req.toDate)}`
                        : ""
                    } • ${req.noOfDays || "-"}d`
                  : formatDate(req.entryDate)
              }
            </span>
          </div>

          <!-- Type/Reason Info -->
          <div>
            <span style="color: #666;">${
              isOd ? "Type" : isDefaulter ? "Category" : "Reason"
            }:</span>
            <span style="margin-left: 4px;">
              ${
                isOd || isDefaulter
                  ? `<span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; 
                    ${
                      isOd
                        ? "background: #E3F2FD; color: #1565C0;"
                        : "background: #FBE9E7; color: #D84315;"
                    }">
                    ${isOd ? req.odType : req.defaulterType || "-"}
                  </span>`
                  : req.reason || "-"
              }
            </span>
          </div>
        </div>

        ${
          isOd && req.odType === "External"
            ? `<div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #f0f0f0; font-size: 12px; color: #666;">
              Event: ${req.eventName || "-"} at ${req.collegeName || "-"}
            </div>`
            : ""
        }

        ${
          isDefaulter && req.defaulterType
            ? `<div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #f0f0f0; font-size: 12px; color: #666;">
              ${
                req.defaulterType === "Late"
                  ? `Time In: ${req.timeIn}`
                  : req.defaulterType === "Discipline and Dresscode"
                  ? `Observation: ${req.observation}`
                  : `Time In: ${req.timeIn} • Observation: ${req.observation}`
              }
            </div>`
            : ""
        }
      </div>
    </div>
  `
    )
    .join("");

  return `
    <div style="margin-bottom: 10px;">
      <div style="display: flex; align-items: center; margin-bottom: 8px;">
        <div style="flex-grow: 1; height: 1px; background: #e0e0e0;"></div>
        <h3 style="margin: 0 8px; color: #1a237e; font-size: 13px; text-transform: uppercase;">
          ${isOd ? "OD" : isDefaulter ? "Defaulter" : "Leave"} Requests
        </h3>
        <div style="flex-grow: 1; height: 1px; background: #e0e0e0;"></div>
      </div>
      ${requestsList}
    </div>
  `;
};

const generateEmailTemplate = (title, content) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          .request-card {
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            margin-bottom: 12px;
            background: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          }
          .card-header {
            border-bottom: 1px solid #e0e0e0;
            background: #f8f9fa;
            border-radius: 6px 6px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .card-content {
            padding: 12px;
          }
          .status-badge {
            padding: 3px 10px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 500;
          }
          .status-approved { background: #e8f5e9; color: #2e7d32; }
          .status-pending { background: #fff3e0; color: #f57c00; }
          .status-rejected { background: #ffebee; color: #c62828; }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 10px;
            margin-bottom: 10px;
          }
          .info-item {
            display: flex;
            flex-direction: column;
          }
          .info-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 2px;
          }
          .info-value {
            font-size: 13px;
            color: #333;
          }
          .section-header {
            font-size: 15px;
            font-weight: 600;
            color: #1a237e;
            margin: 20px 0 12px;
            padding-bottom: 6px;
            border-bottom: 2px solid #e0e0e0;
          }
          .download-link {
            display: inline-block;
            padding: 6px 12px;
            background: #1a237e;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 12px;
          }
          .summary-box {
            background: #f5f5f5;
            border-radius: 6px;
            padding: 12px;
            margin: 12px 0;
          }
          .summary-title {
            font-size: 13px;
            font-weight: 600;
            color: #333;
            margin-bottom: 6px;
          }
          .summary-count {
            font-size: 20px;
            font-weight: 700;
            color: #1a237e;
          }
        </style>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.4; color: #333; background-color: #f5f5f5; margin: 0; padding: 16px;">
        <div style="max-width: 800px; margin: 0 auto; background: white; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="background: #1a237e; padding: 16px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 20px;">${title}</h1>
            <p style="color: #e8eaf6; margin: 6px 0 0; font-size: 13px;">
              ${new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div style="padding: 16px;">${content}</div>
          <div style="background: #f8f9fa; padding: 12px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="color: #666; font-size: 11px; margin: 3px 0;">This is an automated summary from VCET Connect</p>
            <p style="color: #666; font-size: 11px; margin: 3px 0;">© ${new Date().getFullYear()} VCET Connect - Leave Management System</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

const generateEmailContent = (
  name,
  status,
  fromDate,
  toDate,
  comments,
  who
) => {
  return `
    <div style="padding: 20px;">
      <p>Dear ${name},</p>
      <p>Your request has been <strong>${status}</strong> by ${who}.</p>
      <p><strong>From:</strong> ${new Date(fromDate).toLocaleDateString()}</p>
      <p><strong>To:</strong> ${new Date(toDate).toLocaleDateString()}</p>
      <p><strong>Comments:</strong> ${comments || "No comments provided"}</p>
    </div>
  `;
};

export const notifyLeaveRequestStatus = async (
  email,
  name,
  status,
  fromDate,
  toDate,
  comments,
  who
) => {
  const emailSubject = `Leave Request ${
    status.charAt(0).toUpperCase() + status.slice(1)
  } by ${who}`;
  const emailContent = generateEmailContent(
    name,
    status,
    fromDate,
    toDate,
    comments,
    who
  );

  await sendEmail(email, emailSubject, emailContent);
};

export const notifyOdRequestStatus = async (
  email,
  name,
  status,
  fromDate,
  toDate,
  comments,
  who
) => {
  const emailSubject = `OD Request ${
    status.charAt(0).toUpperCase() + status.slice(1)
  } by ${who}`;
  const emailContent = generateEmailContent(
    name,
    status,
    fromDate,
    toDate,
    comments,
    who
  );

  await sendEmail(email, emailSubject, emailContent);
};

const generateRequestsTable = (requests, isOd, isDefaulter) => {
  if (!Array.isArray(requests) || requests.length === 0) {
    return `
      <div class="no-data">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
          <polyline points="13 2 13 9 20 9"></polyline>
        </svg>
        <p>No requests found</p>
      </div>
    `;
  }

  const getStatusBadge = (status) => {
    const statusClass =
      status.toLowerCase() === "approved"
        ? "status-approved"
        : status.toLowerCase() === "pending"
        ? "status-pending"
        : "status-rejected";

    return `<span class="status-badge ${statusClass}">${status}</span>`;
  };

  const headerRow = `
    <tr>
      <th>Name</th>
      <th>Roll No</th>
      <th>${!isDefaulter ? "Date(s)" : "Entry Date"}</th>
      <th>${isDefaulter || isOd ? "Type" : "Reason"}</th>
      <th>${
        !isDefaulter && isOd
          ? "Event Details"
          : !isDefaulter
          ? "Status"
          : "Details"
      }</th>
      ${isOd ? "<th>Status</th>" : ""}
    </tr>
  `;

  const rows = requests
    .map(
      (req) => `
      <tr>
        <td>${req.name || "-"}</td>
        <td>${isDefaulter ? req.roll_no : req.rollNo || "-"}</td>
        <td>
          ${
            !isDefaulter
              ? `<div class="date-cell">
                <div class="date-main">${new Date(
                  req.fromDate
                ).toLocaleDateString()}</div>
                ${
                  req.toDate && req.fromDate !== req.toDate
                    ? `<div class="date-to">to ${new Date(
                        req.toDate
                      ).toLocaleDateString()}</div>`
                    : ""
                }
                <div class="days-count">${req.noOfDays || "-"} day${
                  req.noOfDays > 1 ? "s" : ""
                }</div>
               </div>`
              : `<div class="date-cell">
                <div class="date-main">${new Date(
                  req.entryDate
                ).toLocaleDateString()}</div>
               </div>`
          }
      </td>
        <td>
          <div class="type-cell">
            ${
              isOd
                ? `<span class="type-badge od">${req.odType || "-"}</span>`
                : isDefaulter
                ? `<span class="type-badge defaulter">${
                    req.defaulterType || "-"
                  }</span>`
                : `<span class="type-badge leave">${req.reason || "-"}</span>`
            }
          </div>
      </td>
        <td>
          ${
            !isDefaulter
              ? isOd
                ? req.odType === "External"
                  ? `<div class="event-details">
                    <div class="event-name">${req.eventName || "-"}</div>
                    <div class="college-name">at ${req.collegeName || "-"}</div>
                   </div>`
                  : `<div class="reason-text">${req.reason || "-"}</div>`
                : getStatusBadge(req.status)
              : req.defaulterType === "Late"
              ? `<div class="time-in">${req.timeIn}</div>`
              : req.defaulterType === "Discipline and Dresscode"
              ? `<div class="observation-text">${req.observation}</div>`
              : req.defaulterType === "Both"
              ? `<div class="both-details">
                      <div class="time-in">Time In: ${req.timeIn}</div>
                      <div class="observation-text">Observation: ${req.observation}</div>
                     </div>`
              : "-"
          }
      </td>
        ${isOd ? `<td>${getStatusBadge(req.status || "Pending")}</td>` : ""}
    </tr>
    `
    )
    .join("");

  return `
    <div class="table-container">
      <div class="table-header">
        <div class="table-title">
        ${isOd ? "OD Requests" : isDefaulter ? "Defaulters" : "Leave Requests"}
      </div>
      </div>
      <div class="table-wrapper">
        <table>
          ${headerRow}
          ${rows}
        </table>
      </div>
    </div>
  `;
};

const generateConsolidatedPDF = async (leaves, ods, defaulters, deptName) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Helper function to add common header
  const addHeader = () => {
    doc.setFontSize(18);
    doc.text(
      "VELAMMAL COLLEGE OF ENGINEERING AND TECHNOLOGY",
      pageWidth / 2,
      20,
      { align: "center" }
    );

    doc.setFontSize(12);
    doc.text("(An Autonomous Institution)", pageWidth / 2, 30, {
      align: "center",
    });
    doc.text("Madurai - 625009", pageWidth / 2, 40, {
      align: "center",
    });

    doc.setFontSize(14);
    doc.text(
      `Department of Computer Science and Engineering`,
      pageWidth / 2,
      50,
      { align: "center" }
    );
    doc.text(
      `Daily Requests Summary - ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      60,
      { align: "center" }
    );
  };

  // Add first page header
  addHeader();
  let startY = 70;

  // Leave Requests Section
  if (leaves.length > 0) {
    doc.setFontSize(12);
    doc.text("Leave Requests", 14, startY);

    const leaveHeaders = [
      ["S.No", "Name", "Roll No", "Reason", "Duration", "Days", "Status"],
    ];
    const leaveData = leaves.map((req, index) => [
      index + 1,
      req.name || req.studentName,
      req.rollNo || req.roll_no,
      req.reason,
      `${formatDate(req.fromDate)}${
        req.toDate && req.fromDate !== req.toDate
          ? ` to ${formatDate(req.toDate)}`
          : ""
      }`,
      req.noOfDays || "1",
      req.status || "Pending",
    ]);

    doc.autoTable({
      head: leaveHeaders,
      body: leaveData,
      startY: startY + 5,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [31, 58, 110] },
      foot: [
        ["Total Leave Requests", "", "", "", "", "", leaves.length.toString()],
      ],
      footStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
    });
  }

  // Add new page for OD Requests
  if (ods.length > 0) {
    doc.addPage();
    addHeader();
    startY = 70;

    doc.setFontSize(12);
    doc.text("OD Requests", 14, startY);

    const odHeaders = [
      ["S.No", "Name", "Roll No", "Type", "Duration", "Days", "Status"],
    ];
    const odData = ods.map((req, index) => [
      index + 1,
      req.name || req.studentName,
      req.rollNo || req.roll_no,
      req.odType,
      `${formatDate(req.fromDate)}${
        req.toDate && req.fromDate !== req.toDate
          ? ` to ${formatDate(req.toDate)}`
          : ""
      }`,
      req.noOfDays || "1",
      req.status || "Pending",
    ]);

    doc.autoTable({
      head: odHeaders,
      body: odData,
      startY: startY + 5,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [31, 58, 110] },
      foot: [["Total OD Requests", "", "", "", "", "", ods.length.toString()]],
      footStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
    });
  }

  // Add new page for Defaulter Records
  if (defaulters.length > 0) {
    doc.addPage();
    addHeader();
    startY = 70;

    doc.setFontSize(12);
    doc.text("Defaulter Records", 14, startY);

    const defaulterHeaders = [
      [
        "S.No",
        "Name",
        "Roll No",
        "Type",
        "Time In",
        "Observation",
        "Entry Date",
      ],
    ];
    const defaulterData = defaulters.map((req, index) => [
      index + 1,
      req.name || req.studentName,
      req.rollNo || req.roll_no,
      req.defaulterType,
      req.timeIn || "-",
      req.observation || "-",
      formatDate(req.entryDate),
    ]);

    doc.autoTable({
      head: defaulterHeaders,
      body: defaulterData,
      startY: startY + 5,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [31, 58, 110] },
      foot: [
        [
          "Total Defaulter Records",
          "",
          "",
          "",
          "",
          "",
          defaulters.length.toString(),
        ],
      ],
      footStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
    });
  }

  // Add signature section to the last page
  const finalY = doc.previousAutoTable.finalY + 40;
  doc.text("For Office Use Only", pageWidth - 60, finalY);
  doc.line(pageWidth - 80, finalY + 20, pageWidth - 20, finalY + 20);
  doc.text("HEAD OF THE DEPARTMENT", pageWidth - 70, finalY + 30);

  // Add page numbers and footer to all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 10, {
      align: "right",
    });
    doc.text("Generated by VCET Connect", 20, pageHeight - 10);
  }

  return doc;
};

const sendHodConsolidatedEmails = async () => {
  try {
    // Get current date at midnight for comparison
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Find all HODs
    const hods = await Staff.find({ isHod: true }).lean();
    // Fetch all types of requests with date filter
    const leaveRequests = await LeaveRequest.find({
      fromDate: {
        $gte: currentDate,
        $lt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000),
      },
    })
      .populate({
        path: "userId",
        select: "batchId departmentId",
        populate: {
          path: "batchId",
          select: "batch_name",
        },
      })
      .populate("sectionId")
      .lean();

    const odRequests = await ODRequest.find({
      fromDate: {
        $gte: currentDate,
        $lt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000),
      },
    })
      .populate({
        path: "studentId",
        select: "batchId departmentId",
        populate: {
          path: "batchId",
          select: "batch_name",
        },
      })
      .populate("sectionId")
      .lean();

    const defaulterRequests = await Defaulter.find({
      entryDate: {
        $gte: currentDate,
        $lt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000),
      },
    })
      .populate({
        path: "studentId",
        select: "batchId departmentId",
        populate: {
          path: "batchId",
          select: "batch_name",
        },
      })
      .populate("sectionId")
      .lean();

    // Process for each HOD
    for (const hod of hods) {
      // Filter requests by department
      const deptLeaves = leaveRequests.filter(
        (req) =>
          req.userId?.departmentId?.toString() ===
          hod.staff_handle_dept?.toString()
      );

      const deptODs = odRequests.filter(
        (req) =>
          req.studentId?.departmentId?.toString() ===
          hod.staff_handle_dept?.toString()
      );

      const deptDefaulters = defaulterRequests.filter(
        (req) =>
          req.studentId?.departmentId?.toString() ===
          hod.staff_handle_dept?.toString()
      );

      // Group by batch and section
      const batchSectionRequests = {};

      // Helper function to initialize batch and section
      const initializeBatchSection = (request, batchId, sectionId) => {
        if (!batchSectionRequests[batchId]) {
          batchSectionRequests[batchId] = {
            batchName:
              request.userId?.batchId?.batch_name ||
              request.studentId?.batchId?.batch_name ||
              "No Batch",
            sections: {},
          };
        }

        if (!batchSectionRequests[batchId].sections[sectionId]) {
          batchSectionRequests[batchId].sections[sectionId] = {
            sectionName: request.sectionId?.section_name || "No Section",
            leaves: [],
            ods: [],
            defaulters: [],
          };
        }
      };

      // Process leave requests
      deptLeaves.forEach((request) => {
        const batchId =
          request.userId?.batchId?.batch_name?.toString() || "noBatch";
        const sectionId =
          request.sectionId?.section_name?.toString() || "noSection";
        initializeBatchSection(request, batchId, sectionId);
        batchSectionRequests[batchId].sections[sectionId].leaves.push(request);
      });

      // Process OD requests
      deptODs.forEach((request) => {
        const batchId =
          request.studentId?.batchId?.batch_name?.toString() || "noBatch";
        const sectionId =
          request.sectionId?.section_name?.toString() || "noSection";
        initializeBatchSection(request, batchId, sectionId);
        batchSectionRequests[batchId].sections[sectionId].ods.push(request);
      });

      // Process defaulter requests
      deptDefaulters.forEach((request) => {
        const batchId =
          request.studentId?.batchId?.batch_name?.toString() || "noBatch";
        const sectionId =
          request.sectionId?.section_name?.toString() || "noSection";
        initializeBatchSection(request, batchId, sectionId);
        batchSectionRequests[batchId].sections[sectionId].defaulters.push(
          request
        );
      });

      // Generate email content
      let emailContent = `
        <div style="background: #f8f9fa; border-radius: 8px;margin-bottom: 24px; border: 1px solid #e0e0e0;">
          <div style="font-size: 18px; font-weight: 500; color: #1976D2; margin-bottom: 16px; text-align: center;">Today's Request Summary</div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
            <div style="text-align: center; padding: 12px; background: white; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <span style="display: block; font-size: 24px; font-weight: 600; color: #4CAF50; margin-bottom: 4px;">${deptLeaves.length}</span>
              <span style="color: #666; font-size: 14px;">Leave Requests</span>
            </div>
            <div style="text-align: center; padding: 12px; background: white; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <span style="display: block; font-size: 24px; font-weight: 600; color: #1E88E5; margin-bottom: 4px;">${deptODs.length}</span>
              <span style="color: #666; font-size: 14px;">OD Requests</span>
            </div>
            <div style="text-align: center; padding: 12px; background: white; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <span style="display: block; font-size: 24px; font-weight: 600; color: #F44336; margin-bottom: 4px;">${deptDefaulters.length}</span>
              <span style="color: #666; font-size: 14px;">Defaulter Records</span>
            </div>
          </div>
        </div>
      `;

      // Generate consolidated PDF
      const consolidatedPDF = await generateConsolidatedPDF(
        deptLeaves,
        deptODs,
        deptDefaulters,
        hod.staff_name
      );

      // Sort and display content in email
      const sortedBatches = Object.entries(batchSectionRequests).sort((a, b) =>
        a[1].batchName.localeCompare(b[1].batchName)
      );

      for (const [batchId, batch] of sortedBatches) {
        emailContent += `<div class="section-header">Batch: ${batch.batchName}</div>`;

        const sortedSections = Object.entries(batch.sections).sort((a, b) =>
          a[1].sectionName.localeCompare(b[1].sectionName)
        );

        for (const [sectionId, section] of sortedSections) {
          emailContent += `<div class="section-header">Section: ${section.sectionName}</div>`;

          // Leave Requests
          if (section.leaves.length > 0) {
            emailContent += generateRequestsSection(
              section.leaves,
              false,
              false
            );
          }

          // OD Requests
          if (section.ods.length > 0) {
            emailContent += generateRequestsSection(section.ods, true, false);
          }

          // Defaulter Records
          if (section.defaulters.length > 0) {
            emailContent += generateRequestsSection(
              section.defaulters,
              false,
              true
            );
          }
        }
      }

      // Add download information
      emailContent += `
        <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; border: 1px solid #e0e0e0;">
          <p style="margin: 0; color: #1a237e; font-weight: 500;">📎 Attachments</p>
          <p style="margin: 8px 0 0; color: #666; font-size: 14px;">
            A consolidated PDF report containing all requests has been attached to this email for your reference.
          </p>
        </div>
      `;

      const html = generateEmailTemplate(
        `Department Requests Summary - ${hod.staff_name}`,
        emailContent
      );
      console.log("Sending email to", hod.staff_mail);
      // Send email with PDF attachment
      await transporter.sendMail({
        from: `"VCET Connect" <${process.env.EMAIL}>`,
        to: hod.staff_mail,
        subject: `Department Requests Summary`,
        html: html,
        attachments: [
          {
            filename: `Consolidated_Requests_${
              currentDate.toISOString().split("T")[0]
            }.pdf`,
            content: Buffer.from(consolidatedPDF.output("arraybuffer")),
            contentType: "application/pdf",
          },
        ],
      });
    }
  } catch (error) {
    console.error("Error sending HOD consolidated emails:", error);
  }
};

const sendStaffConsolidatedEmails = async () => {
  try {
    // Get current date at midnight for comparison
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Fetch all leave requests with date filter
    const leaveRequests = await LeaveRequest.find({
      fromDate: {
        $gte: currentDate,
        $lt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000),
      },
    })
      .populate({
        path: "userId",
        select: "batchId",
      })
      .populate("mentorId")
      .populate("classInchargeId")
      .populate("sectionId")
      .lean();

    // Fetch all OD requests with date filter
    const odRequests = await ODRequest.find({
      fromDate: {
        $gte: currentDate,
        $lt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000),
      },
    })
      .populate({
        path: "studentId",
        select: "batchId",
      })
      .populate("mentorId")
      .populate("classInchargeId")
      .populate("sectionId")
      .lean();

    const defaulterRequests = await Defaulter.find({
      entryDate: {
        $gte: currentDate,
        $lt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000),
      },
    })
      .populate("studentId")
      .populate("sectionId")
      .populate("mentorId")
      .populate("classInchargeId")
      .lean();

    const staffRequests = {};

    // Process leave requests
    leaveRequests.forEach((request) => {
      const mentorId = request.mentorId?._id?.toString();
      const classInchargeId = request.classInchargeId?._id?.toString();

      if (mentorId) {
        if (!staffRequests[mentorId]) {
          staffRequests[mentorId] = {
            email: request.mentorId.staff_mail,
            name: request.mentorId.staff_name,
            role: "Mentor",
            leaves: [],
            ods: [],
            defaulters: [],
          };
        }
        staffRequests[mentorId].leaves.push(request);
      }

      if (classInchargeId) {
        if (!staffRequests[classInchargeId]) {
          staffRequests[classInchargeId] = {
            email: request.classInchargeId.staff_mail,
            name: request.classInchargeId.staff_name,
            role: "Class Incharge",
            leaves: [],
            ods: [],
            defaulters: [],
          };
        }
        staffRequests[classInchargeId].leaves.push(request);
      }
    });

    // Process OD requests
    odRequests.forEach((request) => {
      const mentorId = request.mentorId?._id?.toString();
      const classInchargeId = request.classInchargeId?._id?.toString();

      if (mentorId) {
        if (!staffRequests[mentorId]) {
          staffRequests[mentorId] = {
            email: request.mentorId.staff_mail,
            name: request.mentorId.staff_name,
            role: "Mentor",
            leaves: [],
            ods: [],
            defaulters: [],
          };
        }
        staffRequests[mentorId].ods.push(request);
      }

      if (classInchargeId) {
        if (!staffRequests[classInchargeId]) {
          staffRequests[classInchargeId] = {
            email: request.classInchargeId.staff_mail,
            name: request.classInchargeId.staff_name,
            role: "Class Incharge",
            leaves: [],
            ods: [],
            defaulters: [],
          };
        }
        staffRequests[classInchargeId].ods.push(request);
      }
    });

    // Process defaulter requests
    defaulterRequests.forEach((request) => {
      const mentorId = request.mentorId?._id?.toString();
      const classInchargeId = request.classInchargeId?._id?.toString();

      if (mentorId) {
        if (!staffRequests[mentorId]) {
          staffRequests[mentorId] = {
            email: request.mentorId.staff_mail,
            name: request.mentorId.staff_name,
            role: "Mentor",
            leaves: [],
            ods: [],
            defaulters: [],
          };
        }
        staffRequests[mentorId].defaulters.push(request);
      }

      if (classInchargeId) {
        if (!staffRequests[classInchargeId]) {
          staffRequests[classInchargeId] = {
            email: request.classInchargeId.staff_mail,
            name: request.classInchargeId.staff_name,
            role: "Class Incharge",
            leaves: [],
            ods: [],
            defaulters: [],
          };
        }
        staffRequests[classInchargeId].defaulters.push(request);
      }
    });

    // Send emails to each staff member
    for (const staffId in staffRequests) {
      const { email, name, role, leaves, ods, defaulters } =
        staffRequests[staffId];
      let emailContent = "";

      emailContent += `<h2>Dear ${name} (${role}),</h2>`;
      emailContent += `<p>Here is your daily summary of student requests:</p>`;

      // Add tables to email content
      if (leaves.length > 0)
        emailContent += generateRequestsSection(leaves, false, false);
      if (ods.length > 0)
        emailContent += generateRequestsSection(ods, true, false);
      if (defaulters.length > 0)
        emailContent += generateRequestsSection(defaulters, false, true);

      const html = generateEmailTemplate(
        `Daily Request Summary - ${role}`,
        emailContent
      );
      console.log("Sending email to", email);
      // Send email without Excel attachment
      await sendEmailWithAttachments(
        email,
        `Daily Request Summary - ${role}`,
        html
      );
    }
  } catch (error) {
    console.error("Error sending staff consolidated emails:", error);
  }
};

// sendStaffConsolidatedEmails();
// sendHodConsolidatedEmails();

export const scheduleEmails = () => {
  schedule.scheduleJob("40 3 * * *", async () => {
    try {
      await sendStaffConsolidatedEmails();
      await sendHodConsolidatedEmails();
    } catch (error) {
      console.error("Error in scheduled email sending:", error);
    }
  });
};

// Start the scheduler
scheduleEmails();
