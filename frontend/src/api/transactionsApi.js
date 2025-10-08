import apiClient from './apiClient';

export const getTransactions = async (type) => {
    try {
        const { data } = await apiClient.get('/transactions');
        
        // Validate response data
        if (!Array.isArray(data)) {
            console.warn('Invalid transactions data format:', data);
            return [];
        }

        // Filter by type if specified
        if (type === 'income' || type === 'expense') {
            return data.filter(tx => tx && tx.type === type);
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw new Error('Failed to fetch transactions');
    }
};

export const addTransaction = async (transactionData) => {
    try {
        const { data } = await apiClient.post('/transactions', transactionData);
        return data;
    } catch (error) {
        console.error('Error adding transaction:', error);
        throw new Error(error.response?.data?.message || 'Failed to add transaction');
    }
};

export const deleteTransaction = async (id) => {
    try {
        await apiClient.delete(`/transactions/${id}`);
        return id;
    } catch (error) {
        console.error('Error deleting transaction:', error);
        throw new Error(error.response?.data?.message || 'Failed to delete transaction');
    }
};