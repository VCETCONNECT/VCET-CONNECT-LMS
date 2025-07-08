import React, { useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  Users,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Tabs, Modal, Button } from "flowbite-react";
import * as XLSX from "xlsx";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

const AttandanceCalander = ({ leaveRequests, odRequests }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const generateCalendarDays = (
    leaves = [],
    ods = [],
    selectedMonth = new Date()
  ) => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const calendarDays = [];

    // Previous month days
    for (let i = 0; i < startingDay; i++) {
      const date = new Date(year, month, -startingDay + i + 1);
      calendarDays.push({
        date,
        dayOfMonth: date.getDate(),
        isCurrentMonth: false,
        isToday: false,
        leaves: [],
        ods: [],
      });
    }

    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();

      const dayLeaves = leaves.filter((request) => {
        const fromDate = new Date(request.fromDate);
        const toDate = new Date(request.toDate);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);
        date.setHours(12, 0, 0, 0);
        return date >= fromDate && date <= toDate;
      });

      const dayODs = ods.filter((request) => {
        const fromDate = new Date(request.fromDate);
        const toDate = new Date(request.toDate);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);
        date.setHours(12, 0, 0, 0);
        return date >= fromDate && date <= toDate;
      });

      calendarDays.push({
        date,
        dayOfMonth: i,
        isCurrentMonth: true,
        isToday,
        leaves: dayLeaves,
        ods: dayODs,
      });
    }

    // Next month days
    const remainingDays = 42 - calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      calendarDays.push({
        date,
        dayOfMonth: date.getDate(),
        isCurrentMonth: false,
        isToday: false,
        leaves: [],
        ods: [],
      });
    }

    return calendarDays;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status, type) => {
    if (type === "Defaulter")
      return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/30";
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/30";
      case "rejected":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/30";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/30";
      default:
        return "bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Leave":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/30";
      case "OD":
        return "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800/30";
      case "Defaulter":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/30";
      default:
        return "bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
    }
  };

  const DayDetailsModal = ({ date, leaves, ods, onClose }) => (
    <Modal show={true} onClose={onClose} size="md">
      <Modal.Header className="border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Requests for {formatDate(date)}
        </h3>
      </Modal.Header>
      <Modal.Body className="bg-white dark:bg-gray-800">
        <Tabs>
          {leaves.length > 0 && (
            <Tabs.Item active title={`Leave Requests (${leaves.length})`}>
              <div className="space-y-3">
                {leaves.map((req) => (
                  <div
                    key={req._id}
                    className={`p-3 rounded-lg transition-colors duration-300 ${
                      req.forMedical
                        ? "bg-red-50 dark:bg-red-900/10 text-red-900 dark:text-red-100"
                        : "bg-blue-50 dark:bg-blue-900/10 text-blue-900 dark:text-blue-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{req.name}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                          req.approvals.mentor.status === "approved" &&
                            req.approvals.classIncharge.status === "approved"
                            ? "approved"
                            : req.approvals.mentor.status === "rejected" ||
                              req.approvals.classIncharge.status === "rejected"
                            ? "rejected"
                            : "pending"
                        )}`}
                      >
                        {req.approvals.mentor.status === "approved" &&
                        req.approvals.classIncharge.status === "approved"
                          ? "Approved"
                          : req.approvals.mentor.status === "rejected" ||
                            req.approvals.classIncharge.status === "rejected"
                          ? "Rejected"
                          : "Pending"}
                      </span>
                    </div>
                    <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                      {req.reason}
                    </p>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <div>From: {formatDate(req.fromDate)}</div>
                      <div>To: {formatDate(req.toDate)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Tabs.Item>
          )}
          {ods.length > 0 && (
            <Tabs.Item title={`OD Requests (${ods.length})`}>
              <div className="space-y-3">
                {ods.map((req) => (
                  <div
                    key={req._id}
                    className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/10 text-purple-900 dark:text-purple-100 transition-colors duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{req.name}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                          req.approvals.mentor.status === "approved" &&
                            req.approvals.classIncharge.status === "approved"
                            ? "approved"
                            : req.approvals.mentor.status === "rejected" ||
                              req.approvals.classIncharge.status === "rejected"
                            ? "rejected"
                            : "pending"
                        )}`}
                      >
                        {req.approvals.mentor.status === "approved" &&
                        req.approvals.classIncharge.status === "approved"
                          ? "Approved"
                          : req.approvals.mentor.status === "rejected" ||
                            req.approvals.classIncharge.status === "rejected"
                          ? "Rejected"
                          : "Pending"}
                      </span>
                    </div>
                    <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                      {req.reason}
                    </p>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <div>From: {formatDate(req.fromDate)}</div>
                      <div>To: {formatDate(req.toDate)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Tabs.Item>
          )}
          {leaves.length === 0 && ods.length === 0 && (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              No requests for this date
            </div>
          )}
        </Tabs>
      </Modal.Body>
    </Modal>
  );

  const generateMonthlyReport = () => {
    // Get the first and last day of selected month
    const firstDay = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth(),
      1
    );
    const lastDay = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth() + 1,
      0
    );

    // Filter requests for selected month
    const monthLeaves = leaveRequests.filter((req) => {
      const fromDate = new Date(req.fromDate);
      const toDate = new Date(req.toDate);
      return (
        (fromDate >= firstDay && fromDate <= lastDay) ||
        (toDate >= firstDay && toDate <= lastDay)
      );
    });

    const monthODs = odRequests.filter((req) => {
      const fromDate = new Date(req.fromDate);
      const toDate = new Date(req.toDate);
      return (
        (fromDate >= firstDay && fromDate <= lastDay) ||
        (toDate >= firstDay && toDate <= lastDay)
      );
    });

    // Prepare data for Excel
    const leaveData = monthLeaves.map((req) => ({
      "Request Type": req.forMedical ? "Medical Leave" : "Regular Leave",
      "Student Name": req.name,
      "From Date": formatDate(req.fromDate),
      "To Date": formatDate(req.toDate),
      "No. of Days": req.noOfDays,
      Reason: req.reason,
      "Mentor Status": req.approvals.mentor.status,
      "Class Incharge Status": req.approvals.classIncharge.status,
      "Mentor Comment": req.mentorcomment || "No Comments",
      "Class Incharge Comment": req.classInchargeComment || "No Comments",
    }));

    const odData = monthODs.map((req) => ({
      "Request Type": "OD",
      "Student Name": req.name,
      "From Date": formatDate(req.fromDate),
      "To Date": formatDate(req.toDate),
      "No. of Days": req.noOfDays,
      Reason: req.reason,
      "Mentor Status": req.approvals.mentor.status,
      "Class Incharge Status": req.approvals.classIncharge.status,
      "Mentor Comment": req.mentorcomment || "No Comments",
      "Class Incharge Comment": req.classInchargeComment || "No Comments",
    }));

    // Combine all data
    const allData = [...leaveData, ...odData];

    // Create workbook and add data
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(allData);
    XLSX.utils.book_append_sheet(wb, ws, "Monthly Report");

    // Save file
    const fileName = `Requests_${selectedMonth.toLocaleString("default", {
      month: "long",
      year: "numeric",
    })}.xlsx`;

    XLSX.writeFile(wb, fileName);
  };

  // Analytics Functions
  const getMonthlyStats = () => {
    const currentMonth = selectedMonth.getMonth();
    const currentYear = selectedMonth.getFullYear();

    // Filter requests for current month
    const monthLeaves = leaveRequests.filter((req) => {
      const date = new Date(req.fromDate);
      return (
        date.getMonth() === currentMonth && date.getFullYear() === currentYear
      );
    });

    const monthODs = odRequests.filter((req) => {
      const date = new Date(req.fromDate);
      return (
        date.getMonth() === currentMonth && date.getFullYear() === currentYear
      );
    });

    // Calculate total days of absence
    const totalLeaveDays = monthLeaves.reduce(
      (acc, req) => acc + req.noOfDays,
      0
    );
    const totalODDays = monthODs.reduce((acc, req) => acc + req.noOfDays, 0);

    // Get unique students who took leaves/ODs
    const uniqueStudentsLeave = new Set(monthLeaves.map((req) => req.name));
    const uniqueStudentsOD = new Set(monthODs.map((req) => req.name));

    return {
      totalLeaveDays,
      totalODDays,
      uniqueStudentsLeave: uniqueStudentsLeave.size,
      uniqueStudentsOD: uniqueStudentsOD.size,
      totalRequests: monthLeaves.length + monthODs.length,
      medicalLeaves: monthLeaves.filter((req) => req.forMedical).length,
    };
  };

  const getAttendanceDistribution = () => {
    const stats = getMonthlyStats();
    return [
      { name: "Medical Leaves", value: stats.medicalLeaves, color: "#EF4444" },
      {
        name: "Regular Leaves",
        value: stats.totalRequests - stats.medicalLeaves,
        color: "#3B82F6",
      },
      { name: "OD Requests", value: stats.uniqueStudentsOD, color: "#8B5CF6" },
    ];
  };

  const getDailyDistribution = () => {
    const currentMonth = selectedMonth.getMonth();
    const currentYear = selectedMonth.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const dailyData = Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      leaves: 0,
      ods: 0,
    }));

    // Count leaves and ODs for each day
    leaveRequests.forEach((req) => {
      const startDate = new Date(req.fromDate);
      const endDate = new Date(req.toDate);

      if (
        startDate.getMonth() === currentMonth &&
        startDate.getFullYear() === currentYear
      ) {
        for (
          let d = startDate.getDate();
          d <= Math.min(endDate.getDate(), daysInMonth);
          d++
        ) {
          dailyData[d - 1].leaves++;
        }
      }
    });

    odRequests.forEach((req) => {
      const startDate = new Date(req.fromDate);
      const endDate = new Date(req.toDate);

      if (
        startDate.getMonth() === currentMonth &&
        startDate.getFullYear() === currentYear
      ) {
        for (
          let d = startDate.getDate();
          d <= Math.min(endDate.getDate(), daysInMonth);
          d++
        ) {
          dailyData[d - 1].ods++;
        }
      }
    });

    return dailyData;
  };

  // Analytics Section Component
  const AnalyticsSection = () => {
    const stats = getMonthlyStats();
    const COLORS = ["#EF4444", "#3B82F6", "#8B5CF6"];

    return (
      <div className="mb-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Requests
                </p>
                <p className="text-xl font-bold text-blue-600">
                  {stats.totalRequests}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Clock className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Days Off
                </p>
                <p className="text-xl font-bold text-purple-600">
                  {stats.totalLeaveDays + stats.totalODDays}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Medical Leaves
                </p>
                <p className="text-xl font-bold text-red-600">
                  {stats.medicalLeaves}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Users className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Students with OD
                </p>
                <p className="text-xl font-bold text-green-600">
                  {stats.uniqueStudentsOD}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribution Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Request Distribution</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getAttendanceDistribution()}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={windowWidth < 768 ? 40 : 60}
                    outerRadius={windowWidth < 768 ? 70 : 100}
                    paddingAngle={2}
                  >
                    {getAttendanceDistribution().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Distribution Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Daily Distribution</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getDailyDistribution()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="leaves" name="Leaves" fill="#3B82F6" />
                  <Bar dataKey="ods" name="OD Requests" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Attendance Dashboard
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-100 rounded-sm"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Leave
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-100 rounded-sm"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Medical
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-purple-100 rounded-sm"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  OD
                </span>
              </div>
            </div>
          </div>

          {/* Analytics Section */}
          <AnalyticsSection />

          {/* Month Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => {
                const newDate = new Date(selectedMonth);
                newDate.setMonth(selectedMonth.getMonth() - 1);
                setSelectedMonth(newDate);
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {selectedMonth.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <Button
                size="sm"
                onClick={generateMonthlyReport}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
              >
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            </div>
            <button
              onClick={() => {
                const newDate = new Date(selectedMonth);
                newDate.setMonth(selectedMonth.getMonth() + 1);
                setSelectedMonth(newDate);
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          <div className="grid grid-cols-7 gap-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2"
              >
                {day}
              </div>
            ))}

            {generateCalendarDays(leaveRequests, odRequests, selectedMonth).map(
              (day) => (
                <div
                  key={day.date.toISOString()}
                  onClick={() => {
                    setSelectedDate(day.date);
                    setShowModal(true);
                  }}
                  className={`
                    relative min-h-[90px] p-1 border rounded-lg transition-colors duration-300 cursor-pointer
                    ${
                      day.isToday
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30"
                        : day.isCurrentMonth
                        ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                        : "bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                    }
                    ${
                      day.isCurrentMonth
                        ? "hover:bg-gray-50 dark:hover:bg-gray-700"
                        : "cursor-not-allowed"
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-sm font-medium ${
                        day.isCurrentMonth
                          ? day.isToday
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-900 dark:text-white"
                          : "text-gray-400 dark:text-gray-600"
                      }`}
                    >
                      {day.dayOfMonth}
                    </span>
                    {(day.leaves.length > 0 || day.ods.length > 0) && (
                      <div className="flex gap-0.5">
                        {day.leaves.length > 0 && (
                          <span className="px-1 text-[10px] font-medium rounded bg-blue-100 text-blue-600">
                            {day.leaves.length}
                          </span>
                        )}
                        {day.ods.length > 0 && (
                          <span className="px-1 text-[10px] font-medium rounded bg-purple-100 text-purple-600">
                            {day.ods.length}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    {day.leaves.slice(0, 2).map((req) => (
                      <div
                        key={req._id}
                        className={`
                        h-1.5 rounded-full
                        ${req.forMedical ? "bg-red-200" : "bg-blue-200"}
                      `}
                        title={`${req.name} - ${req.reason}`}
                      />
                    ))}
                    {day.ods.slice(0, 2).map((req) => (
                      <div
                        key={req._id}
                        className="h-1.5 rounded-full bg-purple-200"
                        title={`${req.name} - ${req.reason}`}
                      />
                    ))}
                    {day.leaves.length + day.ods.length > 4 && (
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 text-center">
                        +{day.leaves.length + day.ods.length - 4} more
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Day Details Modal */}
      {showModal && selectedDate && (
        <DayDetailsModal
          date={selectedDate}
          leaves={leaveRequests.filter((req) => {
            const fromDate = new Date(req.fromDate);
            const toDate = new Date(req.toDate);
            fromDate.setHours(0, 0, 0, 0);
            toDate.setHours(23, 59, 59, 999);
            selectedDate.setHours(12, 0, 0, 0);
            return selectedDate >= fromDate && selectedDate <= toDate;
          })}
          ods={odRequests.filter((req) => {
            const fromDate = new Date(req.fromDate);
            const toDate = new Date(req.toDate);
            fromDate.setHours(0, 0, 0, 0);
            toDate.setHours(23, 59, 59, 999);
            selectedDate.setHours(12, 0, 0, 0);
            return selectedDate >= fromDate && selectedDate <= toDate;
          })}
          onClose={() => {
            setShowModal(false);
            setSelectedDate(null);
          }}
        />
      )}
    </div>
  );
};

export default AttandanceCalander;
