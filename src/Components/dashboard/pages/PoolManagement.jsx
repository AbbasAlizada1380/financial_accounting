import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import SubmitBtn from "../../../utils/SubmitBtn";
import { FaRegEdit } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
import CancelBtn from "../../../utils/CancelBtn";

// 👇 fallback mock data
import mockCustomers from "./mockCustomers";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const PoolManagement = () => {
  const token = useSelector((state) => state.user.accessToken);

  const [stocks, setStocks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    howManyPerson: "",
    fee: "",
    totalPay: "",
    isCalculated: false,
  });
  const [editingId, setEditingId] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  // --- fetch stocks from API or fallback ---
  const fetchStocks = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/inventory/stocks/`, {
        headers,
      });
      setStocks(res.data);
    } catch (err) {
      console.warn("⚠️ API unavailable, using mock data");
      setStocks(mockCustomers);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  // --- create or update ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, howManyPerson, fee, isCalculated } = formData;
    const totalPay = parseFloat(howManyPerson) * parseFloat(fee);

    const newEntry = {
      id: editingId || Date.now(),
      name,
      howManyPerson: parseInt(howManyPerson),
      fee: parseFloat(fee),
      totalPay,
      isCalculated,
    };
console.log(newEntry);

    if (editingId) {
      // update
      try {
        await axios.patch(
          `${BASE_URL}/api/v1/inventory/stocks/${editingId}/`,
          newEntry,
          { headers }
        );
        Swal.fire("به‌روزرسانی شد!", "با موفقیت تغییر کرد.", "success");
        fetchStocks();
      } catch {
        setStocks((prev) =>
          prev.map((s) => (s.id === editingId ? newEntry : s))
        );
        Swal.fire("آفلاین!", "تغییر در mock data اعمال شد.", "info");
      }
    } else {
      // create
      try {
        await axios.post(`${BASE_URL}/api/v1/inventory/stocks/`, newEntry, {
          headers,
        });
        Swal.fire("ایجاد شد!", "با موفقیت ذخیره شد.", "success");
        fetchStocks();
      } catch {
        setStocks((prev) => [...prev, newEntry]);
        Swal.fire("آفلاین!", "به mock data اضافه شد.", "info");
      }
    }

    setFormData({
      name: "",
      howManyPerson: "",
      fee: "",
      totalPay: "",
      isCalculated: false,
    });
    setEditingId(null);
  };

  // --- delete ---
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "آیا مطمئن هستید؟",
      text: "این عمل قابل بازگشت نمی‌باشد.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله، حذف شود!",
      cancelButtonText: "انصراف",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`${BASE_URL}/api/v1/inventory/stocks/${id}/`, {
        headers,
      });
      Swal.fire("حذف شد!", "با موفقیت حذف گردید.", "success");
      fetchStocks();
    } catch {
      setStocks((prev) => prev.filter((s) => s.id !== id));
      Swal.fire("آفلاین!", "از mock data حذف شد.", "info");
    }
  };

  // --- edit ---
  const handleEdit = (stock) => {
    setFormData({
      name: stock.name,
      howManyPerson: stock.howManyPerson,
      fee: stock.fee,
      totalPay: stock.totalPay,
      isCalculated: stock.isCalculated,
    });
    setEditingId(stock.id);
    setShowForm(true);
  };

  return (
    <div className="p-5">
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
        >
          {showForm ? "بستن فرم" : "افزودن مشتری جدید"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold text-center mb-4">
            {editingId ? "ویرایش مشتری" : "افزودن مشتری"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="نام"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="input-field"
              required
            />
            <input
              type="number"
              placeholder="تعداد نفرات"
              value={formData.howManyPerson}
              onChange={(e) =>
                setFormData({ ...formData, howManyPerson: e.target.value })
              }
              className="input-field"
              required
            />
            <input
              type="number"
              placeholder="هزینه مجموعی"
              value={formData.fee}
              onChange={(e) =>
                setFormData({ ...formData, fee: e.target.value })
              }
              className="input-field"
              required
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isCalculated}
                onChange={(e) =>
                  setFormData({ ...formData, isCalculated: e.target.checked })
                }
              />
              محاسبه شد؟
            </label>
          </div>

          <div className="flex justify-center gap-4 mt-4">
            <SubmitBtn
              type="submit"
              title={editingId ? "ذخیره تغییرات" : "ثبت"}
            />
            <CancelBtn
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setFormData({
                  name: "",
                  howManyPerson: "",
                  fee: "",
                  totalPay: "",
                  isCalculated: false,
                });
              }}
              title="انصراف"
              type="button"
            />
          </div>
        </form>
      )}

      {/* --- list --- */}
      <table className="w-full border bg-white rounded-lg">
        <thead>
          <tr className="bg-blue-500 text-white text-center">
            <th className="px-4 py-2">#</th>
            <th className="px-4 py-2">نام</th>
            <th className="px-4 py-2">تعداد نفرات</th>
            <th className="px-4 py-2">هزینه فی نفر</th>
            <th className="px-4 py-2">مجموع پرداختی</th>
            <th className="px-4 py-2">محاسبه شده؟</th>
            <th className="px-4 py-2">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((s, idx) => (
            <tr
              key={s.id}
              className={`text-center ${idx % 2 === 0 ? "bg-gray-100" : ""}`}
            >
              <td>{idx + 1}</td>
              <td>{s.name}</td>
              <td>{s.howManyPerson}</td>
              <td>{s.fee}</td>
              <td>{s.totalPay}</td>
              <td>{s.isCalculated ? "بله" : "خیر"}</td>
              <td className="flex justify-center gap-2 py-2">
                <button onClick={() => handleEdit(s)} className="text-blue-500">
                  <FaRegEdit size={20} />
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-red-500"
                >
                  <IoTrashSharp size={20} />
                </button>
              </td>
            </tr>
          ))}
          {stocks.length === 0 && (
            <tr>
              <td colSpan="7" className="text-center py-4 text-gray-500">
                هیچ مشتری‌ای یافت نشد.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PoolManagement;
