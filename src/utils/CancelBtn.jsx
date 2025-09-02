import React from "react";

const CancelBtn = ({ onClick, title, type = "button" }) => {
  return (
    <button
      type={type} // 👈 VERY IMPORTANT
      onClick={onClick}
      className="relative px-8 py-2 rounded-md bg-white isolation-auto z-10 border-2 border-red-600 
      before:absolute before:w-0 before:transition-all before:duration-700 before:hover:w-full 
      hover:text-white before:-right-full before:hover:right-0 before:rounded-full before:bg-red-600 
      before:-z-10 before:aspect-square before:hover:scale-150 overflow-hidden 
      inline-flex items-center justify-center text-base  text-red-600 font-semibold 
      shadow-sm gap-x-2 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
    >
      {title}
    </button>
  );
};

export default CancelBtn;
