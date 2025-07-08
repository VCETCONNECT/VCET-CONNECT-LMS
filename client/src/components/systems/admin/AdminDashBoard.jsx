import React from "react";
import { Building2, School, Users, BookOpen } from "lucide-react";

const AdminDashBoard = ({ departments, batches, sections, classDetails }) => {
  return (
    <div className="space-y-6 dark:text-gray-200">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white  transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm dark:text-gray-400">
                Total Departments
              </p>
              <h3 className="text-3xl font-bold mt-1 dark:text-gray-200">
                {departments.length}
              </h3>
            </div>
            <Building2 size={40} className="text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm dark:text-gray-400">
                Total Batches
              </p>
              <h3 className="text-3xl font-bold mt-1 dark:text-gray-200">
                {batches.length}
              </h3>
            </div>
            <School size={40} className="text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Sections</p>
              <h3 className="text-3xl font-bold mt-1">{sections.length}</h3>
            </div>
            <BookOpen size={40} className="text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Total Staff</p>
              <h3 className="text-3xl font-bold mt-1">
                {classDetails.mentors.length +
                  classDetails.classIncharges.length}
              </h3>
            </div>
            <Users size={40} className="text-orange-200" />
          </div>
        </div>
      </div>

      {/* Additional Overview Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
          {/* Add recent activities content */}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          {/* Add quick actions */}
        </div>
      </div>
    </div>
  );
};

export default AdminDashBoard;
