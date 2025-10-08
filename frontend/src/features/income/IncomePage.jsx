import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTransactions, addTransaction, deleteTransaction } from '../../api/transactionsApi';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Trash2, Loader2, Plus, Calendar, RefreshCw } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

const IncomePage = () => {
    const queryClient = useQueryClient();

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
            toast.success('Income added successfully!');
            
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['transactions', 'income'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
            
            reset();
        },
        onError: (error) => { 
            console.error('Add income error:', error);
            toast.error(error.message || 'Failed to add income'); 
        }
    });

    // Mutation for deleting income
    const deleteIncomeMutation = useMutation({
        mutationFn: deleteTransaction,
        onSuccess: (deletedId) => {
            console.log('Deleted transaction ID:', deletedId);
            toast.success('Income deleted successfully!');
            
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['transactions', 'income'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
        onError: (error) => { 
            console.error('Delete income error:', error);
            toast.error(error.message || 'Failed to delete income'); 
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

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Income Management</h1>
                    <p className="text-gray-600 mt-2">Track and manage your income sources</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                            ${totalIncome.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">Total Income</p>
                    </div>
                    <button
                        onClick={() => refetch()}
                        disabled={isLoading}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Refresh data"
                    >
                        <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Debug Info */}
            {process.env.NODE_ENV === 'development' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold">Debug Info:</span>
                        <span>Records: {incomes.length}</span>
                        <span>Loading: {isLoading ? 'Yes' : 'No'}</span>
                        <span>Error: {isError ? 'Yes' : 'No'}</span>
                    </div>
                </div>
            )}

            {/* Add Income Form */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Plus size={24} />
                    Add New Income
                </h2>
                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                            {errors.description && (
                                <span className="text-red-600 text-xs ml-2">{errors.description.message}</span>
                            )}
                        </label>
                        <input 
                            {...register('description', { 
                                required: 'Description is required',
                                minLength: { value: 2, message: 'Description must be at least 2 characters' }
                            })} 
                            placeholder="Salary, Freelance, Investment..." 
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                                errors.description ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amount *
                            {errors.amount && (
                                <span className="text-red-600 text-xs ml-2">{errors.amount.message}</span>
                            )}
                        </label>
                        <input 
                            type="number" 
                            step="0.01" 
                            min="0.01"
                            {...register('amount', { 
                                required: 'Amount is required',
                                min: { value: 0.01, message: 'Amount must be greater than 0' },
                                validate: value => parseFloat(value) > 0 || 'Amount must be positive'
                            })} 
                            placeholder="0.00" 
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                                errors.amount ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <DatePicker
                                selected={watch('date')}
                                onChange={handleDateChange}
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                dateFormat="MMM d, yyyy"
                            />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={addIncomeMutation.isPending}
                        className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-green-300 transition-colors font-semibold"
                    >
                        {addIncomeMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                        {addIncomeMutation.isPending ? 'Adding...' : 'Add Income'}
                    </button>
                </form>
            </div>

            {/* Income List */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Income History</h2>
                    <div className="text-sm text-gray-500">
                        {incomes.length} record(s)
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
                            <p className="font-semibold">Error loading income data</p>
                            <p className="text-sm text-gray-600 mt-1">{error?.message || 'Please try again'}</p>
                        </div>
                        <button
                            onClick={() => refetch()}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!isLoading && !isError && (
                    <div className="overflow-x-auto">
                        {incomes.length > 0 ? (
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {incomes.map((income) => (
                                        <tr key={income.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {income.date ? format(new Date(income.date), 'MMM d, yyyy') : 'No date'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{income.description || 'No description'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {income.category || 'Income'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-lg font-bold text-green-600">
                                                    +${parseFloat(income.amount || 0).toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button 
                                                    onClick={() => {
                                                        console.log('Deleting income ID:', income.id);
                                                        deleteIncomeMutation.mutate(income.id);
                                                    }}
                                                    disabled={deleteIncomeMutation.isPending}
                                                    className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                                                    title="Delete income"
                                                >
                                                    <Trash2 size={18} />
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
                                    <p className="text-lg font-medium">No income records yet</p>
                                    <p className="text-sm">Add your first income using the form above</p>
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