import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const AttributeForm = ({
  attributes = {},
  onAttributesChange,
  categoryId,
  tool,
}) => {
  const [fields, setFields] = useState([]);
  const token = useSelector((state) => state.user.accessToken);

  useEffect(() => {
    if (!categoryId || !tool) {
      setFields([]);
      return;
    }

    const url = `${BASE_URL}/api/v1/categories/attributes/?category=${categoryId}&tool_key=${tool}`;

    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setFields(Array.isArray(response.data) ? response.data : []);
      })
      .catch((error) => {
        console.error("Error fetching attributes:", error);
        setFields([]);
      });
  }, [categoryId, tool, token]);

  const handleAttributeChange = (key, value) => {
    const updated = { ...attributes }; // keep as object, not array
    updated[key] = value;
    onAttributesChange(updated);
  };

  if (!categoryId || !tool) {
    return (
      <p className="text-gray-500">
        لطفاً ابتدا کمپنی و ابزار را انتخاب کنید.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fields.map((field, idx) => {
        const key = field.key || field.name || `field_${idx}`;
        const type = field.attribute_type;
        const value = attributes?.[key] || "";

        return (
          <div key={idx} className="flex flex-col space-y-1">
            <label className="text-sm font-medium">{field.name}</label>

            {type === "dropdown" ? (
              <select
                className="input-field"
                value={value}
                onChange={(e) => handleAttributeChange(key, e.target.value)}
              >
                <option value="">انتخاب کنید</option>
                {Array.isArray(field.attribute_value) &&
                  field.attribute_value.map((val, i) => (
                    <option key={i} value={val}>
                      {val}
                    </option>
                  ))}
              </select>
            ) : (
              <input
                type="text"
                className="input-field"
                placeholder={field.name}
                value={value}
                onChange={(e) => handleAttributeChange(key, e.target.value)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AttributeForm;
