import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import SubmitBtn from "../../../utils/SubmitBtn";
import { FaRegEdit } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
import CancelBtn from "../../../utils/CancelBtn";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const StockManagement = () => {
  const token = useSelector((state) => state.user.accessToken);

  const [stocks, setStocks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false); // 👈 NEW STATE
  const [warehouses, setWarehouses] = useState([]);
  const [formData, setFormData] = useState({
    product: "",
    warehouse: "",
    purchase_price_per_unit: "",
    commission_percent: "",
    quantity: "",
    due_date: "", // NEW
  });

  const [editingId, setEditingId] = useState(null);

  // --- NEW: State for date filters ---
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const headers = { Authorization: `Bearer ${token}` };

  // Fetch all stocks
  const fetchStocks = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/inventory/stocks/`, {
        headers,
      });
      setStocks(res.data);
    } catch (err) {
      console.error("Error fetching stocks:", err);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/categories/categories/`, {
        headers,
      });
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/inventory/products/`, {
        headers,
      });
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // Fetch warehouses
  const fetchWarehouses = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/inventory/warehouses/`, {
        headers,
      });
      setWarehouses(res.data);
    } catch (err) {
      console.error("Error fetching warehouses:", err);
    }
  };

  useEffect(() => {
    fetchStocks();
    fetchCategories();
    fetchProducts();
    fetchWarehouses();
  }, []);

  // Create or Update stock
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.patch(
          `${BASE_URL}/api/v1/inventory/stocks/${editingId}/`,
          formData,
          { headers }
        );
        Swal.fire(
          "به‌روزرسانی شد!",
          "موجودی با موفقیت به‌روزرسانی گردید.",
          "success"
        );
      } else {
        await axios.post(`${BASE_URL}/api/v1/inventory/stocks/`, formData, {
          headers,
        });
        Swal.fire("ایجاد شد!", "موجودی با موفقیت ایجاد گردید.", "success");
      }

      setFormData({
        product: "",
        warehouse: "",
        purchase_price_per_unit: "",
        commission_percent: "",
        quantity: "",
        due_date: "",
      });
      setEditingId(null);
      fetchStocks();
    } catch (err) {
      console.error("Error saving stock:", err);
      Swal.fire("خطا", "ذخیره موجودی انجام نشد.", "error");
    }
  };

  // Delete stock
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "آیا مطمئن هستید؟",
      text: "این عمل قابل بازگشت نمی‌باشد.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله، حذف شود!",
      cancelButtonText: "انصراف",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/api/v1/inventory/stocks/${id}/`, {
          headers,
        });
        Swal.fire("حذف شد!", "موجودی با موفقیت حذف گردید.", "success");
        fetchStocks();
      } catch (err) {
        console.error("Delete failed:", err);
        Swal.fire("خطا", "حذف موجودی انجام نشد.", "error");
      }
    }
  };

  // Edit stock
  const handleEdit = (stock) => {
    setFormData({
      product: stock.product,
      warehouse: stock.warehouse,
      purchase_price_per_unit: stock.purchase_price_per_unit,
      commission_percent: stock.commission_percent,
      quantity: stock.quantity,
      due_date: stock.due_date || "", // NEW
    });
    setEditingId(stock.id);
  };

  // --- NEW: Filter stocks based on the selected date range ---
  const filteredStocks = stocks.filter((stock) => {
    if (!startDate && !endDate) {
      return true; // If no date is selected, show all stocks
    }
    const stockDate = new Date(stock.due_date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    // Adjust end date to include the entire day
    if (end) {
      end.setHours(23, 59, 59, 999);
    }

    if (start && end) {
      return stockDate >= start && stockDate <= end;
    }
    if (start) {
      return stockDate >= start;
    }
    if (end) {
      return stockDate <= end;
    }
    return true;
  });
  // --- Reset Form Function ---
  const resetForm = () => {
    setFormData({
      product: "",
      warehouse: "",
      purchase_price_per_unit: "",
      commission_percent: "",
      quantity: "",
      due_date: "",
    });
    setEditingId(null);
  };

  return (
    <div className=" p-5 ">
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
        >
          {showForm ? "بستن فرم" : "افزودن جنس جدید"}
        </button>
      </div>
      {showForm && (
        <div className="bg-white rounded-lg p-6 ">
          <h2 className="text-xl font-bold text-center mb-4">
            {editingId ? "ویرایش" : "افزودن"} ذخیره
          </h2>

          <form onSubmit={handleSubmit} className="  mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Product */}
              <label className="flex flex-col">
                <span className="mb-1 font-medium">محصول</span>
                <select
                  value={formData.product}
                  onChange={(e) =>
                    setFormData({ ...formData, product: e.target.value })
                  }
                  className="input-field "
                  required
                >
                  <option value="">انتخاب محصول</option>
                  {products.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.sku} - {prod.tool}
                    </option>
                  ))}
                </select>
              </label>

              {/* Warehouse */}
              <label className="flex flex-col">
                <span className="mb-1 font-medium">گدام</span>
                <select
                  value={formData.warehouse}
                  onChange={(e) =>
                    setFormData({ ...formData, warehouse: e.target.value })
                  }
                  className="input-field "
                  required
                >
                  <option value="">انتخاب گدام</option>
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name} - {wh.location}
                    </option>
                  ))}
                </select>
              </label>

              {/* Purchase Price */}
              <label className="flex flex-col">
                <span className="mb-1 font-medium">قیمت خرید فی واحد</span>
                <input
                  type="number"
                  placeholder="قیمت خرید فی واحد"
                  value={formData.purchase_price_per_unit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      purchase_price_per_unit: e.target.value,
                    })
                  }
                  className="input-field "
                  required
                />
              </label>

              {/* Commission */}
              <label className="flex flex-col">
                <span className="mb-1 font-medium">فیصدی کمیشن</span>
                <input
                  type="number"
                  placeholder="فیصدی کمیشن"
                  value={formData.commission_percent}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      commission_percent: e.target.value,
                    })
                  }
                  className="input-field "
                  required
                />
              </label>

              {/* Quantity */}
              <label className="flex flex-col">
                <span className="mb-1 font-medium">تعداد</span>
                <input
                  type="number"
                  placeholder="تعداد"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  className="input-field "
                  required
                />
              </label>

              {/* Due Date */}
              <label className="flex flex-col">
                <span className="mb-1 font-medium">تاریخ سررسید</span>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData({ ...formData, due_date: e.target.value })
                  }
                  className="input-field "
                  required
                />
              </label>
            </div>

            <div className="flex justify-center gap-4">
              <SubmitBtn
                type="submit"
                title={editingId ? "ذخیره تغییرات" : "ثبت"}
              />
              <CancelBtn
                onClick={() => {
                  setShowForm(false), resetForm();
                }}
                title={"انصراف"}
                type="button"
              />
            </div>
          </form>
        </div>
      )}

      {/* --- NEW: Date Filter Section --- */}
      <div className="bg-white rounded-lg p-6 my-4">
        <h3 className="text-lg font-bold mb-4 text-center">
          فیلتر بر اساس تاریخ سررسید
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium">از تاریخ</label>
            <input
              type="date"
              name="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">تا تاریخ</label>
            <input
              type="date"
              name="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      </div>

      <h3 className="text-xl font-semibold font-Ray_black pt-8 pr-2">
        تمام ذخایر
      </h3>
      <div className="mt-4 overflow-x-auto rounded-lg">
        <table className="w-full border bg-white table-auto">
          <thead>
            <tr className="bg-blue-500 text-white text-center">
              <th scope="col" className=" px-4 py-2">
                #
              </th>
              <th scope="col" className=" px-4 py-2">
                محصول
              </th>
              <th scope="col" className=" px-4 py-2">
                گدام
              </th>
              <th scope="col" className=" px-4 py-2">
                قیمت خرید
              </th>
              <th scope="col" className=" px-4 py-2">
                فیصدی کمیشن
              </th>
              <th scope="col" className=" px-4 py-2">
                تعداد
              </th>
              <th scope="col" className=" px-4 py-2">
                سهم شخصی
              </th>
              <th scope="col" className=" px-4 py-2">
                سهم شرکت
              </th>
              <th scope="col" className=" px-4 py-2">
                تاریخ سررسید
              </th>
              <th scope="col" className=" px-4 py-2">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.map((stock, idx) => {
              const purchasePrice =
                parseFloat(stock.purchase_price_per_unit) || 0;
              const commissionPercent =
                parseFloat(stock.commission_percent) || 0;
              const quantity = parseFloat(stock.quantity) || 0;

              const personalProfit =
                purchasePrice * (commissionPercent / 100) * quantity;
              const companyProfit = purchasePrice * quantity - personalProfit;

              return (
                <tr
                  key={stock.id}
                  className={`text-center ${
                    idx % 2 === 0 ? "bg-gray-100" : ""
                  }`}
                >
                  <td className=" px-4 py-2">{idx + 1}</td>
                  <td className=" px-4 py-2">
                    {products.find((p) => p.id === stock.product)?.sku ||
                      stock.product}
                  </td>
                  <td className=" px-4 py-2">
                    {warehouses.find((w) => w.id === stock.warehouse)?.name ||
                      stock.warehouse}
                  </td>
                  <td className=" px-4 py-2">{purchasePrice.toFixed(2)}</td>
                  <td className=" px-4 py-2">{commissionPercent.toFixed(2)}</td>
                  <td className=" px-4 py-2">{quantity}</td>
                  <td className=" px-4 py-2">{personalProfit.toFixed(2)}</td>
                  <td className=" px-4 py-2">{companyProfit.toFixed(2)}</td>
                  <td className=" px-4 py-2">{stock.due_date}</td>

                  <td className="px-4 py-2 flex justify-center items-center gap-x-2">
                    <button
                      onClick={() => handleEdit(stock)}
                      className="text-blue-500"
                    >
                      <FaRegEdit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(stock.id)}
                      className="text-red-500"
                    >
                      <IoTrashSharp size={20} />
                    </button>
                  </td>
                </tr>
              );
            })}

            {filteredStocks.length > 0 && (
              <tr className=" text-center font-bold bg-gray-200">
                <td colSpan="6" className=" px-4 py-2 text-right">
                  مجموع:
                </td>
                <td className=" px-4 py-2">
                  {filteredStocks
                    .reduce((sum, stock) => {
                      const purchasePrice =
                        parseFloat(stock.purchase_price_per_unit) || 0;
                      const commissionPercent =
                        parseFloat(stock.commission_percent) || 0;
                      const quantity = parseFloat(stock.quantity) || 0;
                      return (
                        sum +
                        purchasePrice * (commissionPercent / 100) * quantity
                      );
                    }, 0)
                    .toFixed(2)}
                </td>
                <td className=" px-4 py-2">
                  {filteredStocks
                    .reduce((sum, stock) => {
                      const purchasePrice =
                        parseFloat(stock.purchase_price_per_unit) || 0;
                      const commissionPercent =
                        parseFloat(stock.commission_percent) || 0;
                      const quantity = parseFloat(stock.quantity) || 0;
                      const personalProfit =
                        purchasePrice * (commissionPercent / 100) * quantity;
                      return sum + (purchasePrice * quantity - personalProfit);
                    }, 0)
                    .toFixed(2)}
                </td>
                <td colSpan="2"></td>
              </tr>
            )}

            {filteredStocks.length === 0 && (
              <tr>
                <td colSpan="10" className="text-center text-gray-500 py-4">
                  هیچ ذخیره‌ای یافت نشد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockManagement;
