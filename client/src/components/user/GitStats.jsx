import React, { useState, useEffect } from "react";
import {
  Github,
  ExternalLink,
  Users,
  BookOpen,
  MapPin,
  Globe,
  Clock,
  RefreshCw,
  GitFork,
  Star,
  Code,
  Activity,
  Building,
  Mail,
} from "lucide-react";
import { Loader2 } from "lucide-react";

const GitStats = ({ github_url }) => {
  const [gitStats, setGitStats] = useState(null);
  const [repoStats, setRepoStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const getUsernameFromUrl = (url) => {
    if (!url) return null;
    const cleanUrl = url.endsWith("/") ? url.slice(0, -1) : url;
    return cleanUrl.split("/").pop();
  };

  const username = getUsernameFromUrl(github_url);

  useEffect(() => {
    const fetchGitStats = async () => {
      if (!username) {
        setLoading(false);
        return;
      }
      try {
        // Fetch user data
        const userResponse = await fetch(
          `https://api.github.com/users/${username}`
        );
        const userData = await userResponse.json();
        setGitStats(userData);

        // Fetch repositories data
        const reposResponse = await fetch(
          `https://api.github.com/users/${username}/repos`
        );
        const reposData = await reposResponse.json();

        // Calculate additional stats
        const stats = {
          totalStars: reposData.reduce(
            (acc, repo) => acc + repo.stargazers_count,
            0
          ),
          totalForks: reposData.reduce(
            (acc, repo) => acc + repo.forks_count,
            0
          ),
          languages: {},
          mostStarredRepo: reposData.reduce((prev, current) =>
            prev.stargazers_count > current.stargazers_count ? prev : current
          ),
        };

        // Calculate language statistics
        reposData.forEach((repo) => {
          if (repo.language) {
            stats.languages[repo.language] =
              (stats.languages[repo.language] || 0) + 1;
          }
        });

        setRepoStats(stats);
      } catch (error) {
        console.error("Error fetching GitHub stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGitStats();
  }, [username]);

  if (!github_url) return null;

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!gitStats) {
    return null;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <img
            src={gitStats.avatar_url}
            alt={gitStats.name}
            className="w-12 h-12 rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {gitStats.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              @{gitStats.login}
            </p>
          </div>
        </div>
        <a
          href={github_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-800 dark:bg-gray-700 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
        >
          <Github className="w-4 h-4" />
          View Profile
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {gitStats.bio && (
        <p className="text-gray-600 dark:text-gray-300 mb-6">{gitStats.bio}</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard
          icon={<BookOpen className="w-5 h-5" />}
          label="Repositories"
          value={gitStats.public_repos}
        />
        <StatCard
          icon={<Star className="w-5 h-5" />}
          label="Total Stars"
          value={repoStats?.totalStars || 0}
        />
        <StatCard
          icon={<GitFork className="w-5 h-5" />}
          label="Total Forks"
          value={repoStats?.totalForks || 0}
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Followers"
          value={gitStats.followers}
        />
      </div>

      {repoStats?.mostStarredRepo && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Most Popular Repository
          </h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-gray-500" />
              <a
                href={repoStats.mostStarredRepo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {repoStats.mostStarredRepo.name}
              </a>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <Star className="w-4 h-4" />
                {repoStats.mostStarredRepo.stargazers_count}
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <GitFork className="w-4 h-4" />
                {repoStats.mostStarredRepo.forks_count}
              </span>
            </div>
          </div>
        </div>
      )}

      {repoStats?.languages && Object.keys(repoStats.languages).length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Top Languages
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(repoStats.languages)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([language, count]) => (
                <span
                  key={language}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-full text-gray-700 dark:text-gray-300"
                >
                  {language} ({count})
                </span>
              ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-3">
          {gitStats.location && (
            <InfoItem
              icon={<MapPin className="w-4 h-4" />}
              label="Location"
              value={gitStats.location}
            />
          )}
          {gitStats.blog && (
            <InfoItem
              icon={<Globe className="w-4 h-4" />}
              label="Website"
              value={
                <a
                  href={gitStats.blog}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 line-clamp-1 max-w-56 hover:underline"
                >
                  {gitStats.blog}
                </a>
              }
            />
          )}
          {gitStats.company && (
            <InfoItem
              icon={<Building className="w-4 h-4" />}
              label="Company"
              value={gitStats.company}
            />
          )}
          {gitStats.email && (
            <InfoItem
              icon={<Mail className="w-4 h-4" />}
              label="Email"
              value={gitStats.email}
            />
          )}
        </div>
        <div className="space-y-3">
          <InfoItem
            icon={<Activity className="w-4 h-4" />}
            label="Activity Status"
            value={gitStats.type}
          />
          <InfoItem
            icon={<Clock className="w-4 h-4" />}
            label="Member Since"
            value={formatDate(gitStats.created_at)}
          />
          <InfoItem
            icon={<RefreshCw className="w-4 h-4" />}
            label="Last Updated"
            value={formatDate(gitStats.updated_at)}
          />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
      {icon}
      <span className="text-sm">{label}</span>
    </div>
    <div className="text-2xl font-bold text-gray-900 dark:text-white">
      {value}
    </div>
  </div>
);

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-3">
    <span className="text-gray-500 dark:text-gray-400">{icon}</span>
    <span className="text-sm text-gray-500 dark:text-gray-400">{label}:</span>
    <span className="text-sm text-gray-900 dark:text-white">{value}</span>
  </div>
);

export default GitStats;
