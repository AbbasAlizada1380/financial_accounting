import apiClient from './apiClient';

export const getTransactions = async (type) => {
    const { data } = await apiClient.get('/transactions');
    return data.filter(tx => tx.type === type);
};

export const addTransaction = async (transactionData) => {
    const { data } = await apiClient.post('/transactions', transactionData);
    return data;
};

export const deleteTransaction = async (id) => {
    await apiClient.delete(`/transactions/${id}`);
    return id;
};