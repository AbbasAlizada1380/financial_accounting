import React, { useState } from "react";
import Swal from "sweetalert2";
import data from "./data.json";

const IncomeManagement = () => {
  const [incomes, setIncomes] = useState(data.expense);
  const [showform, setShowform] = useState(false);

  const [formData, setFormData] = useState({
    source: "",
    description: "",
    amount: "",
    type: "income",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const newIncome = { ...formData, id: Date.now() };
    setIncomes([...incomes, newIncome]);

    Swal.fire("موفقیت", "درآمد اضافه شد", "success");
    setFormData({ source: "", description: "", amount: "", type: "income" });
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
        setIncomes(incomes.filter((item) => item.id !== id));
        Swal.fire("حذف شد", "درآمد حذف گردید", "success");
      }
    });
  };

  return (
    <div className="p-4">
      <h2 className="font-bold text-xl mb-4">مدیریت عواید</h2>
      <button
        className="text-white bg bg-green-600 p-2 rounded-xl"
        onClick={() => setShowform(!showform)}
      >
        add
      </button>
      {/* Add Form */}
      {showform && (
        <form onSubmit={handleSubmit} className="space-y-3 mb-5">
          <input
            type="text"
            placeholder="منبع"
            value={formData.source}
            onChange={(e) =>
              setFormData({ ...formData, source: e.target.value })
            }
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
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            className="border p-2 w-full rounded"
            required
          />
          <button className="bg-green-500 text-white px-4 py-2 rounded">
            اضافه کردن
          </button>
        </form>
      )}
<div className="overflow-x-auto shadow-md rounded-2xl mt-10">
      {/* Income Table */}
      <table className="w-full border-collapse bg-white text-gray-800">
        <thead>
          <tr className="bg-gradient-to-l from-green-600 to-green-500 text-white">
            <th className="p-3 text-sm border-r">منبع</th>
            <th className="p-3 text-sm border-r">توضیحات</th>
            <th className="p-3 text-sm border-r">مبلغ</th>
            <th className="p-3 text-sm">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {incomes.map((item, index) => (
            <tr
              key={item.id}
              className={`${
                index % 2 === 0 ? "bg-gray-50" : "bg-white"
              } hover:bg-blue-50 transition duration-200`}
            >
              <td className="p-3 border-r text-right">{item.source}</td>
              <td className="p-3 border-r text-right">{item.description}</td>
              <td className="p-3 border-r text-right font-semibold text-green-600">
                {item.amount} AFN
              </td>
              <td className="p-3 text-center">
                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg transition"
                >
                  حذف
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  );
};

export default IncomeManagement;
