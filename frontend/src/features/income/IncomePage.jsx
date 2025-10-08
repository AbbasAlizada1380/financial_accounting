import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTransactions, addTransaction, deleteTransaction } from '../../api/transactionsApi';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Trash2, Loader2, Plus, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

const IncomePage = () => {
    const queryClient = useQueryClient();

    // Fetch income data
    const { data: response, isLoading, isError } = useQuery({
        queryKey: ['transactions', 'income'],
        queryFn: () => getTransactions('income'),
    });

    const incomes = response?.transactions || [];

    // Mutation for adding income
    const addIncomeMutation = useMutation({
        mutationFn: addTransaction,
        onSuccess: () => {
            toast.success('Income added successfully!');
            queryClient.invalidateQueries({ queryKey: ['transactions', 'income'] });
            reset();
        },
        onError: (error) => { 
            toast.error(error.response?.data?.message || 'Failed to add income'); 
        }
    });

    // Mutation for deleting income
    const deleteIncomeMutation = useMutation({
        mutationFn: deleteTransaction,
        onSuccess: () => {
            toast.success('Income deleted successfully!');
            queryClient.invalidateQueries({ queryKey: ['transactions', 'income'] });
        },
        onError: (error) => { 
            toast.error(error.response?.data?.message || 'Failed to delete income'); 
        }
    });

    const { register, handleSubmit, reset, setValue, watch } = useForm({
        defaultValues: {
            date: new Date()
        }
    });

    const onSubmit = (data) => {
        addIncomeMutation.mutate({ 
            ...data, 
            amount: parseFloat(data.amount), 
            type: 'income',
            date: data.date || new Date()
        });
    };

    const handleDateChange = (date) => {
        setValue('date', date);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Income Management</h1>
                    <p className="text-gray-600 mt-2">Track and manage your income sources</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                        ${incomes.reduce((acc, income) => acc + parseFloat(income.amount), 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">Total Income</p>
                </div>
            </div>

            {/* Add Income Form */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Plus size={24} />
                    Add New Income
                </h2>
                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <input 
                            {...register('description', { required: 'Description is required' })} 
                            placeholder="Salary, Freelance, Investment..." 
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                        <input 
                            type="number" 
                            step="0.01" 
                            {...register('amount', { 
                                required: 'Amount is required',
                                min: { value: 0.01, message: 'Amount must be greater than 0' }
                            })} 
                            placeholder="0.00" 
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Income History</h2>
                </div>
                
                {isLoading && (
                    <div className="flex justify-center items-center p-8">
                        <Loader2 size={32} className="animate-spin text-green-600" />
                    </div>
                )}
                
                {isError && (
                    <div className="p-8 text-center text-red-600">
                        <p>Error loading income data. Please try again.</p>
                    </div>
                )}

                {!isLoading && !isError && (
                    <div className="overflow-x-auto">
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
                                {incomes.length > 0 ? incomes.map((income) => (
                                    <tr key={income.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {format(new Date(income.date), 'MMM d, yyyy')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{income.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {income.category || 'Income'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-lg font-bold text-green-600">
                                                +${parseFloat(income.amount).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button 
                                                onClick={() => deleteIncomeMutation.mutate(income.id)}
                                                disabled={deleteIncomeMutation.isPending}
                                                className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center">
                                            <div className="text-gray-500">
                                                <Plus size={48} className="mx-auto mb-4 text-gray-300" />
                                                <p className="text-lg font-medium">No income records yet</p>
                                                <p className="text-sm">Add your first income to get started</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Info */}
                {response?.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-700">
                                Showing {incomes.length} of {response?.totalCount} records
                            </p>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 text-sm bg-gray-200 rounded disabled:opacity-50">
                                    Previous
                                </button>
                                <button className="px-3 py-1 text-sm bg-green-600 text-white rounded">
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IncomePage;