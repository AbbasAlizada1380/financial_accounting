import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';

// Layouts and Pages
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './features/dashboard/DashboardPage';
import IncomePage from './features/income/IncomePage';
import ExpensesPage from './features/expenses/ExpensesPage';
import ReportsPage from './features/reports/ReportsPage';
import LoginPage from './features/authentication/LoginPage';
import RegisterPage from './features/authentication/RegisterPage';

// Private Route Component
const PrivateRoute = ({ children }) => {
    const { accessToken } = useSelector((state) => state.user);
    return accessToken ? children : <Navigate to="/login" replace />;
};

function App() {
    const { accessToken } = useSelector((state) => state.user);

    return (
        <>
            <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
            <Routes>
                <Route path="/login" element={accessToken ? <Navigate to="/dashboard" /> : <LoginPage />} />
                <Route path="/register" element={accessToken ? <Navigate to="/dashboard" /> : <RegisterPage />} />

                <Route path="/*" element={
                    <PrivateRoute>
                        <MainLayout />
                    </PrivateRoute>
                }>
                    {/* این روت‌ها داخل MainLayout نمایش داده می‌شوند */}
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="income" element={<IncomePage />} />
                    <Route path="expenses" element={<ExpensesPage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    {/* هر روت دیگری به داشبورد هدایت می‌شود */}
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                </Route>
            </Routes>
        </>
    );
}

export default App;