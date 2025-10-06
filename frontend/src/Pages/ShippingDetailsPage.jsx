import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { createOrder } from "../state/checkoutSlice/checkoutSlice";
import { fetchUserProfile } from "../state/userSlice/userSlice";
import {
  Loader2,
  ChevronDown,
  ChevronUp,
  Home,
  Box,
  HelpCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const ShippingDetailsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeQuestion, setActiveQuestion] = useState(0); // Default to first question open

  const {
    cart,
    profile,
    loading: userLoading,
  } = useSelector((state) => state.user);
  const { loading: orderLoading } = useSelector((state) => state.checkout);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    watch,
  } = useForm({ mode: "onChange" });

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      reset({
        full_name: `${profile.first_name} ${profile.last_name}`,
        email: profile.email,
        mobile: profile.phone_number,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        country: profile.country,
      });
    }
  }, [profile, reset]);

  const toggleQuestion = (index) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };

  // ========================================================================
  // REVISED FAQ Section to match your backend logic and pricing
  // ========================================================================
  const faqs = [
    {
      question: "What are the Home Location delivery costs?",
      answer:
        "Delivery costs to your home are based on the total weight of your order: up to 500g is €4.50, up to 1kg is €5.50, and up to 2kg is €6.90.",
      icon: <Home className="h-5 w-5 mr-2 text-indigo-500" />,
    },
    {
      question: "What are the Close Station delivery costs?",
      answer:
        "Picking up from a close station is a flexible option. Costs are: up to 500g is €7.00, up to 1kg is €8.50, and up to 2kg is €9.90.",
      icon: <Box className="h-5 w-5 mr-2 text-indigo-500" />,
    },
    {
      question: "How is the total weight calculated?",
      answer:
        "The total weight is the sum of the weights of all individual products in your cart. You can see each product's weight on its detail page.",
      icon: <HelpCircle className="h-5 w-5 mr-2 text-indigo-500" />,
    },
    {
      question: "Can I change my delivery choice later?",
      answer:
        "Yes, you can select your preferred delivery method (Home or Station) and see the final cost on the next page before completing your payment.",
      icon: <HelpCircle className="h-5 w-5 mr-2 text-indigo-500" />,
    },
  ];

  const onSubmit = (data) => {
    if (!cart?.cart_id) {
      toast.error("Cart not found. Please add items to your cart again.");
      return;
    }
    dispatch(createOrder({ shippingDetails: data, cartId: cart.cart_id }))
      .unwrap()
      .then((result) => {
        navigate(`/checkout/${result.order_oid}`);
      });
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  // The entire return statement is updated for better UI/UX and text.
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col lg:flex-row h-full">
        {/* Information Section */}
        <div className="lg:w-1/2 bg-white p-8 lg:p-12 hidden lg:flex flex-col justify-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Delivery Pricing & Info
            </h2>
            <p className="text-gray-600 mb-8">
              Your shipping cost is calculated on the next page based on your
              delivery choice and total order weight. Here are the details:
            </p>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleQuestion(index)}
                    className="flex items-center justify-between w-full text-left p-4 bg-gray-50 hover:bg-gray-100 focus:outline-none"
                  >
                    <div className="flex items-center">
                      {faq.icon}
                      <span className="text-md font-medium text-gray-800">
                        {faq.question}
                      </span>
                    </div>
                    {activeQuestion === index ? (
                      <ChevronUp className="h-5 w-5 text-gray-500 transition-transform" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500 transition-transform" />
                    )}
                  </button>
                  <AnimatePresence>
                    {activeQuestion === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 bg-white text-gray-600 text-sm">
                          <p>{faq.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white lg:bg-gray-50">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Shipping Address
              </h1>
              <p className="text-gray-600">
                Confirm your details to proceed to the payment page.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Form fields remain unchanged */}
              <div className="relative">
                <input
                  id="full_name"
                  type="text"
                  placeholder="Full Name"
                  {...register("full_name", {
                    required: "Full name is required",
                  })}
                  className={`peer w-full px-4 py-3 rounded-lg bg-white border ${
                    errors.full_name ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:bg-white placeholder-transparent`}
                />
                <label
                  htmlFor="full_name"
                  className={`absolute left-4 bg-white px-1 transition-all duration-200 pointer-events-none ${
                    watch("full_name")
                      ? "-top-2 text-xs text-black"
                      : "top-1/2 -translate-y-1/2 text-gray-400 peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-black"
                  }`}
                >
                  Full Name
                </label>
                {errors.full_name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.full_name.message}
                  </p>
                )}
              </div>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  placeholder="Email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  className={`peer w-full px-4 py-3 rounded-lg bg-white border ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:bg-white placeholder-transparent`}
                />
                <label
                  htmlFor="email"
                  className={`absolute left-4 bg-white px-1 transition-all duration-200 pointer-events-none ${
                    watch("email")
                      ? "-top-2 text-xs text-black"
                      : "top-1/2 -translate-y-1/2 text-gray-400 peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-black"
                  }`}
                >
                  Email
                </label>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="relative">
                <input
                  id="mobile"
                  type="tel"
                  placeholder="Mobile Number"
                  {...register("mobile", {
                    required: "Mobile number is required",
                    pattern: {
                      value: /^[0-9\-\+]{9,15}$/,
                      message: "Invalid phone number",
                    },
                  })}
                  className={`peer w-full px-4 py-3 rounded-lg bg-white border ${
                    errors.mobile ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:bg-white placeholder-transparent`}
                />
                <label
                  htmlFor="mobile"
                  className={`absolute left-4 bg-white px-1 transition-all duration-200 pointer-events-none ${
                    watch("mobile")
                      ? "-top-2 text-xs text-black"
                      : "top-1/2 -translate-y-1/2 text-gray-400 peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-black"
                  }`}
                >
                  Mobile Number
                </label>
                {errors.mobile && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.mobile.message}
                  </p>
                )}
              </div>
              <div className="relative">
                <input
                  id="address"
                  type="text"
                  placeholder="Address"
                  {...register("address", { required: "Address is required" })}
                  className={`peer w-full px-4 py-3 rounded-lg bg-white border ${
                    errors.address ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:bg-white placeholder-transparent`}
                />
                <label
                  htmlFor="address"
                  className={`absolute left-4 bg-white px-1 transition-all duration-200 pointer-events-none ${
                    watch("address")
                      ? "-top-2 text-xs text-black"
                      : "top-1/2 -translate-y-1/2 text-gray-400 peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-black"
                  }`}
                >
                  Address
                </label>
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.address.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    id="city"
                    type="text"
                    placeholder="City"
                    {...register("city", { required: "City is required" })}
                    className={`peer w-full px-4 py-3 rounded-lg bg-white border ${
                      errors.city ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:bg-white placeholder-transparent`}
                  />
                  <label
                    htmlFor="city"
                    className={`absolute left-4 bg-white px-1 transition-all duration-200 pointer-events-none ${
                      watch("city")
                        ? "-top-2 text-xs text-black"
                        : "top-1/2 -translate-y-1/2 text-gray-400 peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-black"
                    }`}
                  >
                    City
                  </label>
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.city.message}
                    </p>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="state"
                    type="text"
                    placeholder="State"
                    {...register("state", { required: "State is required" })}
                    className={`peer w-full px-4 py-3 rounded-lg bg-white border ${
                      errors.state ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:bg-white placeholder-transparent`}
                  />
                  <label
                    htmlFor="state"
                    className={`absolute left-4 bg-white px-1 transition-all duration-200 pointer-events-none ${
                      watch("state")
                        ? "-top-2 text-xs text-black"
                        : "top-1/2 -translate-y-1/2 text-gray-400 peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-black"
                    }`}
                  >
                    State
                  </label>
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.state.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="relative">
                <input
                  id="country"
                  type="text"
                  placeholder="Country"
                  {...register("country", { required: "Country is required" })}
                  className={`peer w-full px-4 py-3 rounded-lg bg-white border ${
                    errors.country ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:bg-white placeholder-transparent`}
                />
                <label
                  htmlFor="country"
                  className={`absolute left-4 bg-white px-1 transition-all duration-200 pointer-events-none ${
                    watch("country")
                      ? "-top-2 text-xs text-black"
                      : "top-1/2 -translate-y-1/2 text-gray-400 peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-black"
                  }`}
                >
                  Country
                </label>
                {errors.country && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.country.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={orderLoading || !isValid}
                className={`w-full mt-6 py-3 px-4 rounded-lg font-medium text-white transition-all ${
                  orderLoading || !isValid
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {orderLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Processing...
                  </span>
                ) : (
                  "Continue to Payment"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/cart"
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium inline-flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Return to cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingDetailsPage;
