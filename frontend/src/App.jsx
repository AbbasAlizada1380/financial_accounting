import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Pages
import LoginPage from './features/authentication/LoginPage';
import RegisterPage from './features/authentication/RegisterPage';
import DashboardPage from './features/dashboard/DashboardPage';
import IncomePage from './features/income/IncomePage';
import ExpensesPage from './features/expenses/ExpensesPage';
import AllTransactionsPage from './features/transactions/AllTransactionsPage'; // NEW
import AnalyticsPage from './features/analytics/AnalyticsPage'; // NEW
import UserManagementPage from './features/admin/UserManagementPage';
import ProfilePage from './features/profile/ProfilePage';
import SettingsPage from './features/settings/SettingsPage'; // NEW
import BudgetPage from './features/budget/BudgetPage';
import GoalsPage from './features/goals/GoalsPage';
/**
 * کامپوننت برای محافظت از روت‌ها برای کاربران لاگین کرده.
 */
const PrivateRoute = ({ children }) => {
    const { accessToken } = useSelector((state) => state.user);
    return accessToken ? children : <Navigate to="/login" replace />;
};

/**
 * کامپوننت برای محافظت از روت‌های مخصوص ادمین.
 */
const AdminRoute = ({ children }) => {
    const { currentUser } = useSelector((state) => state.user);
    return currentUser?.role === 'admin' ? children : <Navigate to="/dashboard" replace />;
};

function App() {
    const { accessToken } = useSelector((state) => state.user);

    return (
        <>
            <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
            <Routes>
                {/* === Public Routes === */}
                <Route path="/login" element={accessToken ? <Navigate to="/dashboard" /> : <LoginPage />} />
                <Route path="/register" element={accessToken ? <Navigate to="/dashboard" /> : <RegisterPage />} />

                {/* === Protected Routes === */}
                <Route 
                  path="/*" 
                  element={
                    <PrivateRoute>
                        <MainLayout />
                    </PrivateRoute>
                  }
                >
                    {/* روت‌های عمومی برای کاربران */}
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="income" element={<IncomePage />} />
                    <Route path="expenses" element={<ExpensesPage />} />
                    <Route path="transactions" element={<AllTransactionsPage />} /> {/* NEW */}
                    <Route path="reports" element={<AnalyticsPage />} /> {/* NEW */}
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="settings" element={<SettingsPage />} /> {/* NEW */}
                    <Route path="budget" element={<BudgetPage />} />
                    <Route path="goals" element={<GoalsPage />} />
                    {/* روت مخصوص ادمین */}
                    <Route 
                      path="admin/users" 
                      element={
                        <AdminRoute>
                            <UserManagementPage />
                        </AdminRoute>
                      } 
                    />

                    {/* روت پیش‌فرض و مدیریت مسیرهای نامعتبر */}
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                </Route>
            </Routes>
        </>
    );
}

export default App;