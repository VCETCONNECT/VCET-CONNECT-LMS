import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Calendar, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Modal } from "flowbite-react";

const PendingWorks = () => {
  const [pendingWorks, setPendingWorks] = useState([]);
  const completedWorks = pendingWorks.filter((work) => work.isDone);
  const incompleteWorks = pendingWorks.filter((work) => !work.isDone);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedWork, setSelectedWork] = useState(null);
  const { currentUser } = useSelector((state) => state.user);

  const fetchPendingWorks = async () => {
    try {
      const response = await fetch(
        `/api/defaulter/pendingworks/${currentUser.id}`
      );
      const data = await response.json();

      if (data.success) {
        setPendingWorks(data.pendingWorks);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error("Error fetching pending works:", error);
      setError("Failed to fetch pending works");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingWorks();
  }, [currentUser.id]);

  const handleMarkAsDone = async (workId) => {
    try {
      const response = await fetch(`/api/defaulter/markasdone/${workId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ workId }),
      });

      if (response.ok) {
        // Refresh the pending works list
        fetchPendingWorks();
        setShowConfirmModal(false);
        setSelectedWork(null);
      } else {
        throw new Error("Failed to mark work as done");
      }
    } catch (error) {
      console.error("Error marking work as done:", error);
      setError("Failed to mark work as done");
    }
  };

  const WorkCard = ({ work }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            work.defaulterType === "Late"
              ? "bg-yellow-100 text-yellow-800"
              : work.defaulterType === "Both"
              ? "bg-red-100 text-red-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {work.defaulterType}
        </span>
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-1" />
          {new Date(work.entryDate).toLocaleDateString()}
        </div>
      </div>

      <div className="mt-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          Assigned Work
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-wrap mb-4">
          {work.remarks}
        </p>
        {work.isDone ? (
          <p className="text-white flex items-center justify-center font-semibold bg-green-500 p-2 rounded-lg text-center text-sm">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Completed
          </p>
        ) : (
          <button
            onClick={() => {
              setSelectedWork(work);
              setShowConfirmModal(true);
            }}
            className="w-full px-4 py-2 text-sm font-medium text-black bg-blue-200 rounded-lg 
                     hover:bg-blue-300 transition-colors duration-200 flex items-center justify-center"
          >
            Mark as Done
          </button>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-red-500">
        <AlertCircle className="w-5 h-5 mr-2" />
        {error}
      </div>
    );
  }

  if (pendingWorks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] text-gray-500">
        <CheckCircle2 className="w-12 h-12 mb-2 text-green-500" />
        <p>No pending works assigned!</p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-4">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Your Pending Works
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            View and manage your pending works
          </p>
        </div>
      </div>{" "}
      {/* Incomplete Works Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold">Incomplete Works</h2>
          <span className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
            {incompleteWorks.length}
          </span>
        </div>
        {incompleteWorks.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {incompleteWorks.map((work) => (
              <WorkCard key={work._id} work={work} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No incomplete works</p>
        )}
      </div>
      {/* Completed Works Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold">Completed Works</h2>
          <span className="px-2 py-1 text-sm bg-green-100 text-green-800 rounded-full">
            {completedWorks.length}
          </span>
        </div>
        {completedWorks.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedWorks.map((work) => (
              <WorkCard key={work._id} work={work} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No works to complete yet</p>
        )}
      </div>
      <Modal
        show={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSelectedWork(null);
        }}
        size="md"
      >
        <Modal.Header>Confirm Work Completion</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Type:</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedWork?.defaulterType === "Late"
                        ? "bg-yellow-100 text-yellow-800"
                        : selectedWork?.defaulterType === "Both"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {selectedWork?.defaulterType}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Date:</span>
                  <span className="font-medium">
                    {selectedWork &&
                      new Date(selectedWork.entryDate).toLocaleDateString()}
                  </span>
                </div>
                {selectedWork?.timeIn && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Time:</span>
                    <span className="font-medium flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {selectedWork.timeIn}
                    </span>
                  </div>
                )}
                <div className="pt-2">
                  <span className="text-gray-500 block mb-1">
                    Assigned Work:
                  </span>
                  <p className="text-gray-700 whitespace-pre-wrap bg-white p-2 rounded border">
                    {selectedWork?.remarks}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Are you sure you want to mark this work as completed?
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            onClick={() => {
              setShowConfirmModal(false);
              setSelectedWork(null);
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg
                     hover:bg-gray-200 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={() => handleMarkAsDone(selectedWork._id)}
            className="w-full px-4 py-2 text-sm font-medium text-black bg-blue-200 rounded-lg 
            hover:bg-blue-300 transition-colors duration-200 flex items-center justify-center"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Yes, Mark as Done
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PendingWorks;
