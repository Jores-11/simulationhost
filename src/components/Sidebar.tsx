"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("/"); // Default active tab set to "Hemo"

  const navItems = [
    { href: "/", label: "Hemo", icon: "🏠" },
    {
      href: "/scenario-plan",
      label: "Scenario Plan",
      icon: "▲",
      hasDropdown: true,
    },
    { href: "/calibrate", label: "Calibrate", icon: "≡" },
    { href: "/intervene", label: "Intervene", icon: "↻" },
    { href: "/visualize", label: "Visualize", icon: "📈" },
    { href: "/scino-ai", label: "Scino AI", icon: "💾" },
  ];

  const dropdownItems = [
    { href: "/scenario-plan/sub1", label: "Sub Item 1" },
    { href: "/scenario-plan/sub2", label: "Sub Item 2" },
  ];

  // Animation variants for sidebar and dropdown
  const sidebarVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const dropdownVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { height: "auto", opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { height: 0, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } },
  };

  const subItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.3, ease: "easeOut" },
    }),
  };

  const handleTabClick = (href: string) => {
    setActiveTab(href);
  };

  return (
    <motion.aside
      className="w-64 h-screen fixed top-0 left-0 flex flex-col p-4 bg-gray-100 dark:bg-gray-800 shadow-lg"
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
    >
      <div className="flex items-center mb-8">
        <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
          Scin Bus
        </h1>
      </div>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <div key={item.href}>
            {item.hasDropdown ? (
              // Dropdown toggle (not a Link, just toggles dropdown)
              <div
                onClick={() => {
                  setIsDropdownOpen(!isDropdownOpen);
                  handleTabClick(item.href); // Update active tab
                }}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 cursor-pointer ${
                  activeTab === item.href
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 font-semibold"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <motion.span
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                    activeTab === item.href
                      ? "bg-green-200 dark:bg-green-600"
                      : "bg-gray-200 dark:bg-gray-600"
                  } transition-all duration-300`}
                >
                  {item.icon}
                </motion.span>
                <span className="flex-1">{item.label}</span>
                <motion.span
                  animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  ▼
                </motion.span>
              </div>
            ) : (
              // Regular navigation item
              <Link
                href={item.href}
                onClick={() => handleTabClick(item.href)}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                  activeTab === item.href
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 font-semibold"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <motion.span
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                    activeTab === item.href
                      ? "bg-green-200 dark:bg-green-600"
                      : "bg-gray-200 dark:bg-gray-600"
                  } transition-all duration-300`}
                >
                  {item.icon}
                </motion.span>
                <span className="flex-1">{item.label}</span>
              </Link>
            )}
            {item.hasDropdown && (
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="ml-8 mt-1 flex flex-col gap-1"
                  >
                    {dropdownItems.map((subItem, index) => (
                      <motion.div
                        key={subItem.href}
                        custom={index}
                        variants={subItemVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        <Link
                          href={subItem.href}
                          onClick={() => handleTabClick(subItem.href)}
                          className={`p-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${
                            activeTab === subItem.href
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : "text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                          }`}
                        >
                          <motion.span
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                              activeTab === subItem.href
                                ? "bg-green-200 dark:bg-green-600"
                                : "bg-gray-200 dark:bg-gray-600"
                            } transition-all duration-300`}
                          >
                            •
                          </motion.span>
                          {subItem.label}
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        ))}
      </nav>
    </motion.aside>
  );
}