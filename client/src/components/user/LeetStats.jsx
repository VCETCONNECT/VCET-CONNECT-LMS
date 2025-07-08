import React, { useState, useEffect } from "react";
import { TbBrandLeetcode } from "react-icons/tb";
import { Loader2 } from "lucide-react";

const LeetStats = ({ leetcode_url }) => {
  const [leetcodeStats, setLeetcodeStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const getUserIdFromUrl = (url) => {
    if (!url) return null;
    const cleanUrl = url.endsWith("/") ? url.slice(0, -1) : url;
    return cleanUrl.split("/").pop();
  };

  const userId = getUserIdFromUrl(leetcode_url);

  useEffect(() => {
    const fetchLeetcodeStats = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(
          `https://leetcode-stats-api.herokuapp.com/${userId}`
        );
        const data = await response.json();
        setLeetcodeStats(data);
      } catch (error) {
        console.error("Error fetching LeetCode stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeetcodeStats();
  }, [userId, leetcode_url]);

  if (!leetcode_url) return null;

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!leetcodeStats || leetcodeStats.status !== "success") {
    return null;
  }

  const calculateProgress = (solved, total) => (solved / total) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <TbBrandLeetcode className="w-6 h-6 text-[#FFA116]" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            LeetCode Stats
          </h3>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Rank: {leetcodeStats.ranking.toLocaleString()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Solved Problems Stats */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Solved Problems
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {leetcodeStats.totalSolved} / {leetcodeStats.totalQuestions}
            </span>
          </div>

          {/* Easy Problems */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-green-600 dark:text-green-400">Easy</span>
              <span className="text-gray-600 dark:text-gray-400">
                {leetcodeStats.easySolved} / {leetcodeStats.totalEasy}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{
                  width: `${calculateProgress(
                    leetcodeStats.easySolved,
                    leetcodeStats.totalEasy
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Medium Problems */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-yellow-600 dark:text-yellow-400">
                Medium
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {leetcodeStats.mediumSolved} / {leetcodeStats.totalMedium}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full"
                style={{
                  width: `${calculateProgress(
                    leetcodeStats.mediumSolved,
                    leetcodeStats.totalMedium
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Hard Problems */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-red-600 dark:text-red-400">Hard</span>
              <span className="text-gray-600 dark:text-gray-400">
                {leetcodeStats.hardSolved} / {leetcodeStats.totalHard}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full"
                style={{
                  width: `${calculateProgress(
                    leetcodeStats.hardSolved,
                    leetcodeStats.totalHard
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {leetcodeStats.acceptanceRate}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Acceptance Rate
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {leetcodeStats.contributionPoints}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Contribution Points
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {leetcodeStats.reputation}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Reputation
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {Object.keys(leetcodeStats.submissionCalendar || {}).length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Active Days
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeetStats;
