import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../state/userSlice';
import { LayoutDashboard, ArrowRightLeft, TrendingUp, TrendingDown, FileText, LogOut } from 'lucide-react';

const Sidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(state => state.user.currentUser);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const navLinks = [
        { to: '/dashboard', icon: <LayoutDashboard size={20} />, text: 'Dashboard' },
        { to: '/income', icon: <TrendingUp size={20} />, text: 'Income' },
        { to: '/expenses', icon: <TrendingDown size={20} />, text: 'Expenses' },
        { to: '/reports', icon: <FileText size={20} />, text: 'Reports' },
    ];

    return (
        <aside className="w-64 flex-shrink-0 bg-white shadow-md flex flex-col">
            <div className="p-4 border-b">
                <h2 className="text-2xl font-bold text-gray-800 text-center">Financial App</h2>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navLinks.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                                isActive
                                    ? 'bg-blue-500 text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-200'
                            }`
                        }
                    >
                        {link.icon}
                        <span className="font-medium">{link.text}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t">
                 <div className="mb-4 text-center">
                    <p className="font-semibold text-gray-700">{user?.firstName} {user?.lastName}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;