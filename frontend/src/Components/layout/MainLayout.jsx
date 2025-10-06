import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout = () => {
    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <Outlet /> {/* صفحات فرزند در اینجا رندر می‌شوند */}
            </main>
        </div>
    );
};

export default MainLayout;