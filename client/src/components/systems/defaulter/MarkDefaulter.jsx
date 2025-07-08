import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  UserCheck,
  Clock,
  Calendar,
  AlertCircle,
  Search,
  Building,
  User,
  Users,
  List,
  PlusCircle,
  FileText,
  ChevronRight,
} from "lucide-react";
import PTGenerateReport from "./PTGenerateReport";
import { Modal, Button } from "flowbite-react";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  subWeeks,
  addWeeks,
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
  eachDayOfInterval,
} from "date-fns";
import { useSelector } from "react-redux";

const MarkDefaulterAndLate = () => {
  const currentuser = useSelector((state) => state.user.currentUser);
  const [activeTab, setActiveTab] = useState("list");
  const [defaulters, setDefaulters] = useState([]);
  const [rollNumber, setRollNumber] = useState("");
  const [selectedMentor, setSelectedMentor] = useState("");
  const [timeIn, setTimeIn] = useState("");
  const [formData, setFormData] = useState({
    studentId: "",
    studentName: "",
    parent_phone: "",
    academicYear: "",
    semester: "",
    year: "",
    sectionName: "",
    department: "",
    entryDate: new Date().toISOString().split("T")[0],
    timeIn: "",
    observation: "",
    classInchargeName: "",
    classInchargeId: null,
    mentorName: "",
    mentorId: null,
    defaulterType: "",
    rollNumber: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [selectedDefaulter, setSelectedDefaulter] = useState(null);
  const [workRemarks, setWorkRemarks] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState([]);
  const [mentorDefaulters, setMentorDefaulters] = useState([]);
  const [classDefaulters, setClassDefaulters] = useState([]);
  const [isMentorSectionOpen, setIsMentorSectionOpen] = useState(true);
  const [isClassSectionOpen, setIsClassSectionOpen] = useState(true);
  const [viewMode, setViewMode] = useState("week"); // 'week' or 'month'
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchDefaulters = async () => {
    try {
      setIsLoading(true);

      const mentorResponse = await fetch(
        `/api/defaulter/getDefaultersByMentorId/${currentuser.userId}`
      );
      const mentorData = await mentorResponse.json();

      const classResponse = await fetch(
        `/api/defaulter/getDefaultersByClassInchargeId/${currentuser.userId}`
      );
      const classData = await classResponse.json();

      setMentorDefaulters(mentorData.defaulters || []);
      setClassDefaulters(classData.defaulters || []);

      setDefaulters([
        ...(mentorData.defaulters || []),
        ...(classData.defaulters || []),
      ]);
    } catch (error) {
      console.error("Error fetching defaulters:", error);
      setError("Failed to fetch defaulters list");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "list") {
      fetchDefaulters();
    }
  }, [activeTab]);

  // Student data fetching
  const fetchStudentData = async () => {
    if (!rollNumber.trim()) return;

    try {
      const response = await fetch(
        `/api/defaulter/getStudentDetailsByRollforDefaulters/${rollNumber}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      if (data && data.name) {
        setFormData((prev) => ({
          ...prev,
          studentName: data.name || "N/A",
          parent_phone: data.parent_phone || "N/A",
          studentId: data.studentId || "N/A",
          academicYear: data.batch_name || "N/A",
          semester: data.semester || "N/A",
          year: data.year || "N/A",
          department: data.department_name || "N/A",
          sectionName: data.sectionName || "N/A",
          mentorName: data.mentorName || "N/A",
          mentorId: data.mentorId || null,
          classInchargeName: data.classInchargeName || "N/A",
          classInchargeId: data.classInchargeId || null,
          rollNumber: rollNumber,
        }));
        setError("");
      } else {
        setFormData((prev) => ({
          ...prev,
          studentName: "N/A",
          parent_phone: "N/A",
          studentId: "N/A",
          academicYear: "N/A",
          semester: "N/A",
          year: "N/A",
          department: "N/A",
          sectionName: "N/A",
          mentorName: "N/A",
          mentorId: null,
          classInchargeName: "N/A",
          classInchargeId: null,
        }));
        setError("Student not found");
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      setError("Error fetching student data");
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (rollNumber.trim()) {
        fetchStudentData();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [rollNumber]);

  const handleChange = (e) => {
    const { name, value, type, id } = e.target;

    if (name === "rollNumber") {
      setRollNumber(value.toUpperCase());
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "radio" ? id : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      const data = {
        rollNumber: formData.rollNumber,
        name: formData.studentName,
        parent_phone: formData.parent_phone,
        studentId: formData.studentId,
        departmentName: formData.department,
        batchName: formData.academicYear,
        sectionName: formData.sectionName,
        entryDate: formData.entryDate,
        timeIn: formData.timeIn,
        observation: formData.observation,
        mentorId: formData.mentorId,
        classInchargeId: formData.classInchargeId,
        defaulterType:
          formData.defaulterType === "lateEntry"
            ? "Late"
            : formData.defaulterType === "dressCode"
            ? "Discipline and Dresscode"
            : formData.defaulterType === "both"
            ? "Both"
            : "",
      };
      const response = await fetch("/api/defaulter/markDefaulter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setSuccessMessage(result.message);
        resetForm();
        if (activeTab === "list") {
          fetchDefaulters(); // Refresh the list if we're on the list tab
        }
      } else {
        const err = await response.json();
        setError(err.message || "Error occurred while marking defaulter");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to submit form: " + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      studentName: "",
      academicYear: "",
      semester: "",
      year: "",
      department: "",
      sectionName: "",
      entryDate: new Date().toISOString().split("T")[0],
      timeIn: "",
      observation: "",
      mentorName: "",
      classInchargeName: "",
      defaulterType: "",
      // rollNumber: "",
    });
    setRollNumber("");
    setSelectedMentor("");
    setTimeIn("");
    setError("");
    setSuccessMessage("");
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  // Tab Components
  const TabNavigation = () => (
    <div className="overflow-x-auto">
      <div className="flex min-w-max border-b dark:border-gray-700">
        <button
          onClick={() => setActiveTab("list")}
          className={`flex items-center px-4 py-2 text-sm ${
            activeTab === "list"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          <List className="w-4 h-4 mr-2" />
          List Defaulters
        </button>
        <button
          onClick={() => setActiveTab("add")}
          className={`flex items-center px-4 py-2 text-sm ${
            activeTab === "add"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Defaulter
        </button>
        <button
          onClick={() => setActiveTab("generate")}
          className={`flex items-center px-4 py-2 text-sm ${
            activeTab === "generate"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }`}
        >
          <FileText className="w-4 h-4 mr-2" />
          Generate Report
        </button>
      </div>
    </div>
  );

  const focusTextareaAtEnd = (textarea) => {
    if (textarea) {
      textarea.focus();
      const length = textarea.value.length;
      textarea.setSelectionRange(length, length);
    }
  };

  const MobileDefaulterRow = ({ defaulter }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const getBadgeColor = (type) => {
      switch (type) {
        case "Late":
          return "bg-yellow-50 text-yellow-700 border-yellow-200";
        case "Both":
          return "bg-red-50 text-red-700 border-red-200";
        default:
          return "bg-blue-50 text-blue-700 border-blue-200";
      }
    };

    return (
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-200">
              {defaulter.name}{" "}
              <span className="text-gray-500 dark:text-gray-400">
                ({defaulter.roll_no})
              </span>
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeColor(
                  defaulter.defaulterType
                )}`}
              >
                {defaulter.defaulterType}
              </span>
              <span className="text-xs text-gray-500">
                {defaulter.defaulterType === "Both" && (
                  <>
                    {defaulter.observation} • {defaulter.timeIn}
                  </>
                )}
                {defaulter.defaulterType === "Late" && defaulter.timeIn}
                {defaulter.defaulterType === "Discipline and Dresscode" &&
                  defaulter.observation}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors"
          >
            <ChevronRight
              size={20}
              className={`transform transition-transform ${
                isExpanded ? "rotate-90" : ""
              }`}
            />
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-3 pt-3 mt-3 border-t border-gray-200 dark:border-gray-600">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
              <p className="text-sm text-gray-900 dark:text-gray-200">
                {new Date(defaulter.entryDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Mentor</p>
              <p className="text-sm text-gray-900 dark:text-gray-200">
                {defaulter.mentorId.staff_name}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Assigned Work
              </p>
              {defaulter.remarks ? (
                <p className="text-sm text-gray-900 dark:text-gray-200">
                  {defaulter.remarks}
                </p>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                  No work assigned
                </p>
              )}
            </div>
            <div className="pt-2">
              {defaulter.isDone ? (
                <span className="text-green-500 font-medium text-sm">
                  Completed
                </span>
              ) : (
                <button
                  onClick={() => {
                    setSelectedDefaulter(defaulter);
                    setWorkRemarks(defaulter.remarks || "");
                    setIsWorkModalOpen(true);
                  }}
                  className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                  {defaulter.remarks ? "Edit Work" : "Assign Work"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const ListDefaulters = () => {
    // Filter defaulters for the selected date
    const filteredMentorDefaulters = mentorDefaulters.filter((defaulter) =>
      isSameDay(new Date(defaulter.entryDate), selectedDate)
    );

    const filteredClassDefaulters = classDefaulters.filter((defaulter) =>
      isSameDay(new Date(defaulter.entryDate), selectedDate)
    );

    // Get dates based on view mode
    const getDates = () => {
      if (viewMode === "week") {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        return Array.from({ length: 7 }).map((_, index) =>
          addDays(start, index)
        );
      } else {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        return eachDayOfInterval({ start, end });
      }
    };

    // Navigation handlers
    const handlePrevious = () => {
      if (viewMode === "week") {
        setCurrentDate((prev) => subWeeks(prev, 1));
      } else {
        setCurrentDate((prev) => subMonths(prev, 1));
      }
    };

    const handleNext = () => {
      if (viewMode === "week") {
        setCurrentDate((prev) => addWeeks(prev, 1));
      } else {
        setCurrentDate((prev) => addMonths(prev, 1));
      }
    };

    const handleToday = () => {
      setCurrentDate(new Date());
      setSelectedDate(new Date());
    };

    return (
      <div className="space-y-4">
        {/* Date Selection Component */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {viewMode === "week" ? "Week View" : "Month View"}
              </h3>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="text-sm border rounded-md px-2 py-1 dark:bg-gray-800 dark:text-gray-200"
              >
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevious}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                ←
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-1 text-sm bg-blue-50 dark:bg-gray-800 text-blue-600 rounded-md hover:bg-blue-100 dark:hover:bg-gray-700"
              >
                Today
              </button>
              <button
                onClick={handleNext}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                →
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div
              className={`grid ${
                viewMode === "week" ? "grid-cols-7" : "grid-cols-7"
              } gap-1 min-w-[500px]`}
            >
              {/* Day headers */}
              {viewMode === "month" && (
                <>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center py-2"
                      >
                        {day}
                      </div>
                    )
                  )}
                </>
              )}

              {/* Date cells */}
              {getDates().map((date) => {
                const isSelected = isSameDay(date, selectedDate);
                const isToday = isSameDay(date, new Date());
                const isCurrentMonth =
                  date.getMonth() === currentDate.getMonth();

                return (
                  <button
                    key={date.toString()}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      flex flex-col items-center p-2 dark:bg-gray-800 rounded-lg transition-colors
                      ${
                        !isCurrentMonth && viewMode === "month"
                          ? "text-gray-400 dark:text-gray-400"
                          : "text-gray-900 dark:text-gray-200"
                      }
                      ${
                        isSelected
                          ? "bg-blue-50 dark:bg-gray-800 text-blue-700 ring-1 ring-blue-600"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700"
                      }
                      ${isToday ? "font-semibold" : ""}
                    `}
                    disabled={!isCurrentMonth && viewMode === "month"}
                  >
                    {viewMode === "week" && (
                      <span className="text-xs uppercase">
                        {format(date, "EEE")}
                      </span>
                    )}
                    <span
                      className={`${
                        viewMode === "week" ? "mt-1" : ""
                      } text-sm ${isToday ? "text-blue-600" : ""}`}
                    >
                      {format(date, "d")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Show mentor section if user is mentor */}
        {currentuser.isMentor && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div
                className="p-4 border-b flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => setIsMentorSectionOpen(!isMentorSectionOpen)}
              >
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200">
                    My Mentees Defaulters -{" "}
                    {format(selectedDate, "dd MMM yyyy")}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {filteredMentorDefaulters.length} defaulters found
                  </p>
                </div>
                <ChevronRight
                  size={20}
                  className={`transform transition-transform ${
                    isMentorSectionOpen ? "rotate-90" : ""
                  }`}
                />
              </div>

              {/* Desktop & Mobile Views - Conditionally render based on isMentorSectionOpen */}
              {isMentorSectionOpen && (
                <>
                  {/* Desktop Table for Mentor's Defaulters */}
                  <div className="hidden md:block">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Roll No
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Student Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Mentor
                            </th>
                            <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Assigned Work
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700">
                          {filteredMentorDefaulters.length > 0 ? (
                            filteredMentorDefaulters.map((defaulter, index) => (
                              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                  {defaulter.roll_no}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                  {defaulter.name}
                                  <p>{defaulter.parent_phone}</p>
                                </td>
                                <td className="px-4 py-4">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                      defaulter.defaulterType === "Late"
                                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                        : defaulter.defaulterType === "Both"
                                        ? "bg-red-50 text-red-700 border-red-200"
                                        : "bg-blue-50 text-blue-700 border-blue-200"
                                    }`}
                                  >
                                    {defaulter.defaulterType}
                                  </span>
                                  <div className="text-sm text-gray-500 mt-1">
                                    {defaulter.defaulterType === "Both" && (
                                      <>
                                        {defaulter.observation} •{" "}
                                        {defaulter.timeIn}
                                      </>
                                    )}
                                    {defaulter.defaulterType === "Late" &&
                                      defaulter.timeIn}
                                    {defaulter.defaulterType ===
                                      "Discipline and Dresscode" &&
                                      defaulter.observation}
                                  </div>
                                </td>
                                <td className="hidden md:table-cell px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(
                                    defaulter.entryDate
                                  ).toLocaleDateString()}
                                </td>
                                <td className="hidden md:table-cell px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {defaulter.mentorId.staff_name}
                                </td>
                                <td className="hidden lg:table-cell px-4 py-4 text-sm text-gray-500">
                                  <div className="max-w-xs">
                                    {defaulter.remarks ? (
                                      <p className="line-clamp-2">
                                        {defaulter.remarks}
                                      </p>
                                    ) : (
                                      <span className="text-gray-400 italic">
                                        No work assigned
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                  {defaulter.isDone ? (
                                    <span className="text-green-500 font-medium">
                                      Completed
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setSelectedDefaulter(defaulter);
                                        setWorkRemarks(defaulter.remarks || "");
                                        setIsWorkModalOpen(true);
                                      }}
                                      className="text-indigo-600 hover:text-indigo-900 font-medium"
                                    >
                                      {defaulter.remarks
                                        ? "Edit Work"
                                        : "Assign Work"}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr className="dark:bg-gray-800">
                              <td
                                colSpan="7"
                                className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                              >
                                No mentee defaulters found for this date
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile List View for Mentor's Defaulters */}
                  <div className="md:hidden space-y-4">
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="p-4 border-b">
                        <h3 className="text-lg font-medium text-gray-900">
                          My Mentees Defaulters -{" "}
                          {format(selectedDate, "dd MMM yyyy")}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {filteredMentorDefaulters.length} defaulters found
                        </p>
                      </div>

                      <div className="p-4 space-y-4">
                        {filteredMentorDefaulters.length > 0 ? (
                          filteredMentorDefaulters.map((defaulter) => (
                            <MobileDefaulterRow
                              key={defaulter._id}
                              defaulter={defaulter}
                            />
                          ))
                        ) : (
                          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                            No mentee defaulters found for this date
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Show class incharge section if user is class incharge */}
        {currentuser.isClassIncharge && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div
                className="p-4 border-b flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => setIsClassSectionOpen(!isClassSectionOpen)}
              >
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200">
                    My Class Defaulters - {format(selectedDate, "dd MMM yyyy")}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {filteredClassDefaulters.length} defaulters found
                  </p>
                </div>
                <ChevronRight
                  size={20}
                  className={`transform transition-transform ${
                    isClassSectionOpen ? "rotate-90" : ""
                  }`}
                />
              </div>

              {/* Desktop & Mobile Views - Conditionally render based on isClassSectionOpen */}
              {isClassSectionOpen && (
                <>
                  {/* Desktop Table for Class Incharge's Defaulters */}
                  <div className="hidden md:block">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              Roll No
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Student Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Mentor
                            </th>
                            <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Assigned Work
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredClassDefaulters.length > 0 ? (
                            filteredClassDefaulters.map((defaulter, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                  {defaulter.roll_no}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                  {defaulter.name}
                                  <p>{defaulter.parent_phone}</p>
                                </td>
                                <td className="px-4 py-4">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                      defaulter.defaulterType === "Late"
                                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                        : defaulter.defaulterType === "Both"
                                        ? "bg-red-50 text-red-700 border-red-200"
                                        : "bg-blue-50 text-blue-700 border-blue-200"
                                    }`}
                                  >
                                    {defaulter.defaulterType}
                                  </span>
                                  <div className="text-sm text-gray-500 mt-1">
                                    {defaulter.defaulterType === "Both" && (
                                      <>
                                        {defaulter.observation} •{" "}
                                        {defaulter.timeIn}
                                      </>
                                    )}
                                    {defaulter.defaulterType === "Late" &&
                                      defaulter.timeIn}
                                    {defaulter.defaulterType ===
                                      "Discipline and Dresscode" &&
                                      defaulter.observation}
                                  </div>
                                </td>
                                <td className="hidden md:table-cell px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(
                                    defaulter.entryDate
                                  ).toLocaleDateString()}
                                </td>
                                <td className="hidden md:table-cell px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {defaulter.mentorId.staff_name}
                                </td>
                                <td className="hidden lg:table-cell px-4 py-4 text-sm text-gray-500">
                                  <div className="max-w-xs">
                                    {defaulter.remarks ? (
                                      <p className="line-clamp-2">
                                        {defaulter.remarks}
                                      </p>
                                    ) : (
                                      <span className="text-gray-400 italic">
                                        No work assigned
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                  {defaulter.isDone ? (
                                    <span className="text-green-500 font-medium">
                                      Completed
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setSelectedDefaulter(defaulter);
                                        setWorkRemarks(defaulter.remarks || "");
                                        setIsWorkModalOpen(true);
                                      }}
                                      className="text-indigo-600 hover:text-indigo-900 font-medium"
                                    >
                                      {defaulter.remarks
                                        ? "Edit Work"
                                        : "Assign Work"}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr className="dark:bg-gray-800">
                              <td
                                colSpan="7"
                                className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                              >
                                No class defaulters found for this date
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile List View for Class Incharge's Defaulters */}
                  <div className="md:hidden space-y-4">
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="p-4 border-b">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200">
                          My Class Defaulters -{" "}
                          {format(selectedDate, "dd MMM yyyy")}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {filteredClassDefaulters.length} defaulters found
                        </p>
                      </div>

                      <div className="p-4 space-y-4">
                        {filteredClassDefaulters.length > 0 ? (
                          filteredClassDefaulters.map((defaulter) => (
                            <MobileDefaulterRow
                              key={defaulter._id}
                              defaulter={defaulter}
                            />
                          ))
                        ) : (
                          <div className="text-center py-6 text-gray-500">
                            No class defaulters found for this date
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Work Assignment Modal */}
        <Modal show={isWorkModalOpen} onClose={handleModalClose} size="md">
          <Modal.Header>
            {selectedDefaulter?.remarks ? "Edit Assigned Work" : "Assign Work"}
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Student:</span>
                    <p className="font-medium">{selectedDefaulter?.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <p className="font-medium">
                      {selectedDefaulter?.defaulterType}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <p className="font-medium">
                      {selectedDefaulter &&
                        new Date(
                          selectedDefaulter.entryDate
                        ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Work/Remarks
                </label>
                <textarea
                  rows="4"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter the work to be done..."
                  value={workRemarks}
                  onChange={(e) => setWorkRemarks(e.target.value)}
                  ref={(textarea) => {
                    if (
                      isWorkModalOpen &&
                      textarea &&
                      !textarea.matches(":focus")
                    ) {
                      focusTextareaAtEnd(textarea);
                    }
                  }}
                ></textarea>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              className="bg-blue-100 text-black hover:bg-blue-200"
              onClick={() =>
                handleAssignWork(selectedDefaulter._id, workRemarks)
              }
            >
              {selectedDefaulter?.remarks ? "Update Work" : "Assign Work"}
            </Button>
            <Button color="gray" onClick={handleModalClose}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  };

  const handleAssignWork = async (id, remarks) => {
    if (!remarks.trim()) return;
    try {
      const response = await fetch(`/api/defaulter/assignwork/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, remarks }),
      });

      if (response.ok) {
        await fetchDefaulters();
        setIsWorkModalOpen(false);
        setSelectedDefaulter(null);
        setWorkRemarks("");
      }
    } catch (error) {
      console.error("Error assigning work:", error);
      setError("Failed to assign work");
    }
  };

  const handleModalClose = () => {
    setIsWorkModalOpen(false);
    setSelectedDefaulter(null);
    setWorkRemarks("");
  };

  useEffect(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start from Monday
    const dates = Array.from({ length: 7 }).map((_, index) =>
      addDays(start, index)
    );
    setWeekDates(dates);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-full mx-auto p-6"
    >
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Defaulters List
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            View and manage defaulters list
          </p>
        </div>
      </div>
      <TabNavigation />

      {activeTab === "list" && <ListDefaulters />}

      {activeTab === "add" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Search Section */}
            <motion.div variants={fadeInUp} className="relative">
              <label
                htmlFor="rollNumber"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                Roll Number
              </label>
              <div className="relative w-full">
                <input
                  type="text"
                  id="rollNumber"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </motion.div>

            {/* Student Details Grid */}
            <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-sm font-semibold text-gray-500">
                  Student:{" "}
                  <span className="ml-1">{formData.studentName || "N/A"}</span>
                </span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-sm font-semibold text-gray-500">
                  Year:{" "}
                  <span className="ml-1">{formData.academicYear || "N/A"}</span>
                </span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded flex items-center">
                <Building className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-sm font-semibold text-gray-500">
                  Dept:{" "}
                  <span className="ml-1">{formData.department || "N/A"}</span>
                </span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded flex items-center">
                <Building className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-sm font-semibold text-gray-500">
                  Section:{" "}
                  <span className="ml-1">{formData.sectionName || "N/A"}</span>
                </span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded flex items-center">
                <Users className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-sm font-semibold text-gray-500">
                  Class Incharge:{" "}
                  <span className="ml-1">
                    {formData.classInchargeName || "N/A"}
                  </span>
                </span>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded flex items-center">
                <Users className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-sm font-semibold text-gray-500">
                  Mentor:{" "}
                  <span className="ml-1">{formData.mentorName || "N/A"}</span>
                </span>
              </div>
            </motion.div>

            {/* Defaulter Type Selection */}
            <motion.div variants={fadeInUp} className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Defaulter Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    id: "dressCode",
                    label: "Dress Code",
                    icon: <AlertCircle />,
                  },
                  { id: "lateEntry", label: "Late Entry", icon: <Clock /> },
                  { id: "both", label: "Both", icon: <UserCheck /> },
                ].map((type) => (
                  <label
                    key={type.id}
                    className={`
                    flex items-center gap-3 p-4 rounded-lg cursor-pointer
                    transition-all duration-200
                    ${
                      formData.defaulterType === type.id
                        ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800"
                        : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                    }
                    border hover:border-blue-300 dark:hover:border-blue-700
                  `}
                  >
                    <input
                      type="radio"
                      id={type.id}
                      name="defaulterType"
                      checked={formData.defaulterType === type.id}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <span
                      className={`
                    ${
                      formData.defaulterType === type.id
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-500 dark:text-gray-400"
                    }
                  `}
                    >
                      {type.icon}
                    </span>
                    <span
                      className={`
                    font-medium
                    ${
                      formData.defaulterType === type.id
                        ? "text-blue-900 dark:text-blue-100"
                        : "text-gray-700 dark:text-gray-300"
                    }
                  `}
                    >
                      {type.label}
                    </span>
                  </label>
                ))}
              </div>
            </motion.div>

            {/* Date and Time Section */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Entry Date
                </label>
                <input
                  type="date"
                  name="entryDate"
                  value={formData.entryDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                         focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Time In
                </label>
                <input
                  type="time"
                  name="timeIn"
                  value={formData.timeIn}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border 
                          ${
                            formData.defaulterType === "dressCode"
                              ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed"
                              : "bg-white dark:bg-gray-700"
                          }
                          border-gray-300 dark:border-gray-600 
                          text-gray-900 dark:text-gray-100
                          focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
                  disabled={formData.defaulterType === "dressCode"}
                  required={formData.defaulterType !== "dressCode"}
                />
              </div>
            </motion.div>

            {/* Observation Field */}
            <motion.div variants={fadeInUp}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Observation
              </label>
              <textarea
                name="observation"
                value={formData.observation}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border
                        ${
                          formData.defaulterType === "lateEntry"
                            ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed"
                            : "bg-white dark:bg-gray-700"
                        }
                        border-gray-300 dark:border-gray-600
                        text-gray-900 dark:text-gray-100
                        focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
                rows="3"
                disabled={formData.defaulterType === "lateEntry"}
                required={formData.defaulterType !== "lateEntry"}
              />
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={fadeInUp} className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r bg-[#1f3a6e] rounded-lg text-white 
                         transition-all duration-200"
              >
                Submit Entry
              </button>
            </motion.div>
          </form>
        </div>
      )}

      {activeTab === "generate" && <PTGenerateReport />}

      {/* Error and Success Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-center"
        >
          {error}
        </motion.div>
      )}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-center"
        >
          {successMessage}
        </motion.div>
      )}
    </motion.div>
  );
};

export default MarkDefaulterAndLate;
