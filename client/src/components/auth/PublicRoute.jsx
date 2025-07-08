import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const { currentUser } = useSelector((state) => state.user);

  // If user is authenticated, redirect to their respective dashboard
  if (currentUser) {
    if (currentUser.userType === "Staff") {
      return currentUser.isHod ? (
        <Navigate to="/hoddash" replace />
      ) : (
        <Navigate to="/staffdashboard" replace />
      );
    } else if (currentUser.userType === "Student") {
      return <Navigate to="/profile" replace />;
    }
  }

  // If not authenticated, render the public route
  return <Outlet />;
};

export default PublicRoute;
