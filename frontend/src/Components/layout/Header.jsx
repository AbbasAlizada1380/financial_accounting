import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Bell, Search, Menu, X } from 'lucide-react';

const Header = ({ onMenuToggle }) => {
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const user = useSelector(state => state.user.currentUser);

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left section - Menu button and Search */}
                    <div className="flex items-center gap-4 flex-1">
                        {/* Mobile menu button */}
                        <button
                            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                            onClick={onMenuToggle}
                        >
                            <Menu size={20} />
                        </button>

                        {/* Search bar - Desktop */}
                        <div className="hidden md:block flex-1 max-w-lg">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="Search transactions..."
                                />
                            </div>
                        </div>

                        {/* Mobile search button */}
                        <button
                            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                        >
                            <Search size={20} />
                        </button>
                    </div>

                    {/* Mobile search bar */}
                    {isSearchOpen && (
                        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 p-4 md:hidden z-30">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Search transactions..."
                                    autoFocus
                                />
                                <button
                                    onClick={() => setIsSearchOpen(false)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    <X size={20} className="text-gray-400 hover:text-gray-600" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Right section */}
                    <div className="flex items-center space-x-4">
                        {/* Notifications */}
                        <div className="relative">
                            <button
                                className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 relative transition-colors"
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            >
                                <Bell size={20} />
                                <span className="absolute top-0 right-0 block h-2 w-2 bg-red-500 rounded-full"></span>
                            </button>

                            {isNotificationsOpen && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsNotificationsOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                        <div className="p-4 border-b border-gray-200">
                                            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            <div className="p-4 text-center text-gray-500">
                                                No new notifications
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* User profile */}
                        <div className="flex items-center space-x-3">
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">
                                    {user?.role}
                                </p>
                            </div>
                            <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;