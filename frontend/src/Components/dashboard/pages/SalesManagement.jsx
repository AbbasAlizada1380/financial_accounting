import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { FaRegEdit } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
import SubmitBtn from "../../../utils/SubmitBtn";
import { formatDateTime } from "./dateformater";
import Pagination from "./comp/Pagination";
import Bill from "./comp/ShopBill";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const SalesManagement = () => {
  const token = useSelector((state) => state.user.accessToken);
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 20; // or whatever your API page size is
  const initialForm = {
    pool_customer: "", // only id
    items: [{ name: "", price: 0 }],
    total: 0,
  };

  const [formData, setFormData] = useState(initialForm);

  // Fetch customers
  const fetchCustomers = async () => {
    let allCustomers = [];
    let url = `${BASE_URL}/api/v1/pool/api/pools/?is_calculated=false`;

    try {
      while (url) {
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        allCustomers = [...allCustomers, ...(res.data.results || [])];
        url = res.data.next; // next page URL, null if no more pages
      }

      setCustomers(allCustomers);
    } catch (err) {
      console.error("Error fetching all customers:", err);
      setCustomers([]); // fallback to empty array
    }
  };

  // Fetch shops (sales)
  const fetchSales = async (page=1) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/pool/api/shops/?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSales(res.data.results || res.data); // handle pagination or array
      setTotalItems(res.data.count)
    } catch (err) {
      console.error(err);
    }
  };
  const toggleCalculated = async (sale) => {
    if (!token) return;

    const newValue = !sale.is_calculated;

    try {
      console.log(sale.id, newValue);
      await axios.patch(
        `${BASE_URL}/api/v1/pool/api/shops/${sale.id}/`,
        { is_calculated: newValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the local state immediately
      setSales((prev) =>
        prev.map((s) =>
          s.id === sale.id ? { ...s, is_calculated: newValue } : s
        )
      );

      Swal.fire(
        "موفق!",
        `وضعیت محاسبه مشتری تغییر کرد به ${newValue ? "✅" : "❌"}`,
        "success"
      );
    } catch (error) {
      console.error(error);
      Swal.fire("خطا!", "تغییر وضعیت انجام نشد.", "error");
    }
  };

  useEffect(() => {
    if (token) {
      fetchSales(currentPage);
      fetchCustomers();
    }
  }, [currentPage]);
const handlePageChange = (page) => {
  setCurrentPage(page);
};
  // Handle customer select
  const handleCustomerChange = (e) => {
    setFormData({ ...formData, pool_customer: Number(e.target.value) });
  };

  // Handle item change
  const handleChange = (e, index) => {
    const items = [...formData.items];
    items[index][e.target.name] =
      e.target.name === "price" ? Number(e.target.value) : e.target.value;

    const total = items.reduce((sum, item) => sum + (item.price || 0), 0);
    setFormData({ ...formData, items, total });
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
        pool_customer: formData.pool_customer, // ✅ only ID
        list: formData.items.reduce(
          (acc, item) =>
            item.name ? { ...acc, [item.name]: item.price } : acc,
          {}
        ),
        total: formData.total,
      };

      if (!payload.pool_customer || Object.keys(payload.list).length === 0) {
        Swal.fire("خطا!", "مشتری یا لیست کالاها نباید خالی باشد", "error");
        setLoading(false);
        return;
      }

      if (editingSale) {
        await axios.patch(
          `${BASE_URL}/api/v1/pool/api/shops/${editingSale.id}/`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Swal.fire("موفق!", "فروش ویرایش شد", "success");
      } else {
        await axios.post(`${BASE_URL}/api/v1/pool/api/shops/`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("موفق!", "فروش جدید اضافه شد", "success");
      }

      setFormOpen(false);
      setEditingSale(null);
      setFormData(initialForm);
      fetchSales();
    } catch (err) {
      console.error(err.response?.data || err);
      Swal.fire("خطا!", "عملیات انجام نشد", "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete
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
        await axios.delete(`${BASE_URL}/api/v1/pool/api/shops/${id}/`, {
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

  // Edit
  const handleEdit = (sale) => {
    const items = Object.entries(sale.list).map(([name, price]) => ({
      name,
      price,
    }));
    setFormData({
      pool_customer: sale.pool_customer, // ✅ id only
      items: items.length > 0 ? items : [{ name: "", price: 0 }],
      total: sale.total,
    });
    setEditingSale(sale);
    setFormOpen(true);
  };

  return (
    <div className="p-5">
      <h2 className="text-xl font-bold mb-4">مدیریت فروش</h2>

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

      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 p-4 border rounded-lg shadow space-y-4"
        >
          {/* Select customer */}
          <select
            value={formData.pool_customer || ""}
            onChange={handleCustomerChange}
            className="border p-2 rounded w-full"
            required
          >
            <option value="">انتخاب مشتری</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {`${c.name} - ${c.cabinet_number}`}
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

          <SubmitBtn loading={loading} title={editingSale ? "ویرایش" : "ثبت"} />
        </form>
      )}

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 text-right">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">نمبر صندق</th>
              <th className="px-4 py-2">مشتری</th>
              <th className="px-4 py-2">لیست کالاها</th>
              <th className="px-4 py-2">جمع کل</th>
              <th className="px-4 py-2">محاسبه شده؟</th>
              <th className="px-4 py-2">عملیات</th>
              <th className="px-4 py-2">تاریخ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Array.isArray(sales) && sales.length > 0 ? (
              sales.map((sale, index) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    {customers.find((c) => c.id === sale.pool_customer)
                      ?.cabinet_number || "نامشخص"}
                  </td>
                  <td className="px-4 py-2">
                    {customers.find((c) => c.id === sale.pool_customer)?.name ||
                      "نامشخص"}
                  </td>
                  <td className="px-4 py-2">
                    {Object.entries(sale.list).map(([k, v]) => (
                      <div key={k}>
                        {k}: {v}
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-2">{sale.total}</td>
                  <td className="px-4 py-2">
                    <button
                      className={`px-2 py-1 rounded ${
                        sale.is_calculated
                          ? "bg-green-500 text-white"
                          : "bg-gray-300"
                      }`}
                      onClick={() => toggleCalculated(sale)}
                    >
                      {sale.is_calculated ? "✅" : "❌"}
                    </button>
                  </td>
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
                    <Bill
                      sale={sale}
                      customer={customers.find(
                        (c) => c.id == sale.pool_customer
                      )}
                    />
                  </td>
                  <td>{formatDateTime(sale.created_at)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  هیچ فروشی ثبت نشده است
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination
          currentPage={currentPage}
          totalOrders={totalItems}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default SalesManagement;
