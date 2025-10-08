import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTransactions } from '../../api/transactionsApi';
import { useSelector } from 'react-redux';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, TrendingUp, TrendingDown, Scale, ArrowRight, Calendar, Wallet, Plus, PieChart as PieChartIcon } from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const StatCard = ({ title, value, change, icon, color, gradient }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:scale-105 ${gradient}`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {change !== undefined && change !== null && (
                    <div className={`flex items-center mt-2 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <TrendingUp size={16} className={change >= 0 ? '' : 'hidden'} />
                        <TrendingDown size={16} className={change < 0 ? '' : 'hidden'} />
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

const DashboardPage = () => {
    const user = useSelector(state => state.user.currentUser);
    const { t } = useLanguage();
    const navigate = useNavigate();

    const { data: transactions, isLoading } = useQuery({
        queryKey: ['transactions'],
        queryFn: () => getTransactions('all'),
    });

    const { stats, lineChartData, doughnutChartData, recentTransactions, monthlyComparison } = useMemo(() => {
        // Default values for empty state
        const defaultStats = { 
            totalIncome: 0, 
            totalExpenses: 0, 
            balance: 0, 
            transactionsCount: 0 
        };

        const defaultComparison = { 
            incomeChange: 0, 
            expenseChange: 0 
        };

        const defaultChartData = {
            labels: [],
            datasets: []
        };

        if (!transactions || transactions.length === 0) {
            return { 
                stats: defaultStats,
                monthlyComparison: defaultComparison,
                lineChartData: defaultChartData,
                doughnutChartData: defaultChartData,
                recentTransactions: []
            };
        }

        try {
            const currentMonthStart = startOfMonth(new Date());
            const currentMonthEnd = endOfMonth(new Date());
            const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
            const lastMonthEnd = endOfMonth(lastMonthStart);

            const currentMonthTransactions = transactions.filter(tx => {
                if (!tx || !tx.date) return false;
                const txDate = new Date(tx.date);
                return txDate >= currentMonthStart && txDate <= currentMonthEnd;
            });

            const lastMonthTransactions = transactions.filter(tx => {
                if (!tx || !tx.date) return false;
                const txDate = new Date(tx.date);
                return txDate >= lastMonthStart && txDate <= lastMonthEnd;
            });

            const totalIncome = currentMonthTransactions
                .filter(tx => tx.type === 'income')
                .reduce((acc, tx) => acc + parseFloat(tx.amount || 0), 0);

            const totalExpenses = currentMonthTransactions
                .filter(tx => tx.type === 'expense')
                .reduce((acc, tx) => acc + parseFloat(tx.amount || 0), 0);

            const lastMonthIncome = lastMonthTransactions
                .filter(tx => tx.type === 'income')
                .reduce((acc, tx) => acc + parseFloat(tx.amount || 0), 0);

            const lastMonthExpenses = lastMonthTransactions
                .filter(tx => tx.type === 'expense')
                .reduce((acc, tx) => acc + parseFloat(tx.amount || 0), 0);

            // Calculate percentage changes safely
            const incomeChange = lastMonthIncome > 0 
                ? Math.round(((totalIncome - lastMonthIncome) / lastMonthIncome) * 100)
                : totalIncome > 0 ? 100 : 0;

            const expenseChange = lastMonthExpenses > 0
                ? Math.round(((totalExpenses - lastMonthExpenses) / lastMonthExpenses) * 100)
                : totalExpenses > 0 ? 100 : 0;

            // Chart data calculations
            const labels = Array.from({ length: 7 }).map((_, i) => 
                format(subDays(new Date(), i), 'MMM d')
            ).reverse();

            const incomeByDay = Array(7).fill(0);
            const expenseByDay = Array(7).fill(0);
            
            transactions.forEach(tx => {
                if (!tx || !tx.date) return;
                const txDate = new Date(tx.date);
                const today = new Date();
                
                for (let i = 0; i < 7; i++) {
                    const compareDate = subDays(today, i);
                    if (format(compareDate, 'yyyy-MM-dd') === format(txDate, 'yyyy-MM-dd')) {
                        const amount = parseFloat(tx.amount || 0);
                        if (tx.type === 'income') {
                            incomeByDay[6 - i] += amount;
                        } else if (tx.type === 'expense') {
                            expenseByDay[6 - i] += amount;
                        }
                    }
                }
            });

            const expenseCategories = transactions
                .filter(tx => tx.type === 'expense')
                .reduce((acc, tx) => {
                    const category = tx.category || 'General';
                    const amount = parseFloat(tx.amount || 0);
                    acc[category] = (acc[category] || 0) + amount;
                    return acc;
                }, {});

            return {
                stats: { 
                    totalIncome, 
                    totalExpenses, 
                    balance: totalIncome - totalExpenses,
                    transactionsCount: transactions.length 
                },
                monthlyComparison: {
                    incomeChange,
                    expenseChange
                },
                lineChartData: {
                    labels,
                    datasets: [
                        { 
                            label: 'Income', 
                            data: incomeByDay, 
                            borderColor: 'rgb(34, 197, 94)', 
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            borderWidth: 3,
                            tension: 0.4,
                            fill: true
                        },
                        { 
                            label: 'Expense', 
                            data: expenseByDay, 
                            borderColor: 'rgb(239, 68, 68)', 
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            borderWidth: 3,
                            tension: 0.4,
                            fill: true
                        },
                    ],
                },
                doughnutChartData: {
                    labels: Object.keys(expenseCategories),
                    datasets: [{
                        data: Object.values(expenseCategories),
                        backgroundColor: [
                            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
                            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff',
                    }],
                },
                recentTransactions: transactions.slice(0, 5),
            };
        } catch (error) {
            console.error('Error processing transaction data:', error);
            return { 
                stats: defaultStats,
                monthlyComparison: defaultComparison,
                lineChartData: defaultChartData,
                doughnutChartData: defaultChartData,
                recentTransactions: []
            };
        }
    }, [transactions]);

    const quickActions = [
        {
            icon: <TrendingUp size={24} />,
            title: t('dashboard.addIncome'),
            description: t('income.descriptionPlaceholder'),
            color: 'bg-green-500',
            onClick: () => navigate('/income')
        },
        {
            icon: <TrendingDown size={24} />,
            title: t('dashboard.addExpense'),
            description: t('expenses.descriptionPlaceholder'),
            color: 'bg-red-500',
            onClick: () => navigate('/expenses')
        },
        {
            icon: <PieChartIcon size={24} />,
            title: t('dashboard.viewReports'),
            description: t('sidebar.analytics'),
            color: 'bg-blue-500',
            onClick: () => navigate('/reports')
        },
        {
            icon: <Calendar size={24} />,
            title: t('dashboard.schedule'),
            description: 'Recurring transactions',
            color: 'bg-purple-500',
            onClick: () => navigate('/settings')
        }
    ];

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {t('dashboard.welcome', { name: user?.firstName || t('common.user') })} 👋
                    </h1>
                    <p className="text-gray-600 mt-2">{t('dashboard.overview')}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={16} />
                    <span>{format(new Date(), 'EEEE, MMMM do, yyyy')}</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title={t('dashboard.totalIncome')} 
                    value={`$${stats.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
                    change={monthlyComparison?.incomeChange}
                    icon={<TrendingUp size={24} />}
                    color="bg-green-500"
                    gradient="bg-gradient-to-br from-green-50 to-white"
                />
                <StatCard 
                    title={t('dashboard.totalExpenses')} 
                    value={`$${stats.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
                    change={monthlyComparison?.expenseChange}
                    icon={<TrendingDown size={24} />}
                    color="bg-red-500"
                    gradient="bg-gradient-to-br from-red-50 to-white"
                />
                <StatCard 
                    title={t('dashboard.currentBalance')} 
                    value={`$${stats.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
                    icon={<Scale size={24} />}
                    color="bg-blue-500"
                    gradient="bg-gradient-to-br from-blue-50 to-white"
                />
                <StatCard 
                    title={t('dashboard.totalTransactions')} 
                    value={stats.transactionsCount} 
                    icon={<Wallet size={24} />}
                    color="bg-purple-500"
                    gradient="bg-gradient-to-br from-purple-50 to-white"
                />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">{t('dashboard.quickActions')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action, index) => (
                        <QuickAction key={index} {...action} />
                    ))}
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <div className="h-80">
                        {lineChartData?.labels?.length > 0 ? (
                            <Line 
                                data={lineChartData} 
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'top',
                                            labels: {
                                                font: { size: 12 },
                                                usePointStyle: true
                                            }
                                        },
                                        title: {
                                            display: true,
                                            text: 'Income vs Expense (Last 7 Days)',
                                            font: { size: 16, weight: 'bold' }
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
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center text-gray-500">
                                    <TrendingUp size={48} className="mx-auto mb-4 text-gray-300" />
                                    <p>{t('common.noData')}</p>
                                    <p className="text-sm">Start adding transactions to see charts</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <div className="h-80">
                        {doughnutChartData?.labels?.length > 0 ? (
                            <Doughnut 
                                data={doughnutChartData} 
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'right',
                                            labels: {
                                                font: { size: 11 },
                                                boxWidth: 12
                                            }
                                        },
                                        title: {
                                            display: true,
                                            text: 'Expense Categories',
                                            font: { size: 16, weight: 'bold' }
                                        },
                                    },
                                    cutout: '60%'
                                }} 
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center text-gray-500">
                                    <PieChartIcon size={48} className="mx-auto mb-4 text-gray-300" />
                                    <p>No expense data to display</p>
                                    <p className="text-sm">Add expenses to see category breakdown</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">{t('dashboard.recentTransactions')}</h2>
                    <button 
                        onClick={() => navigate('/transactions')}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm"
                    >
                        {t('dashboard.viewAll')} <ArrowRight size={16} />
                    </button>
                </div>
                <div className="divide-y divide-gray-100">
                    {recentTransactions.length > 0 ? recentTransactions.map((transaction) => (
                        <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${
                                        transaction.type === 'income' 
                                            ? 'bg-green-100 text-green-600' 
                                            : 'bg-red-100 text-red-600'
                                    }`}>
                                        {transaction.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{transaction.description || 'No description'}</p>
                                        <p className="text-sm text-gray-500">{transaction.category || 'General'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold ${
                                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {transaction.type === 'income' ? '+' : '-'}${parseFloat(transaction.amount || 0).toFixed(2)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {transaction.date ? format(new Date(transaction.date), 'MMM d, yyyy') : 'No date'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="p-12 text-center text-gray-500">
                            <Wallet size={48} className="mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium">{t('common.noRecords')}</p>
                            <p className="text-sm">Start by adding your first income or expense</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;