import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTransactions, addTransaction, deleteTransaction } from '../../api/transactionsApi';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Trash2, Loader2 } from 'lucide-react';

const IncomePage = () => {
    const queryClient = useQueryClient();

    // 1. Fetching data with useQuery
    const { data: incomes, isLoading, isError } = useQuery({
        queryKey: ['transactions', 'income'],
        queryFn: () => getTransactions('income'),
    });

    // 2. Mutation for adding data
    const addIncomeMutation = useMutation({
        mutationFn: addTransaction,
        onSuccess: () => {
            toast.success('Income added successfully!');
            queryClient.invalidateQueries({ queryKey: ['transactions', 'income'] }); // Refetch data
            reset(); // Reset form
        },
        onError: (error) => { toast.error(error.message); }
    });

    // 3. Mutation for deleting data
    const deleteIncomeMutation = useMutation({
        mutationFn: deleteTransaction,
        onSuccess: () => {
            toast.success('Income deleted successfully!');
            queryClient.invalidateQueries({ queryKey: ['transactions', 'income'] });
        },
        onError: (error) => { toast.error(error.message); }
    });

    const { register, handleSubmit, reset } = useForm();
    
    const onSubmit = (data) => {
        addIncomeMutation.mutate({ ...data, amount: parseFloat(data.amount), type: 'income' });
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Income Management</h1>
            
            {/* Form Section */}
            <div className="p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Add New Income</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <input {...register('description', { required: true })} placeholder="Description" className="w-full px-3 py-2 border rounded" />
                    <input type="number" step="0.01" {...register('amount', { required: true })} placeholder="Amount" className="w-full px-3 py-2 border rounded" />
                    <button type="submit" disabled={addIncomeMutation.isPending} className="w-full md:w-auto bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:bg-green-300">
                        {addIncomeMutation.isPending ? 'Adding...' : 'Add Income'}
                    </button>
                </form>
            </div>

            {/* Table Section */}
            <div className="p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Income List</h2>
                {isLoading && <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>}
                {isError && <p className="text-red-500">Error fetching data.</p>}
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="py-2 px-4">Description</th>
                                <th className="py-2 px-4">Amount</th>
                                <th className="py-2 px-4">Date</th>
                                <th className="py-2 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {incomes?.map(income => (
                                <tr key={income.id} className="border-b hover:bg-gray-50">
                                    <td className="py-2 px-4">{income.description}</td>
                                    <td className="py-2 px-4 text-green-600 font-semibold">${income.amount}</td>
                                    <td className="py-2 px-4">{new Date(income.date).toLocaleDateString()}</td>
                                    <td className="py-2 px-4">
                                        <button onClick={() => deleteIncomeMutation.mutate(income.id)} className="text-red-500 hover:text-red-700">
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

export default IncomePage;