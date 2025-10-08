import apiClient from './apiClient';

export const getBudgets = async () => {
    const { data } = await apiClient.get('/budgets');
    return data;
};

export const createBudget = async (budgetData) => {
    const { data } = await apiClient.post('/budgets', budgetData);
    return data;
};

export const updateBudget = async (id, budgetData) => {
    const { data } = await apiClient.put(`/budgets/${id}`, budgetData);
    return data;
};

export const deleteBudget = async (id) => {
    await apiClient.delete(`/budgets/${id}`);
    return id;
};

export const getBudgetStats = async () => {
    const { data } = await apiClient.get('/budgets/stats');
    return data;
};