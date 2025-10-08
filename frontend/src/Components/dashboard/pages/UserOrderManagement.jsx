// src/Components/dashboard/pages/UserOrderManagement.jsx

import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import {
  Loader2,
  PackageSearch,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { store } from "../../../state/store"; // Adjust path if needed
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

// Helper function to create an API client with auth token
const createApiClient = () => {
  const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000",
  });
  api.interceptors.request.use((config) => {
    if (store) {
      const token = store.getState().user.accessToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });
  return api;
};

// StatusBadge component (can be shared in a common file)
const StatusBadge = ({ status }) => {
  const statusStyles = {
    paid: "bg-green-100 text-green-700 ring-green-600/20",
    processing: "bg-yellow-100 text-yellow-800 ring-yellow-600/20",
    failed: "bg-red-100 text-red-700 ring-red-600/20",
    cancelled: "bg-gray-100 text-gray-700 ring-gray-600/20",
    initiated: "bg-blue-100 text-blue-700 ring-blue-600/20",
    pending: "bg-orange-100 text-orange-800 ring-orange-600/20",
    default: "bg-gray-100 text-gray-700 ring-gray-600/20",
  };
  const style = statusStyles[status?.toLowerCase()] || statusStyles.default;
  const capitalizedStatus = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "Unknown";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {capitalizedStatus}
    </span>
  );
};

const UserOrderManagement = () => {
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    const fetchMyOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const api = createApiClient();
        // NOTE: You will need a backend endpoint like this that returns orders for the logged-in user.
        // For now, we'll assume it's the same as the admin one for display purposes.
        const response = await api.get("/api/v1/cart/orders/");
        setMyOrders(response.data);
      } catch (err) {
        const errorMessage =
          err.response?.data?.detail || "Failed to fetch your orders.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchMyOrders();
  }, []);

  const handleToggleExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  if (loading)
    return (
      <div className="p-10 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto" />
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-center bg-red-50 text-red-700 rounded-lg">
        <p>Error: {error}</p>
      </div>
    );

  return (
    <div className="p-3 md:p-6">
      <div className="bg-white p-6 rounded-lg shadow-md min-h-full">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="mt-2 text-sm text-gray-700">
          A history of all the orders you have placed.
        </p>

        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              {myOrders.length > 0 ? (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                  {/* The table structure is identical to your admin OrderManagement component */}
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      {/* Table Headers */}
                      <tr>
                        <th scope="col" className="w-12"></th>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          Order ID
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Total
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Payment Status
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Order Status
                        </th>
                      </tr>
                    </thead>
                    {myOrders.map((order) => (
                      <tbody
                        key={order.oid}
                        className="divide-y divide-gray-200 bg-white"
                      >
                        <tr
                          onClick={() => handleToggleExpand(order.oid)}
                          className="cursor-pointer hover:bg-gray-50"
                        >
                          <td className="pl-4">
                            {expandedOrderId === order.oid ? (
                              <ChevronDown className="h-5 w-5 text-gray-500" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-gray-500" />
                            )}
                          </td>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-mono text-indigo-600 sm:pl-6">
                            {order.oid}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {new Date(order.date).toLocaleDateString()}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                            €{Number(order.total).toFixed(2)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <StatusBadge status={order.payment_status} />
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {order.order_status}
                          </td>
                        </tr>
                        <AnimatePresence>
                          {expandedOrderId === order.oid && (
                            <motion.tr
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <td colSpan="6" className="p-0">
                                {/* ... (Expanded row JSX from your original component) ... */}
                              </td>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </tbody>
                    ))}
                  </table>
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-lg shadow">
                  <PackageSearch className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    You haven't placed any orders yet.
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    When you place an order, it will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOrderManagement;
