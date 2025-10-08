import React from 'react';

const QuickAction = ({ icon, title, description, color, onClick }) => (
    <button
        onClick={onClick}
        className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:scale-105 text-left group"
    >
        <div className={`p-2 rounded-lg ${color} w-12 h-12 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
    </button>
);

export default QuickAction;