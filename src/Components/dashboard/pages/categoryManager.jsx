import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { FaRegEdit } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
import Pagination from "../../Pagination";
import SubmitBtn from "../../../utils/SubmitBtn";
import CancelBtn from "../../../utils/CancelBtn";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const CATEGORY_API = `${BASE_URL}/api/v1/categories/categories/`;

const CategoryManager = () => {
  const token = useSelector((state) => state.user.accessToken);
  const token1 = useSelector((state) => state.user.accessToken);

  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [tools, setTools] = useState([]);
  const [toolInput, setToolInput] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false); // 👈 NEW STATE
  const itemsPerPage = 8;

  const resetForm = () => {
    setCategoryName("");
    setToolInput("");
    setTools([]);
    setEditingCategory(null);
    setShowForm(false); // 👈 close form when reset
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const res = await axios.get(CATEGORY_API, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Check if response data is an array or contains results array
      // Adjust this according to your actual API response shape
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.results)
        ? res.data.results
        : [];

      setCategories(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setCategories([]); // reset to empty array on error
    }
  };

  useEffect(() => {
    console.log(token1);
    
    if (token) fetchCategories();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName) {
      Swal.fire("Validation Error", "Category name is required.", "warning");
      return;
    }

    // Add toolInput to tools array if not empty and not duplicate
    let finalTools = [...tools];
    const trimmedInput = toolInput.trim();
    if (trimmedInput && !finalTools.includes(trimmedInput)) {
      finalTools.push(trimmedInput);
    }

    const payload = {
      name: categoryName,
      tools: finalTools.filter((t) => t.trim() !== ""),
    };

    const method = editingCategory ? "put" : "post";
    const url = editingCategory
      ? `${CATEGORY_API}${editingCategory.id}/`
      : CATEGORY_API;

    try {
      await axios[method](url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire(
        "موفقیت‌آمیز",
        `کمپنی ${editingCategory ? "به‌روزرسانی شد" : "ایجاد شد"}`,
        "success"
      );
      resetForm();
      fetchCategories();
    } catch (err) {
      console.error("Submit error:", err);
      Swal.fire("خطا", "مشکلی پیش آمد", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirmation = await Swal.fire({
      title: "آیا مطمئن هستید؟",
      text: "این عمل قابل برگشت نیست!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "حذف",
      cancelButtonText: "انصراف",
    });

    if (confirmation.isConfirmed) {
      try {
        await axios.delete(`${CATEGORY_API}${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("حذف شد", "کمپنی حذف گردید", "success");
        fetchCategories();
        if (editingCategory?.id === id) {
          resetForm();
        }
      } catch (err) {
        Swal.fire("خطا", "حذف انجام نشد", "error");
      }
    }
  };

  const handleEdit = (cat) => {
    setCategoryName(cat.name);
    setTools(cat.tools || []);
    setEditingCategory(cat);
    setToolInput("");
    window.scrollTo(0, 0);
    setShowForm(true);
  };

  // Add a new tool to the list
  const handleAddTool = () => {
    if (toolInput.trim() !== "" && !tools.includes(toolInput.trim())) {
      setTools([...tools, toolInput.trim()]);
      setToolInput("");
    }
  };

  // Safely get the current page categories slice — ensure categories is array
  const currentCategories = Array.isArray(categories)
    ? categories.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
    : [];

  return (
    <div className="p-5">
      {/* Toggle Button */}
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
        >
          {showForm ? "بستن فرم" : "افزودن کمپنی جدید"}
        </button>
      </div>

      {/* Form Section (conditionally rendered) */}
      {showForm && (
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-center mb-4">
            {editingCategory ? "ویرایش کمپنی" : "افزودن کمپنی"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            {/* Category Name */}
            <div className="grid grid-cols-2 gap-x-5">
              <div>
                <label className="block mb-1 font-semibold">نام کمپنی</label>
                <input
                  type="text"
                  placeholder="نام کمپنی را وارد کنید"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full border px-3 py-2 rounded focus:outline-none bg-gray-200 focus:ring-1 ring-black/50"
                  required
                />
              </div>

              {/* Tool Input + Add */}
              <div>
                <label className="block mb-1 font-semibold">افزودن ابزار</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="نام ابزار را وارد کنید"
                    value={toolInput}
                    onChange={(e) => setToolInput(e.target.value)}
                    className="flex-grow border px-3 py-2 rounded focus:outline-none bg-gray-200 focus:ring-1 ring-black/50"
                  />
                  <button
                    type="button"
                    onClick={handleAddTool}
                    className="bg-blue-600 text-white px-3 py-2 rounded"
                  >
                    افزودن ابزار
                  </button>
                </div>

                {tools.length > 0 && (
                  <ul className="list-disc ml-6 space-y-1">
                    {tools.map((tool, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={tool}
                          onChange={(e) => {
                            const updated = [...tools];
                            updated[idx] = e.target.value;
                            setTools(updated);
                          }}
                          className="flex-grow border px-2 py-1 rounded bg-gray-100 focus:outline-none focus:ring-1 ring-black/50"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setTools(tools.filter((_, i) => i !== idx))
                          }
                          className="text-sm text-red-600"
                        >
                          حذف
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Submit / Cancel Buttons */}
            <div className="flex justify-center gap-4">
              <SubmitBtn
                type="submit"
                title={editingCategory ? "ذخیره تغییرات" : "ثبت"}
              />
              <CancelBtn
                onClick={() => {setShowForm(false),resetForm()}}
                title={"انصراف"}
                type="button"
              />
            </div>
          </form>
        </div>
      )}

      {/* Table Section */}
      <div className="mt-8 overflow-x-auto rounded-lg">
        <table className="min-w-full bg-white border">
          <thead className="bg-blue-500">
            <tr className="text-center text-base text-white">
              <th scope="col" className="px-4 py-2">
                نام
              </th>
              <th scope="col" className="px-4 py-2">
                ابزارها
              </th>
              <th scope="col" className="px-4 py-2">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody>
            {currentCategories.length > 0 ? (
              currentCategories.map((cat, index) => (
                <tr
                  key={cat.id}
                  className={`text-center ${
                    index % 2 === 0 ? "bg-gray-100" : ""
                  }`}
                >
                  <td className="px-4 py-2">{cat.name}</td>
                  <td className="px-4 py-2">{cat.tools?.join(", ") || "—"}</td>
                  <td className="px-4 py-2 text-center flex justify-center gap-4">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="text-green-600 hover:scale-105"
                      aria-label={`ویرایش کمپنی ${cat.name}`}
                    >
                      <FaRegEdit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="text-red-600 hover:scale-105"
                      aria-label={`حذف کمپنی ${cat.name}`}
                    >
                      <IoTrashSharp size={20} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-4 text-gray-500">
                  هیچ کمپنی یافت نشد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {Math.ceil(categories.length / itemsPerPage) > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(categories.length / itemsPerPage)}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default CategoryManager;
