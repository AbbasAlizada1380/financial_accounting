import React, { useState } from "react";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";
import { FaUser } from "react-icons/fa";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000";
const Dashboard = () => {
  const [activeComponent, setActiveComponent] = useState("dashboard");
  const { profile, loading } = useSelector((state) => state.user);

  // URL کامل عکس پروفایل را ایجاد می‌کند
  const fullProfilePhotoUrl = profile?.profile_photo
    ? `${BASE_URL}${profile.profile_photo}`
    : null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white" dir="rtl">
      <Sidebar
        setActiveComponent={setActiveComponent}
        activeComponent={activeComponent}
      />
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <div className="bg-gray-100 py-2 w-full flex items-center justify-between px-4 shadow-sm">
          {/* بخش پروفایل کاربر و خوش آمدگویی */}
          <div className="flex items-center gap-2 cursor-pointer">
            <AnimatePresence mode="wait">
              {loading && !profile ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse"></div>
                  <div className="w-24 h-4 bg-gray-300 rounded animate-pulse"></div>
                </motion.div>
              ) : (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  {fullProfilePhotoUrl ? (
                    <img
                      src={fullProfilePhotoUrl}
                      alt="کاربر"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <FaUser className="text-gray-600" />
                    </div>
                  )}
                  <span className="font-semibold text-gray-500">
                    {profile
                      ? `${profile.first_name} ${profile.last_name}`
                      : "کاربر"}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <MainContent
            activeComponent={activeComponent}
            setActiveComponent={setActiveComponent}
          />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
