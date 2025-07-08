import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import ODStatus from "../components/systems/od/ODStatus";

const DashBoard = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [ODRequests, setODRequests] = useState([]);

  const id =
    currentUser.userType === "Student" ? currentUser.id : currentUser.userId;

  useEffect(() => {
    const fetchODRequests = async () => {
      try {
        const res = await fetch(`/api/getodrequest/${id}`);
        const data = await res.json();
        if (res.ok) {
          setODRequests(data);
        }
      } catch (error) {
        console.error("Error fetching OD requests:", error);
      }
    };

    fetchODRequests();
  }, [currentUser.id]);

  return (
    <div className="app">
      <ODStatus ODRequests={ODRequests} />
    </div>
  );
};

export default DashBoard;
