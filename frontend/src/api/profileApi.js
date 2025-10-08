import apiClient from './apiClient';

export const getProfile = async () => {
    const { data } = await apiClient.get('/profile/me');
    return data;
};

// برای آپلود فایل باید از FormData استفاده کنیم
export const updateProfile = async (formData) => {
    const { data } = await apiClient.put('/profile/me', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return data;
};

export const changePassword = async (passwords) => {
    const { data } = await apiClient.put('/profile/change-password', passwords);
    return data;
};