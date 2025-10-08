import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGoals, createGoal, updateGoal, deleteGoal, addToGoal } from '../../api/goalsApi';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';
import { Plus, Target, TrendingUp, Calendar, PiggyBank, Loader2, Trash2, Edit, PlusCircle } from 'lucide-react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement);

const GoalsPage = () => {
    const queryClient = useQueryClient();
    const { t } = useLanguage();
    const [showGoalForm, setShowGoalForm] = useState(false);
    const [showSavingsForm, setShowSavingsForm] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [selectedGoal, setSelectedGoal] = useState(null);

    const { data: goals = [], isLoading: goalsLoading } = useQuery({
        queryKey: ['goals'],
        queryFn: getGoals,
    });

    const createGoalMutation = useMutation({
        mutationFn: createGoal,
        onSuccess: () => {
            toast.success(t('notifications.goalCreated'));
            queryClient.invalidateQueries({ queryKey: ['goals'] });
            setShowGoalForm(false);
            goalForm.reset();
        },
        onError: (error) => toast.error(error.message)
    });

    const updateGoalMutation = useMutation({
        mutationFn: ({ id, data }) => updateGoal(id, data),
        onSuccess: () => {
            toast.success(t('notifications.goalUpdated'));
            queryClient.invalidateQueries({ queryKey: ['goals'] });
            setEditingGoal(null);
            goalForm.reset();
        },
        onError: (error) => toast.error(error.message)
    });

    const deleteGoalMutation = useMutation({
        mutationFn: deleteGoal,
        onSuccess: () => {
            toast.success(t('notifications.goalDeleted'));
            queryClient.invalidateQueries({ queryKey: ['goals'] });
        },
        onError: (error) => toast.error(error.message)
    });

    const addSavingsMutation = useMutation({
        mutationFn: ({ id, amount }) => addToGoal(id, amount),
        onSuccess: () => {
            toast.success(t('notifications.savingsAdded'));
            queryClient.invalidateQueries({ queryKey: ['goals'] });
            setShowSavingsForm(false);
            savingsForm.reset();
        },
        onError: (error) => toast.error(error.message)
    });

    const goalForm = useForm({
        defaultValues: {
            name: '',
            targetAmount: '',
            savedAmount: '',
            deadline: '',
            color: '#3B82F6'
        }
    });

    const savingsForm = useForm({
        defaultValues: {
            amount: ''
        }
    });

    // Helper function to safely convert to number
    const safeNumber = (value) => {
        if (value === null || value === undefined) return 0;
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
    };

    // Helper function to safely format numbers
    const formatCurrency = (value) => {
        const numValue = safeNumber(value);
        return numValue.toFixed(2);
    };

    // Helper function to get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    // Helper function to get minimum date (tomorrow)
    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const goalsData = useMemo(() => {
        return goals.map(goal => {
            // Ensure amounts are numbers using safeNumber
            const targetAmount = safeNumber(goal.targetAmount);
            const savedAmount = safeNumber(goal.savedAmount);
            
            const progress = targetAmount > 0 ? (savedAmount / targetAmount) * 100 : 0;
            const remaining = targetAmount - savedAmount;
            
            // Calculate status
            const now = new Date();
            const deadline = goal.deadline ? new Date(goal.deadline) : null;
            const isOverdue = deadline && deadline < now && progress < 100;
            const isCompleted = progress >= 100;
            
            return {
                ...goal,
                targetAmount,
                savedAmount,
                progress,
                remaining,
                isOverdue,
                isCompleted,
                // Add formatted versions for display
                formattedTarget: formatCurrency(targetAmount),
                formattedSaved: formatCurrency(savedAmount),
                formattedRemaining: formatCurrency(remaining)
            };
        });
    }, [goals]);

    const onSubmitGoal = (data) => {
        // Validate deadline is in the future
        const deadline = new Date(data.deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time part for accurate date comparison

        if (deadline <= today) {
            toast.error('Deadline must be in the future');
            return;
        }

        const goalData = {
            ...data,
            targetAmount: safeNumber(data.targetAmount),
            savedAmount: safeNumber(data.savedAmount || 0)
        };

        if (editingGoal) {
            updateGoalMutation.mutate({
                id: editingGoal.id,
                data: goalData
            });
        } else {
            createGoalMutation.mutate(goalData);
        }
    };

    const onSubmitSavings = (data) => {
        if (selectedGoal) {
            addSavingsMutation.mutate({
                id: selectedGoal.id,
                amount: safeNumber(data.amount)
            });
        }
    };

    const handleEdit = (goal) => {
        setEditingGoal(goal);
        goalForm.reset({
            name: goal.name,
            targetAmount: goal.targetAmount,
            savedAmount: goal.savedAmount,
            deadline: goal.deadline ? goal.deadline.split('T')[0] : '',
            color: goal.color || '#3B82F6'
        });
        setShowGoalForm(true);
    };

    const handleAddSavings = (goal) => {
        setSelectedGoal(goal);
        savingsForm.reset({ amount: '' });
        setShowSavingsForm(true);
    };

    const handleCancel = () => {
        setShowGoalForm(false);
        setShowSavingsForm(false);
        setEditingGoal(null);
        setSelectedGoal(null);
        goalForm.reset();
        savingsForm.reset();
    };

    const getStatusColor = (goal) => {
        if (goal.isCompleted) return 'text-green-600';
        if (goal.isOverdue) return 'text-red-600';
        return 'text-blue-600';
    };

    const getStatusText = (goal) => {
        if (goal.isCompleted) return t('goals.completed');
        if (goal.isOverdue) return t('goals.overdue');
        return t('goals.inProgress');
    };

    // Safe calculations with fallbacks
    const totalGoals = goalsData.length;
    const totalTarget = goalsData.reduce((acc, goal) => acc + safeNumber(goal.targetAmount), 0);
    const totalSaved = goalsData.reduce((acc, goal) => acc + safeNumber(goal.savedAmount), 0);
    const completionRate = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    const chartData = {
        labels: goalsData.map(goal => goal.name),
        datasets: [
            {
                label: t('goals.savedAmount'),
                data: goalsData.map(goal => safeNumber(goal.savedAmount)),
                backgroundColor: goalsData.map(goal => goal.color || '#3B82F6'),
                borderWidth: 2,
                borderColor: '#ffffff',
            }
        ]
    };

    const progressChartData = {
        labels: goalsData.map(goal => goal.name),
        datasets: [
            {
                label: t('goals.targetAmount'),
                data: goalsData.map(goal => safeNumber(goal.targetAmount)),
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 2,
            },
            {
                label: t('goals.savedAmount'),
                data: goalsData.map(goal => safeNumber(goal.savedAmount)),
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                borderColor: 'rgb(34, 197, 94)',
                borderWidth: 2,
            }
        ]
    };

    const colors = [
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
        '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ];

    if (goalsLoading) {
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
                    <h1 className="text-3xl font-bold text-gray-900">{t('goals.title')}</h1>
                    <p className="text-gray-600 mt-2">{t('goals.description')}</p>
                </div>
                <button
                    onClick={() => setShowGoalForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                    <Plus size={20} />
                    {t('goals.newGoal')}
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">{t('goals.totalGoals')}</p>
                            <p className="text-2xl font-bold text-gray-900">{totalGoals}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Target className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">{t('goals.totalTarget')}</p>
                            <p className="text-2xl font-bold text-gray-900">${formatCurrency(totalTarget)}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <TrendingUp className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">{t('goals.totalSaved')}</p>
                            <p className="text-2xl font-bold text-blue-600">${formatCurrency(totalSaved)}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <PiggyBank className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">{t('goals.completionRate')}</p>
                            <p className="text-2xl font-bold text-green-600">{completionRate.toFixed(1)}%</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Target className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Goal Form Modal */}
            {(showGoalForm || editingGoal) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            {editingGoal ? t('common.edit') : t('goals.newGoal')}
                        </h3>
                        <form onSubmit={goalForm.handleSubmit(onSubmitGoal)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('goals.goalName')} *
                                </label>
                                <input
                                    {...goalForm.register('name', { required: true })}
                                    placeholder={t('goals.goalName')}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('goals.targetAmount')} *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    {...goalForm.register('targetAmount', { required: true })}
                                    placeholder="0.00"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('goals.savedAmount')}
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...goalForm.register('savedAmount')}
                                    placeholder="0.00"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('goals.deadline')} *
                                </label>
                                <input
                                    type="date"
                                    min={getMinDate()}
                                    {...goalForm.register('deadline', { required: true })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Deadline must be in the future
                                </p>
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
                                            onClick={() => goalForm.setValue('color', color)}
                                            className={`w-8 h-8 rounded-full border-2 ${
                                                goalForm.watch('color') === color ? 'border-gray-800' : 'border-gray-300'
                                            }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={createGoalMutation.isPending || updateGoalMutation.isPending}
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 font-semibold"
                                >
                                    {createGoalMutation.isPending || updateGoalMutation.isPending ? (
                                        <Loader2 className="animate-spin mx-auto" size={20} />
                                    ) : editingGoal ? (
                                        t('common.save')
                                    ) : (
                                        t('goals.newGoal')
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

            {/* Add Savings Modal */}
            {showSavingsForm && selectedGoal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            {t('goals.addSavings')} - {selectedGoal.name}
                        </h3>
                        <form onSubmit={savingsForm.handleSubmit(onSubmitSavings)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('goals.savedAmount')} *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max={selectedGoal.remaining}
                                    {...savingsForm.register('amount', { required: true })}
                                    placeholder="0.00"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    {t('goals.remaining')}: ${selectedGoal.formattedRemaining}
                                </p>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={addSavingsMutation.isPending}
                                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-green-300 font-semibold"
                                >
                                    {addSavingsMutation.isPending ? (
                                        <Loader2 className="animate-spin mx-auto" size={20} />
                                    ) : (
                                        t('goals.addSavings')
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
            {goalsData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">{t('goals.savingsDistribution')}</h3>
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
                        <h3 className="text-lg font-bold text-gray-900 mb-6">{t('goals.targetVsSaved')}</h3>
                        <div className="h-80">
                            <Bar
                                data={progressChartData}
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

            {/* Goals List */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">{t('goals.title')}</h3>
                </div>
                <div className="divide-y divide-gray-200">
                    {goalsData.map((goal) => (
                        <div key={goal.id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                    <div 
                                        className="w-4 h-4 rounded-full" 
                                        style={{ backgroundColor: goal.color || '#3B82F6' }}
                                    ></div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-semibold text-gray-900">{goal.name}</h4>
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(goal)} bg-opacity-10 ${goal.isCompleted ? 'bg-green-100' : goal.isOverdue ? 'bg-red-100' : 'bg-blue-100'}`}>
                                                {getStatusText(goal)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Target size={14} />
                                                <span>${goal.formattedSaved} of ${goal.formattedTarget}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                <span>{goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No deadline'}</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                            <div 
                                                className={`h-2 rounded-full ${
                                                    goal.isCompleted ? 'bg-green-500' :
                                                    goal.isOverdue ? 'bg-red-500' : 'bg-blue-500'
                                                }`}
                                                style={{ width: `${Math.min(goal.progress, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleAddSavings(goal)}
                                        disabled={goal.isCompleted}
                                        className="flex items-center gap-1 text-green-600 hover:text-green-700 p-2 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <PlusCircle size={16} />
                                        <span className="text-sm font-medium">{t('goals.addSavings')}</span>
                                    </button>
                                    <button
                                        onClick={() => handleEdit(goal)}
                                        className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => deleteGoalMutation.mutate(goal.id)}
                                        disabled={deleteGoalMutation.isPending}
                                        className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 disabled:opacity-50"
                                    >
                                        {deleteGoalMutation.isPending ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <Trash2 size={16} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {goalsData.length === 0 && (
                        <div className="p-12 text-center text-gray-500">
                            <Target size={48} className="mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium">{t('common.noRecords')}</p>
                            <p className="text-sm">{t('goals.description')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GoalsPage;