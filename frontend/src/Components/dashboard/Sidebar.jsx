import React from "react";
import {
  FaBoxOpen,
  FaSignOutAlt,
  FaUser,
  FaBuilding,
  FaSalesforce,
  FaChartLine,
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { signOutSuccess } from "../../state/userSlice/userSlice";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  MdCategory,
  MdDashboardCustomize,
  MdEditAttributes,
  MdLocalLaundryService,
} from "react-icons/md";
import { LucideUserRoundPlus, Warehouse } from "lucide-react";
import { GiStockpiles } from "react-icons/gi";
import { MdKeyboardArrowLeft } from "react-icons/md";

const Sidebar = ({ setActiveComponent, activeComponent }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const MySwal = withReactContent(Swal);
  const { currentUser } = useSelector((state) => state.user);

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
        navigate("/sign-in");
      }
    });
  };

  // Define all possible menu items
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
      roles: ["admin", "shop", "pool"], // all can see profile
    },
    {
      name: "خروج",
      value: "signout",
      icon: <FaSignOutAlt className="text-rose-500" />,
      roles: ["admin", "shop", "pool"], // all can log out
    },
  ];

  // Filter items based on role
  const userRole =
    // useSelector((state) => state.user.currentUser.role)
    // ||
    "pool";
  const accessibleComponents = allMenuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <div className="h-full transition-all duration-300 ease-in-out w-[70px] md:w-[80px] lg:w-64 bg-white">
      <header className="flex items-center justify-center lg:justify-start gap-5 p-5 font-bold text-xl">
       
        محاسبات مالی
      </header>

      <ul className="mx-2  space-y-1">
        {accessibleComponents.map((component, index) => (
          <li key={index} className="relative group cursor-pointer">
            <a
              onClick={() => {
                if (component.value === "signout") {
                  handleSignOut();
                } else {
                  setActiveComponent(component.value);
                }
              }}
              className={`relative flex items-center justify-between gap-x-3 w-full px-4 rounded-md py-2.5 transition-all duration-300
              ${
                activeComponent === component.value
                  ? "bg-gray-200 text-primary"
                  : "hover:bg-gray-200 text-black"
              }`}
            >
              <div className="flex items-center justify-center lg:justify-start gap-x-3">
                <span className="text-xl md:text-2xl lg:text-xl">
                  {component.icon}
                </span>
                <span className="text-base font-semibold whitespace-nowrap hidden lg:inline">
                  {component.value === "orders" 
                    ? "My Orders"
                    : component.name}
                </span>
              </div>
              <span
                className={`group-hover:-translate-x-1 ease-in-out transition-all duration-300 lg:block hidden`}
              >
                <MdKeyboardArrowLeft className="text-lg" />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
