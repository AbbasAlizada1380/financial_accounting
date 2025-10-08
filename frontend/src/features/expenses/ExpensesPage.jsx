import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTransactions, addTransaction, deleteTransaction } from '../../api/transactionsApi';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';
import { Trash2, Loader2, Plus, Calendar, Tag, RefreshCw } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

const ExpensesPage = () => {
    const queryClient = useQueryClient();
    const { t, currentLanguage } = useLanguage();

    // Fetch expense data with debugging
    const { 
        data: expenses = [], 
        isLoading, 
        isError,
        error,
        refetch 
    } = useQuery({
        queryKey: ['transactions', 'expense'],
        queryFn: () => getTransactions('expense'),
        retry: 2,
    });

    // Debug: Log the data
    useEffect(() => {
        console.log('Expense data:', expenses);
        console.log('Is loading:', isLoading);
        console.log('Is error:', isError);
        console.log('Error:', error);
    }, [expenses, isLoading, isError, error]);

    // Mutation for adding expense
    const addExpenseMutation = useMutation({
        mutationFn: addTransaction,
        onSuccess: (newTransaction) => {
            console.log('Added expense:', newTransaction);
            toast.success(t('notifications.expenseAdded'));
            
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['transactions', 'expense'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            
            reset();
        },
        onError: (error) => { 
            console.error('Add expense error:', error);
            toast.error(error.message || t('common.error')); 
        }
    });

    // Mutation for deleting expense
    const deleteExpenseMutation = useMutation({
        mutationFn: deleteTransaction,
        onSuccess: (deletedId) => {
            console.log('Deleted expense ID:', deletedId);
            toast.success(t('notifications.expenseDeleted'));
            
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['transactions', 'expense'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
        onError: (error) => { 
            console.error('Delete expense error:', error);
            toast.error(error.message || t('common.error')); 
        }
    });

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            date: new Date(),
            category: 'general'
        }
    });

    const onSubmit = (data) => {
        console.log('Submitting expense:', data);
        addExpenseMutation.mutate({ 
            description: data.description,
            amount: parseFloat(data.amount), 
            type: 'expense',
            date: data.date || new Date(),
            category: data.category || 'general'
        });
    };

    const handleDateChange = (date) => {
        setValue('date', date);
    };

    // Get expense categories based on current language
    const getExpenseCategories = () => {
        const categories = [
            { key: 'food', label: t('expenses.categories.food') },
            { key: 'transportation', label: t('expenses.categories.transportation') },
            { key: 'entertainment', label: t('expenses.categories.entertainment') },
            { key: 'shopping', label: t('expenses.categories.shopping') },
            { key: 'utilities', label: t('expenses.categories.utilities') },
            { key: 'healthcare', label: t('expenses.categories.healthcare') },
            { key: 'education', label: t('expenses.categories.education') },
            { key: 'travel', label: t('expenses.categories.travel') },
            { key: 'general', label: t('expenses.categories.general') }
        ];
        return categories;
    };

    const totalExpenses = Array.isArray(expenses) 
        ? expenses.reduce((acc, expense) => acc + parseFloat(expense?.amount || 0), 0)
        : 0;

    // RTL support for Persian
    const isRTL = currentLanguage === 'fa';
    const directionClass = isRTL ? 'rtl' : 'ltr';
    const textAlignClass = isRTL ? 'text-right' : 'text-left';

    return (
        <div className={`space-y-8 ${directionClass}`}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className={textAlignClass}>
                    <h1 className="text-3xl font-bold text-gray-900">{t('expenses.title')}</h1>
                    <p className="text-gray-600 mt-2">{t('expenses.description')}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className={`${textAlignClass}`}>
                        <p className="text-2xl font-bold text-red-600">
                            ${totalExpenses.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">{t('expenses.totalExpenses')}</p>
                    </div>
                    <button
                        onClick={() => refetch()}
                        disabled={isLoading}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title={t('common.refresh')}
                    >
                        <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Debug Info */}
            {process.env.NODE_ENV === 'development' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold">{t('expenses.debugInfo')}:</span>
                        <span>{t('common.records')}: {expenses.length}</span>
                        <span>{t('common.loading')}: {isLoading ? t('common.yes') : t('common.no')}</span>
                        <span>{t('common.error')}: {isError ? t('common.yes') : t('common.no')}</span>
                    </div>
                </div>
            )}

            {/* Add Expense Form */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Plus size={24} />
                    {t('expenses.addNew')}
                </h2>
                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className={isRTL ? 'md:col-start-5' : ''}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('common.description')} *
                            {errors.description && (
                                <span className="text-red-600 text-xs ml-2">{errors.description.message}</span>
                            )}
                        </label>
                        <input 
                            {...register('description', { 
                                required: t('validation.required'),
                                minLength: { value: 2, message: t('validation.minLength', { min: 2 }) }
                            })} 
                            placeholder={t('expenses.descriptionPlaceholder')} 
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                                errors.description ? 'border-red-500' : 'border-gray-300'
                            } ${isRTL ? 'text-right' : 'text-left'}`}
                            dir={isRTL ? 'rtl' : 'ltr'}
                        />
                    </div>
                    <div className={isRTL ? 'md:col-start-4' : ''}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('expenses.amount')} *
                            {errors.amount && (
                                <span className="text-red-600 text-xs ml-2">{errors.amount.message}</span>
                            )}
                        </label>
                        <input 
                            type="number" 
                            step="0.01" 
                            min="0.01"
                            {...register('amount', { 
                                required: t('validation.required'),
                                min: { value: 0.01, message: t('validation.positiveNumber') },
                                validate: value => parseFloat(value) > 0 || t('validation.positiveNumber')
                            })} 
                            placeholder="0.00" 
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                                errors.amount ? 'border-red-500' : 'border-gray-300'
                            } ${isRTL ? 'text-right' : 'text-left'}`}
                            dir={isRTL ? 'rtl' : 'ltr'}
                        />
                    </div>
                    <div className={isRTL ? 'md:col-start-3' : ''}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('expenses.category')}</label>
                        <div className="relative">
                            <Tag className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400`} size={20} />
                            <select
                                {...register('category')}
                                className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors appearance-none bg-white ${isRTL ? 'text-right' : 'text-left'}`}
                                dir={isRTL ? 'rtl' : 'ltr'}
                            >
                                {getExpenseCategories().map(category => (
                                    <option key={category.key} value={category.key}>{category.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className={isRTL ? 'md:col-start-2' : ''}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('expenses.date')}</label>
                        <div className="relative">
                            <Calendar className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400`} size={20} />
                            <DatePicker
                                selected={watch('date')}
                                onChange={handleDateChange}
                                className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${isRTL ? 'text-right' : 'text-left'}`}
                                dateFormat="MMM d, yyyy"
                                popperPlacement={isRTL ? 'bottom-end' : 'bottom-start'}
                            />
                        </div>
                    </div>
                    <div className={isRTL ? 'md:col-start-1' : ''}>
                        <button 
                            type="submit" 
                            disabled={addExpenseMutation.isPending}
                            className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:bg-red-300 transition-colors font-semibold"
                        >
                            {addExpenseMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                            {addExpenseMutation.isPending ? t('common.adding') : t('expenses.addNew')}
                        </button>
                    </div>
                </form>
            </div>

            {/* Expense List */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">{t('expenses.history')}</h2>
                    <div className="text-sm text-gray-500">
                        {expenses.length} {t('expenses.records')}
                    </div>
                </div>
                
                {isLoading && (
                    <div className="flex justify-center items-center p-12">
                        <Loader2 size={40} className="animate-spin text-red-600" />
                    </div>
                )}
                
                {isError && (
                    <div className="p-8 text-center">
                        <div className="text-red-600 mb-4">
                            <p className="font-semibold">{t('common.error')} {t('common.loading')} {t('expenses.title')}</p>
                            <p className="text-sm text-gray-600 mt-1">{error?.message || t('common.tryAgain')}</p>
                        </div>
                        <button
                            onClick={() => refetch()}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold"
                        >
                            {t('common.retry')}
                        </button>
                    </div>
                )}

                {!isLoading && !isError && (
                    <div className="overflow-x-auto">
                        {expenses.length > 0 ? (
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className={`px-6 py-3 ${textAlignClass} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                            {t('expenses.date')}
                                        </th>
                                        <th className={`px-6 py-3 ${textAlignClass} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                            {t('common.description')}
                                        </th>
                                        <th className={`px-6 py-3 ${textAlignClass} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                            {t('expenses.category')}
                                        </th>
                                        <th className={`px-6 py-3 ${textAlignClass} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                            {t('expenses.amount')}
                                        </th>
                                        <th className={`px-6 py-3 ${textAlignClass} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                            {t('common.actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {expenses.map((expense) => (
                                        <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${textAlignClass}`}>
                                                {expense.date ? format(new Date(expense.date), 'MMM d, yyyy') : t('common.noDate')}
                                            </td>
                                            <td className={`px-6 py-4 ${textAlignClass}`}>
                                                <div className="text-sm font-medium text-gray-900">{expense.description || t('common.noDescription')}</div>
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap ${textAlignClass}`}>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    {getExpenseCategories().find(cat => cat.key === expense.category)?.label || t('expenses.categories.general')}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap ${textAlignClass}`}>
                                                <span className="text-lg font-bold text-red-600">
                                                    -${parseFloat(expense.amount || 0).toFixed(2)}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${textAlignClass}`}>
                                                <button 
                                                    onClick={() => {
                                                        console.log('Deleting expense ID:', expense.id);
                                                        deleteExpenseMutation.mutate(expense.id);
                                                    }}
                                                    disabled={deleteExpenseMutation.isPending}
                                                    className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                                                    title={t('common.delete')}
                                                >
                                                    {deleteExpenseMutation.isPending ? (
                                                        <Loader2 size={18} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={18} />
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-12 text-center">
                                <div className="text-gray-500">
                                    <Plus size={48} className="mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg font-medium">{t('expenses.noRecords')}</p>
                                    <p className="text-sm">{t('expenses.addFirst')}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpensesPage;