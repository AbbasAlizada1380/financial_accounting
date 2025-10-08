import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../state/userSlice';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
    LayoutDashboard, 
    TrendingUp, 
    TrendingDown, 
    LogOut,
    Users,
    Briefcase,
    User,
    Settings,
    CreditCard,
    PieChart,
    Award,
    Target,
    Languages
} from 'lucide-react';

const Sidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(state => state.user.currentUser);
    const { t, language, changeLanguage } = useLanguage();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const handleLanguageChange = () => {
        const newLanguage = language === 'en' ? 'fa' : 'en';
        changeLanguage(newLanguage);
    };

    const navLinks = [
        { to: '/dashboard', icon: <LayoutDashboard size={20} />, text: t('sidebar.dashboard'), adminOnly: false },
        { to: '/income', icon: <TrendingUp size={20} />, text: t('sidebar.income'), adminOnly: false },
        { to: '/expenses', icon: <TrendingDown size={20} />, text: t('sidebar.expenses'), adminOnly: false },
        { to: '/transactions', icon: <CreditCard size={20} />, text: t('sidebar.transactions'), adminOnly: false },
        { to: '/budget', icon: <Target size={20} />, text: t('sidebar.budget'), adminOnly: false },
        { to: '/goals', icon: <Award size={20} />, text: t('sidebar.goals'), adminOnly: false },
        { to: '/reports', icon: <PieChart size={20} />, text: t('sidebar.analytics'), adminOnly: false },
        { to: '/admin/users', icon: <Users size={20} />, text: t('sidebar.userManagement'), adminOnly: true },
        { to: '/profile', icon: <User size={20} />, text: t('sidebar.profile'), adminOnly: false },
        { to: '/settings', icon: <Settings size={20} />, text: t('sidebar.settings'), adminOnly: false },
    ];

    return (
        <aside className="w-64 flex-shrink-0 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col transition-all duration-300 shadow-xl">
            {/* Header */}
            <div className="p-6 border-b border-gray-700 flex items-center justify-center gap-3">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                    <Briefcase className="text-white" size={24} />
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-bold">{t('app.name')}</h2>
                    <p className="text-xs text-gray-400">{t('app.description')}</p>
                </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navLinks.map((link) => {
                    if (link.adminOnly && user?.role !== 'admin') return null;
                    
                    return (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium group ${
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:translate-x-1'
                                }`
                            }
                        >
                            <div className={`transition-transform duration-200 ${link.to === '/dashboard' ? 'group-hover:scale-110' : ''}`}>
                                {link.icon}
                            </div>
                            <span>{link.text}</span>
                        </NavLink>
                    );
                })}
            </nav>
            
            {/* User Section */}
            <div className="p-4 border-t border-gray-700 mt-auto space-y-3">
                {/* Language Toggle */}
                <button
                    onClick={handleLanguageChange}
                    className="w-full flex items-center justify-center gap-3 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-400 font-semibold hover:bg-blue-500/20 hover:text-blue-300 transition-all duration-200"
                >
                    <Languages size={18} />
                    <span>{language === 'en' ? 'فارسی' : 'English'}</span>
                </button>

                {/* User Info */}
                <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                    <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                </div>
                
                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-red-500/10 text-red-400 font-semibold hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 group"
                >
                    <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                    <span>{t('auth.logout')}</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;