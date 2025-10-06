import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTransactions, addTransaction, deleteTransaction } from '../../api/transactionsApi';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Trash2, Loader2 } from 'lucide-react';

const ExpensesPage = () => {
    const queryClient = useQueryClient();

    const { data: expenses, isLoading, isError } = useQuery({
        queryKey: ['transactions', 'expense'],
        queryFn: () => getTransactions('expense'),
    });

    const addExpenseMutation = useMutation({
        mutationFn: addTransaction,
        onSuccess: () => {
            toast.success('Expense added successfully!');
            queryClient.invalidateQueries({ queryKey: ['transactions', 'expense'] });
            reset();
        },
        onError: (error) => toast.error(error.message)
    });

    const deleteExpenseMutation = useMutation({
        mutationFn: deleteTransaction,
        onSuccess: () => {
            toast.success('Expense deleted successfully!');
            queryClient.invalidateQueries({ queryKey: ['transactions', 'expense'] });
        },
        onError: (error) => toast.error(error.message)
    });

    const { register, handleSubmit, reset } = useForm();
    
    const onSubmit = (data) => {
        addExpenseMutation.mutate({ ...data, amount: parseFloat(data.amount), type: 'expense' });
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Expense Management</h1>
            
            {/* Form Section */}
            <div className="p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Add New Expense</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <input {...register('description', { required: true })} placeholder="Description" className="w-full px-3 py-2 border rounded" />
                    <input type="number" step="0.01" {...register('amount', { required: true })} placeholder="Amount" className="w-full px-3 py-2 border rounded" />
                    <button type="submit" disabled={addExpenseMutation.isPending} className="w-full md:w-auto bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:bg-red-300">
                        {addExpenseMutation.isPending ? 'Adding...' : 'Add Expense'}
                    </button>
                </form>
            </div>

            {/* Table Section */}
            <div className="p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Expense List</h2>
                {isLoading && <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>}
                {isError && <p className="text-red-500">Error fetching data.</p>}
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="py-2 px-4 text-left">Description</th>
                                <th className="py-2 px-4 text-left">Amount</th>
                                <th className="py-2 px-4 text-left">Date</th>
                                <th className="py-2 px-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses?.map(expense => (
                                <tr key={expense.id} className="border-b hover:bg-gray-50">
                                    <td className="py-2 px-4">{expense.description}</td>
                                    <td className="py-2 px-4 text-red-600 font-semibold">${expense.amount}</td>
                                    <td className="py-2 px-4">{new Date(expense.date).toLocaleDateString()}</td>
                                    <td className="py-2 px-4 text-center">
                                        <button onClick={() => deleteExpenseMutation.mutate(expense.id)} className="text-red-500 hover:text-red-700">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ExpensesPage;