import React, { useState } from "react";
import { useFetchDepartments } from "../../../../hooks/useFetchData";
import ListModel from "./ListModel";

const DepartmentCourses = () => {
  const departments = useFetchDepartments();
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDepartmentClick = (dept) => {
    setSelectedDepartment(dept);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">
        Department Courses Management
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <button
            key={dept._id}
            onClick={() => handleDepartmentClick(dept)}
            className="bg-gray-50 p-6 rounded-xl hover:bg-gray-100 transition-colors text-left"
          >
            <h3 className="text-lg font-medium mb-2">{dept.dept_name}</h3>
            <p className="text-gray-500 text-sm">{dept.dept_acronym}</p>
          </button>
        ))}
      </div>

      <ListModel
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        department={selectedDepartment}
      />
    </div>
  );
};

export default DepartmentCourses;
