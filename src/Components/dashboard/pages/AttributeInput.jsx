// src/components/AttributeInput.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function AttributeInput({
  categoryId,
  toolKey,
  onAttributeChange,
  initialAttributes,
}) {
  const token = useSelector((state) => state.user.accessToken);

  const [allAttributeTypes, setAllAttributeTypes] = useState([]);
  const [allAttributeValues, setAllAttributeValues] = useState([]);
  const [relevantAttributes, setRelevantAttributes] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all attributes and values once
  useEffect(() => {
    if (!token) return;
    const fetchAttributeData = async () => {
      setIsLoading(true);
      try {
        // **FIX: Corrected API endpoint URLs**
        const [typesRes, valuesRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/v1/categories/attributes/`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { page_size: 1000 },
          }),
          axios.get(`${BASE_URL}/api/v1/categories/attribute-values/`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { page_size: 1000 },
          }),
        ]);
        setAllAttributeTypes(typesRes.data || []);
        setAllAttributeValues(valuesRes.data || []);
      } catch (err) {
        console.error("Error fetching attribute data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttributeData();
  }, [token]);

  // Re-calculate relevant attributes and form values when inputs change
  useEffect(() => {
    // **FIX: Filter by both categoryId AND toolKey**
    if (categoryId && toolKey && allAttributeTypes.length > 0) {
      const filtered = allAttributeTypes.filter(
        (attr) =>
          String(attr.category) === String(categoryId) &&
          attr.tool_key === toolKey
      );
      setRelevantAttributes(filtered);

      const newFormValues = {};
      filtered.forEach((attr) => {
        // Use the initial value from props if it exists, otherwise set a default.
        const initialValue = initialAttributes
          ? initialAttributes[attr.name]
          : undefined;
        newFormValues[attr.name] =
          initialValue !== undefined
            ? initialValue
            : attr.attribute_type === "checkbox"
            ? false
            : "";
      });
      setFormValues(newFormValues);
      onAttributeChange(newFormValues);
    } else {
      // Clear everything if no category/tool is selected
      setRelevantAttributes([]);
      setFormValues({});
      onAttributeChange({});
    }
  }, [categoryId, toolKey, allAttributeTypes, initialAttributes]);

  const handleChange = (name, value, type) => {
    const newValues = {
      ...formValues,
      [name]: type === "checkbox" ? !formValues[name] : value,
    };
    setFormValues(newValues);
    onAttributeChange(newValues);
  };

  const renderInput = (attr) => {
    const value = formValues[attr.name];
    switch (attr.attribute_type) {
      case "dropdown":
        const options = allAttributeValues.filter(
          (val) => val.attribute === attr.id
        );
        return (
          <select
            className="w-full px-3 py-2 border rounded bg-gray-50"
            value={value || ""}
            onChange={(e) => handleChange(attr.name, e.target.value)}
          >
            <option value="">-- Select {attr.name} --</option>
            {options.map((opt) => (
              <option key={opt.id} value={opt.attribute_value}>
                {opt.attribute_value}
              </option>
            ))}
          </select>
        );
      case "date":
        return (
          <input
            type="date"
            className="w-full px-3 py-2 border rounded bg-gray-50"
            value={value || ""}
            onChange={(e) => handleChange(attr.name, e.target.value)}
          />
        );
      case "checkbox":
        return (
          <input
            type="checkbox"
            className="h-5 w-5 rounded"
            checked={!!value}
            onChange={(e) =>
              handleChange(attr.name, e.target.checked, "checkbox")
            }
          />
        );
      case "input":
      default:
        return (
          <input
            type="text"
            className="w-full px-3 py-2 border rounded bg-gray-50"
            placeholder={`Enter ${attr.name}`}
            value={value || ""}
            onChange={(e) => handleChange(attr.name, e.target.value)}
          />
        );
    }
  };

  if (isLoading)
    return <p className="col-span-2 text-center p-4">Loading attributes...</p>;

  if (!categoryId || !toolKey)
    return (
      <div className="col-span-2 p-4 text-center bg-gray-50 rounded-md">
        <p className="text-sm text-gray-500">
          Select a category and a tool to see attributes.
        </p>
      </div>
    );

  if (relevantAttributes.length === 0)
    return (
      <div className="col-span-2 p-4 text-center bg-gray-50 rounded-md">
        <p className="text-sm text-gray-500">
          No attributes defined for this category/tool combination.
        </p>
      </div>
    );

  return (
    <div className="col-span-2 space-y-4 p-4 border rounded-md">
      <h3 className="font-medium text-lg">Product Attributes</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {relevantAttributes.map((attr) => (
          <div key={attr.id}>
            <label className="block mb-1 font-medium">{attr.name}</label>
            {renderInput(attr)}
          </div>
        ))}
      </div>
    </div>
  );
}
