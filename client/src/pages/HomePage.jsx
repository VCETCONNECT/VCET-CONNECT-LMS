import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BarChart,
  Bell,
  Calendar,
  ClipboardCheck,
  UserCheck
} from "lucide-react";
import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

// New component for the particle animation
function ConstellationNetwork() {
  const [points, setPoints] = React.useState([]);
  const svgRef = React.useRef(null);

  React.useEffect(() => {
    const generatePoints = () => {
      const newPoints = [];
      const count = 50;
      for (let i = 0; i < count; i++) {
        newPoints.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * (window.innerHeight * 0.7), // Keep within hero section
          vx: (Math.random() - 0.5) * 0.5, // Velocity X
          vy: (Math.random() - 0.5) * 0.5, // Velocity Y
        });
      }
      setPoints(newPoints);
    };

    generatePoints();
    const interval = setInterval(() => {
      setPoints((prevPoints) => {
        return prevPoints.map((point) => ({
          ...point,
          x: point.x + point.vx,
          y: point.y + point.vy,
          vx:
            point.x + point.vx < 0 || point.x + point.vx > window.innerWidth
              ? -point.vx
              : point.vx,
          vy:
            point.y + point.vy < 0 ||
            point.y + point.vy > window.innerHeight * 0.7
              ? -point.vy
              : point.vy,
        }));
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const getLines = () => {
    const lines = [];
    const maxDistance = 150;

    points.forEach((point, i) => {
      points.slice(i + 1).forEach((point2, j) => {
        const distance = Math.hypot(point.x - point2.x, point.y - point2.y);
        if (distance < maxDistance) {
          const opacity = (maxDistance - distance) / maxDistance;
          lines.push({
            x1: point.x,
            y1: point.y,
            x2: point2.x,
            y2: point2.y,
            opacity,
          });
        }
      });
    });

    return lines;
  };

  return (
    <div className="absolute inset-0 z-0">
      <svg ref={svgRef} className="w-full h-[70vh]">
        {getLines().map((line, i) => (
          <motion.line
            key={i}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="rgba(59, 130, 246, 0.2)"
            strokeWidth="1"
            initial={{ opacity: 0 }}
            animate={{ opacity: line.opacity }}
            transition={{ duration: 0.5 }}
          />
        ))}
        {points.map((point, i) => (
          <motion.circle
            key={i}
            cx={point.x}
            cy={point.y}
            r="2"
            fill="rgba(59, 130, 246, 0.5)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}
      </svg>
    </div>
  );
}

function HomePage() {
  const { currentUser } = useSelector((state) => state.user);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const features = [
    {
      icon: <Calendar size={24} />,
      title: "Leave Management",
      text: "Streamlined leave application process with automated tracking and approvals",
    },
    {
      icon: <Award size={24} />,
      title: "OD Management",
      text: "Efficient handling of On-Duty requests for academic and professional activities",
    },
    {
      icon: <UserCheck size={24} />,
      title: "Defaulter Management",
      text: "Systematic tracking of attendance and disciplinary records",
    },
    {
      icon: <ClipboardCheck size={24} />,
      title: "Real-time Processing",
      text: "Instant updates on request status and approvals",
    },
    {
      icon: <Bell size={24} />,
      title: "Smart Notifications",
      text: "Automated alerts for status changes and pending actions",
    },
    {
      icon: <BarChart size={24} />,
      title: "Analytics & Reports",
      text: "Comprehensive reports and insights for better decision-making",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-blue-900 relative overflow-hidden">
      <ConstellationNetwork />
      {/* <BackgroundDecoration /> */}

      {/* Updated Hero Section */}
      <section className="relative min-h-[85vh] flex items-center">
        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 mt-2 md:mt-10 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              className="text-left lg:pr-12"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              
              <motion.h1
                className="text-7xl font-bold mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  VCET
                </span>
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
                  Connect
                </span>
              </motion.h1>
              <div className="m-3 mb-4">
                <p className="text-xl">
                  Managing leaves, od, academics, and notifications in one
                  unified platform
                </p>
              </div>

              {currentUser ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="space-x-4"
                >
                  <Link
                    to={
                      currentUser.isHod
                        ? "/hoddash"
                        : currentUser.isStaff
                        ? "/staffdashboard"
                        : "/profile"
                    }
                    className="group inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    Dashboard
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  className="space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row items-start sm:items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link
                    to="/signin"
                    className="group inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    Get Started
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </Link>
              
                </motion.div>
              )}
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="relative">
                {/* Decorative elements */}
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                {/* Main Card */}
                <motion.div
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="max-w-3xl mx-auto text-gray-800 dark:text-gray-200 px-4 py-8">
                    <h3 className="text-3xl font-bold text-center mb-8">
                      Vision and Mission of Velammal
                    </h3>

                    {/* Vision */}
                    <div className="flex items-start gap-4 mb-6">
                      <div>
                        <h4 className="text-xl text-blue-600 font-semibold mb-1">Vision</h4>
                        <p className="text-base leading-relaxed">
                          To emerge and sustain as a Center of Excellence for
                          Technical and Managerial Education upholding social
                          values.
                        </p>
                      </div>
                    </div>

                    {/* Mission */}
                    <div className="flex items-start gap-4 mb-4">
                      <div>
                        <h4 className="text-xl text-blue-600 font-semibold mb-2">Missions</h4>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-3">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>
                              Imparted with comprehensive, innovative and
                              value-based education.
                            </span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>
                              Exposed to technical, managerial and soft skill
                              resources with emphasis on research, and
                              professionalism.
                            </span>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>
                              Inculcated with the need for a disciplined, happy,
                              married and peaceful life.
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Comprehensive Management System
            </motion.h2>
            <motion.p
              className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
            >
              Experience a unified platform that integrates various academic
              processes into one seamless system.
            </motion.p>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-blue-600 dark:text-blue-400">
                    {feature.icon}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.text}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Image Section */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
              <div className="relative z-10 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <BarChart className="w-8 h-8 text-blue-500" />
                    <h3 className="font-semibold">Analytics Dashboard</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Real-time insights into academic performance
                    </p>
                  </div>
                  <div className="space-y-4 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <Bell className="w-8 h-8 text-purple-500" />
                    <h3 className="font-semibold">Smart Notifications</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Stay updated with instant alerts
                    </p>
                  </div>
                  <div className="space-y-4 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <Calendar className="w-8 h-8 text-green-500" />
                    <h3 className="font-semibold">Leave Management</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Streamlined absence tracking
                    </p>
                  </div>
                  <div className="space-y-4 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <UserCheck className="w-8 h-8 text-red-500" />
                    <h3 className="font-semibold">Attendance System</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Automated attendance monitoring
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Transform Your Academic Experience
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Our integrated platform revolutionizes academic management
                  with cutting-edge features designed specifically for VCET's
                  ecosystem. Experience seamless coordination between students,
                  faculty, and administration.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <motion.div
                  className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Award className="w-10 h-10 text-blue-500" />
                  <div>
                    <h4 className="font-semibold">Excellence</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Promoting academic achievement
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-xl"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <ClipboardCheck className="w-10 h-10 text-green-500" />
                  <div>
                    <h4 className="font-semibold">Efficiency</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Streamlined processes
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
