import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTransactions } from '../../api/transactionsApi';
import { Loader2, Download, Filter, TrendingUp, TrendingDown, PieChart, BarChart3 } from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, subYears } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

const AnalyticsPage = () => {
    const [timeRange, setTimeRange] = useState('6months');
    const [chartType, setChartType] = useState('line');

    const { data: transactions, isLoading } = useQuery({
        queryKey: ['transactions'],
        queryFn: () => getTransactions('all'),
    });

    const { monthlyData, categoryData, summary, chartData } = useMemo(() => {
        if (!transactions || transactions.length === 0) {
            return {
                monthlyData: [],
                categoryData: { income: {}, expense: {} },
                summary: { totalIncome: 0, totalExpenses: 0, netSavings: 0, savingsRate: 0 },
                chartData: { labels: [], datasets: [] }
            };
        }

        // Calculate time range
        const endDate = new Date();
        const startDate = timeRange === '3months' ? subMonths(endDate, 3) :
                         timeRange === '6months' ? subMonths(endDate, 6) :
                         timeRange === '1year' ? subYears(endDate, 1) :
                         subMonths(endDate, 12);

        const months = eachMonthOfInterval({ start: startDate, end: endDate });

        // Monthly data
        const monthlyData = months.map(month => {
            const monthStart = startOfMonth(month);
            const monthEnd = endOfMonth(month);
            
            const monthTransactions = transactions.filter(tx => {
                const txDate = new Date(tx.date);
                return txDate >= monthStart && txDate <= monthEnd;
            });

            const income = monthTransactions
                .filter(tx => tx.type === 'income')
                .reduce((acc, tx) => acc + parseFloat(tx.amount), 0);

            const expenses = monthTransactions
                .filter(tx => tx.type === 'expense')
                .reduce((acc, tx) => acc + parseFloat(tx.amount), 0);

            return {
                month: format(month, 'MMM yyyy'),
                income,
                expenses,
                savings: income - expenses
            };
        });

        // Category data
        const categoryData = {
            income: transactions
                .filter(tx => tx.type === 'income')
                .reduce((acc, tx) => {
                    const category = tx.category || 'Other Income';
                    acc[category] = (acc[category] || 0) + parseFloat(tx.amount);
                    return acc;
                }, {}),
            expense: transactions
                .filter(tx => tx.type === 'expense')
                .reduce((acc, tx) => {
                    const category = tx.category || 'General';
                    acc[category] = (acc[category] || 0) + parseFloat(tx.amount);
                    return acc;
                }, {})
        };

        // Summary
        const totalIncome = monthlyData.reduce((acc, month) => acc + month.income, 0);
        const totalExpenses = monthlyData.reduce((acc, month) => acc + month.expenses, 0);
        const netSavings = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

        // Chart data
        const chartData = {
            labels: monthlyData.map(data => data.month),
            datasets: [
                {
                    label: 'Income',
                    data: monthlyData.map(data => data.income),
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Expenses',
                    data: monthlyData.map(data => data.expenses),
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true
                }
            ]
        };

        return {
            monthlyData,
            categoryData,
            summary: {
                totalIncome,
                totalExpenses,
                netSavings,
                savingsRate: Math.round(savingsRate)
            },
            chartData
        };
    }, [transactions, timeRange]);

    const StatCard = ({ title, value, change, icon, color }) => (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {change && (
                        <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {change >= 0 ? '+' : ''}{change}%
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${color} text-white`}>
                    {icon}
                </div>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 size={48} className="animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Financial Analytics</h1>
                    <p className="text-gray-600 mt-2">Deep insights into your financial performance</p>
                </div>
                <div className="flex items-center gap-4">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="3months">Last 3 Months</option>
                        <option value="6months">Last 6 Months</option>
                        <option value="1year">Last Year</option>
                        <option value="2years">Last 2 Years</option>
                    </select>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                        <Download size={18} />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Income"
                    value={`$${summary.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    icon={<TrendingUp size={24} />}
                    color="bg-green-500"
                />
                <StatCard
                    title="Total Expenses"
                    value={`$${summary.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    icon={<TrendingDown size={24} />}
                    color="bg-red-500"
                />
                <StatCard
                    title="Net Savings"
                    value={`$${summary.netSavings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    icon={<BarChart3 size={24} />}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Savings Rate"
                    value={`${summary.savingsRate}%`}
                    icon={<PieChart size={24} />}
                    color="bg-purple-500"
                />
            </div>

            {/* Main Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Income vs Expenses Over Time</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setChartType('line')}
                            className={`px-3 py-1 rounded-lg text-sm font-medium ${
                                chartType === 'line' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Line
                        </button>
                        <button
                            onClick={() => setChartType('bar')}
                            className={`px-3 py-1 rounded-lg text-sm font-medium ${
                                chartType === 'bar' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Bar
                        </button>
                    </div>
                </div>
                <div className="h-96">
                    {chartType === 'line' ? (
                        <Line 
                            data={chartData} 
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'top',
                                    },
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        grid: { color: 'rgba(0,0,0,0.1)' }
                                    },
                                    x: {
                                        grid: { display: false }
                                    }
                                }
                            }} 
                        />
                    ) : (
                        <Bar 
                            data={chartData} 
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'top',
                                    },
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        grid: { color: 'rgba(0,0,0,0.1)' }
                                    },
                                    x: {
                                        grid: { display: false }
                                    }
                                }
                            }} 
                        />
                    )}
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Income Categories */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Income Categories</h3>
                    <div className="h-80">
                        {Object.keys(categoryData.income).length > 0 ? (
                            <Doughnut
                                data={{
                                    labels: Object.keys(categoryData.income),
                                    datasets: [{
                                        data: Object.values(categoryData.income),
                                        backgroundColor: [
                                            '#10B981', '#059669', '#047857', '#065F46', '#064E3B',
                                            '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'
                                        ],
                                        borderWidth: 2,
                                        borderColor: '#ffffff',
                                    }]
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'right',
                                        },
                                    },
                                    cutout: '50%'
                                }}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                No income data available
                            </div>
                        )}
                    </div>
                </div>

                {/* Expense Categories */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Expense Categories</h3>
                    <div className="h-80">
                        {Object.keys(categoryData.expense).length > 0 ? (
                            <Doughnut
                                data={{
                                    labels: Object.keys(categoryData.expense),
                                    datasets: [{
                                        data: Object.values(categoryData.expense),
                                        backgroundColor: [
                                            '#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D',
                                            '#F87171', '#FCA5A5', '#FECACA', '#FEE2E2'
                                        ],
                                        borderWidth: 2,
                                        borderColor: '#ffffff',
                                    }]
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'right',
                                        },
                                    },
                                    cutout: '50%'
                                }}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                No expense data available
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Monthly Breakdown Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Monthly Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Income</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expenses</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Savings</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Savings Rate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {monthlyData.map((monthData, index) => {
                                const savingsRate = monthData.income > 0 
                                    ? Math.round(((monthData.income - monthData.expenses) / monthData.income) * 100)
                                    : 0;
                                
                                return (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{monthData.month}</td>
                                        <td className="px-6 py-4 text-green-600 font-semibold">
                                            ${monthData.income.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-red-600 font-semibold">
                                            ${monthData.expenses.toFixed(2)}
                                        </td>
                                        <td className={`px-6 py-4 font-semibold ${
                                            monthData.savings >= 0 ? 'text-blue-600' : 'text-red-600'
                                        }`}>
                                            ${monthData.savings.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                savingsRate >= 0 
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {savingsRate}%
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;