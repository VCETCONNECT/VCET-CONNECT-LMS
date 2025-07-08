import { useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import HodPrivateRoute from "./components/auth/HodPrivateRoute";
import PrivateRoute from "./components/auth/PrivateRoute";
import PublicRoute from "./components/auth/PublicRoute";
import SignIn from "./components/auth/SignIn";
import StaffPrivateRoute from "./components/auth/StaffPrivateRoute";
import Footer from "./components/general/Footer";
import Navbar from "./components/general/NavBar";
import BonafiedRequestForm from "./components/systems/bonafieds/BonafiedRequestForm.jsx";
import LeaveRequestForm from "./components/systems/leave/LeaveRequestForm";
import MailTiming from "./components/systems/MailTiming";
import About from "./pages/About";
import DashBoard from "./pages/DashBoard";
import ForgotPassword from "./pages/ForgotPassword";
import Hoddashboard from "./pages/HodDashBoard";
import HomePage from "./pages/HomePage";
import PageNotFound from "./pages/PageNotFound";
import ProfilePage from "./pages/ProfilePage";
import StaffDashBoard from "./pages/StaffDashBoard";
import SuperAdmin from "./pages/SuperAdmin";
import WardDetails from "./pages/WardDetails";
import "./utils/devtools-detector.js";

const AppWrapper = () => {
  const location = useLocation();

  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // Disable keyboard shortcuts and dev tools
    const handleKeyDown = (e) => {
      // Prevent F12 key
      if (e.key === "F12") {
        e.preventDefault();
      }

      // Prevent Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (Dev tools)
      if (
        e.ctrlKey &&
        e.shiftKey &&
        (e.key === "I" ||
          e.key === "i" ||
          e.key === "J" ||
          e.key === "j" ||
          e.key === "C" ||
          e.key === "c")
      ) {
        e.preventDefault();
      }

      // Prevent Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === "U" || e.key === "u")) {
        e.preventDefault();
      }

      // Prevent Alt+F4
      if (e.altKey && e.key === "F4") {
        e.preventDefault();
      }
    };

    // Add console warning
    const warningMessage = "Opps! Nothings Here.";
    console.log(
      "%c" + warningMessage,
      "color: red; font-size: 18px; font-weight: bold; "
    );

    // Clear console periodically
    const clearConsole = () => {
      // console.clear();
      // console.log(
      //   "%c" + warningMessage,
      //   "color: red; font-size: 30px; font-weight: bold;"
      // );
    };

    // Add event listeners
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    // Clear console periodically
    // const consoleInterval = setInterval(clearConsole, 3000);

    // Cleanup function
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      // clearInterval(consoleInterval);
    };
  }, []);

  const dashboardPages = [
    "/profile",
    "/staffdashboard",
    "/hoddash",
    "/superadmin",
  ];
  const showNavbar = !dashboardPages.includes(location.pathname);
  const showFooter = [
    "/",
    "/studentsignup",
    "/staffsignup",
    "/signin",
    "/know-about-us",
    "/wardDetails",
    "*",
  ].includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
        </Route>

        {/* Public Routes without authentication check */}
        <Route path="/" element={<HomePage />} />
        <Route path="/know-about-us" element={<About />} />
        <Route path="/hidden/changeMailTiming" element={<MailTiming />} />
        <Route path="/wardDetails" element={<WardDetails />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/studentdashboard" element={<DashBoard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/leaverequest" element={<LeaveRequestForm />} />
          <Route path="/bonafiedrequest" element={<BonafiedRequestForm />} />
        </Route>

        <Route element={<HodPrivateRoute />}>
          <Route path="/hoddash" element={<Hoddashboard />} />
          <Route path="/superadmin" element={<SuperAdmin />} />
        </Route>

        <Route element={<StaffPrivateRoute />}>
          <Route path="/staffdashboard" element={<StaffDashBoard />} />
        </Route>

        <Route path="*" element={<PageNotFound />} />
      </Routes>
      {showFooter && <Footer />}
    </>
  );
};

const App = () => (
  <BrowserRouter>
    <AppWrapper />
  </BrowserRouter>
);

export default App;
