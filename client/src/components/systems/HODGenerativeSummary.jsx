import axios from "axios";
import React, { useEffect, useState } from "react";
import { formatDate } from "../../utils/formatDate";
import { ChevronLeft, ChevronRight, Calendar, Download } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const HODGenerativeSummary = ({ currentUser }) => {
  const [summaryData, setSummaryData] = useState({
    leaveRequests: [],
    odRequests: [],
    defaulters: [],
    loading: true,
    error: null,
  });

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const navigateDate = (direction) => {
    const currentDate = new Date(selectedDate);
    const newDate = new Date(currentDate);

    if (direction === "prev") {
      newDate.setDate(currentDate.getDate() - 1);
    } else if (direction === "next") {
      newDate.setDate(currentDate.getDate() + 1);
    }

    setSelectedDate(newDate.toISOString().split("T")[0]);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.departmentId) return;

      try {
        const [leaveRes, odRes, defaultersRes] = await Promise.all([
          axios.get(
            `/api/department/${currentUser.departmentId}/leaveRequests`
          ),
          axios.get(`/api/department/${currentUser.departmentId}/odRequests`),
          axios.get(`/api/department/${currentUser.departmentId}/defaulters`),
        ]);

        setSummaryData({
          leaveRequests: leaveRes.data || [],
          odRequests: odRes.data || [],
          defaulters: defaultersRes.data || [],
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setSummaryData((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to fetch data",
        }));
      }
    };

    fetchData();
  }, [currentUser?.departmentId, selectedDate]);

  if (summaryData.loading) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-400">
        Loading department summary...
      </div>
    );
  }

  if (summaryData.error) {
    return (
      <div className="text-center text-red-600 dark:text-red-400">
        {summaryData.error}
      </div>
    );
  }

  // Filter requests for selected date based on createdAt
  const todayRequests = summaryData.leaveRequests.filter((request) => {
    const selectedDateTime = new Date(selectedDate);
    const fromDate = new Date(request.fromDate);
    const toDate = new Date(request.toDate || request.fromDate); // Handle single day leaves

    // Check if the selected date falls within the leave period
    return selectedDateTime >= fromDate && selectedDateTime <= toDate;
  });

  // Update the filtering logic for todayODRequests
  // Update the filtering logic for todayODRequests
  const todayODRequests = summaryData.odRequests.filter((request) => {
    const selectedDateTime = new Date(selectedDate);
    const fromDate = new Date(request.fromDate);
    const toDate = new Date(request.toDate || request.fromDate); // Handle single day OD
    return selectedDateTime >= fromDate && selectedDateTime <= toDate;
  });

  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper function to group requests by batch and section
  const groupRequestsByBatchAndSection = (requests) => {
    return requests.reduce((acc, request) => {
      // Get batch and section info from the populated data
      const batchName = request.sectionId?.Batch?.batch_name || "Unknown Batch";
      const sectionName = request.sectionId?.section_name || "Unknown Section";
      const key = `${batchName}-${sectionName}`;

      if (!acc[key]) {
        acc[key] = {
          batchName,
          sectionName,
          requests: [],
        };
      }
      acc[key].requests.push(request);
      return acc;
    }, {});
  };

  const renderRequestsTable = (requests, type) => {
    const groupedRequests = groupRequestsByBatchAndSection(requests);

    const getApprovalStatus = (approval) => {
      if (!approval) return null;
      switch (approval.status) {
        // case "approved":
        //   return (
        //     <span className="text-xs text-green-600 ml-1">(Approved)</span>
        //   );
        case "rejected":
          return <span className="text-xs text-red-600 ml-1">(Rejected)</span>;
        case "pending":
          return (
            <span className="text-xs text-yellow-600 ml-1">(Pending)</span>
          );
        default:
          return null;
      }
    };

    // Sort groups by batch name (descending) and section name
    const sortedGroups = Object.values(groupedRequests).sort((a, b) => {
      // First sort by batch name in descending order
      if (a.batchName !== b.batchName) {
        return b.batchName.localeCompare(a.batchName); // Reversed comparison for descending
      }
      // Then sort by section name in ascending order
      return a.sectionName.localeCompare(b.sectionName);
    });

    return sortedGroups.map((group, index) => (
      <div key={index} className="mb-4 last:mb-0">
        <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {group.batchName}
            </span>
            <span className="text-gray-400 dark:text-gray-500">•</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {group.sectionName}
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {group.requests.length} {type === "leave" ? "Leave" : "OD"} Request
            {group.requests.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                  Student
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                  Mentor
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                  Class Incharge
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/6">
                  Reason
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {group.requests
                .sort((a, b) => {
                  // Sort requests by section name within each group
                  const sectionA = a.sectionId?.section_name || "";
                  const sectionB = b.sectionId?.section_name || "";
                  return sectionA.localeCompare(sectionB);
                })
                .map((request, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">{request.name}</div>
                      <div className="text-xs text-gray-500">
                        {request.rollNo}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        {request.mentorId?.staff_name || "Not Assigned"}
                        {getApprovalStatus(request.approvals?.mentor)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        {request.classInchargeId?.staff_name || "Not Assigned"}
                        {getApprovalStatus(request.approvals?.classIncharge)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        {type === "leave" ? request.reason : request.purpose}
                        {type === "leave" && request.forMedical && (
                          <span className="ml-2 text-xs text-red-500">
                            (Medical)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          request.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : request.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {request.status?.charAt(0).toUpperCase() +
                          request.status?.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    ));
  };

  // Add this function to generate the report
  const downloadDayReport = () => {
    // Group requests by batch and status
    const groupRequestsByBatch = (requests) => {
      const grouped = requests.reduce((acc, req) => {
        const batchName = req.sectionId?.Batch?.batch_name || "Unknown Batch";
        if (!acc[batchName]) {
          acc[batchName] = {
            approved: [],
            pending: [],
          };
        }
        if (req.status === "approved") {
          acc[batchName].approved.push(req);
        } else if (req.status === "pending") {
          acc[batchName].pending.push(req);
        }
        return acc;
      }, {});

      // Sort batches in descending order
      return Object.fromEntries(
        Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]))
      );
    };

    const batchWiseLeaves = groupRequestsByBatch(todayRequests);
    const batchWiseOD = groupRequestsByBatch(todayODRequests);
    const activeDefaulters = summaryData.defaulters.filter(
      (def) => !def.isDone
    );

    // Sort defaulters by batch in descending order
    const sortedDefaulters = activeDefaulters.sort((a, b) => {
      const batchA = a.batchName || "Unknown";
      const batchB = b.batchName || "Unknown";
      if (batchA !== batchB) {
        return batchB.localeCompare(batchA);
      }
      // If batches are same, sort by section
      const sectionA = a.sectionName || "Unknown";
      const sectionB = b.sectionName || "Unknown";
      return sectionA.localeCompare(sectionB);
    });

    // Create PDF document
    const doc = new jsPDF();

    // Function to add main header (only for first page)
    const addMainHeader = () => {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(
        "VELAMMAL COLLEGE OF ENGINEERING AND TECHNOLOGY",
        doc.internal.pageSize.width / 2,
        15,
        { align: "center" }
      );
      doc.setFontSize(12);
      doc.text(
        "An Autonomous Institution",
        doc.internal.pageSize.width / 2,
        22,
        {
          align: "center",
        }
      );
      doc.setFontSize(11);
      doc.text(
        "Madurai - Rameshwaram Highway, Madurai - 625009",
        doc.internal.pageSize.width / 2,
        29,
        { align: "center" }
      );

      // Add report title
      doc.setFontSize(12);
      doc.text(`Computer Science and Engineering Department`, 15, 42);
      doc.text(`Date: ${formatDisplayDate(selectedDate)}`, 15, 49);
      doc.text("Daily Department Report", doc.internal.pageSize.width / 2, 56, {
        align: "center",
      });
      return 71; // Return starting Y position after header
    };

    // Function to add section title
    const addSectionTitle = (title, startY) => {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(title, doc.internal.pageSize.width / 2, startY, {
        align: "center",
      });
      return startY + 15;
    };

    // Function to add batch-wise table
    const addBatchTable = (batchName, requests, title, startY) => {
      if (requests.length > 0) {
        doc.setFontSize(11);
        doc.text(`${title} - ${batchName}:`, 15, startY - 5);

        const getStaffStatus = (staff, approval) => {
          if (!staff) return "Not Assigned";
          if (!approval || approval.status === "pending") {
            return `${staff.staff_name} (pending)`;
          }
          return staff.staff_name; // Just return staff name if approved/rejected
        };

        // Sort requests by section name
        const sortedRequests = requests.sort((a, b) => {
          const sectionA = a.sectionId?.section_name || "";
          const sectionB = b.sectionId?.section_name || "";
          return sectionA.localeCompare(sectionB);
        });

        doc.autoTable({
          startY: startY,
          head: [
            [
              "S.No",
              "Name",
              "Roll No",
              "Sec.",
              "Mentor",
              "Class Incharge",
              "Reason",
            ],
          ],
          body: sortedRequests.map((req, index) => [
            index + 1,
            req.name,
            req.rollNo,
            req.sectionId?.section_name || "Unknown",
            getStaffStatus(req.mentorId, req.approvals?.mentor),
            getStaffStatus(req.classInchargeId, req.approvals?.classIncharge),
            req.reason || req.purpose,
          ]),
          theme: "grid",
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [71, 85, 105] },
          columnStyles: {
            0: { cellWidth: 8 }, // S.No
            1: { cellWidth: 35 }, // Name
            2: { cellWidth: 20 }, // Roll No
            3: { cellWidth: 10 }, // Section
            4: { cellWidth: 35 }, // Mentor
            5: { cellWidth: 35 }, // Class Incharge
            6: { cellWidth: "auto" }, // Reason
          },
        });
        return doc.previousAutoTable.finalY + 15;
      }
      return startY;
    };

    // Start with main header on first page
    let currentY = addMainHeader();
    let hasContent = false;

    // Add Leave Requests
    const approvedLeaves = Object.entries(batchWiseLeaves).filter(
      ([_, { approved }]) => approved.length > 0
    );

    if (approvedLeaves.length > 0) {
      hasContent = true;
      currentY = addSectionTitle("Leave Requests Report", currentY);
      approvedLeaves.forEach(([batchName, { approved }]) => {
        currentY = addBatchTable(
          batchName,
          approved,
          "Approved Leave Requests",
          currentY
        );
        if (currentY > doc.internal.pageSize.height - 40) {
          doc.addPage();
          currentY = 20;
        }
      });
    }

    // Add OD Requests
    const approvedOD = Object.entries(batchWiseOD).filter(
      ([_, { approved }]) => approved.length > 0
    );

    if (approvedOD.length > 0) {
      hasContent = true;
      if (currentY > doc.internal.pageSize.height - 100) {
        doc.addPage();
        currentY = 20;
      }
      currentY = addSectionTitle("On-Duty Requests Report", currentY);
      approvedOD.forEach(([batchName, { approved }]) => {
        currentY = addBatchTable(
          batchName,
          approved,
          "Approved OD Requests",
          currentY
        );
        if (currentY > doc.internal.pageSize.height - 40) {
          doc.addPage();
          currentY = 20;
        }
      });
    }

    // Add Defaulters List
    if (activeDefaulters.length > 0) {
      hasContent = true;
      if (currentY > doc.internal.pageSize.height - 100) {
        doc.addPage();
        currentY = 20;
      }
      currentY = addSectionTitle("Defaulters Report", currentY);
      doc.autoTable({
        startY: currentY,
        head: [
          ["S.No", "Name", "Roll No", "Batch", "Section", "Type", "Remarks"],
        ],
        body: sortedDefaulters.map((defaulter, index) => [
          index + 1,
          defaulter.name,
          defaulter.roll_no,
          defaulter.batchName || "Unknown",
          defaulter.sectionName || "Unknown",
          defaulter.defaulterType,
          defaulter.remarks || defaulter.observation || "N/A",
        ]),
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [71, 85, 105] },
      });
      currentY = doc.previousAutoTable.finalY + 15;
    }

    // Add Pending Requests
    const pendingLeaves = Object.values(batchWiseLeaves).flatMap(
      (batch) => batch.pending
    );
    const pendingOD = Object.values(batchWiseOD).flatMap(
      (batch) => batch.pending
    );

    if (pendingLeaves.length > 0 || pendingOD.length > 0) {
      hasContent = true;
      if (currentY > doc.internal.pageSize.height - 100) {
        doc.addPage();
        currentY = 20;
      }
      currentY = addSectionTitle("Pending Requests Report", currentY);

      if (pendingLeaves.length > 0) {
        const pendingLeavesByBatch = pendingLeaves.reduce((acc, req) => {
          const batchName = req.sectionId?.Batch?.batch_name || "Unknown Batch";
          if (!acc[batchName]) acc[batchName] = [];
          acc[batchName].push(req);
          return acc;
        }, {});

        // Sort batches in descending order
        const sortedBatches = Object.entries(pendingLeavesByBatch).sort(
          (a, b) => b[0].localeCompare(a[0])
        );

        for (const [batchName, requests] of sortedBatches) {
          currentY = addBatchTable(
            batchName,
            requests,
            "Pending Leave Requests",
            currentY
          );
          if (currentY > doc.internal.pageSize.height - 40) {
            doc.addPage();
            currentY = 20;
          }
        }
      }

      if (pendingOD.length > 0) {
        const pendingODByBatch = pendingOD.reduce((acc, req) => {
          const batchName = req.sectionId?.Batch?.batch_name || "Unknown Batch";
          if (!acc[batchName]) acc[batchName] = [];
          acc[batchName].push(req);
          return acc;
        }, {});

        // Sort batches in descending order
        const sortedBatches = Object.entries(pendingODByBatch).sort((a, b) =>
          b[0].localeCompare(a[0])
        );

        for (const [batchName, requests] of sortedBatches) {
          currentY = addBatchTable(
            batchName,
            requests,
            "Pending OD Requests",
            currentY
          );
          if (currentY > doc.internal.pageSize.height - 40) {
            doc.addPage();
            currentY = 20;
          }
        }
      }
    }

    if (!hasContent) {
      currentY = addSectionTitle("No Requests Found", currentY);
      doc.setFontSize(10);
      doc.text(
        "There are no leave requests, OD requests, or defaulters for the selected date.",
        doc.internal.pageSize.width / 2,
        currentY + 10,
        { align: "center" }
      );
    }

    // Add signature on the last page
    if (currentY > doc.internal.pageSize.height - 100) {
      doc.addPage();
      currentY = doc.internal.pageSize.height - 80;
    } else {
      currentY = doc.internal.pageSize.height - 80;
    }

    doc.setFontSize(11);
    doc.text("For Office Use Only", doc.internal.pageSize.width / 2, currentY, {
      align: "center",
    });
    currentY += 20;
    doc.line(
      doc.internal.pageSize.width / 2 - 30,
      currentY,
      doc.internal.pageSize.width / 2 + 30,
      currentY
    );
    currentY += 5;
    doc.text(
      "HEAD OF THE DEPARTMENT",
      doc.internal.pageSize.width / 2,
      currentY,
      { align: "center" }
    );

    // Add footer to all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Generated on: ${new Date().toLocaleString()}`,
        15,
        doc.internal.pageSize.height - 10
      );
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 25,
        doc.internal.pageSize.height - 10
      );
    }

    // Save the PDF
    doc.save(
      `Computer Science and Engineering_Daily_Report_${selectedDate}.pdf`
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Compact Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold">Department Summary</h2>
            <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700/50 rounded-md p-1">
              <button
                onClick={() => navigateDate("prev")}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none text-sm w-32 p-0 focus:ring-0"
              />
              <button
                onClick={() => navigateDate("next")}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
              Leaves: {todayRequests.length}
            </span>
            <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full">
              OD: {todayODRequests.length}
            </span>
            <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full">
              Defaulters: {summaryData.defaulters.length}
            </span>
            <button
              onClick={downloadDayReport}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-400 text-white rounded-md hover:bg-blue-500 transition-colors"
              title="Download approved requests report"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Requests Sections */}
      <div className="space-y-6">
        {/* Leave Requests */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-semibold">Leave Requests</h3>
          </div>
          {todayRequests.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No leave requests for {formatDisplayDate(selectedDate)}
            </div>
          ) : (
            renderRequestsTable(todayRequests, "leave")
          )}
        </div>

        {/* OD Requests */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-semibold">OD Requests</h3>
          </div>
          {todayODRequests.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No OD requests for {formatDisplayDate(selectedDate)}
            </div>
          ) : (
            renderRequestsTable(todayODRequests, "od")
          )}
        </div>
      </div>
    </div>
  );
};

export default HODGenerativeSummary;
