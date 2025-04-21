"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProfileChart from "../components/ProfileChart";
import { toast } from "react-toastify";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userName, setUserName] = useState("User Profile");
  const [newName, setNewName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true); // Simulate online status
  const [showStats, setShowStats] = useState(false);

  // Sample data for ProfileChart
  const profileData = [
    { month: "Jan", revenue: 4000, users: 240 },
    { month: "Feb", revenue: 3000, users: 139 },
    { month: "Mar", revenue: 5000, users: 300 },
    { month: "Apr", revenue: 2780, users: 190 },
    { month: "May", revenue: 1890, users: 480 },
    { month: "Jun", revenue: 3490, users: 230 },
  ];

  const handleLogout = () => {
    // Simulate logout
    toast.success("Logged out successfully!");
    setIsProfileOpen(false);
    // Redirect to login page (simulated)
    window.location.href = "/login";
  };

  const handleNameChange = () => {
    if (newName.trim()) {
      setUserName(newName);
      setIsEditingName(false);
      toast.success("Name updated successfully!");
    }
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
        toast.success("Profile picture updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  // Animation variants for dropdown
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } },
  };

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 min-h-screen flex flex-col`}
      >
        {/* Principal Navbar */}
        <header className="w-full bg-white shadow-md p-4 flex justify-between items-center fixed top-0 left-0 z-20 dark:bg-gray-800 dark:text-white">
          <div className="flex items-center gap-2">
            {/* Simulation Logo */}
            <img
              src="https://via.placeholder.com/32" // Placeholder logo (replace with actual logo URL)
              alt="Simulation Logo"
              className="w-8 h-8"
            />
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              OptimScale
            </h1>
          </div>
          <div className="relative">
            <motion.div
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-gray-700 dark:text-gray-300">{userName}</span>
              <div className="relative w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-gray-700 dark:text-gray-300">👤</span>
                )}
                {isOnline && (
                  <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                )}
              </div>
            </motion.div>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-30 dark:bg-gray-800"
                >
                  {/* Profile Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      {profilePic ? (
                        <img
                          src={profilePic}
                          alt="Profile"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-700 dark:text-gray-300 text-xl">👤</span>
                      )}
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        {userName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isOnline ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>

                  {/* Change Name */}
                  {isEditingName ? (
                    <div className="mb-4">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Enter new name"
                        className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 text-sm"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={handleNameChange}
                          className="p-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors duration-200"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setIsEditingName(false)}
                          className="p-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-colors duration-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setNewName(userName);
                        setIsEditingName(true);
                      }}
                      className="w-full p-2 mb-2 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-sm text-gray-700 dark:text-gray-300"
                    >
                      Change Name
                    </button>
                  )}

                  {/* Change Profile Picture */}
                  <div className="mb-2">
                    <label className="w-full p-2 flex items-center gap-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                      <span>Change Profile Picture</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePicChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Toggle Online Status (Simulated) */}
                  <button
                    onClick={() => setIsOnline(!isOnline)}
                    className="w-full p-2 mb-2 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-sm text-gray-700 dark:text-gray-300"
                  >
                    {isOnline ? "Go Offline" : "Go Online"}
                  </button>

                  {/* View Profile Stats */}
                  <button
                    onClick={() => setShowStats(!showStats)}
                    className="w-full p-2 mb-2 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-sm text-gray-700 dark:text-gray-300"
                  >
                    {showStats ? "Hide Stats" : "View Profile Stats"}
                  </button>

                  {/* Settings (Placeholder) */}
                  <button
                    onClick={() => toast.info("Settings feature coming soon!")}
                    className="w-full p-2 mb-2 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-sm text-gray-700 dark:text-gray-300"
                  >
                    Settings
                  </button>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full p-2 text-left rounded-lg hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-200 text-sm text-red-600 dark:text-red-400"
                  >
                    Logout
                  </button>

                  {/* Profile Stats (Chart) */}
                  <AnimatePresence>
                    {showStats && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4"
                      >
                        <ProfileChart
                          data={profileData}
                          dataKey="users"
                          title="Active Users"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          unit="users"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Main Content with Sidebar */}
        <div className="flex flex-1 pt-16">
          <Sidebar />
          <main className="flex-1 ml-64 p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}