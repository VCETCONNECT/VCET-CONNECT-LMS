import React from "react";
import {
  Building2,
  Trash2,
  PlusCircle,
  ChevronRight,
  School,
  Users,
} from "lucide-react";

const Departments = ({
  departments,
  selectedDepartment,
  handleDepartmentSelect,
  handleDeleteDepartment,
  newDepartment,
  setNewDepartment,
  handleAddDepartment,
  departmentAlertMessage,
  // Batch props
  batches,
  selectedBatch,
  handleBatchSelect,
  newBatchName,
  setNewBatchName,
  handleAddBatch,
  handleDeleteBatch,
  batchAlertMessage,
  // Section props
  sections,
  selectedSection,
  handleSectionSelect,
  newSection,
  setNewSection,
  handleAddSection,
  handleDeleteClass,
  sectionAlertMessage,
  // Staff props
  classDetails,
  handleDeleteMentor,
  handleDeleteClassIncharge,
  MentorAlertMessage,
  classInchargeMessage,
}) => {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6`}>
      {/* Department Management Panel */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
          <div className="flex flex-col gap-4">
            {/* Add Department Form */}
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold text-gray-800">
                Departments
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  placeholder="New Department"
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  onClick={handleAddDepartment}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <PlusCircle size={18} />
                  Add
                </button>
              </div>
              {departmentAlertMessage && (
                <p
                  className={`text-sm ${
                    departmentAlertMessage.includes("failed")
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {departmentAlertMessage}
                </p>
              )}
            </div>

            {/* Departments List */}
            <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto custom-scrollbar">
              {departments.map((dept) => (
                <div
                  key={dept._id}
                  onClick={() => handleDepartmentSelect(dept)}
                  className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedDepartment === dept
                      ? "bg-blue-50 border-l-4 border-blue-500 shadow-md"
                      : "bg-gray-50 hover:bg-gray-100 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Building2 size={18} className="text-gray-500" />
                    <span className="font-medium">{dept.dept_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronRight
                      size={18}
                      className={`text-gray-400 transition-transform ${
                        selectedDepartment === dept ? "rotate-90" : ""
                      }`}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            `Are you sure you want to delete ${dept.dept_name}?`
                          )
                        ) {
                          handleDeleteDepartment(dept._id);
                        }
                      }}
                      className="p-1 hover:bg-red-100 rounded-full text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Batch and Section Management */}
      <div className="lg:col-span-2">
        {selectedDepartment && (
          <div className="space-y-6">
            {/* Batch Management */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedDepartment.dept_name} - Batches
                </h2>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newBatchName}
                    onChange={(e) => setNewBatchName(e.target.value)}
                    placeholder="New Batch"
                    className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddBatch}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Add Batch
                  </button>
                </div>
              </div>
              {batchAlertMessage && (
                <p className="text-sm text-red-500 mb-4">{batchAlertMessage}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {batches.map((batch) => (
                  <div
                    key={batch._id}
                    onClick={() => handleBatchSelect(batch)}
                    className={`flex justify-between items-center p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedBatch === batch
                        ? "bg-green-50 border-l-4 border-green-500 shadow-md"
                        : "bg-gray-50 hover:bg-gray-100 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <School size={18} className="text-gray-500" />
                      <span className="font-medium">{batch.batch_name}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBatch(batch._id);
                      }}
                      className="text-red-500 hover:bg-red-100 p-2 rounded-full"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Section Management */}
            {selectedBatch && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Sections - {selectedBatch.batch_name}
                  </h2>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newSection}
                      onChange={(e) => setNewSection(e.target.value)}
                      placeholder="New Section"
                      className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleAddSection}
                      className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      Add Section
                    </button>
                  </div>
                </div>
                {sectionAlertMessage && (
                  <p className="text-sm text-red-500 mb-4">
                    {sectionAlertMessage}
                  </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sections.map((section) => (
                    <div
                      key={section._id}
                      className={`bg-gray-50 rounded-lg p-4 ${
                        selectedSection === section
                          ? "border-l-4 border-purple-500"
                          : ""
                      }`}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold">
                          Section {section.section_name}
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSectionSelect(section)}
                            className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleDeleteClass(section._id)}
                            className="text-red-500 hover:bg-red-100 p-1 rounded-full"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Staff Details */}
            {selectedSection && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">
                  Staff Details - Section {selectedSection.section_name}
                </h2>

                {/* Mentors */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Mentors</h3>
                  {MentorAlertMessage && (
                    <p className="text-sm text-green-500 mb-2">
                      {MentorAlertMessage}
                    </p>
                  )}
                  <div className="space-y-2">
                    {classDetails.mentors.map((mentor) => (
                      <div
                        key={mentor._id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <span>{mentor.staff_name}</span>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `Are you sure you want to delete ${mentor.staff_name}?`
                              )
                            ) {
                              handleDeleteMentor(mentor._id);
                            }
                          }}
                          className="text-red-500 hover:bg-red-100 p-1 rounded-full"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Class Incharges */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Class Incharges
                  </h3>
                  {classInchargeMessage && (
                    <p className="text-sm text-green-500 mb-2">
                      {classInchargeMessage}
                    </p>
                  )}
                  <div className="space-y-2">
                    {classDetails.classIncharges.map((incharge) => (
                      <div
                        key={incharge._id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <span>{incharge.staff_name}</span>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `Are you sure you want to delete ${incharge.staff_name}?`
                              )
                            ) {
                              handleDeleteClassIncharge(incharge._id);
                            }
                          }}
                          className="text-red-500 hover:bg-red-100 p-1 rounded-full"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Departments;
