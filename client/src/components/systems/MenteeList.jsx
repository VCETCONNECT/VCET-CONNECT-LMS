import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Search, ArrowUpDown, ChevronRight } from "lucide-react";

const MenteeList = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "roll_no",
    direction: "asc",
  });
  const [leaveStats, setLeaveStats] = useState({});
  const [expandedRow, setExpandedRow] = useState(null);
  const SEMESTER_START_DATE = new Date("2025-07-01T00:00:00.000Z");

  useEffect(() => {
    const fetchMenteesAndLeaves = async () => {
      try {
        // Fetch mentees
        const menteeResponse = await fetch(
          `/api/fetch/mentee/${currentUser.userId}`
        );
        if (!menteeResponse.ok) throw new Error("Failed to fetch mentees");
        const menteeData = await menteeResponse.json();

        // Fetch leave statistics for each mentee
        const leaveStatsObj = {};
        for (const mentee of menteeData) {
          const leaveResponse = await fetch(
            `/api/getleaverequest/${mentee._id}`
          );
          if (leaveResponse.ok) {
            const leaveData = await leaveResponse.json();
            const filteredLeaves = leaveData.filter(
              (leave) => new Date(leave.createdAt) >= SEMESTER_START_DATE
            );
            leaveStatsObj[mentee.roll_no] = {
              totalLeaves: filteredLeaves.length,
              totalDays: filteredLeaves.reduce(
                (acc, leave) => acc + leave.noOfDays,
                0
              ),
              medicalLeaves: filteredLeaves.filter((leave) => leave.forMedical)
                .length,
              approvedLeaves: filteredLeaves.filter(
                (leave) => leave.status === "approved"
              ).length,
              rejectedLeaves: filteredLeaves.filter(
                (leave) => leave.status === "rejected"
              ).length,
              pendingLeaves: filteredLeaves.filter(
                (leave) => leave.status === "pending"
              ).length,
            };
          }
        }

        setMentees(menteeData);
        setLeaveStats(leaveStatsObj);
        setError(null);
      } catch (error) {
        console.error("Error:", error);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser.userId) {
      fetchMenteesAndLeaves();
    }
  }, [currentUser.userId]);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  const sortedMentees = [...mentees].sort((a, b) => {
    if (sortConfig.direction === "asc") {
      return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
    }
    return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
  });

  const filteredMentees = sortedMentees.filter(
    (mentee) =>
      mentee.roll_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentee.register_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const MobileRow = ({ mentee }) => (
    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium text-gray-900 dark:text-gray-200">
            {mentee.name}{" "}
            <span className="text-gray-500 dark:text-gray-400">
              ({mentee.roll_no})
            </span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {mentee.register_no}
          </p>
        </div>
        <button
          onClick={() =>
            setExpandedRow(expandedRow === mentee._id ? null : mentee._id)
          }
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors"
        >
          <ChevronRight
            size={20}
            className={`transform transition-transform ${
              expandedRow === mentee._id ? "rotate-90" : ""
            }`}
          />
        </button>
      </div>

      {expandedRow === mentee._id && (
        <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-600">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
            <p className="text-sm text-gray-900 dark:text-gray-200">
              {mentee.email}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Contact</p>
            <p className="text-sm text-gray-900 dark:text-gray-200">
              {mentee.phone}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Parent Contact
            </p>
            <p className="text-sm text-gray-900 dark:text-gray-200">
              {mentee.parent_phone}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Leave Statistics
            </p>
            {leaveStats[mentee.roll_no] ? (
              <div className="space-y-1 mt-1">
                <p className="text-sm text-gray-900 dark:text-gray-200">
                  Total Leaves: {leaveStats[mentee.roll_no].totalLeaves} (
                  {leaveStats[mentee.roll_no].totalDays} days)
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <p>Medical: {leaveStats[mentee.roll_no].medicalLeaves}</p>
                  <p>Approved: {leaveStats[mentee.roll_no].approvedLeaves}</p>
                  <p>Rejected: {leaveStats[mentee.roll_no].rejectedLeaves}</p>
                  <p>Pending: {leaveStats[mentee.roll_no].pendingLeaves}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500">
                No leaves
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1f3a6e]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-4">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mentee List
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            View and manage mentee list
          </p>
        </div>
      </div>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Mentee List
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Mentees: {mentees.length}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-auto">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search mentees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-auto pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f3a6e] dark:bg-gray-700 dark:text-gray-200"
            />
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400">
              <tr>
                {[
                  "Roll No",
                  "Name",
                  "Email",
                  "Phone",
                  "Parent Phone",
                  "Leave Stats",
                ].map((header, index) => (
                  <th
                    key={index}
                    className="px-4 py-3 font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() =>
                      handleSort(header.toLowerCase().replace(" ", "_"))
                    }
                  >
                    <div className="flex items-center gap-2">
                      {header}
                      <ArrowUpDown size={14} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredMentees.map((mentee, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-200">
                    {mentee.roll_no}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {mentee.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {mentee.email}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {mentee.phone}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {mentee.parent_phone}
                  </td>
                  <td className="px-4 py-3">
                    {leaveStats[mentee.roll_no] ? (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Total Leaves : {leaveStats[mentee.roll_no].totalDays}{" "}
                          days
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Medical: {leaveStats[mentee.roll_no].medicalLeaves} |
                          Approved: {leaveStats[mentee.roll_no].approvedLeaves}{" "}
                          | Rejected:{" "}
                          {leaveStats[mentee.roll_no].rejectedLeaves} | Pending:{" "}
                          {leaveStats[mentee.roll_no].pendingLeaves}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">
                        No leaves
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile List View */}
      <div className="md:hidden space-y-4">
        {filteredMentees.map((mentee) => (
          <MobileRow key={mentee._id} mentee={mentee} />
        ))}
      </div>
    </div>
  );
};

export default MenteeList;
