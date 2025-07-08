import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const WardDetails = () => {
  const [rollNo, setRollNo] = useState("");
  const [wardDetails, setWardDetails] = useState([]);
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status, type) => {
    if (type === "Defaulter") return "bg-red-100 text-red-800 border-red-200";
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Leave":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "OD":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Defaulter":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleChange = (event) => {
    const roll = event.target.value;
    setRollNo(roll.toUpperCase());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSearchInitiated(true);
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(
        `/api/fetch/getWardDetailsByRollNumber/${rollNo}`
      );
      if (!res.ok) {
        throw new Error("Could not fetch ward details");
      }
      const data = await res.json();
      setWardDetails(data);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to fetch ward details");
    } finally {
      setIsLoading(false);
    }
  };

  const MobileRecordCard = ({ record }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(
                  record.type
                )}`}
              >
                {record.type}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                  record.status,
                  record.type
                )}`}
              >
                {record.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {new Date(record.fromDate).toLocaleDateString()}
              {record.fromDate !== record.toDate &&
                ` - ${new Date(record.toDate).toLocaleDateString()}`}
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

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Duration
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {record.noOfDays} day(s)
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Details
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {record.type === "Defaulter"
                  ? record.defaulterType
                  : record.reason}
                {record.type === "Defaulter" && record.timeIn && (
                  <span className="block text-xs text-gray-500 mt-1">
                    Time: {record.timeIn}
                  </span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 from-blue-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Ward Activity Monitor
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Track your ward's attendance, leaves, and on-duty activities in one
            place
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-xl mx-auto mb-12"
        >
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-colors"
                  placeholder="Enter Roll Number (e.g., 22CSEB01)"
                  value={rollNo}
                  onChange={handleChange}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <FaSearch className="h-5 w-5" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 dark:border-red-400 rounded-xl p-4">
              <p className="text-center text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          )}

          {searchInitiated &&
            !isLoading &&
            wardDetails.length === 0 &&
            !error && (
              <div className="bg-gray-50 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  No records found for Roll Number{" "}
                  <span className="font-semibold">{rollNo}</span>
                </p>
              </div>
            )}

          {wardDetails.length > 0 && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <SummaryCard
                  title="Total Leaves"
                  count={wardDetails.filter((r) => r.type === "Leave").length}
                  type="leave"
                />
                <SummaryCard
                  title="Total ODs"
                  count={wardDetails.filter((r) => r.type === "OD").length}
                  type="od"
                />
                <SummaryCard
                  title="Defaulter Records"
                  count={
                    wardDetails.filter((r) => r.type === "Defaulter").length
                  }
                  type="defaulter"
                />
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        {[
                          "Name",
                          "Type",
                          "Date Range",
                          "Duration",
                          "Status",
                          "Details",
                        ].map((header) => (
                          <th
                            key={header}
                            className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {wardDetails.map((record, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap font-medium ">
                            {record.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(
                                record.type
                              )}`}
                            >
                              {record.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {formatDate(record.fromDate)}
                            {record.fromDate !== record.toDate &&
                              ` - ${formatDate(record.toDate)}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {record.noOfDays} day(s)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                                record.status,
                                record.type
                              )}`}
                            >
                              {record.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm ">
                            {record.type === "Defaulter"
                              ? record.defaulterType
                              : record.reason}
                            {record.type === "Defaulter" && record.timeIn && (
                              <span className="block text-xs ">
                                Time: {record.timeIn}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {wardDetails.map((record, index) => (
                  <MobileRecordCard key={index} record={record} />
                ))}
              </div>

              {/* Warning Message */}
              {wardDetails.filter(
                (record) =>
                  record.type === "Leave" && record.status === "approved"
              ).length > 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl"
                >
                  <p className="text-red-700 text-center font-medium">
                    ⚠️ Please advise your ward to avoid taking unnecessary
                    leaves
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

// New Summary Card Component
const SummaryCard = ({ title, count, type }) => {
  const getCardStyle = () => {
    switch (type) {
      case "leave":
        return "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/10 dark:border-blue-700/30 dark:text-blue-400";
      case "od":
        return "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/10 dark:border-purple-700/30 dark:text-purple-400";
      case "defaulter":
        return "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/10 dark:border-red-700/30 dark:text-red-400";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-900/10 dark:border-gray-700/30 dark:text-gray-400";
    }
  };

  return (
    <div
      className={`p-6 rounded-xl border ${getCardStyle()} dark:border-gray-700 transition-all duration-200 hover:shadow-md`}
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-3xl font-bold mt-2">{count}</p>
    </div>
  );
};

export default WardDetails;
