import React, { useState } from "react";
import Swal from "sweetalert2";
import data from "./data.json"
const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState(data.income);
  const [formData, setFormData] = useState({
    source: "",
    description: "",
    amount: "",
    type: "expense",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const newExpense = { ...formData, id: Date.now() };
    setExpenses([...expenses, newExpense]);

    Swal.fire("موفقیت", "مصرف اضافه شد", "success");
    setFormData({ source: "", description: "", amount: "", type: "expense" });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "حذف شود؟",
      text: "آیا مطمئن هستید؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله",
      cancelButtonText: "خیر",
    }).then((result) => {
      if (result.isConfirmed) {
        setExpenses(expenses.filter((item) => item.id !== id));
        Swal.fire("حذف شد", "مصرف حذف گردید", "success");
      }
    });
  };

  return (
    <div className="p-4">
      <h2 className="font-bold text-xl mb-4">مدیریت مصارف</h2>

      {/* Add Form */}
      <form onSubmit={handleSubmit} className="space-y-3 mb-5">
        <input
          type="text"
          placeholder="منبع"
          value={formData.source}
          onChange={(e) => setFormData({ ...formData, source: e.target.value })}
          className="border p-2 w-full rounded"
          required
        />
        <input
          type="text"
          placeholder="توضیحات"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="border p-2 w-full rounded"
        />
        <input
          type="number"
          placeholder="مبلغ"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className="border p-2 w-full rounded"
          required
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded">
          اضافه کردن
        </button>
      </form>

      {/* Expense Table */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">منبع</th>
            <th className="p-2 border">توضیحات</th>
            <th className="p-2 border">مبلغ</th>
            <th className="p-2 border">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((item) => (
            <tr key={item.id} className="border">
              <td className="p-2 border">{item.source}</td>
              <td className="p-2 border">{item.description}</td>
              <td className="p-2 border">{item.amount} AFN</td>
              <td className="p-2 border text-center">
                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  حذف
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseManagement;
