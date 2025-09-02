import React from "react";
import { useSelector } from "react-redux";
import CategoryManagement from "./pages/categoryManager.jsx";
import Dashboard from "./dashboard";
import Profile from "../../Pages/dashboard/Profiles.jsx";
import Attribute from "./pages/attribute.jsx";
import ProductManager from "./pages/ProductManager.jsx";
import ProductList from "./pages/ProductList.jsx";
import OrderManagement from "./pages/OrderManagement.jsx";
import VendorManager from "./pages/VendorManager.jsx";
import { Warehouse } from "lucide-react";
import WarehouseManagement from "./pages/Warehouse.jsx";
import StockManager from "./pages/PoolManagement.jsx";
import StockManagement from "./pages/PoolManagement.jsx";
import SalesManagement from "./pages/SalesManagement.jsx";
import Reporting from "./pages/Reporting";
import PoolManagement from "./pages/PoolManagement.jsx";
const MainContent = ({ activeComponent, setActiveComponent }) => {
  const { profile } = useSelector((state) => state.user);

  const isAdmin = profile?.role === "admin";

  const renderContent = () => {
    switch (activeComponent) {
      case "dashboard":
        // Only admins can see the main dashboard
        return <Dashboard />;
      case "reporting":
        return <Reporting />;
      case "category":
        return <CategoryManagement />;
      case "attribute":
        return <Attribute />;
      case "products":
        return <ProductManager />;
      case "poolManagement":
        return <PoolManagement />;
      case "SalesManagement":
        return <SalesManagement />;
      case "Warehouse":
        return <WarehouseManagement />;
      case "VendorManager":
        return <VendorManager />;
      case "porductlist":
        return <ProductList setActiveComponent={setActiveComponent} />;
      case "orders":
        // If the user is an admin, show all orders. Otherwise, show only their orders.
        return <OrderManagement userOnly={!isAdmin} />;
      case "profile":
        return <Profile />;
      default:
        // Default for admin is dashboard, for user is their orders.
        return isAdmin ? <Dashboard /> : <OrderManagement userOnly={true} />;
    }
  };

  return <div className="min-h-full bg-gray-200">{renderContent()}</div>;
};

export default MainContent;
