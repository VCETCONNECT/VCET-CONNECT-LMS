import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Calendar,
  GraduationCap,
  X,
} from "lucide-react";
import { GiMedicines } from "react-icons/gi";
import { format } from "date-fns";

const LeaveStatsCard = ({
  leaveRequestsAsMentor,
  leaveRequestsAsClassIncharge,
}) => {
  const [menteeRequests, setMenteeRequests] = useState(leaveRequestsAsMentor);
  const [classInchargeRequests, setClassInchargeRequests] = useState(
    leaveRequestsAsClassIncharge
  );
  const [menteeList, setMenteeList] = useState([]);
  const [menteeStats, setMenteeStats] = useState({
    total: 0,
    withLeaves: 0,
    withoutLeaves: 0,
  });
  const { currentUser } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState(null);
  const [stats, setStats] = useState({
    mentor: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      medical: 0,
      nonMedical: 0,
      singleDay: 0,
      multiDay: 0,
    },
    classIncharge: {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      medical: 0,
      nonMedical: 0,
      singleDay: 0,
      multiDay: 0,
    },
  });

  useEffect(() => {
    fetchLeaveRequestsMentor();
  }, []);
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

  useEffect(() => {
    const fetchMenteeList = async () => {
      try {
        const response = await fetch(`/api/fetch/mentee/${currentUser.userId}`);
        const data = await response.json();

        if (response.ok) {
          setMenteeList(data);

          // Calculate mentee statistics
          const menteeWithLeaves = data.filter((menteeList) =>
            leaveRequestsAsMentor.some(
              (request) =>
                request.name === menteeList.name ||
                request.roll_no === menteeList.rollNo
            )
          );

          setMenteeStats({
            total: data.length,
            withLeaves: menteeWithLeaves.length,
            withoutLeaves: data.length - menteeWithLeaves.length,
          });
        }
      } catch (error) {
        console.error("Error fetching mentee list:", error);
      }
    };

    if (currentUser.isMentor) {
      fetchMenteeList();
    }
  }, [currentUser.userId, currentUser.isMentor]);

  useEffect(() => {
    calculateStats();
  }, [menteeRequests, leaveRequestsAsClassIncharge]);

  const calculateStats = () => {
    const mentorStats = {
      total: leaveRequestsAsMentor.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      medical: 0,
      nonMedical: 0,
      singleDay: 0,
      multiDay: 0,
    };

    const classInchargeStats = {
      total: leaveRequestsAsClassIncharge.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      medical: 0,
      nonMedical: 0,
      singleDay: 0,
      multiDay: 0,
    };

    // Calculate mentor stats
    leaveRequestsAsMentor.forEach((request) => {
      const status = request.approvals.mentor.status;
      mentorStats[status]++;

      if (request.forMedical) mentorStats.medical++;
      else mentorStats.nonMedical++;

      if (request.noOfDays === 1) mentorStats.singleDay++;
      else mentorStats.multiDay++;
    });

    // Calculate class incharge stats
    leaveRequestsAsClassIncharge.forEach((request) => {
      const status = request.approvals.classIncharge.status;
      classInchargeStats[status]++;

      if (request.forMedical) classInchargeStats.medical++;
      else classInchargeStats.nonMedical++;

      if (request.noOfDays === 1) classInchargeStats.singleDay++;
      else classInchargeStats.multiDay++;
    });

    setStats({ mentor: mentorStats, classIncharge: classInchargeStats });
  };

  const formatDate = (date) => {
    return format(new Date(date), "dd/MM/yyyy");
  };

  const StatCard = ({ title, stats, onClick }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {title}
        </h3>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Primary Stats */}
          <StatItem
            icon={<Users />}
            label="Total Requests"
            value={stats.total}
          />
          <StatItem
            icon={<Clock />}
            label="Pending"
            value={stats.pending}
            colorClass="yellow"
          />
          <StatItem
            icon={<CheckCircle />}
            label="Approved"
            value={stats.approved}
            colorClass="green"
          />
          <StatItem
            icon={<XCircle />}
            label="Rejected"
            value={stats.rejected}
            colorClass="red"
          />

          {/* Additional Stats */}
          <StatItem
            icon={<GiMedicines />}
            label="Medical"
            value={stats.medical}
            colorClass="blue"
          />
          <StatItem
            icon={<FileText />}
            label="Non-Medical"
            value={stats.nonMedical}
            colorClass="blue"
          />
          <StatItem
            icon={<Calendar />}
            label="Single Day"
            value={stats.singleDay}
            colorClass="blue"
          />
          <StatItem
            icon={<Calendar />}
            label="Multiple Days"
            value={stats.multiDay}
            colorClass="blue"
          />
        </div>

        <button
          onClick={onClick}
          className="w-full bg-[#1f3a6e] text-white py-2 rounded-lg font-medium hover:bg-[#0b1f44] transition-all duration-300"
        >
          View Detailed Report
        </button>
      </div>
    </div>
  );

  const StatItem = ({ icon, label, value, colorClass = "blue" }) => (
    <div className="flex items-center gap-3">
      <div
        className={`p-2 bg-${colorClass}-100 dark:bg-${colorClass}-900/30 rounded-lg`}
      >
        <div className={`text-${colorClass}-600 dark:text-${colorClass}-400`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {value}
        </p>
      </div>
    </div>
  );

  const DetailedTable = ({ data, title, role, onClose }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mt-4">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          {title}
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      <div className="p-4 overflow-x-auto">
        {data.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Section
                </th>
                <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {data.map((request, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {request.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {request.section_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    <div className="flex items-center gap-2">
                      {request.reason}
                      {request.forMedical && (
                        <GiMedicines className="text-green-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    <div className="flex flex-col">
                      <span>{formatDate(request.fromDate)}</span>
                      {request.fromDate !== request.toDate && (
                        <span>{formatDate(request.toDate)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        request.approvals[role].status === "approved"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : request.approvals[role].status === "rejected"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      {request.approvals[role].status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            No requests found
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full mx-auto p-4">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Students Reports
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            View and manage leave reports
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentUser.isMentor && (
          <>
            <StatCard
              title="As a Mentor"
              stats={stats.mentor}
              onClick={() => setActiveTab("mentor")}
            />
          </>
        )}
        {currentUser.isClassIncharge && (
          <StatCard
            title="As a Class Incharge"
            stats={stats.classIncharge}
            onClick={() => setActiveTab("classIncharge")}
          />
        )}
      </div>

      {activeTab === "mentor" && (
        <DetailedTable
          data={leaveRequestsAsMentor}
          title="Detailed Report (As Mentor)"
          role="mentor"
          onClose={() => setActiveTab(null)}
        />
      )}

      {activeTab === "classIncharge" && (
        <DetailedTable
          data={leaveRequestsAsClassIncharge}
          title="Detailed Report (As Class Incharge)"
          role="classIncharge"
          onClose={() => setActiveTab(null)}
        />
      )}
    </div>
  );
};

export default LeaveStatsCard;
