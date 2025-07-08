import React, { useEffect, useState } from 'react';
import LeaveStatus from '../components/systems/leave/LeaveStatus';
import { useSelector } from 'react-redux';

const DashBoard = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [leaveRequests, setLeaveRequests] = useState([]);


  const id = currentUser.userType === "Student" ? currentUser.id : currentUser.userId;

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const res = await fetch(`/api/getleaverequest/${id}`);
        const data = await res.json();
        if (res.ok) {
          setLeaveRequests(data);
        }
      } catch (error) {
        console.error('Error fetching leave requests:', error);
      }
    };

    fetchLeaveRequests();
  }, [currentUser.id]);

  return (
    <div className="app">
      <LeaveStatus leaveRequests={leaveRequests} />
    </div>
  );
};

export default DashBoard;
