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
      name: "گزارشات",
      value: "reporting",
      icon: <FaChartLine className="text-teal-500" />,
      roles: ["admin"],
    },
    {
      name: "داشبورد",
      value: "dashboard",
      icon: <MdDashboardCustomize className="text-green-500" />,
      roles: ["admin"],
    },
    {
      name: "کمپنی",
      value: "category",
      icon: <MdCategory className="text-blue-500" />,
      roles: ["admin"],
    },
    {
      name: "مشخصه",
      value: "attribute",
      icon: <MdEditAttributes className="text-blue-500" />,
      roles: ["admin"],
    },
    {
      name: "محصول جدید",
      value: "products",
      icon: <MdLocalLaundryService className="text-blue-500" />,
      roles: ["admin"],
    },
    {
      name: "مدیریت حوض",
      value: "poolManagement",
      icon: <GiStockpiles className="text-blue-500" />,
      roles: ["admin", "pool"],
    },
    {
      name: "مدیریت فروشات",
      value: "SalesManagement",
      icon: <FaSalesforce className="text-blue-500" />,
      roles: ["admin", "shop"], // shop can also see this
    },
    {
      name: "Pool to Pool",
      value: "poolToPool",
      icon: <FaBuilding className="text-purple-500" />,
      roles: ["admin"], // pool users can only see this + admins
    },
    {
      name: "بخش",
      value: "Warehouse",
      icon: <Warehouse className="text-blue-500" />,
      roles: ["admin"], // warehouse access for shop & admin
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
    useSelector((state) => state.user.currentUser.role) || "pool";
  const accessibleComponents = allMenuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <div className="h-full transition-all duration-300 ease-in-out w-[70px] md:w-[80px] lg:w-64 bg-white">
      <header className="flex items-center justify-center lg:justify-start gap-5 p-5 font-bold text-xl">
        <Link
          to="/"
          className="flex items-center justify-center p-2 bg-gray-300 h-16 w-16 md:h-20 md:w-20 rounded-full"
        >
          <img
            src="/logo.png"
            alt="logo"
            className="h-12 w-12 object-contain"
          />
        </Link>
        <Link
          to="/"
          className="text-lg font-semibold text-[#7209b7] whitespace-nowrap hidden lg:inline"
        >
          BAND-E-AMIR
        </Link>
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
                  {component.value === "orders" && userRole !== "admin"
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
