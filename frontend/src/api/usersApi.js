import apiClient from './apiClient';

export const getUsers = async () => {
    const { data } = await apiClient.get('/users');
    return data;
};

export const updateUserStatus = async ({ userId, status }) => {
    const { data } = await apiClient.put(`/users/${userId}/status`, { accountStatus: status });
    return data;
};