import { Button, Modal, ModalBody, ModalHeader, Spinner } from "flowbite-react";
import { Info } from "lucide-react";
import React, { useEffect, useState } from "react";
import { MdOutlineDownloadDone } from "react-icons/md";
import { RxCross2, RxCrossCircled } from "react-icons/rx";
import { SiTicktick } from "react-icons/si";
import { TiTick } from "react-icons/ti";
import { useSelector } from "react-redux";
import StatusDot from "../../general/StatusDot";
import { GiConsoleController, GiMedicines } from "react-icons/gi";
import { ChevronRight } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  startOfWeek,
  addDays,
  parseISO,
  isWithinInterval,
} from "date-fns";

export default function LeaveRequests({
  leaveRequestsAsMentor,
  leaveRequestsAsClassIncharge,
}) {
  const [classInchargemodalType, setClassInchargeModalType] = useState(null); // 'approve', 'reject', or 'taken'
  const [mentormodalType, setMentorModalType] = useState(null); // 'approve', 'reject', or 'taken'
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [menteeRequests, setMenteeRequests] = useState(leaveRequestsAsMentor);
  const [classInchargeRequests, setClassInchargeRequests] = useState(
    leaveRequestsAsClassIncharge
  );
  const [isFetching, setIsFetching] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const [mentorComment, setmentorComment] = useState("");
  const [classInchargeComment, setclassInchargeComment] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const isStaffBothMentorAndCI =
    currentUser.isMentor && currentUser.isClassIncharge;
  const [activeTab, setActiveTab] = useState("pending");

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear().toString().slice(-2); // Get last two digits of the year
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month in two digits
    const day = date.getDate().toString().padStart(2, "0"); // Day in two digits
    return `${day}-${month}-${year}`;
  };

  // useEffect(() => {
  //   fetchLeaveRequestsMentor();
  // }, []);

  // useEffect(() => {
  //   fetchLeaveRequestsClassIncharge();
  // }, []);

  const handleRequest = (type, id) => {
    setMentorModalType(type);
    setCurrentRequestId(id);
  };

  const handleClose = () => {
    setMentorModalType(null);
    setCurrentRequestId(null);
  };

  const fetchLeaveRequestsMentor = async () => {
    setIsFetching(true);
    try {
      const response = await fetch(
        `/api/getleaverequestbymentorid/${currentUser.userId}`
      );
      const data = await response.json();
      setMenteeRequests(data);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const fetchLeaveRequestsClassIncharge = async () => {
    setIsFetching(true);
    try {
      const response = await fetch(
        `/api/getleaverequestbyclassinchargeid/${currentUser.userId}`
      );
      const data = await response.json();
      setClassInchargeRequests(data);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleRequestClassIncharge = (type, id) => {
    setClassInchargeModalType(type);
    setCurrentRequestId(id);
  };

  const handleCloseClassIncharge = () => {
    setClassInchargeModalType(null);
    setCurrentRequestId(null);
  };

  const confirmRequestMentor = async () => {
    setLoading(true);
    try {
      const backendUrl = `/api/leave-requestsbymentorid/${currentRequestId}/status`;
      const requestBody = {
        status: mentormodalType,
        mentorcomment: mentorComment,
        isStaffBothRoles: isStaffBothMentorAndCI,
      };

      const response = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update status");
      }

      // Refresh both lists to show updated status
      await Promise.all([
        fetchLeaveRequestsMentor(),
        fetchLeaveRequestsClassIncharge(),
      ]);
    } catch (error) {
      console.error("Error updating request:", error);
      alert(`Failed to update request: ${error.message}`);
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  const confirmRequestClass = async () => {
    setLoading(true);
    try {
      const backendUrl = `/api/leave-requestsbyclassinchargeid/${currentRequestId}/status`;
      const response = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: classInchargemodalType,
          classInchargeComment: classInchargeComment,
        }),
      });

      if (response.ok) {
        await fetchLeaveRequestsClassIncharge();
      } else {
        alert(`Failed to ${classInchargemodalType} request`);
      }
    } catch (error) {
      console.error("Error updating request:", error);
      alert(`Failed to ${classInchargemodalType} request`);
    } finally {
      setLoading(false);
      handleCloseClassIncharge();
    }
  };

  // Update the filtered class incharge requests logic
  const filteredClassInchargeRequests = classInchargeRequests.filter(
    (request) => {
      // If the staff is both mentor and CI for this student
      const isStaffMentorForStudent = menteeRequests.some(
        (menteeReq) => menteeReq._id === request._id
      );

      if (isStaffMentorForStudent) {
        const mentorStatus = request.approvals.mentor.status;
        // Show in CI section if mentor has taken action (either approved or rejected)
        return mentorStatus !== "pending";
      }

      // Show all requests where staff is only CI (not mentor)
      return true;
    }
  );

  // Update the isActionDisabled function
  const isActionDisabled = (request) => {
    if (currentUser.isClassIncharge) {
      // For CI view, disable actions if mentor rejected
      return request.approvals.mentor.status === "rejected";
    }
    return false; // Enable all actions for mentor
  };

  // Update the status display in renderRequestTable
  const getStatusDisplay = (request, role) => {
    const status = request.approvals[role].status;
    const mentorStatus = request.approvals.mentor.status;

    if (role === "classIncharge" && mentorStatus === "rejected") {
      return (
        <span className="px-4 py-1 rounded-full text-sm bg-red-100 text-red-600">
          Rejected
        </span>
      );
    }

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm ${
          status === "approved"
            ? "bg-green-100 text-green-600"
            : status === "rejected"
            ? "bg-red-100 text-red-600"
            : "bg-gray-100 text-gray-600"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Update the action buttons display
  const renderActionButtons = (request, role, handleRequest) => {
    const status = request.approvals[role].status;

    if (status === "pending" && !isActionDisabled(request)) {
      return (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() =>
              role === "mentor"
                ? handleRequest("approved", request._id)
                : handleRequestClassIncharge("approved", request._id)
            }
            className="bg-green-400 hover:bg-green-600 text-white p-1 rounded-full transition-all duration-300"
          >
            <TiTick size={30} />
          </button>
          <button
            onClick={() =>
              role === "mentor"
                ? handleRequest("rejected", request._id)
                : handleRequestClassIncharge("rejected", request._id)
            }
            className="bg-red-400 hover:bg-red-600 text-white p-1 rounded-full transition-all duration-300"
          >
            <RxCross2 size={30} />
          </button>
        </div>
      );
    }

    return getStatusDisplay(request, role);
  };

  // Update the getStatusColor function
  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300";
      case "rejected":
        return "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
    }
  };

  // Update the MobileRequestCard component
  const MobileRequestCard = ({ request, role, onAction }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900 dark:text-gray-200">
                {request.name}
              </p>
              {request.forMedical && (
                <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                  Medical
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {request.noOfDays} day(s) • {formatDate(request.fromDate)}
              {request.fromDate !== request.toDate &&
                ` to ${formatDate(request.toDate)}`}
            </p>
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

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <StatusDot
              status={request.approvals.mentor.status}
              showLine={true}
              by="M"
            />
            <StatusDot
              status={request.approvals.classIncharge.status}
              showLine={false}
              by="CI"
            />
          </div>
          {request.approvals[role].status === "pending" &&
          !isActionDisabled(request) ? (
            <div className="flex gap-2">
              <button
                onClick={() => onAction("approved", request._id)}
                className="bg-green-400 hover:bg-green-500 text-white p-1.5 rounded-full transition-all duration-300"
              >
                <TiTick size={20} />
              </button>
              <button
                onClick={() => onAction("rejected", request._id)}
                className="bg-red-400 hover:bg-red-500 text-white p-1.5 rounded-full transition-all duration-300"
              >
                <RxCross2 size={20} />
              </button>
            </div>
          ) : (
            <span
              className={`px-3 py-1 rounded-full text-xs ${
                request.approvals[role].status === "approved"
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {request.approvals[role].status.charAt(0).toUpperCase() +
                request.approvals[role].status.slice(1)}
            </span>
          )}
        </div>

        {isExpanded && (
          <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-600">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Reason</p>
              <p className="text-sm text-gray-900 dark:text-gray-200">
                {request.reason}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Contact
              </p>
              <p className="text-sm text-gray-900 dark:text-gray-200">
                {request.parent_phone}
              </p>
            </div>
            {/* {(request.mentorcomment !== "No Comments" ||
              request.classInchargeComment !== "No Comments") && ( */}
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Comments
              </p>
              <CommentsCell
                mentorcomment={request.mentorcomment}
                classInchargeComment={request.classInchargeComment}
                isBothRoles={isStaffBothMentorAndCI}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  // Add this function to filter requests based on status
  const filterRequestsByStatus = (requests, role) => {
    const today = new Date();
    return requests.filter((request) => {
      const toDate = new Date(request.toDate);
      today.setHours(0, 0, 0, 0);
      const isPastDue = toDate < today;

      if (activeTab === "pending") {
        // For pending tab, show only pending requests that are not past due
        return request.approvals[role].status === "pending" && !isPastDue;
      } else {
        // For other tabs, show non-pending requests and past due requests
        return (
          request.approvals[role].status !== "pending" ||
          (request.approvals[role].status === "pending" && isPastDue)
        );
      }
    });
  };

  // Update the renderRequestTable function to include mobile view
  const renderRequestTable = (requests, role, handleRequest) => {
    return (
      <>
        {/* Desktop view */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr className="text-center">
                <th className="px-6 py-4 w-[18%]">Student</th>
                <th className="px-6 py-4 w-[18%]">Reason</th>
                <th className="px-6 py-4 w-[10%]">Phone</th>
                <th className="px-6 py-4 w-[15%]">Dates</th>
                <th className="px-6 py-4 w-[12%]">Status</th>
                <th className="px-6 py-4 w-[15%]">Comments</th>
                <th className="px-6 py-4 w-[10%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {requests.map((req) => {
                const { status } = req.approvals[role];
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
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setShowDetails(true);
                          }}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <Info
                            size={16}
                            className="text-gray-400 hover:text-gray-600"
                          />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-300">
                      {req.parent_phone}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      <div className="flex items-center min-w-max justify-center gap-2">
                        <span className="bg-blue-200 px-1 rounded-full text-xs">
                          {req.noOfDays}
                        </span>
                        {req.fromDate === req.toDate ? (
                          <div>{formatDate(req.fromDate)}</div>
                        ) : (
                          <div className="flex gap-2">
                            <div>{formatDate(req.fromDate)}</div>
                            <div>{formatDate(req.toDate)}</div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
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
                      <CommentsCell
                        mentorcomment={req.mentorcomment}
                        classInchargeComment={req.classInchargeComment}
                        isBothRoles={isStaffBothMentorAndCI}
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      {renderActionButtons(req, role, handleRequest)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile view */}
        <div className="md:hidden space-y-4 p-4">
          {requests.map((request) => (
            <MobileRequestCard
              key={request._id}
              request={request}
              role={role}
              onAction={handleRequest}
            />
          ))}
        </div>
      </>
    );
  };

  // Add this new custom calendar component
  const CustomCalendar = ({ requests }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    // Create a map of dates to requests
    const requestsByDate = requests.reduce((acc, request) => {
      // Handle date range for each request
      const startDate = parseISO(request.fromDate);
      const endDate = parseISO(request.toDate);

      // Get all dates in the range
      const datesInRange = eachDayOfInterval({
        start: startDate,
        end: endDate,
      });

      // Add request to each date in the range
      datesInRange.forEach((date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        if (!acc[dateStr]) {
          acc[dateStr] = [];
        }
        acc[dateStr].push(request);
      });

      return acc;
    }, {});

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfMonth(monthEnd);

    // Get all dates to display (including padding days)
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const previousMonth = () => {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
      );
    };

    const nextMonth = () => {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
      );
    };

    const handleDateClick = (date, requests) => {
      if (requests && requests.length > 0) {
        setSelectedDate(date);
        // You can add additional handling here, like showing a modal with requests for that date
      }
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            ←
          </button>
          <h2 className="text-lg font-semibold">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            →
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Week day headers */}
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 p-2"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayRequests = requestsByDate[dateStr] || [];
            const isCurrentMonth = isSameMonth(day, currentDate);

            return (
              <div
                key={dateStr}
                onClick={() => handleDateClick(day, dayRequests)}
                className={`
                  relative p-2 min-h-[2.5rem] text-center border border-gray-100 
                  dark:border-gray-700 cursor-pointer
                  ${!isCurrentMonth ? "opacity-50" : ""}
                  ${
                    isToday(day)
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }
                  ${
                    selectedDate &&
                    format(selectedDate, "yyyy-MM-dd") === dateStr
                      ? "ring-2 ring-blue-500"
                      : ""
                  }
                `}
              >
                <span
                  className={`
                  text-sm ${
                    isToday(day)
                      ? "font-bold text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300"
                  }
                `}
                >
                  {format(day, "d")}
                </span>
                {dayRequests.length > 0 && (
                  <span className="absolute top-0 right-0 -mt-1 -mr-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
                    {dayRequests.length}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Optional: Show selected date's requests */}
        {selectedDate && requestsByDate[format(selectedDate, "yyyy-MM-dd")] && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <h4 className="font-medium mb-2">
              Requests for {format(selectedDate, "dd MMM yyyy")}
            </h4>
            <div className="space-y-2">
              {requestsByDate[format(selectedDate, "yyyy-MM-dd")].map(
                (request, index) => (
                  <div
                    key={index}
                    className="text-sm p-2 bg-white dark:bg-gray-600 rounded"
                  >
                    <div className="font-medium">{request.name}</div>
                    <div className="text-gray-500 dark:text-gray-300">
                      {request.reason}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Add the Pagination component
  const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    return (
      <div className="flex justify-center items-center space-x-2 mt-4">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-md ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Previous
        </button>

        <div className="flex space-x-1">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => onPageChange(index + 1)}
              className={`w-8 h-8 rounded-md ${
                currentPage === index + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-md ${
            currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Next
        </button>
      </div>
    );
  };

  // Update the CompactRequestList component to include pagination
  const CompactRequestList = ({ requests, role }) => {
    const [expandedId, setExpandedId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const requestsPerPage = 10;

    // Calculate pagination values
    const indexOfLastRequest = currentPage * requestsPerPage;
    const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
    const currentRequests = requests.slice(
      indexOfFirstRequest,
      indexOfLastRequest
    );
    const totalPages = Math.ceil(requests.length / requestsPerPage);

    const handlePageChange = (pageNumber) => {
      setCurrentPage(pageNumber);
      setExpandedId(null); // Close any expanded items when changing pages
    };

    const getStatusColor = (status) => {
      switch (status) {
        case "approved":
          return "bg-green-100 text-green-800";
        case "rejected":
          return "bg-red-100 text-red-800";
        default:
          return "bg-yellow-100 text-yellow-800";
      }
    };

    const formatDate = (date) => {
      return format(parseISO(date), "dd MMM yy");
    };

    return (
      <div>
        <div className="space-y-2">
          {currentRequests.map((request) => (
            <div
              key={request._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
            >
              {/* Header - Always visible */}
              <div
                onClick={() =>
                  setExpandedId(expandedId === request._id ? null : request._id)
                }
                className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {request.forMedical ? (
                      <span className="p-1 bg-red-100 text-red-600 rounded">
                        <GiMedicines className="h-4 w-4" />
                      </span>
                    ) : (
                      <span className="p-1 bg-blue-100 text-blue-600 rounded">
                        <Info className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {request.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(request.fromDate)}
                      {request.fromDate !== request.toDate &&
                        ` - ${formatDate(request.toDate)}`}
                      {" • "}
                      {request.noOfDays} day(s)
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                      request.approvals[role].status
                    )}`}
                  >
                    {request.approvals[role].status}
                  </span>
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${
                      expandedId === request._id ? "rotate-90" : ""
                    }`}
                  />
                </div>
              </div>

              {/* Expanded content */}
              {expandedId === request._id && (
                <div className="px-3 pb-3 text-sm space-y-2">
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t dark:border-gray-700">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Reason
                      </p>
                      <p className="text-gray-900 dark:text-gray-200">
                        {request.reason}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Contact
                      </p>
                      <p className="text-gray-900 dark:text-gray-200">
                        {request.parent_phone}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Comments
                      </p>
                      <CommentsCell
                        mentorcomment={request.mentorcomment}
                        classInchargeComment={request.classInchargeComment}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Show pagination only if there are more than requestsPerPage items */}
        {requests.length > requestsPerPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    );
  };

  // First, let's create separate components for Pending and Action Done sections

  const PendingRequestsSection = ({
    currentUser,
    menteeRequests,
    filteredClassInchargeRequests,
    handleRequest,
    handleRequestClassIncharge,
  }) => {
    return (
      <>
        {/* Mentor Requests Section */}
        {currentUser.isMentor && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="p-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-semibold">
                Pending Leave Requests From Your Class Mentees
              </h2>
            </div>
            {filterRequestsByStatus(menteeRequests, "mentor").length > 0 ? (
              renderRequestTable(
                filterRequestsByStatus(menteeRequests, "mentor"),
                "mentor",
                handleRequest
              )
            ) : (
              <h2 className="font-semibold text-center p-6">
                No Pending Leave Requests from Your Mentees
              </h2>
            )}
          </div>
        )}

        {/* Class Incharge Requests Section */}
        {currentUser.isClassIncharge && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b dark:border-gray-700">
              <h2 className="text-lg font-semibold">
                Pending Leave Requests From Your Class Students
              </h2>
            </div>
            {filterRequestsByStatus(
              filteredClassInchargeRequests,
              "classIncharge"
            ).length > 0 ? (
              renderRequestTable(
                filterRequestsByStatus(
                  filteredClassInchargeRequests,
                  "classIncharge"
                ),
                "classIncharge",
                handleRequestClassIncharge
              )
            ) : (
              <h2 className="font-semibold text-center p-6">
                No Pending Leave Requests from Your Students
              </h2>
            )}
          </div>
        )}
      </>
    );
  };

  const ActionDoneSection = ({
    currentUser,
    menteeRequests,
    filteredClassInchargeRequests,
    activeTab,
  }) => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-1">
          {currentUser.isMentor && !currentUser.isClassIncharge && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">
                Mentor Requests Calendar
              </h3>
              <CustomCalendar
                requests={filterRequestsByStatus(menteeRequests, "mentor")}
              />
            </div>
          )}
          {currentUser.isClassIncharge && !currentUser.isMentor && (
            <div>
              <h3 className="text-sm font-medium mb-2">
                Class Incharge Requests Calendar
              </h3>
              <CustomCalendar
                requests={filterRequestsByStatus(
                  filteredClassInchargeRequests,
                  "classIncharge"
                )}
              />
            </div>
          )}
          {currentUser.isMentor && currentUser.isClassIncharge && (
            <div>
              <h3 className="text-sm font-medium mb-2">
                All Requests Calendar
              </h3>
              <CustomCalendar
                requests={[
                  ...filterRequestsByStatus(menteeRequests, "mentor"),
                  ...filterRequestsByStatus(
                    filteredClassInchargeRequests,
                    "classIncharge"
                  ),
                ]}
              />
            </div>
          )}
        </div>

        {/* List Section */}
        <div className="lg:col-span-2">
          {currentUser.isMentor && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="p-4 border-b dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">
                    Action Done Leave Requests From Your Class Mentees
                  </h2>
                  <span className="text-sm text-gray-500">
                    Total:{" "}
                    {
                      filterRequestsByStatus(
                        menteeRequests,
                        "mentor",
                        activeTab
                      ).length
                    }
                  </span>
                </div>
              </div>
              <div className="p-4">
                {filterRequestsByStatus(menteeRequests, "mentor", activeTab)
                  .length > 0 ? (
                  <CompactRequestList
                    requests={filterRequestsByStatus(
                      menteeRequests,
                      "mentor",
                      activeTab
                    )}
                    role="mentor"
                  />
                ) : (
                  <h2 className="text-center text-gray-500">
                    No Action Done Leave Requests from Your Mentees
                  </h2>
                )}
              </div>
            </div>
          )}

          {currentUser.isClassIncharge && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">
                    Action Done Leave Requests From Your Class Students
                  </h2>
                  <span className="text-sm text-gray-500">
                    Total:{" "}
                    {
                      filterRequestsByStatus(
                        filteredClassInchargeRequests,
                        "classIncharge",
                        activeTab
                      ).length
                    }
                  </span>
                </div>
              </div>
              <div className="p-4">
                {filterRequestsByStatus(
                  filteredClassInchargeRequests,
                  "classIncharge",
                  activeTab
                ).length > 0 ? (
                  <CompactRequestList
                    requests={filterRequestsByStatus(
                      filteredClassInchargeRequests,
                      "classIncharge",
                      activeTab
                    )}
                    role="classIncharge"
                  />
                ) : (
                  <h2 className="text-center text-gray-500">
                    No Action Done Leave Requests from Your Students
                  </h2>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full mx-auto p-4">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Students Leave Requests
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            View and manage leave requests
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
            activeTab === "pending"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Pending Requests
        </button>
        <button
          onClick={() => setActiveTab("actionDone")}
          className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
            activeTab === "actionDone"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Action Done Requests
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === "pending" ? (
        <PendingRequestsSection
          currentUser={currentUser}
          menteeRequests={menteeRequests}
          filteredClassInchargeRequests={filteredClassInchargeRequests}
          handleRequest={handleRequest}
          handleRequestClassIncharge={handleRequestClassIncharge}
        />
      ) : (
        <ActionDoneSection
          currentUser={currentUser}
          menteeRequests={menteeRequests}
          filteredClassInchargeRequests={filteredClassInchargeRequests}
          activeTab={activeTab}
        />
      )}

      {/* Mentor Modal */}
      <Modal
        show={mentormodalType !== null}
        size="md"
        onClose={handleClose}
        popup
      >
        <ModalHeader />
        <ModalBody>
          <h3 className="text-lg font-semibold mb-4">
            {mentormodalType === "approved" ? "Approve" : "Reject"} Request
            {isStaffBothMentorAndCI && " (as Mentor & Class Incharge)"}
          </h3>
          <div>
            <div className="mb-4">
              <label
                htmlFor="mentor_comment"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Add your comment
                {isStaffBothMentorAndCI && " (will apply for both roles)"}
              </label>
              <textarea
                id="mentor_comment"
                rows="4"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Write your comments..."
                onChange={(e) => setmentorComment(e.target.value)}
              />
            </div>
            <div className="flex justify-center gap-4">
              <Button
                color={mentormodalType === "approved" ? "success" : "failure"}
                onClick={confirmRequestMentor}
              >
                {loading ? (
                  <div className="flex items-center">
                    <Spinner size="sm" className="mr-2" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <span>
                    {mentormodalType === "approved" ? "Approve" : "Reject"}
                  </span>
                )}
              </Button>
              <Button color="gray" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>

      {/* Class Incharge Modal */}
      <Modal
        show={classInchargemodalType !== null}
        size="md"
        onClose={handleCloseClassIncharge}
        popup
      >
        <ModalHeader />
        <ModalBody className="pt-3">
          <div className="text-center">
            {classInchargemodalType === "approved" ? (
              <SiTicktick className="mx-auto mb-4 h-14 w-14 text-green-500 dark:text-white" />
            ) : classInchargemodalType === "rejected" ? (
              <RxCrossCircled className="mx-auto mb-4 h-14 w-14 text-red-500 dark:text-white" />
            ) : (
              <MdOutlineDownloadDone className="mx-auto mb-4 h-14 w-14 text-secondary-blue dark:text-white" />
            )}

            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              {classInchargemodalType === "approved" ? (
                <div>
                  Are you to approve this request?
                  <div className="w-full my-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="px-4 py-2  rounded-t-lg dark:bg-gray-800">
                      <textarea
                        id="classIncharge_comment"
                        rows="4"
                        className="w-full px-0 text-sm text-gray-900 bg-white border-0  focus:ring-0 dark:text-white"
                        placeholder="Write your comments..."
                        onChange={(e) =>
                          setclassInchargeComment(e.target.value)
                        }
                      ></textarea>
                    </div>
                  </div>
                </div>
              ) : classInchargemodalType === "rejected" ? (
                <div>
                  Are you sure you want to reject this request?
                  <div className="w-full my-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="px-4 py-2 bg-white rounded-t-lg dark:bg-gray-800">
                      <textarea
                        id="classIncharge_comment"
                        rows="4"
                        className="w-full px-0 text-sm text-gray-900 bg-white border-0  focus:ring-0 dark:text-white"
                        placeholder="Write your comments..."
                        onChange={(e) =>
                          setclassInchargeComment(e.target.value)
                        }
                      ></textarea>
                    </div>
                  </div>
                </div>
              ) : (
                "This action has already been taken."
              )}
            </h3>
            {classInchargemodalType !== "taken" && (
              <div className="flex justify-center gap-4">
                <Button
                  color={
                    classInchargemodalType === "approved"
                      ? "success"
                      : "failure"
                  }
                  className={`${
                    classInchargemodalType === "approved"
                      ? "bg-green-500 hover:bg-green-500"
                      : "bg-red-500 hover:bg-red-500"
                  }`}
                  onClick={confirmRequestClass}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <Spinner size="sm" className="mr-2" />
                      <span className="text-white">Loading...</span>
                    </div>
                  ) : (
                    <span className="text-white">
                      {classInchargemodalType === "approved"
                        ? "Approve"
                        : "Reject"}
                    </span>
                  )}
                </Button>
                <Button color="gray" onClick={handleCloseClassIncharge}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </ModalBody>
      </Modal>

      {/* Details Modal */}
      {selectedRequest && (
        <DetailsModal
          isOpen={showDetails}
          onClose={() => {
            setShowDetails(false);
            setSelectedRequest(null);
          }}
          request={selectedRequest}
        />
      )}
    </div>
  );
}

// Helper Components

const CommentsCell = ({ mentorcomment, classInchargeComment, isBothRoles }) => {
  return (
    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
      {mentorcomment ? (
        <div className="bg-gray-50 p-2 rounded">
          <p>
            <span className="font-semibold text-gray-700">Mentor:</span>{" "}
            {mentorcomment}
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 p-2 rounded">
          <p>
            <span className="font-semibold text-gray-700">Mentor:</span> No
            Comments
          </p>
        </div>
      )}
      {classInchargeComment ? (
        <div className="bg-gray-50 p-2 rounded">
          <p>
            <span className="font-semibold text-gray-700">CI:</span>{" "}
            {classInchargeComment}
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 p-2 rounded">
          <p>
            <span className="font-semibold text-gray-700">CI:</span> No Comments
          </p>
        </div>
      )}
    </div>
  );
};

const DetailsModal = ({ isOpen, onClose, request }) => (
  <Modal show={isOpen} onClose={onClose} size="lg">
    <Modal.Header>Leave Request Details</Modal.Header>
    <Modal.Body>
      <div className="space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <DetailItem label="Student Name" value={request.name} />
          <DetailItem label="Section" value={request.section_name} />
          <DetailItem
            label="Leave Type"
            value={
              request.typeOfLeave ||
              (request.forMedical ? "Medical Leave" : "Regular Leave")
            }
          />
          <DetailItem label="No. of Days" value={request.noOfDays} />
          <DetailItem
            label="From Date"
            value={new Date(request.fromDate).toLocaleDateString()}
          />
          <DetailItem
            label="To Date"
            value={new Date(request.toDate).toLocaleDateString()}
          />
        </div>

        <hr className="border-gray-200 dark:border-gray-700" />

        {/* Leave Details */}
        <div>
          <h3 className="font-medium mb-2">Leave Details</h3>
          <DetailItem label="Reason" value={request.reason} />
          {request.isHalfDay && (
            <DetailItem
              label="Half Day"
              value={request.isHalfDay === "FN" ? "Forenoon" : "Afternoon"}
            />
          )}
          {request.forMedical && (
            <div className="mt-2 flex items-center gap-2 text-red-600">
              <span className="bg-red-50 p-1 rounded">
                <GiMedicines className="h-4 w-4" />
              </span>
              <span className="text-sm font-medium">Medical Leave</span>
            </div>
          )}
        </div>

        {/* Approval Status */}
        <div className="flex items-center gap-2">
          <h3 className="font-medium">Approval Status</h3>
          <div className="">
            <div className="flex">
              <StatusDot
                status={request.approvals.mentor.status}
                showLine={true}
                by="M"
              />
              <StatusDot
                status={request.approvals.classIncharge.status}
                showLine={false}
                by="CI"
              />
            </div>
          </div>
        </div>
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button color="gray" onClick={onClose}>
        Close
      </Button>
    </Modal.Footer>
  </Modal>
);

const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium">{value || "Not provided"}</p>
  </div>
);
