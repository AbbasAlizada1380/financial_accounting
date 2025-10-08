import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Plus, Target, Calendar, DollarSign, TrendingUp, CheckCircle, Clock, Award } from 'lucide-react';

const GoalsPage = () => {
    const [goals, setGoals] = useState([
        {
            id: 1,
            name: 'New Laptop',
            targetAmount: 1500,
            savedAmount: 850,
            deadline: '2024-06-30',
            category: 'Electronics',
            color: '#3B82F6',
            completed: false
        },
        {
            id: 2,
            name: 'Vacation to Europe',
            targetAmount: 5000,
            savedAmount: 3200,
            deadline: '2024-12-31',
            category: 'Travel',
            color: '#10B981',
            completed: false
        },
        {
            id: 3,
            name: 'Emergency Fund',
            targetAmount: 10000,
            savedAmount: 7500,
            deadline: '2024-08-31',
            category: 'Savings',
            color: '#F59E0B',
            completed: false
        }
    ]);

    const [showGoalForm, setShowGoalForm] = useState(false);
    const goalForm = useForm();

    const addGoal = (data) => {
        const newGoal = {
            id: Date.now(),
            name: data.name,
            targetAmount: parseFloat(data.targetAmount),
            savedAmount: 0,
            deadline: data.deadline,
            category: data.category,
            color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
            completed: false
        };
        setGoals([...goals, newGoal]);
        setShowGoalForm(false);
        goalForm.reset();
        toast.success('Goal created successfully!');
    };

    const addToSavings = (goalId, amount) => {
        setGoals(goals.map(goal => {
            if (goal.id === goalId) {
                const newSavedAmount = goal.savedAmount + parseFloat(amount);
                const completed = newSavedAmount >= goal.targetAmount;
                if (completed && !goal.completed) {
                    toast.success(`Congratulations! You've reached your goal: ${goal.name}`);
                }
                return { ...goal, savedAmount: newSavedAmount, completed };
            }
            return goal;
        }));
    };

    const deleteGoal = (goalId) => {
        setGoals(goals.filter(goal => goal.id !== goalId));
        toast.success('Goal deleted!');
    };

    const totalTarget = goals.reduce((acc, goal) => acc + goal.targetAmount, 0);
    const totalSaved = goals.reduce((acc, goal) => acc + goal.savedAmount, 0);
    const completionRate = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    const getDaysUntilDeadline = (deadline) => {
        const today = new Date();
        const targetDate = new Date(deadline);
        const diffTime = targetDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Financial Goals</h1>
                    <p className="text-gray-600 mt-2">Track your savings goals and financial milestones</p>
                </div>
                <button
                    onClick={() => setShowGoalForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                    <Plus size={20} />
                    New Goal
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Goals</p>
                            <p className="text-2xl font-bold text-gray-900">{goals.length}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Target className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Target</p>
                            <p className="text-2xl font-bold text-gray-900">${totalTarget.toFixed(2)}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <DollarSign className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Saved</p>
                            <p className="text-2xl font-bold text-blue-600">${totalSaved.toFixed(2)}</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <TrendingUp className="text-purple-600" size={24} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Completion</p>
                            <p className="text-2xl font-bold text-green-600">{completionRate.toFixed(1)}%</p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <Award className="text-yellow-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Goal Form Modal */}
            {showGoalForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Goal</h3>
                        <form onSubmit={goalForm.handleSubmit(addGoal)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Name</label>
                                <input
                                    {...goalForm.register('name', { required: true })}
                                    placeholder="e.g., New Car, Vacation"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Target Amount</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...goalForm.register('targetAmount', { required: true })}
                                    placeholder="0.00"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select
                                    {...goalForm.register('category', { required: true })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="Savings">Savings</option>
                                    <option value="Travel">Travel</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Home">Home</option>
                                    <option value="Vehicle">Vehicle</option>
                                    <option value="Education">Education</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Target Date</label>
                                <input
                                    type="date"
                                    {...goalForm.register('deadline', { required: true })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold"
                                >
                                    Create Goal
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowGoalForm(false)}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 font-semibold"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Goals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map((goal) => {
                    const progress = (goal.savedAmount / goal.targetAmount) * 100;
                    const daysLeft = getDaysUntilDeadline(goal.deadline);
                    const isOverdue = daysLeft < 0;
                    
                    return (
                        <div key={goal.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div 
                                className="h-2"
                                style={{ backgroundColor: goal.color }}
                            ></div>
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">{goal.name}</h3>
                                        <p className="text-sm text-gray-500">{goal.category}</p>
                                    </div>
                                    {goal.completed ? (
                                        <CheckCircle className="text-green-500" size={24} />
                                    ) : (
                                        <Clock className="text-blue-500" size={24} />
                                    )}
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                                            <span>Progress</span>
                                            <span>{progress.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="h-2 rounded-full transition-all duration-300"
                                                style={{ 
                                                    width: `${Math.min(progress, 100)}%`,
                                                    backgroundColor: goal.color
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500">Saved</p>
                                            <p className="font-semibold text-gray-900">${goal.savedAmount.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Target</p>
                                            <p className="font-semibold text-gray-900">${goal.targetAmount.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-1 text-gray-500">
                                            <Calendar size={14} />
                                            <span>{isOverdue ? 'Overdue' : `${daysLeft} days left`}</span>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            goal.completed 
                                                ? 'bg-green-100 text-green-800'
                                                : isOverdue
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {goal.completed ? 'Completed' : isOverdue ? 'Overdue' : 'In Progress'}
                                        </span>
                                    </div>
                                    
                                    {!goal.completed && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    const amount = prompt('How much to add?');
                                                    if (amount && !isNaN(amount)) {
                                                        addToSavings(goal.id, amount);
                                                    }
                                                }}
                                                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold"
                                            >
                                                Add Savings
                                            </button>
                                            <button
                                                onClick={() => deleteGoal(goal.id)}
                                                className="px-3 py-2 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                
                {goals.length === 0 && (
                    <div className="col-span-3 text-center py-12">
                        <Target size={64} className="mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No goals yet</h3>
                        <p className="text-gray-500 mb-4">Start by creating your first financial goal</p>
                        <button
                            onClick={() => setShowGoalForm(true)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold"
                        >
                            Create Your First Goal
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GoalsPage;