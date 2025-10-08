import apiClient from './apiClient';

export const getGoals = async () => {
    const { data } = await apiClient.get('/goals');
    return data;
};

export const createGoal = async (goalData) => {
    const { data } = await apiClient.post('/goals', goalData);
    return data;
};

export const updateGoal = async (id, goalData) => {
    const { data } = await apiClient.put(`/goals/${id}`, goalData);
    return data;
};

export const addToGoal = async (id, amount) => {
    const { data } = await apiClient.put(`/goals/${id}/add`, { amount });
    return data;
};

export const deleteGoal = async (id) => {
    await apiClient.delete(`/goals/${id}`);
    return id;
};

export const getGoalStats = async () => {
    const { data } = await apiClient.get('/goals/stats');
    return data;
};