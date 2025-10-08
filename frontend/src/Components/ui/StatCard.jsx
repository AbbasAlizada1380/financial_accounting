import React from 'react';

const StatCard = ({ title, value, change, icon, color, gradient }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:scale-105 ${gradient}`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
                {change !== undefined && change !== null && (
                    <div className={`flex items-center mt-2 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <span className="ml-1 font-semibold">{Math.abs(change)}%</span>
                        <span className="ml-1 text-gray-500">from last month</span>
                    </div>
                )}
            </div>
            <div className={`p-3 rounded-xl ${color} text-white`}>
                {icon}
            </div>
        </div>
    </div>
);

export default StatCard;