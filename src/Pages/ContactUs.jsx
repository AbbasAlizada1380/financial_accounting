import React, { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { MapPin, Mail, Phone, Clock, MessageSquare } from "lucide-react";
import FAQSection from "../Components/FAQSection";

const ContactUs = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const textVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  // For scroll-triggered animations
  const [headingRef, headingInView] = useInView({
    triggerOnce: false, // Set to true if you only want animation once
    threshold: 0.5,
  });

  const [paragraphRef, paragraphInView] = useInView({
    triggerOnce: false,
    threshold: 0.3,
  });
  return (
    <div className="bg-gradient-to-b from-indigo-50/20 to-white min-h-screen">
      {/* Hero Section */}

      <section className="relative bg-[url('about.png')] bg-cover bg-center bg-no-repeat text-white py-20 h-[400px]">
        <div className="absolute inset-0 bg-black opacity-50 z-0" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.h1
            ref={headingRef}
            initial="hidden"
            animate={headingInView ? "visible" : "hidden"}
            variants={textVariants}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Contact Us
          </motion.h1>

          <motion.p
            ref={paragraphRef}
            initial="hidden"
            animate={paragraphInView ? "visible" : "hidden"}
            variants={textVariants}
            transition={{ delay: 0.2 }} // Slight delay for staggered effect
            className="text-xl md:text-2xl max-w-3xl mx-auto"
          >
            We're here to help! Reach out to our team for any questions or
            concerns.
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container max-w-[] md:max-w-[90%] mx-auto px-6 py-16">
        <div className=" gap-12">
          {/* Contact Information */}
          <div className="bg-white">
            <h2 className="text-2xl font-bold text-center text-indigo-900 mb-8">
              Get in Touch
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-x-10 gap-y-10 mb-8 pt-5">
              <div className=" text-center gap-4">
                <div className="flex items-center gap-x-2  justify-center bg-indigo-100 p-3 rounded-full">
                  <MapPin className="text-indigo-600" size={30} />
                  <h3 className="font-semibold text-lg text-gray-900">
                    Our Location
                  </h3>
                </div>
                <div className="mt-3">
                  <p className="text-gray-600">
                    123 Fashion Avenue, Suite 456
                    <br />
                    New York, NY 10001
                  </p>
                </div>
              </div>

              <div className="gap-4">
                <div className="flex items-center gap-x-2 justify-center bg-indigo-100 p-3 rounded-full">
                  <Mail className="text-indigo-600" size={30} />
                  <h3 className="font-semibold text-lg text-gray-900">
                    Email Us
                  </h3>
                </div>
                <div className="text-center mt-3">
                  <p className="text-gray-600">
                    <a
                      href="mailto:info@chigfrip.com"
                      className="hover:text-indigo-600 transition-colors"
                    >
                      info@chigfrip.com
                    </a>
                    <br />
                    <a
                      href="mailto:support@chigfrip.com"
                      className="hover:text-indigo-600 transition-colors"
                    >
                      support@chigfrip.com
                    </a>
                  </p>
                </div>
              </div>

              <div className="gap-4">
                <div className="flex items-center gap-x-2 justify-center bg-indigo-100 p-3 rounded-full">
                  <Phone className="text-indigo-600" size={30} />
                  <h3 className="font-semibold text-lg text-gray-900">
                    Call Us
                  </h3>
                </div>
                <div className="text-center mt-3">
                  <p className="text-gray-600">
                    <a
                      href="tel:+18005551234"
                      className="hover:text-indigo-600 transition-colors"
                    >
                      +1 (800) 555-1234
                    </a>
                    <br />
                    Mon-Fri: 9am-6pm EST
                  </p>
                </div>
              </div>

              <div className="gap-4">
                <div className="flex items-center gap-x-2 justify-center bg-indigo-100 p-3 rounded-full">
                  <Clock className="text-indigo-600" size={30} />
                  <h3 className="font-semibold text-lg text-gray-900">
                    Business Hours
                  </h3>
                </div>
                <div className="text-center mt-3">
                  <p className="text-gray-600">
                    Monday-Friday: 9:00 AM - 6:00 PM
                    <br />
                    Saturday: 10:00 AM - 4:00 PM
                    <br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="col-span-1 md:px-20">
              <h2 className="text-2xl font-bold text-indigo-900 mb-8">
                Send Us a Message
              </h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1  gap-6">
                  <div className="space-y-6">
                    {/* Full Name Input */}
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="peer w-full px-4 py-3 border border-black rounded-lg bg-white focus:outline-none focus:bg-white placeholder-transparent"
                        placeholder="Full Name"
                        required
                      />
                      <label
                        htmlFor="name"
                        className={`absolute left-4 bg-white px-1 transition-all duration-200 pointer-events-none
            ${
              name
                ? "-top-2 text-xs text-black"
                : "top-1/2 -translate-y-1/2 text-gray-400 peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-black"
            }`}
                      >
                        Your Name
                      </label>
                    </div>

                    {/* Email Input */}
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="peer w-full px-4 py-3 border border-black rounded-lg bg-white focus:outline-none focus:bg-white placeholder-transparent"
                        placeholder="Email"
                        required
                      />
                      <label
                        htmlFor="email"
                        className={`absolute left-4 bg-white px-1 transition-all duration-200 pointer-events-none
            ${
              email
                ? "-top-2 text-xs text-black"
                : "top-1/2 -translate-y-1/2 text-gray-400 peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-black"
            }`}
                      >
                        Your Email
                      </label>
                    </div>
                  </div>
                </div>

                <div className="relative mt-6">
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Your message"
                    className="peer w-full px-4 pt-6 pb-2 border border-black rounded-lg focus:outline-none  placeholder-transparent resize-none"
                    required
                  />
                  <label
                    htmlFor="message"
                    className={`absolute left-4 bg-white px-1 transition-all duration-200 pointer-events-none
          ${
            message
              ? "-top-2 text-xs text-black"
              : "top-4 text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-black"
          }`}
                  >
                    Your Message
                  </label>
                </div>

                <div className="flex justify-center items-center">
                  <button class="text-xl w-40 h-12 rounded bg-emerald-500 text-white relative overflow-hidden group z-10 hover:text-white duration-1000">
                    <span class="absolute bg-emerald-600 w-44 h-36 rounded-full group-hover:scale-100 scale-0 -z-10 -left-2 -top-10 group-hover:duration-500 duration-700 origin-center transform transition-all"></span>
                    <span class="absolute bg-emerald-800 w-44 h-36 -left-2 -top-10 rounded-full group-hover:scale-100 scale-0 -z-10 group-hover:duration-700 duration-500 origin-center transform transition-all"></span>
                    Send
                  </button>
                </div>
              </form>
            </div>
            <div className="col-span-1 flex items-center bg-white rounded-xl shadow-sm p-8">
              <FAQSection />
            </div>
          </div>
        </div>

        {/* FAQ Section */}
      </div>
    </div>
  );
};

export default ContactUs;
