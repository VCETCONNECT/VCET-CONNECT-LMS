import React from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Mail,
  Phone,
  Globe,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const contactInfo = [
    {
      icon: <MapPin size={18} />,
      text: "Velammal Nagar Viraganoor - Madurai 625009",
    },
    {
      icon: <Mail size={18} />,
      text: "principal@vcet.ac.in",
      link: "mailto:principal@vcet.ac.in",
    },
    {
      icon: <Phone size={18} />,
      text: "+91 99949-94991",
      link: "tel:+919994994991",
    },
    {
      icon: <Globe size={18} />,
      text: "www.vcet.ac.in",
      link: "https://vcet.ac.in/",
    },
  ];

  const socialLinks = [
    {
      icon: <Facebook size={18} />,
      link: "/",
      label: "Facebook",
    },
    {
      icon: <Twitter size={18} />,
      link: "/",
      label: "Twitter",
    },
    {
      icon: <Linkedin size={18} />,
      link: "/",
      label: "LinkedIn",
    },
    {
      icon: <Instagram size={18} />,
      link: "/",
      label: "Instagram",
    },
  ];

  return (
    <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* College Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/vcet.jpeg"
                alt="VCET Logo"
                className="w-10 h-10 rounded-full"
              />
              <h3 className="font-semibold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-[#1f3a6e] dark:from-blue-400 dark:to-blue-200">
                VCET Connect
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Velammal College of Engineering and Technology - Nurturing
              Excellence in Education
            </p>
            {/* Social Links moved under college info */}
            {/* <div className="pt-4">
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div> */}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/know-about-us"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/wardDetails"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Ward Details
                </Link>
              </li>
              <li>
                <a
                  href="https://vcet.ac.in/vcetit/cse.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  CSE Department
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info - Moved to right */}
          <div className="lg:text-right">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Contact Information
            </h4>
            <ul className="space-y-3">
              {contactInfo.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 lg:justify-end"
                >
                  {item.link ? (
                    <a
                      href={item.link}
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-start gap-2"
                    >
                      <span className="mt-1 text-blue-600 dark:text-blue-400 order-1 lg:-order-1">
                        {item.icon}
                      </span>
                      {item.text}
                    </a>
                  ) : (
                    <>
                      <span className="mt-1 text-blue-600 dark:text-blue-400 order-1 lg:-order-1">
                        {item.icon}
                      </span>
                      <span>{item.text}</span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {currentYear} VCET Connect. All rights reserved.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Designed and Developed by Department of Computer Science and
              Engineering
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
