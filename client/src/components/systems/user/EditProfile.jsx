// Update the StatBox component with a new design
const StatBox = ({ icon, label, value, isText }) => (
  <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center justify-center p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30">
          {icon}
        </span>
        <span className={`text-2xl font-bold ${
          isText ? 'text-lg' : 'text-3xl'
        } text-gray-900 dark:text-white`}>
          {value}
        </span>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {label}
        </p>
      </div>
    </div>
  </div>
);

// Update the stats grid layout in the main component
// Find this section in the component: 

{/* Right Column - Stats & Links */}
<div className="lg:col-span-2">
  <div className="space-y-6 lg:h-[90vh] lg:overflow-y-auto lg:pr-4 pb-6">
    {/* Stats Grid - Updated Layout */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="md:col-span-2 lg:col-span-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Academic Overview
        </h3>
      </div>
      
      {/* Academic Stats */}
      <StatBox
        icon={<BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
        label="Total Semesters Completed"
        value={Object.values(userData?.semester_results || {}).length || 0}
      />
      
      <StatBox
        icon={<Hash className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
        label="Total Subjects"
        value={Object.values(userData?.semester_results || {}).reduce(
          (acc, sem) => acc + Object.values(sem || {}).length,
          0
        ) || 0}
      />

      {/* Faculty Information */}
      <div className="md:col-span-2 lg:col-span-4 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Faculty Information
        </h3>
      </div>
      
      <StatBox
        icon={
          <FaChalkboardTeacher className="w-6 h-6 text-green-600 dark:text-green-400" />
        }
        label="Class Incharge"
        value={classIncharge?.staff_name || "Loading..."}
        isText
      />
      
      <StatBox
        icon={
          <MdSupervisorAccount className="w-6 h-6 text-orange-600 dark:text-orange-400" />
        }
        label="Mentor"
        value={mentor?.staff_name || "Loading..."}
        isText
      />
    </div>

    {/* Professional Links Section - Keep existing code */}
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      {/* ... existing professional links code ... */}
    </div>

    {/* Rest of the components */}
    {/* ... */}
  </div>
</div> 