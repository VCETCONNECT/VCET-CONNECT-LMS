import React, { useEffect, useState } from "react";
import { FaCalendarDay } from "react-icons/fa6";
import { TbBrandDaysCounter } from "react-icons/tb";
import { useSelector } from "react-redux";

import { FiEdit3 } from "react-icons/fi";
import { IoDocumentOutline } from "react-icons/io5";
import DashboardSidebar from "../components/layout/DashboardSidebar";
import PendingWorks from "../components/systems/defaulter/PendingWorks";
import LeaveRequestForm from "../components/systems/leave/LeaveRequestForm";
import ODRequestForm from "../components/systems/od/ODRequestForm";
import EditProfile from "../components/user/EditProfile";
import DashBoard from "./DashBoard";
import ODDashBoard from "./ODDashBoard";
import Academics from "../components/systems/studentacademics/Academics";
import { FaChalkboardTeacher, FaCheckCircle } from "react-icons/fa";
import BonafiedRequestForm from "../components/systems/bonafieds/BonafiedRequestForm";
import { Info, Loader2 } from "lucide-react";

const ProfilePage = () => {
  const { currentUser } = useSelector((state) => state.user);

  console.warn("Current User" , currentUser);

  const [mentor, setMentor] = useState({});
  const [classIncharge, setClassIncharge] = useState({});
  const [tab, setTab] = useState("EditProfile");
  const [pendingWorksCount, setPendingWorksCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [mentorRes, classInchargeRes] = await Promise.all([
          fetch(`/api/fetch/mentor/${currentUser.mentorId}`).then((res) =>
            res.json()
          ),
          fetch(`/api/fetch/class-incharge/${currentUser.sectionId}`).then(
            (res) => res.json()
          ),
        ]);
        setMentor(mentorRes);
        setClassIncharge(classInchargeRes);
      } catch (error) {
        console.error("Error fetching mentor/class incharge data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  useEffect(() => {
    const fetchPendingWorksCount = async () => {
      try {
        const response = await fetch(
          `/api/defaulter/pendingworks/${currentUser.id}`
        );
        const data = await response.json();
        if (data.success) {
          const pendingWorks = data.pendingWorks.filter((work) => !work.isDone);
          setPendingWorksCount(pendingWorks.length);
        }
      } catch (error) {
        console.error("Error fetching pending works count:", error);
      }
    };

    fetchPendingWorksCount();
  }, [currentUser.id]);

  const renderComponent = () => {
    switch (tab) {
      case "LeaveRequestForm":
        return (
          <LeaveRequestForm
            setTab={setTab}
            mentor={mentor}
            classIncharge={classIncharge}
          />
        );
      case "Your Pending Works":
        return <PendingWorks />;
      case "ODRequestForm":
        return (
          <ODRequestForm
            setTab={setTab}
            mentor={mentor}
            classIncharge={classIncharge}
          />
        );
      case "EditProfile":
        return (
          <EditProfile
            setTab={setTab}
            mentor={mentor}
            classIncharge={classIncharge}
          />
        );
      case "Bonafied":
        return <BonafiedRequestForm setTab={setTab} />;
      case "Your Leave Requests":
        return <DashBoard setTab={setTab} />;
      case "Your OD Requests":
        return <ODDashBoard setTab={setTab} />;
      case "Academics":
        return <Academics setTab={setTab} student={currentUser} />;
      default:
        return <LeaveRequestForm setTab={setTab} />;
    }
  };

  const menuItems = [
    {
      id: "EditProfile",
      icon: <FiEdit3 size={18} />,
      label: "Profile",
      submenu: false,
      disabled: isLoading,
    },
    {
      id: "Academics",
      icon: <FaChalkboardTeacher size={20} />,
      label: "Academics",
      submenu: false,
      disabled: isLoading,
    },
    {
      id: "Bonafied",
      icon: <FaCheckCircle size={18} />,
      label: "Bonafied Application",
      submenu: false,
      disabled: isLoading,
    },
    {
      id: "Your Pending Works",
      icon: <IoDocumentOutline size={18} />,
      label: "Your Pending Work",
      badge: pendingWorksCount > 0 ? pendingWorksCount : null,
      submenu: false,
      disabled: isLoading,
    },
    {
      id: "leave",
      icon: <FaCalendarDay size={20} />,
      label: "Leave Management",
      submenu: true,
      disabled: isLoading,
      submenuItems: [
        { id: "LeaveRequestForm", label: "Request Leave", disabled: isLoading },
        {
          id: "Your Leave Requests",
          label: "Your Leave Requests",
          disabled: isLoading,
        },
      ],
    },
    {
      id: "od",
      icon: <TbBrandDaysCounter size={20} />,
      label: "OD Management",
      submenu: true,
      disabled: isLoading,
      submenuItems: [
        { id: "ODRequestForm", label: "Request OD", disabled: isLoading },
        {
          id: "Your OD Requests",
          label: "Your OD Requests",
          disabled: isLoading,
        },
      ],
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardSidebar
          menuItems={menuItems}
          currentTab={tab}
          onTabChange={setTab}
          userInfo={currentUser}
          title="Profile"
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
            From 1st March 2025, Leave Requests Should be submitted before or within 7:30 AM.
          </span>
        </h2>
      </div> */}
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              renderComponent()
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
