import { Button, Modal, ModalBody, ModalHeader, Spinner } from "flowbite-react";
import { Info, ChevronRight, Eye } from "lucide-react";
import React, { useEffect, useState } from "react";
import { MdOutlineDownloadDone } from "react-icons/md";
import { RxCross2, RxCrossCircled } from "react-icons/rx";
import { SiTicktick } from "react-icons/si";
import { TiTick } from "react-icons/ti";
import { useSelector } from "react-redux";
import StatusDot from "../../general/StatusDot";

export default function ODRequests({
  odRequestsAsMentor,
  odRequestsAsClassIncharge,
}) {
  const [classInchargemodalType, setClassInchargeModalType] = useState(null); // 'approve', 'reject', or 'taken'
  const [mentormodalType, setMentorModalType] = useState(null); // 'approve', 'reject', or 'taken'
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [menteeRequests, setMenteeRequests] = useState(odRequestsAsMentor);
  const [classInchargeRequests, setClassInchargeRequests] = useState(
    odRequestsAsClassIncharge
  );
  const [isFetching, setIsFetching] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const [mentorComment, setmentorComment] = useState("");
  const [classInchargeComment, setclassInchargeComment] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear().toString().slice(-2); // Get last two digits of the year
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month in two digits
    const day = date.getDate().toString().padStart(2, "0"); // Day in two digits
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    if (currentUser.isMentor) {
      fetchODRequestsMentor();
    }
  }, [currentUser.isMentor]);

  useEffect(() => {
    if (currentUser.isClassIncharge) {
      fetchODRequestsClassIncharge();
    }
  }, [currentUser.isClassIncharge]);

  const handleRequest = (type, id) => {
    setMentorModalType(type);
    setCurrentRequestId(id);
  };

  const handleClose = () => {
    setMentorModalType(null);
    setCurrentRequestId(null);
  };

  const fetchODRequestsMentor = async () => {
    setIsFetching(true);
    try {
      const response = await fetch(
        `/api/getodrequestbymentorid/${currentUser.userId}`
      );
      const data = await response.json();
      setMenteeRequests(data);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const fetchODRequestsClassIncharge = async () => {
    setIsFetching(true);
    try {
      const response = await fetch(
        `/api/getodrequestbyclassinchargeid/${currentUser.userId}`
      );
      const data = await response.json();
      setClassInchargeRequests(data);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleRequestClassIncharge = (type, id) => {
    setClassInchargeModalType(type);
    setCurrentRequestId(id);
  };

  const handleCloseClassIncharge = () => {
    setClassInchargeModalType(null);
    setCurrentRequestId(null);
  };

  const confirmRequestMentor = async () => {
    setLoading(true);
    try {
      const backendUrl = `/api/od-requestsbymentorid/${currentRequestId}/status`;
      const response = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: mentormodalType,
          mentorcomment: mentorComment,
        }),
      });

      if (response.ok) {
        await fetchODRequestsMentor();
        await fetchODRequestsClassIncharge();
      } else {
        alert(`Failed to ${mentormodalType} request`);
      }
    } catch (error) {
      console.error("Error updating request:", error);
      alert(`Failed to ${mentormodalType} request`);
    } finally {
      setLoading(false);
      handleClose();
      setmentorComment("");
    }
  };

  const confirmRequestClass = async () => {
    setLoading(true);
    try {
      const backendUrl = `/api/od-requestsbyclassinchargeid/${currentRequestId}/status`;
      const response = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: classInchargemodalType,
          classInchargeComment: classInchargeComment,
        }),
      });

      if (response.ok) {
        await fetchODRequestsClassIncharge();
        await fetchODRequestsMentor();
      } else {
        alert(`Failed to ${classInchargemodalType} request`);
      }
    } catch (error) {
      console.error("Error updating request:", error);
      alert(`Failed to ${classInchargemodalType} request`);
    } finally {
      setLoading(false);
      handleCloseClassIncharge();
      setclassInchargeComment("");
    }
  };

  const filterRequestsByStatus = (requests, role) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    return requests.filter((request) => {
      const toDate = new Date(request.toDate);
      const isPastDue = toDate < today;
  
      if (activeTab === "pending") {
        // For the pending tab, show:
        // 1. Requests that are pending and not past due
        return !isPastDue && request.approvals[role].status === "pending";
      } else {
        // For other tabs, show:
        // 1. Rejected requests
        // 2. Past due requests
        // 3. Approved requests
        return (
          request.approvals[role].status === "rejected" ||
          isPastDue ||
          request.approvals[role].status === "approved"
        );
      }
    });
  };
  

  const filteredMenteeRequests = menteeRequests.filter(
    (menteeReq) =>
      !classInchargeRequests.some((classReq) => classReq._id === menteeReq._id)
  );

  const MobileRequestCard = ({ request, role, onAction }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900 dark:text-gray-200">
                {request.name}
              </p>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  request.odType === "Internal"
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800/30"
                    : "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800/30"
                }`}
              >
                {request.odType}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {request.noOfDays} day(s) • {formatDate(request.fromDate)}
              {request.fromDate !== request.toDate &&
                ` to ${formatDate(request.toDate)}`}
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
          <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-600">
            {request.odType === "Internal" ? (
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Reason
                </p>
                <p className="text-sm text-gray-900 dark:text-gray-200">
                  {request.reason}
                </p>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    College/Company
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-200">
                    {request.collegeName}, {request.city}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Event Name
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-200">
                    {request.eventName}
                  </p>
                </div>
              </>
            )}
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Contact
              </p>
              <p className="text-sm text-gray-900 dark:text-gray-200">
                {request.parent_phone}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Comments
              </p>
              <CommentsCell
                mentorComment={request.mentorcomment}
                classInchargeComment={request.classInchargeComment}
              />
            </div>
            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center gap-2">
                <StatusDot
                  status={request.approvals.mentor.status}
                  showLine={true}
                  by="M"
                />
                <StatusDot
                  status={request.approvals.classIncharge.status}
                  showLine={false}
                  by="CI"
                />
              </div>
              {request.approvals[role].status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onAction("approved", request._id)}
                    className="bg-green-400 hover:bg-green-600 text-white p-1 rounded-full transition-all duration-300"
                  >
                    <TiTick size={24} />
                  </button>
                  <button
                    onClick={() => onAction("rejected", request._id)}
                    className="bg-red-400 hover:bg-red-600 text-white p-1 rounded-full transition-all duration-300"
                  >
                    <RxCross2 size={24} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRequestTable = (requests, role, handleRequest) => {
    return (
      <>
        {/* Desktop view */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr className="text-center">
                <th className="px-6 py-4 w-[18%]">Student</th>
                <th className="px-6 py-4 w-[18%]">Details</th>
                <th className="px-6 py-4 w-[6%]">Phone</th>
                <th className="px-6 py-4 w-[15%]">Dates</th>
                <th className="px-6 py-4 w-[8%]">Status</th>
                <th className="px-6 py-4 w-[15%]">Comments</th>
                <th className="px-6 py-4 w-[8%]">Actions</th>
                <th className="px-6 py-4 w-[10%]">Proof</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {requests.map((req) => {
                const { status } = req.approvals[role];
                return (
                  <tr
                    key={req._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-200">
                      {req.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="text-gray-600 dark:text-gray-300 line-clamp-2 capitalize">
                          {req.odType === "Internal" ? (
                            req.reason
                          ) : (
                            <>
                              {req.collegeName}, {req.city}
                              <br />
                              {req.eventName}
                            </>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setShowDetails(true);
                          }}
                          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <Info
                            size={16}
                            className="text-gray-400 hover:text-gray-600"
                          />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-300">
                      {req.parent_phone}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      <div className="flex items-center min-w-max justify-center gap-2">
                        <span className="bg-blue-200 px-1 rounded-full text-xs">
                          {req.noOfDays}
                        </span>
                        {req.fromDate === req.toDate ? (
                          <div>{formatDate(req.fromDate)}</div>
                        ) : (
                          <div className="flex gap-2">
                            <div>{formatDate(req.fromDate)}</div>
                            <div>{formatDate(req.toDate)}</div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <StatusDot
                          status={req.approvals.mentor.status}
                          showLine={true}
                          by="M"
                        />
                        <StatusDot
                          status={req.approvals.classIncharge.status}
                          showLine={false}
                          by="CI"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <CommentsCell
                        mentorComment={req.mentorcomment}
                        classInchargeComment={req.classInchargeComment}
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      {status === "pending" ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              role === "mentor"
                                ? handleRequest("approved", req._id)
                                : handleRequestClassIncharge(
                                    "approved",
                                    req._id
                                  )
                            }
                            className="bg-green-400 hover:bg-green-600 text-white p-1 rounded-full transition-all duration-300"
                          >
                            <TiTick size={30} />
                          </button>
                          <button
                            onClick={() =>
                              role === "mentor"
                                ? handleRequest("rejected", req._id)
                                : handleRequestClassIncharge(
                                    "rejected",
                                    req._id
                                  )
                            }
                            className="bg-red-400 hover:bg-red-600 text-white p-1 rounded-full transition-all duration-300"
                          >
                            <RxCross2 size={30} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              role === "mentor"
                                ? handleRequest("taken", req._id)
                                : handleRequestClassIncharge("taken", req._id)
                            }
                            className={`text-white py-1 px-3 min-w-[90px] rounded-lg transition-all duration-300 ${
                              status === "approved"
                                ? "bg-green-400"
                                : status === "rejected"
                                ? "bg-red-400"
                                : ""
                            }`}
                          >
                            {status === "approved"
                              ? "Approved"
                              : status === "rejected"
                              ? "Rejected"
                              : "Taken"}
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="text-center flex items-center justify-center mt-3">
                      {req.completionProof ? (
                        <a
                          href={req.completionProof}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={req.completionProof}
                            alt="Proof"
                            className="h-16 w-28 object-cover rounded-md shadow-md border border-gray-300 cursor-pointer"
                          />
                        </a>
                      ) : (
                        "Yet to Upload"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile view */}
        <div className="md:hidden space-y-4">
          {requests.map((request) => (
            <MobileRequestCard
              key={request._id}
              request={request}
              role={role}
              onAction={handleRequest}
            />
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="w-full mx-auto p-4">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Students OD Requests
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            View and manage OD requests
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
            activeTab === "pending"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Pending Requests
        </button>
        <button
          onClick={() => setActiveTab("actionDone")}
          className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
            activeTab === "actionDone"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Action Done Requests
        </button>
      </div>

      {/* Mentor Requests Section */}
      {currentUser.isMentor && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-4 border-b dark:border-gray-700">
            <h2 className="text-lg font-semibold">
              {activeTab === "pending" ? "Pending" : "Action Done"} OD Requests
              From Your Class Mentees
            </h2>
          </div>
          {filterRequestsByStatus(odRequestsAsMentor, "mentor").length > 0 ? (
            renderRequestTable(
              filterRequestsByStatus(menteeRequests, "mentor"),
              "mentor",
              handleRequest
            )
          ) : (
            <h2 className="font-semibold text-center p-6">
              No {activeTab === "pending" ? "Pending" : "Action Done"} OD
              Requests from Your Mentees
            </h2>
          )}
        </div>
      )}

      {/* Class Incharge Requests Section */}
      {currentUser.isClassIncharge && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b dark:border-gray-700">
            <h2 className="text-lg font-semibold">
              {activeTab === "pending" ? "Pending" : "Action Done"} OD Requests
              From Your Class Students
            </h2>
          </div>
          {filterRequestsByStatus(odRequestsAsClassIncharge, "classIncharge")
            .length > 0 ? (
            renderRequestTable(
              filterRequestsByStatus(classInchargeRequests, "classIncharge"),
              "classIncharge",
              handleRequestClassIncharge
            )
          ) : (
            <h2 className="font-semibold text-center p-6">
              No {activeTab === "pending" ? "Pending" : "Action Done"} OD
              Requests from Your Students
            </h2>
          )}
        </div>
      )}

      {/* Mentor Modal */}
      <Modal
        show={mentormodalType !== null}
        size="md"
        onClose={handleClose}
        popup
      >
        <ModalHeader />
        <ModalBody>
          <div className="text-center">
            {mentormodalType === "approved" ? (
              <SiTicktick className="mx-auto mb-4 h-14 w-14 text-green-400 dark:text-white" />
            ) : mentormodalType === "rejected" ? (
              <RxCrossCircled className="mx-auto mb-4 h-14 w-14 text-red-400 dark:text-white" />
            ) : (
              <MdOutlineDownloadDone className="mx-auto mb-4 h-14 w-14 text-secondary-blue dark:text-white" />
            )}

            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              {mentormodalType === "approved" ? (
                <div>
                  Are you to approve this request?
                  <div className="w-full my-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="px-4 py-2 bg-white rounded-t-lg dark:bg-gray-800">
                      <textarea
                        id="mentor_comment"
                        rows="4"
                        className="w-full px-0 text-sm text-gray-900 bg-white border-0  focus:ring-0 dark:text-white"
                        placeholder="Write your comments..."
                        onChange={(e) => setmentorComment(e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                </div>
              ) : mentormodalType === "rejected" ? (
                <div>
                  Are you sure you want to reject this request?
                  <div className="w-full my-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="px-4 py-2 bg-white rounded-t-lg dark:bg-gray-800">
                      <textarea
                        id="mentor_comment"
                        rows="4"
                        className="w-full px-0 text-sm text-gray-900 bg-white border-0  focus:ring-0 dark:text-white"
                        placeholder="Write your comments..."
                        onChange={(e) => setmentorComment(e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                </div>
              ) : (
                "This action has already been taken."
              )}
            </h3>
            {mentormodalType !== "taken" && (
              <div className="flex justify-center gap-4">
                <Button
                  color={mentormodalType === "approved" ? "success" : "failure"}
                  className={`${
                    mentormodalType === "approved"
                      ? "bg-green-400 hover:bg-green-500"
                      : "bg-red-400 hover:bg-red-500"
                  }`}
                  onClick={confirmRequestMentor}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <Spinner size="sm" className="mr-2" />
                      <span className="text-white">Loading...</span>
                    </div>
                  ) : (
                    <span className="text-white">
                      {mentormodalType === "approved" ? "Approve" : "Reject"}
                    </span>
                  )}
                </Button>

                <Button color="gray" outline onClick={handleClose}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </ModalBody>
      </Modal>

      {/* Class Incharge Modal */}
      <Modal
        show={classInchargemodalType !== null}
        size="md"
        onClose={handleCloseClassIncharge}
        popup
      >
        <ModalHeader />
        <ModalBody className="pt-3">
          <div className="text-center">
            {classInchargemodalType === "approved" ? (
              <SiTicktick className="mx-auto mb-4 h-14 w-14 text-green-500 dark:text-white" />
            ) : classInchargemodalType === "rejected" ? (
              <RxCrossCircled className="mx-auto mb-4 h-14 w-14 text-red-500 dark:text-white" />
            ) : (
              <MdOutlineDownloadDone className="mx-auto mb-4 h-14 w-14 text-secondary-blue dark:text-white" />
            )}

            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              {classInchargemodalType === "approved" ? (
                <div>
                  Are you to approve this request?
                  <div className="w-full my-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="px-4 py-2  rounded-t-lg dark:bg-gray-800">
                      <textarea
                        id="classIncharge_comment"
                        rows="4"
                        className="w-full px-0 text-sm text-gray-900 bg-white border-0  focus:ring-0 dark:text-white"
                        placeholder="Write your comments..."
                        onChange={(e) =>
                          setclassInchargeComment(e.target.value)
                        }
                      ></textarea>
                    </div>
                  </div>
                </div>
              ) : classInchargemodalType === "rejected" ? (
                <div>
                  Are you sure you want to reject this request?
                  <div className="w-full my-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="px-4 py-2 bg-white rounded-t-lg dark:bg-gray-800">
                      <textarea
                        id="classIncharge_comment"
                        rows="4"
                        className="w-full px-0 text-sm text-gray-900 bg-white border-0  focus:ring-0 dark:text-white"
                        placeholder="Write your comments..."
                        onChange={(e) =>
                          setclassInchargeComment(e.target.value)
                        }
                      ></textarea>
                    </div>
                  </div>
                </div>
              ) : (
                "This action has already been taken."
              )}
            </h3>
            {classInchargemodalType !== "taken" && (
              <div className="flex justify-center gap-4">
                <Button
                  color={
                    classInchargemodalType === "approved"
                      ? "success"
                      : "failure"
                  }
                  className={`${
                    classInchargemodalType === "approved"
                      ? "bg-green-500 hover:bg-green-500"
                      : "bg-red-500 hover:bg-red-500"
                  }`}
                  onClick={confirmRequestClass}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <Spinner size="sm" className="mr-2" />
                      <span className="text-white">Loading...</span>
                    </div>
                  ) : (
                    <span className="text-white">
                      {classInchargemodalType === "approved"
                        ? "Approve"
                        : "Reject"}
                    </span>
                  )}
                </Button>
                <Button color="gray" onClick={handleCloseClassIncharge}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </ModalBody>
      </Modal>

      {/* Details Modal */}
      {selectedRequest && (
        <DetailsModal
          isOpen={showDetails}
          onClose={() => {
            setShowDetails(false);
            setSelectedRequest(null);
          }}
          request={selectedRequest}
        />
      )}
    </div>
  );
}

// Helper Components
const CommentsCell = ({ mentorComment, classInchargeComment }) => (
  <div className="flex flex-col gap-1 max-w-xs">
    {mentorComment !== "No Comments" && (
      <div className="text-xs">
        <span className="font-medium text-gray-700 dark:text-gray-300">
          Mentor:
        </span>{" "}
        <span className="text-gray-600 dark:text-gray-400">
          {mentorComment}
        </span>
      </div>
    )}
    {classInchargeComment !== "No Comments" && (
      <div className="text-xs">
        <span className="font-medium text-gray-700 dark:text-gray-300">
          CI:
        </span>{" "}
        <span className="text-gray-600 dark:text-gray-400">
          {classInchargeComment}
        </span>
      </div>
    )}
  </div>
);

const DetailsModal = ({ isOpen, onClose, request }) => (
  <Modal show={isOpen} onClose={onClose} size="lg">
    <Modal.Header className="border-b border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Request Details
      </h3>
    </Modal.Header>
    <Modal.Body className="bg-white dark:bg-gray-800">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <DetailItem label="Student Name" value={request.name} />
          <DetailItem label="Section" value={request.section_name} />
          <DetailItem label="OD Type" value={request.odType} />
          <DetailItem label="No. of Days" value={request.noOfDays} />
          <DetailItem
            label="From Date"
            value={new Date(request.fromDate).toLocaleDateString()}
          />
          <DetailItem
            label="To Date"
            value={new Date(request.toDate).toLocaleDateString()}
          />
        </div>

        <hr className="border-gray-200 dark:border-gray-700" />

        {request.odType === "Internal" ? (
          <div>
            <h3 className="font-medium mb-2 text-gray-900 dark:text-white">
              Internal OD Details
            </h3>
            <DetailItem label="Reason" value={request.reason} />
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="font-medium mb-2 text-gray-900 dark:text-white">
              External OD Details
            </h3>
            <DetailItem label="College/Company" value={request.collegeName} />
            <DetailItem label="City" value={request.city} />
            <DetailItem label="Event Name" value={request.eventName} />
            {request.paperTitle && (
              <DetailItem label="Paper Title" value={request.paperTitle} />
            )}
            {request.projectTitle && (
              <DetailItem label="Project Title" value={request.projectTitle} />
            )}
            {request.eventDetails && (
              <DetailItem label="Event Details" value={request.eventDetails} />
            )}
            {request.eventTypes?.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Event Types:
                </p>
                <div className="flex gap-2 flex-wrap">
                  {request.eventTypes.map((type) => (
                    <span
                      key={type}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium transition-colors duration-300"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal.Body>
    <Modal.Footer className="border-t border-gray-200 dark:border-gray-700">
      <Button color="gray" onClick={onClose}>
        Close
      </Button>
    </Modal.Footer>
  </Modal>
);

const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">
      {value || "Not provided"}
    </p>
  </div>
);
