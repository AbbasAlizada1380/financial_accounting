import React, { useState, useRef, useEffect } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";

const faqItems = [
  {
    question: "How long does shipping take?",
    answer:
      "Standard shipping takes 3-5 business days. Express options are available at checkout.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We offer 30-day returns for unused items with original tags. Final sale items are non-returnable.",
  },
  {
    question: "How do I track my order?",
    answer:
      "You'll receive a tracking number via email once your order ships. You can also check in your account dashboard.",
  },
  {
    question: "Do you offer international shipping?",
    answer:
      "Yes! We ship to over 50 countries worldwide. Shipping costs vary by destination.",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0); // First question open by default
  const contentRefs = useRef([]);

  const toggleIndex = (index) => {
    setOpenIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  useEffect(() => {
    contentRefs.current.forEach((ref, index) => {
      if (ref) {
        if (openIndex === index) {
          ref.style.maxHeight = ref.scrollHeight + "px";
        } else {
          ref.style.maxHeight = "0px";
        }
      }
    });
  }, [openIndex]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-indigo-900 mb-4">
        Frequently Asked Questions
      </h2>
      {faqItems.map((item, index) => (
        <div key={index} className="border-b border-gray-200 pb-4">
          <button
            onClick={() => toggleIndex(index)}
            className="flex justify-between items-center w-full text-left"
          >
            <h3 className="text-base font-semibold text-gray-900">
              {item.question}
            </h3>
            <span className="text-gray-500">
              {openIndex === index ? <FaMinus /> : <FaPlus />}
            </span>
          </button>

          <div
            ref={(el) => (contentRefs.current[index] = el)}
            className="overflow-hidden transition-all duration-300 ease-in-out mt-2 text-gray-600"
            style={{ maxHeight: openIndex === index ? "none" : "0px" }}
          >
            <p className="py-1">{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQSection;
