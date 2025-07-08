import {
  Document,
  Image,
  Page,
  pdf,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { Button, Modal, ModalBody, ModalHeader, Spinner } from "flowbite-react";
import "jspdf-autotable";
import { BookOpen, ClipboardList, Calendar } from "lucide-react";
import React, { useEffect, useState } from "react";
import { MdOutlineDownloadDone } from "react-icons/md";
import { RxCrossCircled } from "react-icons/rx";
import { SiTicktick } from "react-icons/si";
import { useSelector } from "react-redux";
import StatusDot from "../components/general/StatusDot";
import DashboardSidebar from "../components/layout/DashboardSidebar";
import HODGenerativeSummary from "../components/systems/HODGenerativeSummary";

const Hoddashboard = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [deptName, setDeptName] = useState(null);
  const [classIncharge, setClassIncharge] = useState([]);
  const [modalType, setModalType] = useState(null);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState([]);
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [studentRequest, setStudentRequest] = useState(false);
  const [staffRequest, setStaffRequest] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [error, setError] = useState(null);
  const [staffLeaveRequests, setStaffLeaveRequests] = useState([]);
  const [hodComment, sethodComment] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear().toString().slice(-2); // Get last two digits of the year
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month in two digits
    const day = date.getDate().toString().padStart(2, "0"); // Day in two digits
    return `${day}-${month}-${year}`;
  };
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [isFetching, setIsFetching] = useState(false);

  const handleRequest = (type, id) => {
    setModalType(type);
    setCurrentRequestId(id);
  };

  const handleClose = () => {
    setModalType(null);
    setCurrentRequestId(null);
  };

  useEffect(() => {
    if (currentUser && currentUser.departmentId) {
      fetchDepartmentName();
      fetchBatches(currentUser.departmentId);
    }
  }, [currentUser]);

  useEffect(() => {
    if (deptName) {
      fetchBatches(currentUser.departmentId);
    }
  }, [deptName, currentUser.departmentId]);

  useEffect(() => {
    if (selectedBatch) {
      fetchSections(selectedBatch._id);
    }
  }, [selectedBatch]);

  useEffect(() => {
    if (selectedSection) {
      fetchLeaveRequests(selectedSection._id);
    }
  }, [selectedSection]);

  // useEffect(() => {
  //   fetchStaffLeaveRequests();
  // }, []);

  const fetchDepartmentName = async () => {
    try {
      setIsFetching(true);
      const response = await fetch(
        `/api/getDepartmentNameByCurrentUserId?deptId=${currentUser.departmentId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch departments");
      }
      const data = await response.json();
      setDeptName(data.name); // set deptName to data.name, assuming data returns an object with 'name' field
    } catch (error) {
      console.error("Error fetching departments:", error.message);
    } finally {
      setIsFetching(false);
    }
  };

  const fetchBatches = async (departmentId) => {
    try {
      setIsFetching(true);
      const response = await fetch(`/api/departments/${departmentId}/batches`);
      if (!response.ok) {
        throw new Error("Failed to fetch batches");
      }
      const data = await response.json();
      setBatches(data);
    } catch (error) {
      console.error("Error fetching batches:", error.message);
    } finally {
      setIsFetching(false);
    }
  };

  const fetchSections = async (batchId) => {
    try {
      setIsFetching(true);
      const response = await fetch(`/api/batches/${batchId}/sections`);
      if (!response.ok) {
        throw new Error("Failed to fetch sections");
      }
      const data = await response.json();
      setSections(data);
    } catch (error) {
      console.error("Error fetching sections:", error.message);
    } finally {
      setIsFetching(false);
    }
  };

  const fetchLeaveRequests = async (sectionId) => {
    try {
      setIsFetching(true);
      const response = await fetch(
        `/api/leaverequestsbysectionid/${sectionId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch leave requests");
      }
      const data = await response.json();
      setLeaveRequests(data);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    } finally {
      setIsFetching(false);
    }
  };

  // const fetchStaffLeaveRequests = async () => {
  //   try {
  //     setIsFetching(true);
  //     const response = await fetch(
  //       `/api/getStaffLeaveRequests?deptId=${currentUser.departmentId}`
  //     );
  //     if (!response.ok) {
  //       throw new Error("Failed to fetch staff leave requests");
  //     }
  //     const data = await response.json();
  //     setStaffLeaveRequests(data);
  //   } catch (error) {
  //     console.error("Error fetching staff leave requests:", error.message);
  //   } finally {
  //     setIsFetching(false);
  //   }
  // };

  const handleStudentLeaveRequest = () => {
    setStudentRequest(true);
    setStaffRequest(false);
  };

  const handleBatchSelect = (batch) => {
    setLeaveRequests([]);
    setSelectedSection(null);
    setSelectedBatch((prevBatch) =>
      prevBatch?._id === batch._id ? null : batch
    );
  };

  const handleSectionSelect = async (section) => {
    setSelectedSection((prevSection) =>
      prevSection === section ? null : section
    );
    if (section) {
      setLeaveRequests([]);
      await fetchLeaveRequests(section._id);
    }
  };

  const confirmRequest = async () => {
    setLoading(true);
    try {
      const backendUrl = `/api/leave-requestsbyhodid/${currentRequestId}/status`;
      const response = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: modalType,
          hodComment: hodComment,
        }),
      });

      if (response.ok) {
        setLeaveRequests((prevRequests) =>
          prevRequests.map((req) =>
            req._id === currentRequestId
              ? {
                  ...req,
                  approvals: { ...req.approvals, hod: { status: modalType } },
                }
              : req
          )
        );
      } else {
        alert(`Failed to ${modalType} request`);
      }
    } catch (error) {
      console.error("Error updating request:", error);
      alert(`Failed to ${modalType} request`);
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  const handleStaffLeaveRequest = () => {
    setStudentRequest(false);
    setStaffRequest(true);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const id =
    currentUser.userType === "Student" ? currentUser.id : currentUser.userId;

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const res = await fetch(`/api/getleaverequest/${id}`);
        const data = await res.json();
        if (res.ok) {
          setLeaveRequests(data);
        }
      } catch (error) {
        console.error("Error fetching leave requests:", error);
      }
    };

    fetchLeaveRequests();
  }, [currentUser.id]);

  // Define menu items for the sidebar
  const menuItems = [
    {
      id: "summary",
      icon: <Calendar size={18} />,
      label: "Daily Department Summary",
      active: !studentRequest && !staffRequest,
    },
    {
      id: "student_requests",
      icon: <ClipboardList size={18} />,
      label: "Student's Leave Requests",
      active: studentRequest,
    },
  ];

  // Add this function to handle tab changes
  const handleTabChange = (tabId) => {
    if (tabId === "student_requests") {
      handleStudentLeaveRequest();
    } else if (tabId === "summary") {
      setStudentRequest(false);
      setStaffRequest(false);
    }
  };

  // Add this new function to fetch all leave requests for a batch
  const fetchAllLeaveRequestsForBatch = async (batchId) => {
    try {
      // First get all sections for this batch
      const sectionsResponse = await fetch(`/api/batches/${batchId}/sections`);
      if (!sectionsResponse.ok) throw new Error("Failed to fetch sections");
      const batchSections = await sectionsResponse.json();

      // Then fetch leave requests for each section
      const requests = [];
      for (const section of batchSections) {
        const requestsResponse = await fetch(
          `/api/leaverequestsbysectionid/${section._id}`
        );
        if (!requestsResponse.ok)
          throw new Error("Failed to fetch leave requests");
        const sectionRequests = await requestsResponse.json();
        requests.push({
          section: section.section_name,
          requests: sectionRequests,
        });
      }
      return { sections: batchSections, requests };
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      return null;
    }
  };

  // Update the styles
  const styles = StyleSheet.create({
    page: {
      padding: "0.7in",
      fontSize: 10,
    },
    firstPageHeader: {
      marginBottom: 20,
      alignItems: "center",
    },
    logo: {
      width: 60,
      height: 60,
      marginBottom: 8,
    },
    collegeName: {
      fontSize: 14,
      fontWeight: "bold",
      marginBottom: 4,
      textAlign: "center",
    },
    collegeInfo: {
      fontSize: 9,
      marginBottom: 2,
      textAlign: "center",
      color: "#444",
    },
    departmentName: {
      fontSize: 12,
      fontWeight: "bold",
      marginBottom: 12,
      textAlign: "center",
    },
    title: {
      fontSize: 11,
      fontWeight: "bold",
      marginBottom: 15,
      textAlign: "center",
      textDecoration: "underline",
    },
    headerInfo: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 15,
      fontSize: 9,
      borderBottom: 1,
      paddingBottom: 4,
    },
    section: {
      marginBottom: 15,
    },
    sectionTitle: {
      fontSize: 10,
      fontWeight: "bold",
      marginBottom: 6,
      marginTop: 15,
      backgroundColor: "#f3f4f6",
      padding: "6 4",
      borderWidth: 0.5,
      borderColor: "#000",
    },
    table: {
      width: "100%",
      marginBottom: 15,
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 0.5,
      borderBottomColor: "#ccc",
      minHeight: 24,
      alignItems: "center",
    },
    tableHeader: {
      backgroundColor: "#1f3a6e",
      color: "#fff",
      padding: "6 4",
      fontSize: 9,
      fontWeight: "bold",
    },
    tableCell: {
      padding: "6 4",
      fontSize: 9,
    },
    totalRow: {
      flexDirection: "row",
      borderTopWidth: 1,
      borderTopColor: "#000",
      backgroundColor: "#f3f4f6",
      minHeight: 24,
      alignItems: "center",
    },
    footer: {
      position: "absolute",
      bottom: 30,
      left: 0,
      right: 0,
      paddingHorizontal: "0.7in",
    },
    footerContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      fontSize: 8,
      color: "#666",
      borderTopWidth: 0.5,
      borderTopColor: "#666",
      paddingTop: 4,
    },
    signature: {
      position: "absolute",
      bottom: 60, // Adjusted to be above footer
      right: 0,
      width: 200,
      textAlign: "center",
    },
    signatureText: {
      fontSize: 10,
      marginBottom: 25,
    },
    signatureLine: {
      width: 150,
      borderBottomWidth: 0.5,
      borderBottomColor: "#000",
      marginBottom: 4,
      alignSelf: "center",
    },
    signatureTitle: {
      fontSize: 9,
      fontWeight: "bold",
    },
    content: {
      flex: 1,
      position: "relative",
    },
  });

  // Update the Document Component
  const LeaveRequestsDocument = ({ deptName, filteredData, today }) => {
    const totalPages = Math.ceil(filteredData.requests.length * 0.5 + 1);

    return (
      <Document>
        {Array.from({ length: totalPages }, (_, pageIndex) => (
          <Page key={pageIndex} size="A4" style={styles.page}>
            {pageIndex === 0 && (
              <View style={styles.firstPageHeader}>
                <Image src="/vcet.jpeg" style={styles.logo} />
                <Text style={styles.collegeName}>
                  VELAMMAL COLLEGE OF ENGINEERING AND TECHNOLOGY
                </Text>
                <Text style={styles.collegeInfo}>
                  (An Autonomous Institution)
                </Text>
                <Text style={styles.collegeInfo}>Madurai - 625009</Text>
                <Text style={styles.departmentName}>
                  Department of {deptName}
                </Text>
                <Text style={styles.title}>
                  ON DUTY / LEAVE REQUEST REPORT for{" "}
                  {today.toLocaleDateString()}
                </Text>
              </View>
            )}

            <View style={styles.content}>
              {pageIndex === 0 && (
                <View style={styles.headerInfo}>
                  <Text>Date: {today.toLocaleDateString()}</Text>
                  <Text>Batch: 2022-2026</Text>
                </View>
              )}

              {/* Sections and Table */}
              {filteredData.requests
                .slice(pageIndex * 2, (pageIndex + 1) * 2)
                .map((sectionData, sectionIndex) => (
                  <View key={sectionIndex} wrap={false}>
                    <Text style={styles.sectionTitle}>
                      Section {sectionData.section}
                    </Text>

                    <View style={styles.table}>
                      {/* Table Header */}
                      <View style={[styles.tableRow, styles.tableHeader]}>
                        <Text style={[styles.tableCell, { width: "5%" }]}>
                          S.No
                        </Text>
                        <Text style={[styles.tableCell, { width: "20%" }]}>
                          Name
                        </Text>
                        <Text style={[styles.tableCell, { width: "12%" }]}>
                          Roll No
                        </Text>
                        <Text style={[styles.tableCell, { width: "28%" }]}>
                          Reason
                        </Text>
                        <Text style={[styles.tableCell, { width: "25%" }]}>
                          Duration
                        </Text>
                        <Text
                          style={[
                            styles.tableCell,
                            { width: "10%" },
                            styles.lastCell,
                          ]}
                        >
                          Days
                        </Text>
                      </View>

                      {/* Table Body */}
                      {sectionData.requests.map((req, index) => (
                        <View key={index} style={styles.tableRow}>
                          <Text style={[styles.tableCell, { width: "5%" }]}>
                            {index + 1}
                          </Text>
                          <Text style={[styles.tableCell, { width: "20%" }]}>
                            {req.name}
                          </Text>
                          <Text style={[styles.tableCell, { width: "12%" }]}>
                            {req.rollNo}
                          </Text>
                          <Text style={[styles.tableCell, { width: "28%" }]}>
                            {req.reason}
                          </Text>
                          <Text style={[styles.tableCell, { width: "25%" }]}>
                            {`${formatDate(req.fromDate)} to ${formatDate(
                              req.toDate
                            )}`}
                          </Text>
                          <Text
                            style={[
                              styles.tableCell,
                              { width: "10%" },
                              styles.lastCell,
                            ]}
                          >
                            {req.noOfDays}
                          </Text>
                        </View>
                      ))}

                      {/* Total Row for Section */}
                      <View style={styles.totalRow}>
                        <Text style={[styles.totalCell, { width: "90%" }]}>
                          Total Students on OD/Leave in Section{" "}
                          {sectionData.section}
                        </Text>
                        <Text
                          style={[
                            styles.totalCell,
                            { width: "10%" },
                            styles.lastCell,
                          ]}
                        >
                          {sectionData.requests.length}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}

              {/* Show signature only on last page */}
              {pageIndex === totalPages - 1 && (
                <>
                  {/* Grand Total Row */}
                  <View style={[styles.table, { marginBottom: 40 }]}>
                    <View style={styles.totalRow}>
                      <Text
                        style={[
                          styles.tableCell,
                          { width: "90%", fontWeight: "bold" },
                        ]}
                      >
                        Total Students on OD/Leave in Batch
                      </Text>
                      <Text
                        style={[
                          styles.tableCell,
                          { width: "10%", fontWeight: "bold" },
                        ]}
                      >
                        {filteredData.requests.reduce(
                          (acc, section) => acc + section.requests.length,
                          0
                        )}
                      </Text>
                    </View>
                  </View>

                  {/* Signature */}
                  <View style={styles.signature}>
                    <Text style={styles.signatureText}>
                      For Office Use Only
                    </Text>
                    <View style={styles.signatureLine} />
                    <Text style={styles.signatureTitle}>
                      HEAD OF THE DEPARTMENT
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Page numbers */}
            <View style={styles.footer} fixed>
              <View style={styles.footerContent}>
                <Text style={{ fontSize: 8, color: "#666" }}>
                  Generated by VCET Connect
                </Text>
                <Text style={{ fontSize: 8, color: "#666" }}>
                  Page {pageIndex + 1} of {totalPages}
                </Text>
              </View>
            </View>
          </Page>
        ))}
      </Document>
    );
  };

  // Modify the generatePDF function
  const generatePDF = async () => {
    const targetBatch = batches.find(
      (batch) => batch.batch_name === "2022-2026"
    );
    if (!targetBatch) {
      alert("2022-2026 batch not found");
      return;
    }

    setLoading(true);

    try {
      const allData = await fetchAllLeaveRequestsForBatch(targetBatch._id);
      if (!allData) {
        alert("Failed to fetch leave requests");
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const filteredData = {
        requests: allData.requests
          .map((sectionData) => ({
            section: sectionData.section,
            requests: sectionData.requests.filter(
              (req) =>
                req.status === "approved" &&
                new Date(req.fromDate).toLocaleDateString() ===
                  new Date().toLocaleDateString()
            ),
          }))
          .filter((sectionData) => sectionData.requests.length > 0),
      };

      if (filteredData.requests.length === 0) {
        setLoading(false);
        alert("No approved leave requests found");
        return;
      }

      // Generate PDF
      const blob = await pdf(
        <LeaveRequestsDocument
          deptName={deptName}
          filteredData={filteredData}
          today={today}
        />
      ).toBlob();

      // Save the PDF
      saveAs(
        blob,
        `${deptName}_Leave_Requests_${today.toLocaleDateString()}.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Replace the old sidebar with DashboardSidebar */}
      <DashboardSidebar
        menuItems={menuItems}
        currentTab={studentRequest ? "student_requests" : ""}
        onTabChange={handleTabChange}
        userInfo={currentUser}
        title={`HOD Dashboard - ${deptName || "Loading..."}`}
        onSidebarToggle={setIsSidebarOpen}
      />

      {/* Main Content - Update the wrapper div to match StaffDashBoard.jsx */}
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        <div className="p-4">
          {studentRequest && (
            <>
              {/* Add Generate PDF button */}
              {/* <div className="mb-6">
                <button
                  onClick={generatePDF}
                  disabled={loading}
                  className="bg-[#1f3a6e] hover:bg-[#162951] text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586L7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Generate PDF Report
                    </>
                  )}
                </button>
              </div> */}

              {/* Batch Selection Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-[#1f3a6e]" />
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Select Batch
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {batches.map((batch, index) => (
                    <div
                      key={index}
                      onClick={() => handleBatchSelect(batch)}
                      className={`cursor-pointer p-4 rounded-lg transition-all duration-300 ${
                        selectedBatch && selectedBatch._id === batch._id
                          ? "bg-[#1f3a6e] text-white"
                          : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700"
                      }`}
                    >
                      {batch.batch_name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Section Selection */}
              {selectedBatch && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    Sections for {selectedBatch.batch_name}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {sections.map((section, index) => (
                      <div
                        key={index}
                        className={`bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border-l-4 transition-all duration-300 ${
                          selectedSection && selectedSection._id === section._id
                            ? "border-[#1f3a6e]"
                            : "border-transparent"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">
                            Section {section.section_name}
                          </h3>
                          <button
                            onClick={() => handleSectionSelect(section)}
                            className="bg-[#1f3a6e] hover:bg-[#162951] text-white px-4 py-2 rounded-lg transition-all duration-300"
                          >
                            View Requests
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Leave Requests Table */}
              {selectedSection && leaveRequests.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Leave Requests - Section {selectedSection.section_name}
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                          <th className="px-6 py-4 w-[18%]">Student</th>
                          <th className="px-6 py-4 w-[20%]">Reason</th>
                          <th className="px-6 py-4 w-[15%]">Dates</th>
                          <th className="px-6 py-4 w-[8%] text-center">Days</th>
                          <th className="px-6 py-4 w-[12%]">Status</th>
                          <th className="px-6 py-4 w-[15%]">Comments</th>
                          <th className="px-6 py-4 w-[10%]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y dark:divide-gray-700">
                        {leaveRequests.map((req) => {
                          const { status: classInchargeStatus } =
                            req.approvals.classIncharge;
                          const { status: mentorStatus } = req.approvals.mentor;

                          return (
                            <tr
                              key={req._id}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            >
                              <td className="px-6 py-4 text-gray-900 dark:text-gray-200">
                                {req.name}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`text-gray-600 dark:text-gray-300 line-clamp-2 capitalize ${
                                      req.forMedical === true
                                        ? "text-red-600"
                                        : "text-blue-600"
                                    }`}
                                  >
                                    {req.reason}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                <div className="flex flex-col items-center min-w-max justify-center gap-2">
                                  <div>{formatDate(req.fromDate)}</div>
                                  <div>{formatDate(req.toDate)}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-300">
                                {req.noOfDays}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-center">
                                  <StatusDot
                                    status={req.approvals.mentor.status}
                                    showLine={true}
                                    by="M"
                                  />
                                  <StatusDot
                                    status={req.approvals.classIncharge.status}
                                    showLine={false}
                                    by="CI"
                                  />
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col gap-1 max-w-xs">
                                  {req.mentorcomment !== "No Comments" && (
                                    <div className="text-xs">
                                      <span className="font-medium text-gray-700">
                                        Mentor:
                                      </span>{" "}
                                      <span className="text-gray-600">
                                        {req.mentorcomment}
                                      </span>
                                    </div>
                                  )}
                                  {req.classInchargeComment !==
                                    "No Comments" && (
                                    <div className="text-xs">
                                      <span className="font-medium text-gray-700">
                                        CI:
                                      </span>{" "}
                                      <span className="text-gray-600">
                                        {req.classInchargeComment}
                                      </span>
                                    </div>
                                  )}
                                  {req.hodComment !== "No Comments" && (
                                    <div className="text-xs">
                                      <span className="font-medium text-gray-700">
                                        HOD:
                                      </span>{" "}
                                      <span className="text-gray-600">
                                        {req.hodComment}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {(() => {
                                  const baseClasses =
                                    "text-white text-center rounded-full p-1";
                                  if (
                                    mentorStatus === "approved" &&
                                    classInchargeStatus === "approved"
                                  ) {
                                    return (
                                      <div
                                        className={`bg-green-400 ${baseClasses}`}
                                      >
                                        Approved
                                      </div>
                                    );
                                  }
                                  if (
                                    mentorStatus === "rejected" ||
                                    classInchargeStatus === "rejected"
                                  ) {
                                    return (
                                      <div
                                        className={`bg-red-400 ${baseClasses}`}
                                      >
                                        Rejected
                                      </div>
                                    );
                                  }
                                  return (
                                    <div
                                      className={`bg-yellow-400 ${baseClasses}`}
                                    >
                                      Pending
                                    </div>
                                  );
                                })()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selectedSection && leaveRequests.length === 0 && !isFetching && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
                  <p className="text-gray-600 dark:text-gray-300">
                    No leave requests found for this section.
                  </p>
                </div>
              )}

              {isFetching && (
                <div className="flex justify-center items-center p-4">
                  <Spinner size="lg" />
                </div>
              )}
            </>
          )}

          {!studentRequest && !staffRequest && (
            <div className="">
              <div>
                {currentUser && (
                  <HODGenerativeSummary currentUser={currentUser} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Existing Modal remains the same */}
      <Modal show={modalType !== null} size="md" onClose={handleClose} popup>
        <ModalHeader />
        <ModalBody>
          <div className="text-center">
            {modalType === "approved" ? (
              <SiTicktick className="mx-auto mb-4 h-14 w-14 text-green-400 dark:text-white" />
            ) : modalType === "rejected" ? (
              <RxCrossCircled className="mx-auto mb-4 h-14 w-14 text-red-400 dark:text-white" />
            ) : (
              <MdOutlineDownloadDone className="mx-auto mb-4 h-14 w-14 text-primary-blue dark:text-white" />
            )}

            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              {modalType === "approved" ? (
                <div>
                  Are you to approve this request?
                  <div className="w-full my-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="px-4 py-2 bg-white rounded-t-lg dark:bg-gray-800">
                      <textarea
                        id="hod_comment"
                        rows="4"
                        className="w-full px-0 text-sm text-gray-900 bg-white border-0 focus:ring-0 dark:text-white"
                        placeholder="Write your comments..."
                        onChange={(e) => sethodComment(e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                </div>
              ) : modalType === "rejected" ? (
                <div>
                  Are you sure you want to reject this request?
                  <div className="w-full my-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="px-4 py-2 bg-white rounded-t-lg dark:bg-gray-800">
                      <textarea
                        id="comment"
                        rows="4"
                        className="w-full px-0 text-sm text-gray-900 bg-white border-0 focus:ring-0 dark:text-white"
                        placeholder="Write your comments..."
                        onChange={(e) => sethodComment(e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                </div>
              ) : (
                "This action has already been taken."
              )}
            </h3>
            {modalType !== "taken" && (
              <div className="flex justify-center gap-4">
                <Button
                  color={modalType === "approved" ? "success" : "failure"}
                  className={`${
                    modalType === "approved"
                      ? "bg-green-400 hover:bg-green-500"
                      : "bg-red-400 hover:bg-red-500"
                  }`}
                  onClick={confirmRequest}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <Spinner size="sm" className="mr-2" />
                      <span className="text-white">Loading...</span>
                    </div>
                  ) : (
                    <span className="text-white">
                      {modalType === "approved" ? "Approve" : "Reject"}
                    </span>
                  )}
                </Button>
                <Button color="gray" onClick={handleClose}>
                  Cancel
                </Button>
              </div>
            )}
            {modalType === "taken" && (
              <div className="flex justify-center gap-4">
                <Button className="bg-primary-blue" onClick={handleClose}>
                  <h1 className="text-white">Close</h1>
                </Button>
              </div>
            )}
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default Hoddashboard;
