import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Modal } from "flowbite-react";
import {
  Calendar,
  Clock,
  Trash2,
  AlertCircle,
  MessageCircle,
  CheckCircle2,
  History,
  Filter,
  FileText,
  Loader2,
} from "lucide-react";
import StatusDot from "../../general/StatusDot";

const LeaveStatus = ({ leaveRequests }) => {
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("pending");
  const [openModal, setOpenModal] = useState(false);
  const [deletingLeave, setDeletingLeave] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const { currentUser } = useSelector((state) => state.user);

  if (!Array.isArray(leaveRequests)) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500 dark:text-gray-400">
          No leave requests found.
        </p>
      </div>
    );
  }

  const filteredRequests = leaveRequests.filter((request) => {
    const toDate = new Date(request.toDate);
    const today = new Date();
    switch (filter) {
      case "past7days":
        return toDate >= new Date(today.setDate(today.getDate() - 7));
      case "past1month":
        return toDate >= new Date(today.setMonth(today.getMonth() - 1));
      default:
        return true;
    }
  });

  const pendingRequests = filteredRequests.filter((request) => {
    return (
      (request.approvals.mentor.status === "pending" ||
        request.approvals.classIncharge.status === "pending") &&
      request.approvals.mentor.status !== "rejected" &&
      request.approvals.classIncharge.status !== "rejected"
    );
  });

  const approvedRequests = filteredRequests.filter((request) => {
    return (
      request.approvals.mentor.status === "rejected" ||
      request.approvals.classIncharge.status === "rejected" ||
      (request.approvals.mentor.status === "approved" &&
        request.approvals.classIncharge.status === "approved")
    );
  });

  const handleDeleteLeave = async (id) => {
    setDeletingLeave(true);
    try {
      const response = await fetch(`/api/deleteleave/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting leave request:", error);
    } finally {
      setDeletingLeave(false);
      setOpenModal(false);
    }
  };

  const LeaveRequestCard = ({ request, isPending }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-b dark:border-gray-700">
        <div className="space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <Calendar size={16} />
            From Date
          </p>
          <p className="font-medium">
            {new Date(request.fromDate).toLocaleDateString()}
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <Calendar size={16} />
            To Date
          </p>
          <p className="font-medium">
            {new Date(request.toDate).toLocaleDateString()}
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <FileText size={16} />
            Leave Type
          </p>
          <p className="font-medium">
            {request.isMedical ? "Medical Leave" : "Casual Leave"}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {request.isHalfDay ? " (Half Day)" : " (Full Day)"}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Status:
          </span>
          <div className="flex-1">
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

      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {request.noOfDays} {request.noOfDays === 1 ? "day" : "days"}
            </span>
          </div>
          <span className="text-xs text-gray-400">
            Applied on {new Date(request.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="mt-4 space-y-3 grid grid-cols-2 gap-4">
          {request.mentorcomment !== "No Comments" && (
            <CommentBox
              title="Mentor Comment"
              comment={request.mentorcomment}
            />
          )}
          {request.classInchargeComment !== "No Comments" && (
            <CommentBox
              title="Class Incharge Comment"
              comment={request.classInchargeComment}
            />
          )}
        </div>

        <div className="flex justify-between items-center pt-2">
          <StatusBadge status={request.status} />
          {isPending && (
            <button
              onClick={() => {
                setSelectedRequest(request);
                setOpenModal(true);
              }}
              className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Add leave summary calculation
  const getStartOfWeek = (date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(start.setDate(diff));
  };

  const getStartOfMonth = (date) =>
    new Date(date.getFullYear(), date.getMonth(), 1);

  const getStartOfSemester = (date) => {
    const month = date.getMonth();
    const semesterStartMonth = month < 6 ? 0 : 6;
    return new Date(date.getFullYear(), semesterStartMonth, 1);
  };

  const getStartOfYear = (date) => new Date(date.getFullYear(), 0, 1);

  const getTotalApprovedDays = (requests, startDateFunction) => {
    const now = new Date();
    return requests
      .filter((request) => new Date(request.toDate) >= startDateFunction(now))
      .reduce((total, request) => total + request.noOfDays, 0);
  };

  const allotedLeave = filteredRequests.filter(
    (request) => request.status === "approved"
  );

  const summaryItems = [
    {
      title: "Week",
      value: getTotalApprovedDays(allotedLeave, getStartOfWeek),
    },
    {
      title: "Month",
      value: getTotalApprovedDays(allotedLeave, getStartOfMonth),
      maxValue: 3,
    },
    {
      title: "Semester",
      value: getTotalApprovedDays(allotedLeave, getStartOfSemester),
    },
    {
      title: "Year",
      value: getTotalApprovedDays(allotedLeave, getStartOfYear),
    },
  ];

  const CommentsCell = ({ mentorcomment, classInchargeComment }) => {
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
              <span className="font-semibold text-gray-700">CI:</span> No
              Comments
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full mx-auto p-4">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Leave Requests
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            View and manage your leave requests
          </p>
        </div>
      </div>

      {/* Leave Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 shadow-md rounded-3xl p-8 mb-8 max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-300 mb-2 sm:mb-0">
            Leave Summary
          </h2>
          <p className="text-sm text-indigo-600 dark:text-indigo-300 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow">
            Max 3 leaves per month
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {summaryItems.map((item) => (
            <div
              key={item.title}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <h3 className="text-sm font-medium text-indigo-400 dark:text-indigo-300 mb-1">
                {item.title}
              </h3>
              <p
                className={`text-2xl font-bold ${
                  item.maxValue && item.value > item.maxValue
                    ? "text-red-500 dark:text-red-400"
                    : "text-indigo-700 dark:text-indigo-300"
                }`}
              >
                {item.value}
              </p>
              {item.maxValue && item.value > item.maxValue && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                  Limit Exceeded
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* View Toggle Buttons */}
      <div className="flex justify-center gap-4 mb-6">
        <ViewToggleButton
          active={view === "pending"}
          onClick={() => setView("pending")}
          icon={<History size={18} />}
          text="Pending Requests"
        />
        <ViewToggleButton
          active={view === "approved"}
          onClick={() => setView("approved")}
          icon={<CheckCircle2 size={18} />}
          text="Completed Requests"
        />
      </div>

      {/* Filter */}
      <div className="flex items-center justify-end gap-3 mb-6">
        <Filter size={16} className="text-gray-400" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-40 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="all">All Time</option>
          <option value="past7days">Past 7 Days</option>
          <option value="past1month">Past Month</option>
        </select>
      </div>

      {/* Leave Request Cards */}
      <div className="max-w-3xl mx-auto space-y-4">
        {view === "pending" ? (
          pendingRequests.length > 0 ? (
            pendingRequests.map((request) => (
              <LeaveRequestCard
                key={request._id}
                request={request}
                isPending={true}
              />
            ))
          ) : (
            <EmptyState text="No pending requests" />
          )
        ) : approvedRequests.length > 0 ? (
          approvedRequests.map((request) => (
            <LeaveRequestCard
              key={request._id}
              request={request}
              isPending={false}
            />
          ))
        ) : (
          <EmptyState text="No completed requests" />
        )}
      </div>

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onConfirm={() => handleDeleteLeave(selectedRequest?._id)}
        isLoading={deletingLeave}
      />
    </div>
  );
};

const ViewToggleButton = ({ active, onClick, icon, text }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
      active
        ? "bg-blue-200 text-black"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`}
  >
    {icon}
    <span className="font-medium">{text}</span>
  </button>
);

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-50 text-yellow-600 border-yellow-200",
    approved: "bg-green-50 text-green-600 border-green-200",
    rejected: "bg-red-50 text-red-600 border-red-200",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium border ${styles[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const CommentBox = ({ title, comment }) => (
  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
    <div className="flex items-center gap-2 mb-1">
      <MessageCircle size={14} className="text-gray-400" />
      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
        {title}
      </p>
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-400">{comment}</p>
  </div>
);

const EmptyState = ({ text }) => (
  <div className="flex flex-col items-center justify-center py-8">
    <History size={48} className="text-gray-300 mb-2" />
    <p className="text-gray-500 dark:text-gray-400">{text}</p>
  </div>
);

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, isLoading }) => (
  <Modal show={isOpen} onClose={onClose} size="sm">
    <Modal.Header className="border-b border-gray-200 dark:border-gray-700">
      Delete Leave Request
    </Modal.Header>
    <Modal.Body>
      <div className="flex items-center gap-3 text-gray-600">
        <AlertCircle size={20} className="text-red-500" />
        <p>Are you sure you want to delete this leave request?</p>
      </div>
    </Modal.Body>
    <Modal.Footer>
      <button
        onClick={onConfirm}
        disabled={isLoading}
        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Deleting...</span>
          </div>
        ) : (
          "Delete Request"
        )}
      </button>
      <button
        onClick={onClose}
        className="px-4 py-2 text-gray-500 hover:text-gray-700"
      >
        Cancel
      </button>
    </Modal.Footer>
  </Modal>
);

export default LeaveStatus;
