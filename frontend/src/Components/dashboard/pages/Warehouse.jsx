import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import SubmitBtn from "../../../utils/SubmitBtn";
import { FaRegEdit } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
import CancelBtn from "../../../utils/CancelBtn";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const WarehouseManagement = () => {
  const token = useSelector((state) => state.user.accessToken);
  const [warehouses, setWarehouses] = useState([]);
  const [formData, setFormData] = useState({ name: "", location: "" });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false); // 👈 NEW STATE

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // Fetch warehouses
  const fetchWarehouses = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/inventory/warehouses/`, {
        headers,
      });
      setWarehouses(res.data);
    } catch (err) {
      console.error("Failed to fetch warehouses:", err);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  // Create or Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.patch(
          `${BASE_URL}/api/v1/inventory/warehouses/${editingId}/`,
          formData,
          { headers }
        );
        Swal.fire("بروز شد!", "گدام موفقانه بروز گردید.", "success");
      } else {
        await axios.post(`${BASE_URL}/api/v1/inventory/warehouses/`, formData, {
          headers,
        });
        Swal.fire("ایجاد شد!", "گدام موفقانه اضافه گردید.", "success");
      }
      setFormData({ name: "", location: "" });
      setEditingId(null);
      fetchWarehouses();
    } catch (err) {
      console.error("Error submitting form:", err);
      Swal.fire("خطا", "مشکلی پیش آمد!", "error");
    }
  };

  // Delete
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "مطمئن هستید؟",
      text: "این عمل برگشت داده نمی‌شود.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بلی، حذف شود!",
      cancelButtonText: "انصراف",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/api/v1/inventory/warehouses/${id}/`, {
          headers,
        });
        Swal.fire("حذف شد!", "گدام موفقانه حذف گردید.", "success");
        fetchWarehouses();
      } catch (err) {
        console.error("Delete failed:", err);
        Swal.fire("خطا", "حذف گدام ناکام شد.", "error");
      }
    }
  };

  const handleEdit = (warehouse) => {
    setFormData({ name: warehouse.name, location: warehouse.location });
    setEditingId(warehouse.id);
    setShowForm(true);
  };
  const resetForm = () => {
    setFormData({ name: "", location: "" });
    setEditingId(null);
  };

  return (
    <div className=" p-5">
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
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <input
                type="text"
                placeholder="نام گدام"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="input-field"
                required
              />
              <input
                type="text"
                placeholder="موقعیت"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="input-field"
                required
              />
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

      <h3 className="text-xl font-semibold font-Ray_black pt-8 pr-2">
        تمام گدام‌ها
      </h3>
      <div className="mt-4 overflow-x-auto rounded-lg">
        <table className="w-full  bg-white table-auto">
          <thead>
            <tr className="bg-blue-500 text-white text-center">
              <th className=" px-4 py-2">#</th>
              <th className=" px-4 py-2">نام</th>
              <th className=" px-4 py-2">موقعیت</th>
              <th className=" px-4 py-2">اقدامات</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.map((wh, idx) => (
              <tr
                key={wh.id}
                className={`text-center ${idx % 2 === 0 ? "bg-gray-100" : ""}`}
              >
                <td className=" px-4 py-2">{idx + 1}</td>
                <td className=" px-4 py-2">{wh.name}</td>
                <td className=" px-4 py-2">{wh.location}</td>

                <td className="px-4 py-2 flex justify-center items-center gap-x-2">
                  <button
                    onClick={() => handleEdit(wh)}
                    className="text-blue-500"
                  >
                    <FaRegEdit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(wh.id)}
                    className="text-red-500"
                  >
                    <IoTrashSharp size={20} />
                  </button>
                </td>
              </tr>
            ))}
            {warehouses.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center text-gray-500 py-4">
                  هیچ گدامی پیدا نشد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WarehouseManagement;
