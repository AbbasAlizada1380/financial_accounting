import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { FaRegEdit } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
import Pagination from "../../Pagination";
import AttributeForm from "./AttributeForm";
import SubmitBtn from "../../../utils/SubmitBtn";
import CancelBtn from "../../../utils/CancelBtn";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const PRODUCT_API = `${BASE_URL}/api/v1/inventory/products/`;
const CATEGORY_API = `${BASE_URL}/api/v1/categories/categories/`;

const ProductManager = () => {
  const token = useSelector((state) => state.user.accessToken);

  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false); // 👈 NEW STATE
  const [categories, setCategories] = useState([]);
  const [toolOptions, setToolOptions] = useState([]);

  const [formData, setFormData] = useState({
    tool: "",
    category: "",
    attributes: {},
    description: "",
  });

  const [editingProductId, setEditingProductId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = products.slice(indexOfFirst, indexOfLast);

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(PRODUCT_API, { headers });
      setProducts(res.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(CATEGORY_API, { headers });
      setCategories(res.data || []);
    } catch (err) {
      console.error("Category fetch error:", err);
    }
  };

  const handleCategoryChange = (e) => {
    const selectedCategoryId = e.target.value;
    const selectedCategory = categories.find(
      (cat) => cat.id === selectedCategoryId
    );
    setToolOptions(selectedCategory?.tools || []);
    setFormData((prev) => ({
      ...prev,
      category: selectedCategoryId,
      tool: "",
      attributes: [],
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(formData);
      
      if (editingProductId) {
        await axios.put(`${PRODUCT_API}${editingProductId}/`, formData, {
          headers,
        });
        Swal.fire(
          "به‌روزرسانی شد",
          "محصول با موفقیت به‌روزرسانی گردید",
          "success"
        );
      } else {
        await axios.post(PRODUCT_API, formData, { headers });
        Swal.fire("ایجاد شد", "محصول با موفقیت اضافه گردید", "success");
      }
      fetchProducts();
      resetForm();
    } catch (err) {
      console.error("Save error:", err);
      Swal.fire("خطا", "ذخیره محصول انجام نشد", "error");
    }
  };

  const handleDelete = async (id) => {
    const confirmation = await Swal.fire({
      title: "آیا مطمئن هستید؟",
      text: "این محصول دیگر قابل بازیابی نخواهد بود!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "بله، حذف شود!",
      cancelButtonText: "انصراف",
    });

    if (confirmation.isConfirmed) {
      try {
        await axios.delete(`${PRODUCT_API}${id}/`, { headers });
        Swal.fire("حذف شد!", "محصول با موفقیت حذف گردید.", "success");
        fetchProducts();
      } catch (err) {
        console.error("Delete error:", err);
        Swal.fire("خطا", "حذف محصول انجام نشد", "error");
      }
    }
  };

  const handleEdit = (product) => {
    setShowForm(true);
    const selectedCategory = categories.find(
      (cat) => cat.id === product.category
    );
    setToolOptions(selectedCategory?.tools || []);
    setEditingProductId(product.id);
    setFormData({
      tool: product.tool,
      category: product.category,
      attributes: product.attributes,
      description: product.description,
    });
  };
  // inside ProductManager component

  const resetForm = () => {
    setFormData({
      tool: "",
      category: "",
      attributes: {},
      description: "",
    });
    setEditingProductId(null); // exit edit mode
    setToolOptions([]); // reset tools list
    setShowForm(false); // close form
  };

  return (
    <div className="p-5">
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
        >
          {showForm ? "بستن فرم" : "افزودن محصول جدید"}
        </button>
      </div>
      {showForm && (
        <div className="bg-white rounded-lg p-6 ">
          <h2 className="text-xl font-bold text-center mb-4">مدیریت محصول</h2>
          <form onSubmit={handleSubmit} className="bg-white p-4  space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block mb-1 font-semibold">کمپنی</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleCategoryChange}
                  className="input-field l"
                  required
                >
                  <option value="">انتخاب کمپنی</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tool */}
              <div>
                <label className="block mb-1 font-semibold">ابزار</label>
                <select
                  name="tool"
                  value={formData.tool}
                  onChange={handleChange}
                  className="input-field "
                  required
                  disabled={!toolOptions.length}
                >
                  <option value="">انتخاب ابزار</option>
                  {toolOptions.map((tool, i) => (
                    <option key={i} value={tool}>
                      {tool}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block mb-1 font-semibold">توضیحات</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="توضیحات محصول را اینجا بنویسید"
                  className="border p-2 rounded w-full max-h-44 min-h-24  focus:outline-none bg-gray-200 focus:ring-1 ring-black/50"
                />
              </div>
            </div>

            {/* Attributes */}
            <AttributeForm
              categoryId={formData.category}
              attributes={formData.attributes}
              onAttributesChange={(newAttrs) =>
                setFormData((prev) => ({ ...prev, attributes: newAttrs }))
              }
              tool={formData.tool}
            />

            {/* Buttons */}
            {/* Submit / Cancel Buttons */}
            <div className="flex justify-center gap-4">
              <SubmitBtn
                type="submit"
                title={editingProductId ? "ذخیره تغییرات" : "ثبت"}
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
      {/* Form */}

      {/* Table */}
      <div className="mt-8 overflow-x-auto rounded-lg">
        <table className="min-w-full bg-white  border-gray-300">
          <thead className="bg-blue-500 text-white text-base">
            <tr>
              <th className="px-4 py-2">SKU</th>
              <th className="px-4 py-2">ابزار</th>
              <th className="px-4 py-2">کمپنی</th>
              <th className="px-4 py-2">مشخصات</th>
              <th className="px-4 py-2">توضیحات</th>
              <th className="px-4 py-2">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((product, index) => (
              <tr
                key={product.id}
                className={`text-center ${
                  index % 2 === 0 ? "bg-gray-100" : ""
                }`}
              >
                <td className="px-4 py-2">{product.sku}</td>
                <td className="px-4 py-2">{product.tool}</td>
                <td className="px-4 py-2">
                  {categories.find((cat) => cat.id === product.category)
                    ?.name || product.category}
                </td>
                <td className="px-4 py-2">
                  <ul className="list-none pl-4">
                    {Object.entries(product.attributes || {}).map(
                      ([key, value]) => (
                        <li key={key}>
                          <strong>{key}:</strong>{" "}
                          {typeof value === "object"
                            ? JSON.stringify(value)
                            : value}
                        </li>
                      )
                    )}
                  </ul>
                </td>

                <td className="px-4 py-2">
                  {product.description.length > 20
                    ? product.description.slice(0, 20) + "..."
                    : product.description}
                </td>
                <td className="px-4 py-2 flex justify-center items-center gap-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-blue-500"
                  >
                    <FaRegEdit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-500"
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

export default ProductManager;
