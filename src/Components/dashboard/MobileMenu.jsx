import React, { useState } from "react";
import { MdMenu, MdClose, MdKeyboardArrowLeft } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { signOutSuccess } from "../../state/userSlice/userSlice";
import { MdDashboardCustomize } from "react-icons/md";
import { GiStockpiles } from "react-icons/gi";
import { FaSignOutAlt, FaUser } from "react-icons/fa";

const MobileMenu = ({ setActiveComponent, activeComponent }) => {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const MySwal = withReactContent(Swal);

  // 🔒 Handle sign out
  const handleSignOut = () => {
    MySwal.fire({
      title: "آیا مطمئن هستید؟",
      text: "شما از حساب خود خارج خواهید شد!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "بله، خارج شوم!",
      cancelButtonText: "لغو",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(signOutSuccess());
      }
    });
  };

  // 📋 Menu Items
  const allMenuItems = [
    {
      name: "داشبورد",
      value: "dashboard",
      icon: <MdDashboardCustomize className="text-green-500" />,
      roles: ["pool"],
    },
    {
      name: "مدیریت مالی",
      value: "financialManagement",
      icon: <GiStockpiles className="text-blue-500" />,
      roles: ["admin", "pool"],
    },
    {
      name: "پروفایل",
      value: "profile",
      icon: <FaUser className="text-blue-500" />,
      roles: ["admin", "shop", "pool"],
    },
    {
      name: "خروج",
      value: "signout",
      icon: <FaSignOutAlt className="text-rose-500" />,
      roles: ["admin", "shop", "pool"],
    },
  ];

  const userRole = "pool"; // can be dynamic later
  const accessibleComponents = allMenuItems.filter((i) =>
    i.roles.includes(userRole)
  );

  return (
    <>
      {/* 🔘 Hamburger Button */}
      <div className="lg:hidden fixed top-3 right-3 z-50">
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="p-2 bg-gray-100 rounded-full shadow-md hover:bg-gray-200 transition"
          >
            <MdMenu className="text-2xl text-gray-700" />
          </button>
        )}
      </div>

      {/* 📱 Mobile Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full bg-white shadow-lg z-40 w-64 transform transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">محاسبات مالی</h2>
          <button onClick={() => setOpen(false)} className="text-gray-600">
            <MdClose className="text-2xl" />
          </button>
        </header>

        <ul className="mt-4 px-3 space-y-1">
          {accessibleComponents.map((component, index) => (
            <li key={index}>
              <button
                onClick={() => {
                  if (component.value === "signout") {
                    handleSignOut();
                  } else {
                    setActiveComponent(component.value);
                    setOpen(false);
                  }
                }}
                className={`flex items-center justify-between w-full px-4 py-2.5 rounded-md text-right transition ${
                  activeComponent === component.value
                    ? "bg-gray-200 text-primary"
                    : "hover:bg-gray-100 text-gray-800"
                }`}
              >
                <div className="flex items-center gap-x-3">
                  <span className="text-xl">{component.icon}</span>
                  <span className="font-semibold text-sm">
                    {component.name}
                  </span>
                </div>
                <MdKeyboardArrowLeft className="text-gray-500 text-lg" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* 🩶 Overlay background when menu open */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
          onClick={() => setOpen(false)}
        ></div>
      )}
    </>
  );
};

export default MobileMenu;
