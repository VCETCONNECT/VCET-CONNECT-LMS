import React from "react";
import classNames from "classnames";

const StatusDot = ({ status, showLine, by }) => {
  const getStatusStyle = (status) => {
    switch (status) {
      case "approved":
        return {
          badge: "bg-emerald-100 text-emerald-700 ring-emerald-700/10",
          line: "bg-emerald-500",
        };
      case "rejected":
        return {
          badge: "bg-red-100 text-red-700 ring-red-700/10",
          line: "bg-red-500",
        };
      case "pending":
        return {
          badge: "bg-yellow-100 text-yellow-700 ring-yellow-700/10",
          line: "bg-yellow-500",
        };
      default:
        return {
          badge: "bg-gray-100 text-gray-700 ring-gray-700/10",
          line: "bg-gray-500",
        };
    }
  };

  const statusStyle = getStatusStyle(status);

  return (
    <div className="flex items-center">
      {/* Badge */}
      <span
        className={classNames(
          "inline-flex items-center justify-center",
          "w-5 h-5 rounded-full",
          "text-xs font-medium",
          "ring-[0.5px] ring-inset",
          statusStyle.badge
        )}
      >
        {by}
      </span>

      {/* Line */}
      {showLine && (
        <div className={classNames("h-[1px] w-6 ml-0.5", statusStyle.line)} />
      )}
    </div>
  );
};

export default StatusDot;
