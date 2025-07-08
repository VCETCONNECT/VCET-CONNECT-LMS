import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { signOutSuccess } from "../../redux/user/userSlice";
import { Home, User, LogOut, BookOpen, X, LayoutDashboard } from "lucide-react";
import { FaMoon, FaSun } from "react-icons/fa";
import { toggleTheme } from "../../redux/theme/themeSlice";

const SideMenu = ({ open, setOpen }) => {
  const { currentUser } = useSelector((state) => state.user);
  const { theme } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignout = async () => {
    try {
      const res = await fetch("/api/auth/signout", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signOutSuccess());
        navigate("/");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const isActive = (path) => location.pathname === path;

  const MenuItem = ({ to, icon: Icon, label, onClick }) => (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        isActive(to)
          ? "bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
      onClick={() => {
        setOpen(false);
        onClick?.();
      }}
    >
      <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
        <Icon size={20} />
      </span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300
          ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 w-[280px] bg-white dark:bg-gray-900 shadow-xl z-50 lg:hidden
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
              <img
                src="/vcet.jpeg"
                alt="VCET Logo"
                className="w-6 h-6 rounded-full"
              />
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              VCET Connect
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        {currentUser && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <p className="font-medium text-sm text-gray-900 dark:text-white">
              {currentUser.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {currentUser.email}
            </p>
          </div>
        )}

        {/* Menu */}
        <div className="overflow-y-auto h-[calc(100vh-200px)]">
          <nav className="px-2 py-4 space-y-1">
            <MenuItem to="/" icon={Home} label="Home" />
            <MenuItem to="/wardDetails" icon={BookOpen} label="Wards Detail" />

            {currentUser ? (
              <MenuItem
                to={
                  currentUser.isHod
                    ? "/hoddash"
                    : currentUser.userType === "Staff"
                    ? "/staffdashboard"
                    : currentUser.userType === "Student"
                    ? "/profile"
                    : "/hoddash"
                }
                icon={LayoutDashboard}
                label={
                  currentUser.userType === "Staff"
                    ? "Staff Dashboard"
                    : currentUser.userType === "Student"
                    ? "Student Dashboard"
                    : "HOD Dashboard"
                }
              />
            ) : (
              <MenuItem to="/signin" icon={User} label="Sign In" />
            )}

            {/* Theme Toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
            >
              <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                {theme === "light" ? (
                  <FaMoon className="w-4 h-4" />
                ) : (
                  <FaSun className="w-4 h-4" />
                )}
              </span>
              <span className="text-sm font-medium">
                {theme === "light" ? "Dark Mode" : "Light Mode"}
              </span>
            </button>
          </nav>
        </div>

        {/* Logout Button */}
        {currentUser && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSignout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors duration-200"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default SideMenu;
