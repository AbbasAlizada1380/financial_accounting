import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, updateUserStatus } from '../../api/usersApi';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const UserManagementPage = () => {
    const queryClient = useQueryClient();

    const { data: users, isLoading, isError } = useQuery({
        queryKey: ['users'],
        queryFn: getUsers,
    });

    const mutation = useMutation({
        mutationFn: updateUserStatus,
        onSuccess: () => {
            toast.success("User status updated successfully!");
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to update status.");
        }
    });

    const handleStatusChange = (userId, newStatus) => {
        mutation.mutate({ userId, status: newStatus });
    };

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" size={40} /></div>;
    if (isError) return <p className="text-red-500">Error fetching users.</p>;

    const statusStyles = {
        active: "bg-green-100 text-green-800",
        pending_activation: "bg-yellow-100 text-yellow-800",
        deactivated: "bg-red-100 text-red-800",
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users?.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.firstName} {user.lastName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[user.accountStatus]}`}>
                                            {user.accountStatus.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <select
                                            onChange={(e) => handleStatusChange(user.id, e.target.value)}
                                            defaultValue={user.accountStatus}
                                            className="border rounded-md p-1"
                                            disabled={mutation.isLoading}
                                        >
                                            <option value="active">Active</option>
                                            <option value="pending_activation">Pending</option>
                                            <option value="deactivated">Deactivated</option>
                                        </select>
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

export default UserManagementPage;