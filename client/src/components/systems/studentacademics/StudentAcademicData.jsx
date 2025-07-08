import axios from "axios";
import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Spinner } from "flowbite-react";
import { Info, Award, TrendingUp, Users, ChevronDown } from "lucide-react";
import { toast } from "react-hot-toast";
import { utils as XLSXUtils, write as XLSXWrite } from "xlsx";
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
import { FaGithub, FaLinkedin, FaHackerrank } from "react-icons/fa";
import LeetStats from "../../user/LeetStats";
import PortfolioPage from "../../user/PortfolioPage";
import ResumeViewer from "../../user/ResumeVewer";

const StudentAcademicData = ({ userId }) => {
  const [studentResults, setStudentResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [leetcodeStats, setLeetcodeStats] = useState({});

  const getUserIdFromUrl = (url) => {
    if (!url) return null;
    const cleanUrl = url.endsWith("/") ? url.slice(0, -1) : url;
    return cleanUrl.split("/").pop();
  };

  const fetchLeetcodeStats = async (students) => {
    const statsPromises = students.map(async (student) => {
      if (!student.leetcode_url) return null;
      const userId = getUserIdFromUrl(student.leetcode_url);
      if (!userId) return null;

      try {
        const response = await fetch(
          `https://leetcode-stats-api.herokuapp.com/${userId}`
        );
        const data = await response.json();
        return { studentId: student._id, stats: data };
      } catch (error) {
        console.error("Error fetching LeetCode stats:", error);
        return null;
      }
    });

    const results = await Promise.all(statsPromises);
    const statsMap = {};
    results.forEach((result) => {
      if (result) {
        statsMap[result.studentId] = result.stats;
      }
    });
    setLeetcodeStats(statsMap);
  };

  const getStudentResultsForClassIncharge = async () => {
    try {
      const response = await axios.get(
        `/api/cgpa/getStudentResultsByClassInchargeId/${userId}`
      );
      return response.data;
    } catch (error) {
      toast.error("Failed to fetch student results");
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    getStudentResultsForClassIncharge().then((data) => {
      setStudentResults(data.data);
      fetchLeetcodeStats(data.data);
      setLoading(false);
    });
  }, [userId]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const calculateLatestCGPA = (results) => {
    if (!results || Object.keys(results).length === 0) return "N/A";
    const latestSem = Math.max(...Object.keys(results).map(Number));
    return results[latestSem]?.cgpa || "N/A";
  };

  const generateExcelReport = () => {
    try {
      const workbook = XLSXUtils.book_new();

      const GRADE_POINTS = {
        O: 10,
        "A+": 9,
        A: 8,
        "B+": 7,
        B: 6,
        C: 5,
        F: 0,
        AB: 0,
        NA: 0,
      };

      // Get all unique semesters
      const allSemesters = [
        ...new Set(
          studentResults.flatMap((student) =>
            Object.keys(student.semester_results || {})
          )
        ),
      ].sort((a, b) => a - b);

      allSemesters.forEach((semester) => {
        const courseCodes = new Set();
        studentResults.forEach((student) => {
          const semResults =
            student.semester_results?.[semester]?.courses || [];
          semResults.forEach((course) => courseCodes.add(course.course_code));
        });
        const sortedCourseCodes = [...courseCodes].sort();

        // Reorder headers according to specified sequence
        const headers = [
          "Name",
          "Register No",
          "Roll No",
          ...sortedCourseCodes,
          "Semester Total",
          "GPA",
          "Cumulative Total",
          "CGPA",
          "Credits Earned",
          "Total Credits",
        ];

        // Prepare data rows with reordered columns
        const rows = studentResults.map((student) => {
          const semesterResult = student.semester_results?.[semester];
          const courseGrades = {};
          let semesterTotal = 0;
          let cumulativeTotal = 0;

          // Initialize grades
          sortedCourseCodes.forEach((code) => (courseGrades[code] = "-"));

          // Calculate totals and fill grades
          semesterResult?.courses?.forEach((course) => {
            courseGrades[course.course_code] = course.grade;
            const gradePoint = GRADE_POINTS[course.grade] || 0;
            semesterTotal += course.credits * gradePoint;
          });

          // Calculate cumulative total
          for (let sem = 1; sem <= semester; sem++) {
            const semResults = student.semester_results?.[sem]?.courses || [];
            semResults.forEach((course) => {
              const gradePoint = GRADE_POINTS[course.grade] || 0;
              cumulativeTotal += course.credits * gradePoint;
            });
          }

          // Return data in specified order
          return [
            student.name,
            student.register_no,
            student.roll_no,
            ...sortedCourseCodes.map((code) => courseGrades[code]),
            semesterTotal.toFixed(2),
            semesterResult?.gpa || "-",
            cumulativeTotal.toFixed(2),
            semesterResult?.cgpa || "-",
            semesterResult?.earnedCredits || "-",
            semesterResult?.totalCredits || "-",
          ];
        });

        // Create worksheet
        const worksheet = XLSXUtils.aoa_to_sheet([headers, ...rows]);

        // Set column widths and styles
        const colWidths = [
          { wch: 25 }, // Name
          { wch: 15 }, // Register No
          { wch: 12 }, // Roll No
          ...sortedCourseCodes.map(() => ({ wch: 8 })), // Course codes
          { wch: 12 }, // Semester Total
          { wch: 12 }, // GPA
          { wch: 12 }, // Cumulative Total
          { wch: 12 }, // CGPA
          { wch: 12 }, // Credits Earned
          { wch: 12 }, // Total Credits
        ];
        worksheet["!cols"] = colWidths;

        // Style all cells
        const range = XLSXUtils.decode_range(worksheet["!ref"]);
        for (let R = range.s.r; R <= range.e.r; R++) {
          for (let C = range.s.c; C <= range.e.c; C++) {
            const cellRef = XLSXUtils.encode_cell({ r: R, c: C });
            if (!worksheet[cellRef]) continue;

            // Create cell object if it doesn't exist
            if (
              typeof worksheet[cellRef] === "number" ||
              typeof worksheet[cellRef] === "string"
            ) {
              worksheet[cellRef] = { v: worksheet[cellRef] };
            }

            // Add style object if it doesn't exist
            if (!worksheet[cellRef].s) worksheet[cellRef].s = {};

            // Header row styling
            if (R === 0) {
              worksheet[cellRef].s = {
                font: { bold: true, color: { rgb: "000000" } },
                fill: { fgColor: { rgb: "E0E0E0" } },
                alignment: { horizontal: "center", vertical: "center" },
                border: {
                  top: { style: "thin" },
                  bottom: { style: "thin" },
                  left: { style: "thin" },
                  right: { style: "thin" },
                },
              };
            } else {
              // Data rows styling
              worksheet[cellRef].s = {
                alignment: {
                  horizontal:
                    C >= 3 && C < 3 + sortedCourseCodes.length
                      ? "center"
                      : C >= 3 + sortedCourseCodes.length
                      ? "right"
                      : "left",
                  vertical: "center",
                },
                border: {
                  top: { style: "thin" },
                  bottom: { style: "thin" },
                  left: { style: "thin" },
                  right: { style: "thin" },
                },
              };
            }
          }
        }

        // Add the worksheet to workbook
        XLSXUtils.book_append_sheet(
          workbook,
          worksheet,
          `Semester ${semester}`
        );
      });

      // Save and download
      const excelBuffer = XLSXWrite(workbook, {
        bookType: "xlsx",
        type: "array",
        bookSST: false,
      });

      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "CSEB_Cumulative_Academic_Report.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Report generated successfully");
    } catch (error) {
      console.error("Error generating excel:", error);
      toast.error("Failed to generate report");
    }
  };

  const getCGPADistribution = (students) => {
    const distribution = {
      "9.0+": 0,
      "8.0-8.99": 0,
      "7.0-7.99": 0,
      "6.0-6.99": 0,
      "Below 6.0": 0,
    };

    students.forEach((student) => {
      const cgpa = parseFloat(calculateLatestCGPA(student.semester_results));
      if (cgpa >= 9.0) distribution["9.0+"]++;
      else if (cgpa >= 8.0) distribution["8.0-8.99"]++;
      else if (cgpa >= 7.0) distribution["7.0-7.99"]++;
      else if (cgpa >= 6.0) distribution["6.0-6.99"]++;
      else if (cgpa > 0) distribution["Below 6.0"]++;
    });

    return Object.entries(distribution).map(([range, count]) => ({
      range,
      count,
    }));
  };

  const getClassStats = (students) => {
    const cgpas = students
      .map((student) =>
        parseFloat(calculateLatestCGPA(student.semester_results))
      )
      .filter((cgpa) => !isNaN(cgpa) && cgpa > 0);

    return {
      averageCGPA: (
        cgpas.reduce((sum, cgpa) => sum + cgpa, 0) / cgpas.length
      ).toFixed(2),
      highestCGPA: Math.max(...cgpas).toFixed(2),
      totalStudents: students.length,
      studentsAbove8: cgpas.filter((cgpa) => cgpa >= 8.0).length,
    };
  };

  const AnalyticsSection = ({ students }) => {
    const distribution = getCGPADistribution(students);
    const stats = getClassStats(students);
    const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#6B7280"];

    const getDetailedDistribution = () => {
      const detailedDist = Array.from({ length: 21 }, (_, i) => ({
        range: `${(i * 0.5).toFixed(1)}-${((i + 1) * 0.5).toFixed(1)}`,
        count: 0,
        interval: i * 0.5,
      }));

      students.forEach((student) => {
        const cgpa = parseFloat(calculateLatestCGPA(student.semester_results));
        if (!isNaN(cgpa) && cgpa > 0) {
          const index = Math.floor(cgpa * 2);
          if (index < detailedDist.length) {
            detailedDist[index].count++;
          }
        }
      });

      // Filter out ranges with no students
      return detailedDist.filter((d) => d.count > 0);
    };

    return (
      <div className="mb-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Average CGPA
                </p>
                <p className="text-xl font-bold text-blue-600">
                  {stats.averageCGPA}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Award className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Highest CGPA
                </p>
                <p className="text-xl font-bold text-green-600">
                  {stats.highestCGPA}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Users className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Students
                </p>
                <p className="text-xl font-bold text-orange-600">
                  {stats.totalStudents}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Award className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Above 8.0 CGPA
                </p>
                <p className="text-xl font-bold text-purple-600">
                  {stats.studentsAbove8}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Updated Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enhanced Bar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">CGPA Distribution</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getDetailedDistribution()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis
                    dataKey="interval"
                    label={{
                      value: "CGPA Range",
                      position: "bottom",
                      offset: 0,
                    }}
                    tickFormatter={(value) => value.toFixed(1)}
                  />
                  <YAxis
                    label={{
                      value: "Number of Students",
                      angle: -90,
                      position: "insideLeft",
                      offset: 10,
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px",
                    }}
                    labelStyle={{ color: "#E5E7EB" }}
                    itemStyle={{ color: "#E5E7EB" }}
                    formatter={(value, name, props) => [
                      `${value} student${value !== 1 ? "s" : ""}`,
                      `CGPA: ${props.payload.range}`,
                    ]}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                    {getDetailedDistribution().map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`hsl(${210 + index * 5}, 100%, ${
                          60 + index * 2
                        }%)`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Updated pie chart with windowWidth prop */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              Performance Categories
            </h3>
            <div className="h-[300px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    dataKey="count"
                    nameKey="range"
                    cx="50%"
                    cy="50%"
                    innerRadius={windowWidth < 768 ? 40 : 60}
                    outerRadius={windowWidth < 768 ? 70 : 100}
                    paddingAngle={2}
                  >
                    {distribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index]}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "none",
                      color: "#000000",
                      borderRadius: "8px",
                      padding: "12px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value, name) => [
                      `${value} student${value !== 1 ? "s" : ""}`,
                      `CGPA Range: ${name}`,
                    ]}
                  />
                  <Legend
                    layout={windowWidth < 768 ? "horizontal" : "vertical"}
                    align={windowWidth < 768 ? "center" : "right"}
                    verticalAlign={windowWidth < 768 ? "bottom" : "middle"}
                    wrapperStyle={
                      windowWidth < 768
                        ? {
                            position: "absolute",
                            bottom: -20,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: "100%",
                            fontSize: "12px",
                          }
                        : {}
                    }
                    formatter={(value, entry) => {
                      const { payload } = entry;
                      const percentage = (
                        (payload.count / stats.totalStudents) *
                        100
                      ).toFixed(1);
                      return windowWidth < 768
                        ? `${percentage}%`
                        : `${value} (${percentage}%)`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Student Results
            </h2>
            <p className="text-gray-600 mt-1">
              View academic records of all students
            </p>
          </div>
          <Button
            className="bg-green-500 hover:bg-green-600"
            onClick={generateExcelReport}
            disabled={loading || studentResults.length === 0}
          >
            Download Cumulative Report
          </Button>
        </div>
      </div>

      {/* Add Analytics Section */}
      <AnalyticsSection students={studentResults} />

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="px-4 py-3 text-gray-700 dark:text-gray-300">
                Roll No
              </th>
              <th className="px-4 py-3 text-gray-700 dark:text-gray-300">
                Name
              </th>
              <th className="px-4 py-3 text-gray-700 dark:text-gray-300">
                Register No
              </th>
              <th className="px-4 py-3 text-gray-700 dark:text-gray-300">
                Current CGPA
              </th>
              <th className="px-4 py-3 text-gray-700 dark:text-gray-300">
                LeetCode Problems
              </th>
              <th className="px-4 py-3 text-gray-700 dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {studentResults.map((student) => (
              <tr
                key={student._id}
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-300"
              >
                <td className="px-4 py-3 text-gray-900 dark:text-gray-200 font-semibold">
                  {student.roll_no}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-200 font-semibold">
                  {student.name}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-200 font-semibold">
                  {student.register_no}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-200 font-bold">
                  {calculateLatestCGPA(student.semester_results)}
                </td>
                <td className="px-4 py-3">
                  {leetcodeStats[student._id]?.status === "success" ? (
                    <div className="flex items-center space-x-1">
                      <span className="font-medium text-gray-900 dark:text-gray-200">
                        {leetcodeStats[student._id]?.totalSolved || 0}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        /{leetcodeStats[student._id]?.totalQuestions || 0}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">
                      N/A
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Button
                    size="sm"
                    color="light"
                    onClick={() => {
                      setSelectedStudent(student);
                      setShowDetails(true);
                    }}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                  >
                    <Info className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {studentResults.map((student) => (
          <div
            key={student._id}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 space-y-2 transition-colors duration-300"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-200">
                  {student.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {student.roll_no}
                </p>
              </div>
              <Button
                size="sm"
                color="light"
                onClick={() => {
                  setSelectedStudent(student);
                  setShowDetails(true);
                }}
                className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
              >
                <Info className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </Button>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                CGPA: {calculateLatestCGPA(student.semester_results)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                LeetCode:{" "}
                {leetcodeStats[student._id]?.status === "success" ? (
                  <span>
                    {leetcodeStats[student._id]?.totalSolved || 0}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      /{leetcodeStats[student._id]?.totalQuestions || 0}
                    </span>
                  </span>
                ) : (
                  "N/A"
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Details Modal */}
      <Modal
        show={showDetails}
        onClose={() => setShowDetails(false)}
        size="6xl"
      >
        <Modal.Header className="border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Student Details
          </h3>
        </Modal.Header>
        <Modal.Body className="bg-white dark:bg-gray-800">
          {selectedStudent && (
            <div className="space-y-8">
              {/* Student Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Name:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedStudent.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Roll No:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedStudent.roll_no}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Register No:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedStudent.register_no}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Section:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedStudent.section_name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Email:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedStudent.email}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Phone:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedStudent.phone}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Parent Phone:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedStudent.parent_phone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Professional Links
                  </h3>
                  <div className="space-y-3">
                    {selectedStudent.github_url && (
                      <a
                        href={selectedStudent.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-300"
                      >
                        <FaGithub /> GitHub Profile
                      </a>
                    )}
                    {selectedStudent.linkedin_url && (
                      <a
                        href={selectedStudent.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-300"
                      >
                        <FaLinkedin /> LinkedIn Profile
                      </a>
                    )}
                    {selectedStudent.hackerrank_url && (
                      <a
                        href={selectedStudent.hackerrank_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-300"
                      >
                        <FaHackerrank /> HackerRank Profile
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Semester Results */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Academic Performance
                </h3>
                <div className="space-y-3">
                  {Object.entries(selectedStudent.semester_results || {})
                    .sort((a, b) => a[0] - b[0])
                    .map(([semester, data]) => (
                      <div
                        key={semester}
                        className="border dark:border-gray-700 rounded-lg overflow-hidden transition-colors duration-300"
                      >
                        <button
                          onClick={(e) => {
                            e.currentTarget.nextElementSibling.classList.toggle(
                              "hidden"
                            );
                            e.currentTarget
                              .querySelector("svg")
                              .classList.toggle("rotate-180");
                          }}
                          className="w-full bg-gray-50 dark:bg-gray-700 p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300"
                        >
                          <div className="flex items-center gap-4">
                            <h4 className="font-medium text-lg text-gray-900 dark:text-white">
                              Semester {semester}
                            </h4>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded transition-colors duration-300">
                                GPA: {data.gpa}
                              </span>
                              <span className="px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded transition-colors duration-300">
                                CGPA: {data.cgpa}
                              </span>
                              <span className="px-2 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded transition-colors duration-300">
                                Credits: {data.earnedCredits}/
                                {data.totalCredits}
                              </span>
                            </div>
                          </div>
                          <ChevronDown className="w-5 h-5 transform transition-transform duration-300 text-gray-500 dark:text-gray-400" />
                        </button>
                        <div className="hidden">
                          <div className="p-4 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {data.courses.map((course, idx) => (
                                <div
                                  key={idx}
                                  className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm border dark:border-gray-600 transition-colors duration-300"
                                >
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium text-gray-900 dark:text-white">
                                        {course.course_code}
                                      </p>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {course.course_name}
                                      </p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                      <span
                                        className={`text-sm font-medium px-2 py-1 rounded transition-colors duration-300 ${
                                          course.grade === "F" ||
                                          course.grade === "AB"
                                            ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                                            : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                        }`}
                                      >
                                        {course.grade}
                                      </span>
                                      <span className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                                        {course.credits} Credits
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* LeetCode Stats */}
              {selectedStudent.leetcode_url && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                  <LeetStats leetcode_url={selectedStudent.leetcode_url} />
                </div>
              )}

              {/* Portfolio and Resume Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedStudent.portfolio_url && (
                  <PortfolioPage
                    portfolio_url={selectedStudent.portfolio_url}
                  />
                )}
                {selectedStudent.resume_url && (
                  <ResumeViewer resume_url={selectedStudent.resume_url} />
                )}
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default StudentAcademicData;
