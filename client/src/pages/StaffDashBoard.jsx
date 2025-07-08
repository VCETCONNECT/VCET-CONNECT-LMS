import React, { useState, useEffect } from "react";
import LeaveRequestForm from "../components/systems/leave/LeaveRequestForm";
import DashBoard from "./DashBoard";
import { useSelector } from "react-redux";
import {
  useFetchLeaveRequestForClassIncharge,
  useFetchLeaveRequestForMentor,
  useFetchODRequestForMentor,
  useFetchODRequestForClassIncharge,
} from "../../hooks/useFetchData";
import { ChevronDown, Info, User, UserRoundPlus } from "lucide-react";
import { ClipboardList, FileBarChart, UserCheck, FileText } from "lucide-react";
import LeaveStatsCard from "../components/systems/leave/LeaveStatsCard";
import LeaveRequests from "../components/systems/leave/LeaveRequests";
import MarkDefaulterandLate from "../components/systems/defaulter/MarkDefaulter";
import GenerateReport from "../components/systems/defaulter/PTGenerateReport";
import MenteeList from "../components/systems/MenteeList";
import StaffProfile from "../components/user/StaffProfile";
import ODRequests from "../components/systems/od/ODRequests";
import DashboardSidebar from "../components/layout/DashboardSidebar";
import StudentAcademicData from "../components/systems/studentacademics/StudentAcademicData";
import AttandanceCalander from "../components/systems/calendar/AttandanceCalander";
import { Calendar } from "lucide-react";
import LeaveRequestFormByStaff from "../components/systems/leave/LeaveRequestFormByStaff";

const StaffDashBoard = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [tab, setTab] = useState("Leave Requests");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [mentorRequests, setMentorRequests] = useState([]);
  const [classInchargeRequest, setClassInchargeRequest] = useState([]);
  const mentorODRequests = useFetchODRequestForMentor(currentUser.userId);
  const classInchargeODRequests = useFetchODRequestForClassIncharge(
    currentUser.userId,
    currentUser.classInchargeSectionId
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch leave requests on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [mentorData, classInchargeData] = await Promise.all([
          fetch(`/api/getleaverequestbymentorid/${currentUser.userId}`).then(
            (res) => res.json()
          ),
          fetch(
            `/api/getleaverequestbyclassinchargeid/${currentUser.userId}`
          ).then((res) => res.json()),
        ]);

        setMentorRequests(mentorData);
        setClassInchargeRequest(classInchargeData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (tab === "Leave Requests") {
      fetchInitialData();
    }
  }, [currentUser.userId, tab]);

  const renderComponent = () => {
    if (currentUser.isPEStaff === true) {
      switch (tab) {
        case "Mark Defaulter":
          return <MarkDefaulterandLate />;
        case "Generate Report":
          return <GenerateReport />;
        default:
          return <MarkDefaulterandLate />;
      }
    } else {
      switch (tab) {
        case "Profile":
          return <StaffProfile />;
        case "Leave Requests":
          return isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <LeaveRequests
              leaveRequestsAsClassIncharge={classInchargeRequest}
              leaveRequestsAsMentor={mentorRequests}
            />
          );
        case "OD Requests":
          return (
            <ODRequests
              odRequestsAsClassIncharge={classInchargeODRequests}
              odRequestsAsMentor={mentorODRequests}
            />
          );
        case "Defaulter":
          return <MarkDefaulterandLate />;
        case "Mentee List":
          return <MenteeList />;
        case "Student's Academics":
          return <StudentAcademicData userId={currentUser.userId} />;
        case "Calendar":
          return (
            <AttandanceCalander
              leaveRequests={[...mentorRequests, ...classInchargeRequest]}
              odRequests={[...mentorODRequests, ...classInchargeODRequests]}
            />
          );
        case "Student Leave by Staff":
          return <LeaveRequestFormByStaff/>;
      }
    }
  };

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    {
      id: "Leave Requests",
      icon: <ClipboardList size={18} />,
      label: `Student's Leave Requests`,
    },
    {
      id: "OD Requests",
      icon: <FileText size={18} />,
      label: "Student's OD Requests",
    },
    {
      id: "Defaulter",
      icon: <UserCheck size={18} />,
      label: "Defaulter",
    },
    {
      id: "Calendar",
      icon: <Calendar size={18} />,
      label: "Attandance Calendar",
    },
    // {
    //   id: "Leave Reports",
    //   icon: <FileBarChart size={18} />,
    //   label: "Reports",
    // },
    {
      id: "Student's Academics",
      icon: <UserRoundPlus size={18} />,
      label: "Student's Academics",
    },
    {
      id: "Mentee List",
      icon: <UserRoundPlus size={18} />,
      label: "Mentee List",
    },
    {
      id: "Profile",
      icon: <User size={18} />,
      label: "Profile",
    },
    {
      id: "Student Leave by Staff",
      icon: <UserRoundPlus size={18} />,
      label: "Emergency Student Leave",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardSidebar
        menuItems={menuItems}
        currentTab={tab}
        onTabChange={setTab}
        userInfo={currentUser}
        title={currentUser.isPEStaff ? "PE Staff Dashboard" : "Staff Dashboard"}
        onSidebarToggle={setIsSidebarOpen}
      />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        {/* <div className="text-sm bg-yellow-100 dark:bg-yellow-800 py-2 px-4 text-center">
          <h2 className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
            <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-300 shrink-0" />
            <span className="font-medium text-yellow-700 dark:text-yellow-200 text-xs sm:text-sm">
              Kindly note that from 1st March 2025, Leave Requests Should be
              approved or rejected before or within 7:30 AM - 8:00 AM for the current day
              request.
            </span>
          </h2>
        </div> */}
        <div className="p-4">{renderComponent()}</div>
      </div>
    </div>
  );
};

export default StaffDashBoard;
