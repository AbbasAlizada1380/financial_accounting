import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // ✅ make sure AnimatePresence is imported
import { X, Plus, Minus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const mobileMenuVariants = {
  hidden: { x: "-100%" },
  visible: { x: 0, transition: { duration: 0.3, ease: "easeInOut" } },
  exit: { x: "-100%", transition: { duration: 0.2, ease: "easeIn" } },
};
const submenuVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: "auto",
    opacity: 1,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.2, ease: "easeInOut" },
  },
};

const MobileMenu = ({
  isMobileMenuOpen,
  setMobileMenuOpen,
  navbarItems,
  isMobileCategoryOpen,
  setIsMobileCategoryOpen,
  categories,
  categoryLoading,
  categoryError,
}) => {
  const navigate = useNavigate();

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // Clean up on unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setMobileMenuOpen(false)}
        className="fixed inset-0 bg-black/50 z-40"
      />
      <motion.div
        variants={mobileMenuVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed top-0 left-0 h-full w-4/5 max-w-sm bg-gradient-to-b from-indigo-50 to-white z-50 p-6 border-r border-indigo-100"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-indigo-900">Menu</h2>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 text-indigo-700 hover:text-indigo-900"
          >
            <X size={24} />
          </button>
        </div>
        <nav className="flex flex-col space-y-2">
          {navbarItems.map((item, index) => {
            const isCategory = item.name === "Category";

            return (
              <div key={index}>
                <div
                  className="flex items-center justify-between text-gray-700 hover:text-indigo-700 pl-4 py-2.5 bg-gray-200 hover:bg-indigo-100 rounded-lg transition-colors duration-150 cursor-pointer"
                  onClick={() => {
                    if (isCategory) {
                      setIsMobileCategoryOpen((prev) => !prev);
                    } else {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }
                  }}
                >
                  <span>{item.name}</span>
                  {isCategory && (
                    <span className="pr-2">
                      {isMobileCategoryOpen ? (
                        <Minus size={18} />
                      ) : (
                        <Plus size={18} />
                      )}
                    </span>
                  )}
                </div>

                <AnimatePresence initial={false}>
                  {isCategory && isMobileCategoryOpen && (
                    <motion.div
                      key="submenu"
                      variants={submenuVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="ml-6 mt-1 overflow-hidden space-y-1"
                    >
                      {categoryLoading ? (
                        <p className="text-sm text-gray-400">
                          Loading categories...
                        </p>
                      ) : categoryError ? (
                        <p className="text-sm text-red-500">{categoryError}</p>
                      ) : (
                        categories.map((cat) => (
                          <Link
                            key={cat.id || cat.name}
                            to={`/?category=${cat.name.toLowerCase()}`}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setIsMobileCategoryOpen(false);
                            }}
                            className="block text-base border-b py-2 text-gray-600 hover:text-indigo-600 transition-colors duration-150"
                          >
                            {cat.name}
                          </Link>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
      </motion.div>
    </>
  );
};

export default MobileMenu;
