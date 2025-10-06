import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTransactions } from '../../api/transactionsApi';
import { DollarSign, TrendingUp, TrendingDown, Scale, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';

// کامپوننت کوچک برای کارت‌های داشبورد
const StatCard = ({ title, value, icon, colorClass }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className={`p-3 rounded-full ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">${value.toFixed(2)}</p>
        </div>
    </div>
);

const DashboardPage = () => {
    const user = useSelector(state => state.user.currentUser);

    // Fetch all transactions once
    const { data: transactions, isLoading, isError } = useQuery({
        queryKey: ['transactions'],
        queryFn: () => getTransactions('all'), // 'all' is just for the query key, api still gets all
    });

    // Calculate totals using useMemo for performance
    const { totalIncome, totalExpenses, balance } = useMemo(() => {
        if (!transactions) return { totalIncome: 0, totalExpenses: 0, balance: 0 };
        
        const totalIncome = transactions
            .filter(tx => tx.type === 'income')
            .reduce((acc, tx) => acc + parseFloat(tx.amount), 0);

        const totalExpenses = transactions
            .filter(tx => tx.type === 'expense')
            .reduce((acc, tx) => acc + parseFloat(tx.amount), 0);
            
        return { totalIncome, totalExpenses, balance: totalIncome - totalExpenses };
    }, [transactions]);
    
    // Get recent 5 transactions
    const recentTransactions = transactions?.slice(0, 5) || [];

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Loader2 size={48} className="animate-spin text-blue-500" /></div>;
    }

    if (isError) {
        return <p className="text-center text-red-500">Failed to load dashboard data.</p>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.firstName}!</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Income" value={totalIncome} icon={<TrendingUp className="text-green-800" />} colorClass="bg-green-100" />
                <StatCard title="Total Expenses" value={totalExpenses} icon={<TrendingDown className="text-red-800" />} colorClass="bg-red-100" />
                <StatCard title="Current Balance" value={balance} icon={<Scale className="text-blue-800" />} colorClass="bg-blue-100" />
            </div>

            {/* Recent Transactions */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                 <h2 className="text-xl font-semibold mb-4 text-gray-700">Recent Transactions</h2>
                 <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <tbody>
                            {recentTransactions.length > 0 ? recentTransactions.map(tx => (
                                <tr key={tx.id} className="border-b last:border-b-0">
                                    <td className="py-3 px-4">{tx.description}</td>
                                    <td className={`py-3 px-4 font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                        {tx.type === 'income' ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                                    </td>
                                    <td className="py-3 px-4 text-gray-500 text-sm">{new Date(tx.date).toLocaleDateString()}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="text-center py-4 text-gray-500">No recent transactions.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
};

export default DashboardPage;