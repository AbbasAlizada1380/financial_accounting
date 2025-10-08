import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTransactions, addTransaction, deleteTransaction } from '../../api/transactionsApi';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';
import { Trash2, Loader2, Plus, Calendar, RefreshCw } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

const IncomePage = () => {
    const queryClient = useQueryClient();
    const { t, currentLanguage } = useLanguage();

    // Fetch income data with debugging
    const { 
        data: incomes = [], 
        isLoading, 
        isError,
        error,
        refetch 
    } = useQuery({
        queryKey: ['transactions', 'income'],
        queryFn: () => getTransactions('income'),
        retry: 2,
    });

    // Debug: Log the data
    useEffect(() => {
        console.log('Income data:', incomes);
        console.log('Is loading:', isLoading);
        console.log('Is error:', isError);
        console.log('Error:', error);
    }, [incomes, isLoading, isError, error]);

    // Mutation for adding income
    const addIncomeMutation = useMutation({
        mutationFn: addTransaction,
        onSuccess: (newTransaction) => {
            console.log('Added transaction:', newTransaction);
            toast.success(t('notifications.incomeAdded'));
            
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['transactions', 'income'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            
            reset();
        },
        onError: (error) => { 
            console.error('Add income error:', error);
            toast.error(error.message || t('common.error')); 
        }
    });

    // Mutation for deleting income
    const deleteIncomeMutation = useMutation({
        mutationFn: deleteTransaction,
        onSuccess: (deletedId) => {
            console.log('Deleted transaction ID:', deletedId);
            toast.success(t('notifications.incomeDeleted'));
            
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['transactions', 'income'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
        onError: (error) => { 
            console.error('Delete income error:', error);
            toast.error(error.message || t('common.error')); 
        }
    });

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
        defaultValues: {
            date: new Date(),
            category: 'Income'
        }
    });

    const onSubmit = (data) => {
        console.log('Submitting income:', data);
        addIncomeMutation.mutate({ 
            description: data.description,
            amount: parseFloat(data.amount), 
            type: 'income',
            date: data.date || new Date(),
            category: data.category || 'Income'
        });
    };

    const handleDateChange = (date) => {
        setValue('date', date);
    };

    const totalIncome = Array.isArray(incomes) 
        ? incomes.reduce((acc, income) => acc + parseFloat(income?.amount || 0), 0)
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
                    <h1 className="text-3xl font-bold text-gray-900">{t('income.title')}</h1>
                    <p className="text-gray-600 mt-2">{t('income.description')}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className={`${textAlignClass}`}>
                        <p className="text-2xl font-bold text-green-600">
                            ${totalIncome.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">{t('income.totalIncome')}</p>
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
                        <span className="font-semibold">{t('income.debugInfo')}:</span>
                        <span>{t('common.records')}: {incomes.length}</span>
                        <span>{t('common.loading')}: {isLoading ? t('common.yes') : t('common.no')}</span>
                        <span>{t('common.error')}: {isError ? t('common.yes') : t('common.no')}</span>
                    </div>
                </div>
            )}

            {/* Add Income Form */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Plus size={24} />
                    {t('income.addNew')}
                </h2>
                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className={isRTL ? 'md:col-start-4' : ''}>
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
                            placeholder={t('income.descriptionPlaceholder')} 
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                                errors.description ? 'border-red-500' : 'border-gray-300'
                            } ${isRTL ? 'text-right' : 'text-left'}`}
                            dir={isRTL ? 'rtl' : 'ltr'}
                        />
                    </div>
                    <div className={isRTL ? 'md:col-start-3' : ''}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('income.amount')} *
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
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                                errors.amount ? 'border-red-500' : 'border-gray-300'
                            } ${isRTL ? 'text-right' : 'text-left'}`}
                            dir={isRTL ? 'rtl' : 'ltr'}
                        />
                    </div>
                    <div className={isRTL ? 'md:col-start-2' : ''}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('income.date')}</label>
                        <div className="relative">
                            <Calendar className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400`} size={20} />
                            <DatePicker
                                selected={watch('date')}
                                onChange={handleDateChange}
                                className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${isRTL ? 'text-right' : 'text-left'}`}
                                dateFormat="MMM d, yyyy"
                                popperPlacement={isRTL ? 'bottom-end' : 'bottom-start'}
                            />
                        </div>
                    </div>
                    <div className={isRTL ? 'md:col-start-1' : ''}>
                        <button 
                            type="submit" 
                            disabled={addIncomeMutation.isPending}
                            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-green-300 transition-colors font-semibold"
                        >
                            {addIncomeMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                            {addIncomeMutation.isPending ? t('common.adding') : t('income.addNew')}
                        </button>
                    </div>
                </form>
            </div>

            {/* Income List */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">{t('income.history')}</h2>
                    <div className="text-sm text-gray-500">
                        {incomes.length} {t('income.records')}
                    </div>
                </div>
                
                {isLoading && (
                    <div className="flex justify-center items-center p-12">
                        <Loader2 size={40} className="animate-spin text-green-600" />
                    </div>
                )}
                
                {isError && (
                    <div className="p-8 text-center">
                        <div className="text-red-600 mb-4">
                            <p className="font-semibold">{t('common.error')} {t('common.loading')} {t('income.title')}</p>
                            <p className="text-sm text-gray-600 mt-1">{error?.message || t('common.tryAgain')}</p>
                        </div>
                        <button
                            onClick={() => refetch()}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold"
                        >
                            {t('common.retry')}
                        </button>
                    </div>
                )}

                {!isLoading && !isError && (
                    <div className="overflow-x-auto">
                        {incomes.length > 0 ? (
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className={`px-6 py-3 ${textAlignClass} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                            {t('income.date')}
                                        </th>
                                        <th className={`px-6 py-3 ${textAlignClass} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                            {t('common.description')}
                                        </th>
                                        <th className={`px-6 py-3 ${textAlignClass} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                            {t('income.category')}
                                        </th>
                                        <th className={`px-6 py-3 ${textAlignClass} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                            {t('income.amount')}
                                        </th>
                                        <th className={`px-6 py-3 ${textAlignClass} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                            {t('common.actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {incomes.map((income) => (
                                        <tr key={income.id} className="hover:bg-gray-50 transition-colors">
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${textAlignClass}`}>
                                                {income.date ? format(new Date(income.date), 'MMM d, yyyy') : t('common.noDate')}
                                            </td>
                                            <td className={`px-6 py-4 ${textAlignClass}`}>
                                                <div className="text-sm font-medium text-gray-900">{income.description || t('common.noDescription')}</div>
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap ${textAlignClass}`}>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {income.category || t('income.category')}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap ${textAlignClass}`}>
                                                <span className="text-lg font-bold text-green-600">
                                                    +${parseFloat(income.amount || 0).toFixed(2)}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${textAlignClass}`}>
                                                <button 
                                                    onClick={() => {
                                                        console.log('Deleting income ID:', income.id);
                                                        deleteIncomeMutation.mutate(income.id);
                                                    }}
                                                    disabled={deleteIncomeMutation.isPending}
                                                    className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                                                    title={t('common.delete')}
                                                >
                                                    {deleteIncomeMutation.isPending ? (
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
                                    <p className="text-lg font-medium">{t('income.noRecords')}</p>
                                    <p className="text-sm">{t('income.addFirst')}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default IncomePage;