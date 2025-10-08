import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTransactions } from '../../api/transactionsApi';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Plus, Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { Doughnut, Bar } from 'react-chartjs-2';

const BudgetPage = () => {
    const queryClient = useQueryClient();
    const [showBudgetForm, setShowBudgetForm] = useState(false);

    const { data: transactions, isLoading } = useQuery({
        queryKey: ['transactions'],
        queryFn: () => getTransactions('all'),
    });

    const budgetForm = useForm();

    // Default budget categories
    const [budgets, setBudgets] = useState([
        { id: 1, category: 'Food & Dining', budget: 500, spent: 0, color: '#FF6384' },
        { id: 2, category: 'Transportation', budget: 300, spent: 0, color: '#36A2EB' },
        { id: 3, category: 'Entertainment', budget: 200, spent: 0, color: '#FFCE56' },
        { id: 4, category: 'Shopping', budget: 400, spent: 0, color: '#4BC0C0' },
        { id: 5, category: 'Utilities', budget: 350, spent: 0, color: '#9966FF' },
    ]);

    const budgetData = useMemo(() => {
        if (!transactions) return budgets;

        return budgets.map(budget => {
            const spent = transactions
                .filter(tx => tx.type === 'expense' && tx.category === budget.category)
                .reduce((acc, tx) => acc + parseFloat(tx.amount), 0);
            
            return {
                ...budget,
                spent,
                remaining: budget.budget - spent,
                percentage: (spent / budget.budget) * 100
            };
        });
    }, [transactions, budgets]);

    const totalBudget = budgetData.reduce((acc, budget) => acc + budget.budget, 0);
    const totalSpent = budgetData.reduce((acc, budget) => acc + budget.spent, 0);
    const totalRemaining = totalBudget - totalSpent;

    const addBudget = (data) => {
        const newBudget = {
            id: Date.now(),
            category: data.category,
            budget: parseFloat(data.amount),
            spent: 0,
            color: `#${Math.floor(Math.random()*16777215).toString(16)}`
        };
        setBudgets([...budgets, newBudget]);
        setShowBudgetForm(false);
        budgetForm.reset();
        toast.success('Budget category added successfully!');
    };

    const deleteBudget = (id) => {
        setBudgets(budgets.filter(budget => budget.id !== id));
        toast.success('Budget category deleted!');
    };

    const getStatusColor = (percentage) => {
        if (percentage >= 90) return 'text-red-600';
        if (percentage >= 75) return 'text-yellow-600';
        return 'text-green-600';
    };

    const getStatusIcon = (percentage) => {
        if (percentage >= 90) return <AlertTriangle size={16} className="text-red-600" />;
        if (percentage >= 75) return <AlertTriangle size={16} className="text-yellow-600" />;
        return <CheckCircle size={16} className="text-green-600" />;
    };

    const chartData = {
        labels: budgetData.map(budget => budget.category),
        datasets: [
            {
                label: 'Budget',
                data: budgetData.map(budget => budget.budget),
                backgroundColor: budgetData.map(budget => budget.color),
                borderWidth: 2,
                borderColor: '#ffffff',
            }
        ]
    };

    const spendingChartData = {
        labels: budgetData.map(budget => budget.category),
        datasets: [
            {
                label: 'Budget',
                data: budgetData.map(budget => budget.budget),
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 2,
            },
            {
                label: 'Spent',
                data: budgetData.map(budget => budget.spent),
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                borderColor: 'rgb(239, 68, 68)',
                borderWidth: 2,
            }
        ]
    };

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
                    <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
                    <p className="text-gray-600 mt-2">Track and manage your spending across categories</p>
                </div>
                <button
                    onClick={() => setShowBudgetForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                    <Plus size={20} />
                    Add Budget
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Budget</p>
                            <p className="text-2xl font-bold text-gray-900">${totalBudget.toFixed(2)}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Target className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Spent</p>
                            <p className="text-2xl font-bold text-red-600">${totalSpent.toFixed(2)}</p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-lg">
                            <TrendingDown className="text-red-600" size={24} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Remaining</p>
                            <p className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ${totalRemaining.toFixed(2)}
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <TrendingUp className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Budget Form Modal */}
            {showBudgetForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Budget</h3>
                        <form onSubmit={budgetForm.handleSubmit(addBudget)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <input
                                    {...budgetForm.register('category', { required: true })}
                                    placeholder="e.g., Groceries, Entertainment"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Budget Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...budgetForm.register('amount', { required: true })}
                                    placeholder="0.00"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold"
                                >
                                    Add Budget
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowBudgetForm(false)}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 font-semibold"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Budget Allocation</h3>
                    <div className="h-80">
                        <Doughnut
                            data={chartData}
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
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Budget vs Actual Spending</h3>
                    <div className="h-80">
                        <Bar
                            data={spendingChartData}
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
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Budget List */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">Budget Categories</h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {budgetData.map((budget) => (
                        <div key={budget.id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div 
                                        className="w-4 h-4 rounded-full" 
                                        style={{ backgroundColor: budget.color }}
                                    ></div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{budget.category}</h4>
                                        <p className="text-sm text-gray-500">
                                            ${budget.spent.toFixed(2)} of ${budget.budget.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 mb-1">
                                            {getStatusIcon(budget.percentage)}
                                            <span className={`text-sm font-semibold ${getStatusColor(budget.percentage)}`}>
                                                {budget.percentage.toFixed(1)}%
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            ${budget.remaining.toFixed(2)} remaining
                                        </p>
                                    </div>
                                    
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className={`h-2 rounded-full ${
                                                budget.percentage >= 90 ? 'bg-red-500' :
                                                budget.percentage >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                                            }`}
                                            style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                                        ></div>
                                    </div>
                                    
                                    <button
                                        onClick={() => deleteBudget(budget.id)}
                                        className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {budgetData.length === 0 && (
                        <div className="p-12 text-center text-gray-500">
                            <Target size={48} className="mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium">No budgets set up yet</p>
                            <p className="text-sm">Create your first budget to start tracking your spending</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BudgetPage;