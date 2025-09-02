import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
const BASE_URL = import.meta.env.VITE_BASE_URL;
const initialFormState = {
  image: null,
  name: "",
  email: "",
  slug: "",
  description: "",
  mobile: "",
  verified: false,
  active: false,
  vid: "",
};

const VendorManager = () => {
  const [vendors, setVendors] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);

  const fetchVendors = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/vendor/`);
      setVendors(response.data);
    } catch (err) {
      console.error("Error fetching vendors:", err);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (val !== null) payload.append(key, val);
    });

    try {
      if (editingId) {
        await axios.put(`${BASE_URL}/api/v1/vendor/${editingId}/`, payload);
        Swal.fire("Updated!", "Vendor updated successfully.", "success");
      } else {
        await axios.post(`${BASE_URL}/api/v1/vendor/`, payload);
        Swal.fire("Created!", "Vendor created successfully.", "success");
      }

      setFormData(initialFormState);
      setEditingId(null);
      fetchVendors();
    } catch (err) {
      console.error("Error submitting form:", err);
      Swal.fire("Error", "Failed to save vendor.", "error");
    }
  };

  const handleEdit = (vendor) => {
    setFormData({
      ...vendor,
      image: null, // Avoid pre-filling image input
    });
    setEditingId(vendor.id);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the vendor.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${BASE_URL}/api/v1/vendor/${d}/`);
        fetchVendors();
        Swal.fire("Deleted!", "Vendor has been deleted.", "success");
      } catch (err) {
        console.error("Delete error:", err);
        Swal.fire("Error", "Failed to delete vendor.", "error");
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Vendor Management</h2>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-4 bg-gray-100 p-4 rounded mb-6"
      >
        <input type="file" name="image" onChange={handleChange} />
        <input
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <input
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <input
          name="slug"
          placeholder="Slug"
          value={formData.slug}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <input
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <input
          name="mobile"
          placeholder="Mobile"
          value={formData.mobile}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <input
          name="vid"
          placeholder="VID"
          value={formData.vid}
          onChange={handleChange}
          className="p-2 border rounded"
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="verified"
            checked={formData.verified}
            onChange={handleChange}
          />
          <span>Verified</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="active"
            checked={formData.active}
            onChange={handleChange}
          />
          <span>Active</span>
        </label>

        <button
          type="submit"
          className="col-span-2 bg-blue-600 text-white py-2 rounded"
        >
          {editingId ? "Update Vendor" : "Create Vendor"}
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border border-collapse">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Mobile</th>
              <th className="p-2 border">Active</th>
              <th className="p-2 border">Verified</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(vendors) &&
              vendors.length > 0 &&
              vendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{vendor.name}</td>
                  <td className="p-2 border">{vendor.email}</td>
                  <td className="p-2 border">{vendor.mobile}</td>
                  <td className="p-2 border">{vendor.active ? "✅" : "❌"}</td>
                  <td className="p-2 border">
                    {vendor.verified ? "✅" : "❌"}
                  </td>
                  <td className="p-2 border flex gap-2">
                    <button
                      onClick={() => handleEdit(vendor)}
                      className="bg-yellow-400 px-2 py-1 rounded text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(vendor.id)}
                      className="bg-red-500 px-2 py-1 rounded text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            {vendors.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  No vendors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendorManager;
