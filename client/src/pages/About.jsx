import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  FileText,
  Clock,
  AlertTriangle,
  Users,
  BookOpen,
  ChevronDown,
  Computer,
} from "lucide-react";
import { Carousel } from "flowbite-react";
import { useEffect } from "react";

const systems = [
  {
    name: "Leave Management System / CGPA System",
    description:
      "Streamlined academic and leave management for enhanced efficiency",
    icon: FileText,
    color: "from-blue-400 to-blue-600",
    developers: [
      "Navin Kumaran - 22CSEB48",
      "Vinoth Kumar - 22CSEB59",
      "Dinesh Kumar - 22CSEB35",
      "Udhaya Chandra Pandiyan - 22CSEB57",
    ],
  },
  {
    name: "OD Management System",
    description: "Simplified On-Duty request and approval workflow",
    icon: Clock,
    color: "from-purple-400 to-purple-600",
    developers: [
      "Manasha Devi T G - 22CSEB16",
      "Ritika Sachdeva - 22CSEB22",
      "Matcharani J - 22CSEB17",
    ],
  },
  {
    name: "Defaulter Management System",
    description: "Efficient tracking and management of academic defaulters",
    icon: AlertTriangle,
    color: "from-red-400 to-red-600",
    developers: [
      "Sanjana R - 22CSEC23",
      "Muthieswari - 22CSEC15",
      "Abitha Sri G - 22CSEC03",
    ],
  },
];

const coordinators = {
  name: "Project Coordinators",
  description: "Our guiding mentors and project supervisors",
  icon: Users,
  color: "from-green-400 to-green-600",
  members: [
    "Dr.R. Perumalraja - Professor & HOD, CSE",
    "Mrs.S.Padma Devi - Assistant Professor II, CSE",
    "Ms.J. Shanthalakshmi Revathy - Assistant Professor II, CSE",
    "Dr.A.M. Rajeswari - Associate Professor, CSE",
    "Mr.S. Murali - Assistant Professor II, CSE",
  ],
};

const About = () => {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
          <motion.div
            className="relative z-10 text-center"
            style={{ opacity, scale }}
          >
            <motion.h1
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600"
            >
              About VCET Connect
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl mb-8 text-gray-800"
            >
              Revolutionizing academic administration through innovative digital
              solutions
            </motion.p>
            <motion.a
              href="#about"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="animate-bounce inline-block"
            >
              <ChevronDown size={48} className="text-white" />
            </motion.a>
          </motion.div>
        </section>

        {/* Systems Section - New Design */}
        <div className="max-w-7xl mx-auto mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Systems
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Innovative solutions designed and developed by our students
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {systems.map((system, index) => (
              <motion.div
                key={system.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative group h-full"
              >
                <div
                  className="absolute inset-0 bg-gradient-to-r w-full h-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(to right, ${
                      system.color.split(" ")[1]
                    }, ${system.color.split(" ")[3]})`,
                  }}
                />
                <div className="relative h-full bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="p-6 flex flex-col h-full">
                    {/* Icon Header */}
                    <div className="flex items-center gap-4 mb-6">
                      <div
                        className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${system.color}`}
                      >
                        <system.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {system.name}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {system.description}
                    </p>

                    {/* Developers Section - Push to bottom using flex-grow */}
                    <div className="mt-auto">
                      <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                          Development Team:
                        </p>
                        <div className="space-y-2">
                          {system.developers.map((dev, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                            >
                              <div className="h-1.5 w-1.5 rounded-full bg-gray-400"></div>
                              <span>{dev}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Coordinators Section - New Design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16"
        >
          <div className="text-center my-5">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Project Coordinators
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Our guiding mentors and project supervisors
            </p>
          </div>

          <div className="relative">
            {/* Background Decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-3xl -z-10" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
              {coordinators.members.map((member, idx) => {
                const [name, role] = member.split(" - ");
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="flex items-center text-center justify-center gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {role}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full blur-2xl opacity-50 -z-20" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full blur-2xl opacity-50 -z-20" />
          </div>
        </motion.div>

        {/* Vision Mission Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-slate-200 p-4">
            <div className="flex items-center gap-2">
              <BookOpen size={20} className="text-[#1f3a6e]" />
              <h2 className="text-lg font-semibold text-black">
                Our Vision & Mission
              </h2>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
            >
              <h4 className="text-md font-semibold mb-2 text-[#1f3a6e] dark:text-blue-400">
                Our Vision
              </h4>
              <p className="text-md text-gray-600 dark:text-gray-300">
                To revolutionize academic administration through innovative
                digital solutions that enhance the educational experience.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
            >
              <h4 className="text-md font-semibold mb-2 text-[#1f3a6e] dark:text-blue-400">
                Our Mission
              </h4>
              <p className="text-md text-gray-600 dark:text-gray-300">
                Creating seamless connections between students, faculty, and
                administration while maintaining transparency and efficiency.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
            >
              <h4 className="text-md font-semibold mb-2 text-[#1f3a6e] dark:text-blue-400">
                Our Values
              </h4>
              <p className="text-md text-gray-600 dark:text-gray-300">
                Innovation, integrity, and excellence in every aspect of our
                service to the VCET community.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-slate-200 p-4">
            <h2 className="text-lg font-semibold text-black">
              Why Choose VCET Connect?
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-3"
              >
                {[
                  "Streamlined Leave Management",
                  "Real-time Status Updates",
                  "Secure Data Handling",
                ].map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-300"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-[#1f3a6e] dark:bg-blue-400" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-3"
              >
                {[
                  "Automated Notifications",
                  "Intuitive User Interface",
                  "24/7 System Availability",
                ].map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-300"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-[#1f3a6e] dark:bg-blue-400" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-md font-semibold text-center text-gray-500 dark:text-gray-400 mt-6"
            >
              A proud initiative of the Department of Computer Science and
              Engineering, VCET
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
