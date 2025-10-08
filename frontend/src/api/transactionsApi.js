import apiClient from './apiClient';

/**
 * Get transactions with optional filtering
 * @param {string} type - 'income', 'expense', or 'all'
 * @param {object} filters - Additional filters (date range, search, etc.)
 */
export const getTransactions = async (type, filters = {}) => {
    try {
        const params = new URLSearchParams();
        
        if (type && type !== 'all') {
            params.append('type', type);
        }
        
        // Add additional filters
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.search) params.append('search', filters.search);
        if (filters.category) params.append('category', filters.category);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);

        const queryString = params.toString();
        const url = `/transactions${queryString ? `?${queryString}` : ''}`;
        
        const { data } = await apiClient.get(url);
        
        // Handle both response formats (array or paginated object)
        if (Array.isArray(data)) {
            return data; // Old format - direct array
        } else if (data && data.transactions) {
            return data.transactions; // New format - paginated response
        } else {
            console.warn('Unexpected response format:', data);
            return [];
        }
    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch transactions');
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

export const updateTransaction = async (id, transactionData) => {
    try {
        const { data } = await apiClient.put(`/transactions/${id}`, transactionData);
        return data;
    } catch (error) {
        console.error('Error updating transaction:', error);
        throw new Error(error.response?.data?.message || 'Failed to update transaction');
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

export const getTransactionStats = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        
        const queryString = params.toString();
        const url = `/transactions/stats${queryString ? `?${queryString}` : ''}`;
        
        const { data } = await apiClient.get(url);
        return data;
    } catch (error) {
        console.error('Error fetching transaction stats:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch transaction statistics');
    }
};