import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../../api/budgetApi';
import { getTransactions } from '../../api/transactionsApi';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';
import { Plus, Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Loader2, Trash2, Edit } from 'lucide-react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';
import { startOfMonth, endOfMonth } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement);

const BudgetPage = () => {
    const queryClient = useQueryClient();
    const { t } = useLanguage();
    const [showBudgetForm, setShowBudgetForm] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);

    const { data: budgets = [], isLoading: budgetsLoading } = useQuery({
        queryKey: ['budgets'],
        queryFn: getBudgets,
    });

    const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
        queryKey: ['transactions'],
        queryFn: () => getTransactions('all'),
    });

    const createBudgetMutation = useMutation({
        mutationFn: createBudget,
        onSuccess: () => {
            toast.success(t('notifications.budgetCreated'));
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
            setShowBudgetForm(false);
            budgetForm.reset();
        },
        onError: (error) => toast.error(error.message)
    });

    const updateBudgetMutation = useMutation({
        mutationFn: ({ id, data }) => updateBudget(id, data),
        onSuccess: () => {
            toast.success(t('notifications.budgetUpdated'));
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
            setEditingBudget(null);
            budgetForm.reset();
        },
        onError: (error) => toast.error(error.message)
    });

    const deleteBudgetMutation = useMutation({
        mutationFn: deleteBudget,
        onSuccess: () => {
            toast.success(t('notifications.budgetDeleted'));
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
        },
        onError: (error) => toast.error(error.message)
    });

    const budgetForm = useForm({
        defaultValues: {
            category: '',
            budgetAmount: '',
            color: '#3B82F6'
        }
    });

    const budgetData = useMemo(() => {
        if (!transactions || !budgets) return [];

        const currentDate = new Date();
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);

        return budgets.map(budget => {
            // Ensure budgetAmount is a number
            const budgetAmount = parseFloat(budget.budgetAmount) || 0;
            
            const spent = transactions
                .filter(tx => 
                    tx.type === 'expense' && 
                    tx.category === budget.category &&
                    new Date(tx.date) >= monthStart &&
                    new Date(tx.date) <= monthEnd
                )
                .reduce((acc, tx) => acc + parseFloat(tx.amount || 0), 0);
            
            const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
            
            return {
                ...budget,
                budgetAmount, // Ensure this is always a number
                spent,
                remaining: budgetAmount - spent,
                percentage: percentage
            };
        });
    }, [transactions, budgets]);

    const onSubmit = (data) => {
        if (editingBudget) {
            updateBudgetMutation.mutate({
                id: editingBudget.id,
                data: {
                    ...data,
                    budgetAmount: parseFloat(data.budgetAmount)
                }
            });
        } else {
            createBudgetMutation.mutate({
                ...data,
                budgetAmount: parseFloat(data.budgetAmount)
            });
        }
    };

    const handleEdit = (budget) => {
        setEditingBudget(budget);
        budgetForm.reset({
            category: budget.category,
            budgetAmount: budget.budgetAmount,
            color: budget.color || '#3B82F6'
        });
        setShowBudgetForm(true);
    };

    const handleCancel = () => {
        setShowBudgetForm(false);
        setEditingBudget(null);
        budgetForm.reset();
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

    // Safe calculations with fallbacks
    const totalBudget = budgetData.reduce((acc, budget) => acc + (parseFloat(budget.budgetAmount) || 0), 0);
    const totalSpent = budgetData.reduce((acc, budget) => acc + (parseFloat(budget.spent) || 0), 0);
    const totalRemaining = totalBudget - totalSpent;

    const chartData = {
        labels: budgetData.map(budget => budget.category),
        datasets: [
            {
                label: t('budget.budgetAmount'),
                data: budgetData.map(budget => parseFloat(budget.budgetAmount) || 0),
                backgroundColor: budgetData.map(budget => budget.color || '#3B82F6'),
                borderWidth: 2,
                borderColor: '#ffffff',
            }
        ]
    };

    const spendingChartData = {
        labels: budgetData.map(budget => budget.category),
        datasets: [
            {
                label: t('budget.budgetAmount'),
                data: budgetData.map(budget => parseFloat(budget.budgetAmount) || 0),
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 2,
            },
            {
                label: t('budget.spent'),
                data: budgetData.map(budget => parseFloat(budget.spent) || 0),
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                borderColor: 'rgb(239, 68, 68)',
                borderWidth: 2,
            }
        ]
    };

    const expenseCategories = [
        'Food & Dining',
        'Transportation',
        'Entertainment',
        'Shopping',
        'Utilities',
        'Healthcare',
        'Education',
        'Travel',
        'General'
    ];

    const colors = [
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
        '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ];

    // Helper function to safely format numbers
    const formatCurrency = (value) => {
        const numValue = parseFloat(value) || 0;
        return numValue.toFixed(2);
    };

    if (budgetsLoading || transactionsLoading) {
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
                    <h1 className="text-3xl font-bold text-gray-900">{t('budget.title')}</h1>
                    <p className="text-gray-600 mt-2">{t('budget.description')}</p>
                </div>
                <button
                    onClick={() => setShowBudgetForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                    <Plus size={20} />
                    {t('budget.addBudget')}
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">{t('budget.totalBudget')}</p>
                            <p className="text-2xl font-bold text-gray-900">${formatCurrency(totalBudget)}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Target className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">{t('budget.totalSpent')}</p>
                            <p className="text-2xl font-bold text-red-600">${formatCurrency(totalSpent)}</p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-lg">
                            <TrendingDown className="text-red-600" size={24} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">{t('budget.totalRemaining')}</p>
                            <p className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ${formatCurrency(totalRemaining)}
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <TrendingUp className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Budget Form Modal */}
            {(showBudgetForm || editingBudget) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            {editingBudget ? t('common.edit') : t('budget.addBudget')}
                        </h3>
                        <form onSubmit={budgetForm.handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('budget.category')} *
                                </label>
                                <select
                                    {...budgetForm.register('category', { required: true })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">{t('common.select')} {t('budget.category')}</option>
                                    {expenseCategories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('budget.budgetAmount')} *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    {...budgetForm.register('budgetAmount', { required: true })}
                                    placeholder="0.00"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('common.color')}
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {colors.map(color => (
                                        <button
                                            type="button"
                                            key={color}
                                            onClick={() => budgetForm.setValue('color', color)}
                                            className={`w-8 h-8 rounded-full border-2 ${
                                                budgetForm.watch('color') === color ? 'border-gray-800' : 'border-gray-300'
                                            }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={createBudgetMutation.isPending || updateBudgetMutation.isPending}
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 font-semibold"
                                >
                                    {createBudgetMutation.isPending || updateBudgetMutation.isPending ? (
                                        <Loader2 className="animate-spin mx-auto" size={20} />
                                    ) : editingBudget ? (
                                        t('common.save')
                                    ) : (
                                        t('budget.addBudget')
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 font-semibold"
                                >
                                    {t('common.cancel')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Charts */}
            {budgetData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">{t('budget.allocation')}</h3>
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
                        <h3 className="text-lg font-bold text-gray-900 mb-6">{t('budget.vsActual')}</h3>
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
            )}

            {/* Budget List */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">{t('budget.categories')}</h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {budgetData.map((budget) => (
                        <div key={budget.id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div 
                                        className="w-4 h-4 rounded-full" 
                                        style={{ backgroundColor: budget.color || '#3B82F6' }}
                                    ></div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{budget.category}</h4>
                                        <p className="text-sm text-gray-500">
                                            ${formatCurrency(budget.spent)} {t('common.of')} ${formatCurrency(budget.budgetAmount)}
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
                                            ${formatCurrency(budget.remaining)} {t('budget.remaining')}
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
                                    
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(budget)}
                                            className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => deleteBudgetMutation.mutate(budget.id)}
                                            disabled={deleteBudgetMutation.isPending}
                                            className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 disabled:opacity-50"
                                        >
                                            {deleteBudgetMutation.isPending ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <Trash2 size={16} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {budgetData.length === 0 && (
                        <div className="p-12 text-center text-gray-500">
                            <Target size={48} className="mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium">{t('common.noRecords')}</p>
                            <p className="text-sm">{t('budget.description')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BudgetPage;