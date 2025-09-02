import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { FaRegEdit } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
import SubmitBtn from "../../../utils/SubmitBtn";
import customers from "./mockCustomers";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const SalesManagement = () => {
  const token = useSelector((state) => state.user.accessToken);
  const [sales, setSales] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [loading, setLoading] = useState(false);

  const initialForm = {
    customer: null, // will hold full customer object
    items: [{ name: "", price: 0 }],
    total: 0,
  };

  const [formData, setFormData] = useState(initialForm);

  // Fetch sales
  const fetchSales = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/sales`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSales(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire("خطا!", "مشکل در گرفتن لیست فروش‌ها", "error");
    }
  };

  useEffect(() => {
    if (token) fetchSales();
  }, [token]);

  // Handle item change
  const handleChange = (e, index = null) => {
    if (index !== null) {
      const items = [...formData.items];
      items[index][e.target.name] =
        e.target.name === "price" ? Number(e.target.value) : e.target.value;
      const total = items.reduce((sum, item) => sum + (item.price || 0), 0);
      setFormData({ ...formData, items, total });
    }
  };

  // Select customer
  const handleCustomerChange = (e) => {
    const selected = customers.find((c) => c.id === Number(e.target.value));
    setFormData({ ...formData, customer: selected });
  };

  // Add new item
  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: "", price: 0 }],
    });
  };

  // Remove item
  const removeItem = (index) => {
    const items = formData.items.filter((_, i) => i !== index);
    const total = items.reduce((sum, item) => sum + (item.price || 0), 0);
    setFormData({ ...formData, items, total });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        customer: formData.customer, // send full customer object
        list: formData.items.reduce(
          (acc, item) =>
            item.name ? { ...acc, [item.name]: item.price } : acc,
          {}
        ),
        total: formData.total,
      };
      console.log("Payload:", payload);

      if (editingSale) {
        await axios.patch(`${BASE_URL}/api/sales/${editingSale.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("موفق!", "فروش ویرایش شد", "success");
      } else {
        await axios.post(`${BASE_URL}/api/sales`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("موفق!", "فروش جدید اضافه شد", "success");
      }

      setFormOpen(false);
      setEditingSale(null);
      setFormData(initialForm);
      fetchSales();
    } catch (err) {
      console.error(err);
      Swal.fire("خطا!", "عملیات انجام نشد", "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete sale
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "حذف شود؟",
      text: "آیا مطمئن هستید که می‌خواهید حذف کنید؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله",
      cancelButtonText: "خیر",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/api/sales/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("حذف شد!", "فروش با موفقیت حذف شد", "success");
        fetchSales();
      } catch (error) {
        console.error(error);
        Swal.fire("خطا!", "فروش حذف نشد", "error");
      }
    }
  };

  // Edit sale
  const handleEdit = (sale) => {
    const items = Object.entries(sale.list).map(([name, price]) => ({
      name,
      price,
    }));
    setFormData({
      customer: sale.customer, // already object
      items: items.length > 0 ? items : [{ name: "", price: 0 }],
      total: sale.total,
    });
    setEditingSale(sale);
    setFormOpen(true);
  };

  return (
    <div className="p-5">
      <h2 className="text-xl font-bold mb-4">مدیریت فروش</h2>

      {/* Toggle Form */}
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        onClick={() => {
          setFormOpen(!formOpen);
          setEditingSale(null);
          setFormData(initialForm);
        }}
      >
        {formOpen ? "بستن فرم" : "افزودن فروش"}
      </button>

      {/* Form */}
      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 p-4 border rounded-lg shadow space-y-4"
        >
          {/* Select customer */}
          <select
            value={formData.customer?.id || ""}
            onChange={handleCustomerChange}
            className="border p-2 rounded w-full"
            required
          >
            <option value="">انتخاب مشتری</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {formData.items.map((item, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="text"
                name="name"
                value={item.name}
                onChange={(e) => handleChange(e, index)}
                placeholder="نام کالا"
                className="border p-2 rounded w-1/2"
              />
              <input
                type="number"
                name="price"
                value={item.price}
                onChange={(e) => handleChange(e, index)}
                placeholder="قیمت"
                className="border p-2 rounded w-1/2"
              />
              {formData.items.length > 1 && (
                <button
                  type="button"
                  className="text-red-500 px-2"
                  onClick={() => removeItem(index)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="bg-green-500 text-white px-3 py-1 rounded"
          >
            افزودن کالا
          </button>

          <div>
            <strong>جمع کل: {formData.total}</strong>
          </div>

          <SubmitBtn loading={loading} text={editingSale ? "ویرایش" : "ثبت"} />
        </form>
      )}

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 text-right">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">مشتری</th>
              <th className="px-4 py-2">مشخصات مشتری</th>
              <th className="px-4 py-2">لیست کالاها</th>
              <th className="px-4 py-2">جمع کل</th>
              <th className="px-4 py-2">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sales.length > 0 ? (
              sales.map((sale, index) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{sale.customer?.name}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    افراد: {sale.customer?.howManyPerson}، هزینه:{" "}
                    {sale.customer?.fee}، پرداخت: {sale.customer?.totalPay}،{" "}
                    {sale.customer?.isCalculated ? "محاسبه شد" : "در انتظار"}
                  </td>
                  <td className="px-4 py-2">
                    {Object.entries(sale.list).map(([k, v]) => (
                      <div key={k}>
                        {k}: {v}
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-2">{sale.total}</td>
                  <td className="px-4 py-2 flex gap-3">
                    <button
                      className="text-blue-500"
                      onClick={() => handleEdit(sale)}
                    >
                      <FaRegEdit />
                    </button>
                    <button
                      className="text-red-500"
                      onClick={() => handleDelete(sale.id)}
                    >
                      <IoTrashSharp />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  هیچ فروشی ثبت نشده است
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesManagement;
