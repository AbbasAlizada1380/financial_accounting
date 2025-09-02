import React, { useEffect, useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
import axios from "axios";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import SubmitBtn from "../../../utils/SubmitBtn";
import CancelBtn from "../../../utils/CancelBtn";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const ATTRIBUTE_TYPE_CHOICES = ["dropdown", "input"];

const AttributeManager = () => {
  const token = useSelector((state) => state.user.accessToken);

  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [showForm, setShowForm] = useState(false); // 👈 toggle form
  const [formData, setFormData] = useState({
    name: "",
    attribute_type: "input",
    category: "",
    tool_key: "",
    attribute_value: "",
    editingId: null,
  });

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/categories/categories/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data || []);
    } catch (err) {
      console.error("Category fetch error:", err);
    }
  };

  function getCategoryName(categoryId) {
    const category = categories.find((category) => category.id === categoryId);
    return category ? category.name : "Loading...";
  }

  const fetchAttributes = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/categories/attributes/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttributes(res.data || []);
    } catch (err) {
      console.error("Attribute fetch error:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCategories();
      fetchAttributes();
    }
  }, [token]);

  const selectedCategory = categories.find(
    (cat) => cat.id === formData.category
  );
  const categoryTools = selectedCategory?.tools || [];
  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      name,
      attribute_type,
      category,
      tool_key,
      attribute_value,
      editingId,
    } = formData;

    if (!name || !category || !tool_key) {
      Swal.fire("اعتبارسنجی", "لطفاً تمام فیلدهای ضروری را پر کنید", "warning");
      return;
    }

    // پردازش مقادیر تنها در صورت انتخاب نوع لیست کشویی
    let valuesArray = [];
    if (attribute_type === "dropdown" && attribute_value) {
      valuesArray = attribute_value
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v.length > 0); // حذف رشته‌های خالی
    }

    const payload = {
      name,
      attribute_type,
      category,
      tool_key,
      attribute_value: attribute_type === "dropdown" ? valuesArray : [],
    };

    const method = editingId ? "put" : "post";
    const url = editingId
      ? `${BASE_URL}/api/v1/categories/attributes/${editingId}/`
      : `${BASE_URL}/api/v1/categories/attributes/`;

    try {
      await axios[method](url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Swal.fire(
        "موفقیت‌آمیز",
        `ویژگی ${editingId ? "به‌روزرسانی شد" : "ایجاد شد"}`,
        "success"
      );
      setFormData({
        name: "",
        attribute_type: "input",
        category: "",
        tool_key: "",
        attribute_value: "",
        editingId: null,
      });
      fetchAttributes();
    } catch (err) {
      console.error("Submit error:", err);
      Swal.fire("خطا", "ذخیره ویژگی انجام نشد", "error");
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
        await axios.delete(`${BASE_URL}/api/v1/categories/attributes/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchAttributes();
        Swal.fire("حذف شد", "ویژگی با موفقیت حذف گردید", "success");
      } catch (err) {
        Swal.fire("خطا", "حذف ویژگی انجام نشد", "error");
      }
    }
  };

  const handleEdit = (attr) => {
    setFormData({
      name: attr.name,
      attribute_type: attr.attribute_type,
      category: attr.category,
      tool_key: attr.tool_key,
      attribute_value:
        attr.attribute_value && attr.attribute_value.length > 0
          ? attr.attribute_value.join(", ")
          : "",
      editingId: attr.id,
    });
    window.scrollTo(0, 0);

    setShowForm(true); // 👈 open form on edit
  };
  const resetForm = () => {
    setFormData({
      name: "",
      attribute_type: "input",
      category: "",
      tool_key: "",
      attribute_value: "",
      editingId: null,
    });
    setShowForm(false); // 👈 hide form after cancel or save
  };
  return (
    <div className="p-5 " dir="rtl">
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
        >
          {showForm ? "بستن فرم" : "افزودن مشخصه جدید"}
        </button>
      </div>
      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg ">
          <h2 className="text-xl font-bold mb-4 text-center">
            {formData.editingId ? "ویرایش ویژگی" : "افزودن ویژگی جدید"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 ">
            <div className="grid grid-cols-2 gap-5">
              {/* Category */}
              <div>
                <label className="block mb-1 font-semibold">کمپنی</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value,
                      tool_key: "",
                    })
                  }
                  className="w-full border px-3 py-2 rounded focus:outline-none bg-gray-200 focus:ring-1 ring-black/50"
                  required
                >
                  <option value="" disabled>
                    انتخاب کمپنی
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tool Key */}
              <div>
                <label className="block mb-1 font-semibold">ابزار</label>
                {categoryTools.length > 0 ? (
                  <select
                    value={formData.tool_key}
                    onChange={(e) =>
                      setFormData({ ...formData, tool_key: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded focus:outline-none bg-gray-200 focus:ring-1 ring-black/50"
                    required
                  >
                    <option value="" disabled>
                      انتخاب ابزار
                    </option>
                    {categoryTools.map((tool, idx) => (
                      <option key={idx} value={tool}>
                        {tool}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-gray-500">
                    برای این کمپنی هیچ ابزاری موجود نیست.
                  </p>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="block mb-1 font-semibold">نام ویژگی</label>
                <input
                  type="text"
                  placeholder="نام ویژگی را وارد کنید"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded focus:outline-none bg-gray-200 focus:ring-1 ring-black/50"
                  required
                />
              </div>

              {/* Attribute Type */}
              <div>
                <label className="block mb-1 font-semibold">نوع ویژگی</label>
                <select
                  value={formData.attribute_type}
                  onChange={(e) =>
                    setFormData({ ...formData, attribute_type: e.target.value })
                  }
                  className="w-full border px-3 py-2 rounded focus:outline-none bg-gray-200 focus:ring-1 ring-black/50"
                >
                  {ATTRIBUTE_TYPE_CHOICES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dropdown Values */}
            {formData.attribute_type === "dropdown" && (
              <div className="max-w-md mx-auto">
                <label className="block mb-1 font-semibold text-center">
                  مقادیر ویژگی
                </label>
                <input
                  type="text"
                  placeholder="مقادیر را با کاما جدا کنید"
                  value={formData.attribute_value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      attribute_value: e.target.value,
                    })
                  }
                  className="w-full border px-3 py-2 rounded focus:outline-none bg-gray-200 focus:ring-1 ring-black/50"
                  required
                />
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3 justify-center">
              <SubmitBtn
                type="submit"
                title={formData.editingId ? "ذخیره تغییرات" : "ثبت"}
              />
              <CancelBtn onClick={resetForm} title={"انصراف"} />
            </div>
          </form>
        </div>
      )}
      {/* Attribute List */}
      <h2 className="text-xl font-semibold font-Ray_black pt-8 pr-2">
        لیست ویژگی‌ها
      </h2>
      <div className="mt-4 overflow-x-auto rounded-lg">
        <table className="min-w-full bg-white border">
          <thead className="bg-blue-500 text-white rounded-lg text-base">
            <tr>
              <th scope="col" className="px-3 py-2 ">
                کمپنی
              </th>{" "}
              <th scope="col" className="px-3 py-2 ">
                ابزار
              </th>
              <th scope="col" className="px-3 py-2 ">
                نام
              </th>
              <th scope="col" className="px-3 py-2 ">
                نوع
              </th>
              <th scope="col" className="px-3 py-2 ">
                مقادیر
              </th>
              <th scope="col" className="px-3 py-2 ">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody className="text-center">
            {attributes.map((attr, index) => (
              <tr
                key={attr.id}
                className={`text-center ${
                  index % 2 === 0 ? "bg-gray-100" : ""
                }`}
              >
                <td className="px-3 py-2">{getCategoryName(attr.category)}</td>
                <td className="px-3 py-2 ">{attr.tool_key}</td>
                <td className="px-3 py-2">{attr.name}</td>{" "}
                <td className="px-3 py-2 ">{attr.attribute_type}</td>
                <td className="px-3 py-2 ">
                  {attr.attribute_value?.join(", ") || "-"}
                </td>
                <td className="px-4 py-2 text-center flex justify-center gap-4">
                  <button
                    onClick={() => handleEdit(attr)}
                    className="text-green-600 hover:scale-105"
                    aria-label={`ویرایش کمپنی ${attr.name}`}
                  >
                    <FaRegEdit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(attr.id)}
                    className="text-red-600 hover:scale-105"
                    aria-label={`حذف کمپنی ${attr.name}`}
                  >
                    <IoTrashSharp size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttributeManager;
