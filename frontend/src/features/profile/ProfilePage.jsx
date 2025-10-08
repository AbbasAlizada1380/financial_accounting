import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile, changePassword } from '../../api/profileApi';
import { useForm } from 'react-hook-form';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from 'react-hot-toast';
import { Loader2, Edit, Save, ShieldCheck, Camera, User, Mail, Calendar } from 'lucide-react';

const API_URL = 'http://localhost:5000';

const ProfilePage = () => {
    const queryClient = useQueryClient();
    const { t, currentLanguage } = useLanguage();
    const [photoPreview, setPhotoPreview] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');

    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: getProfile,
    });

    const updateMutation = useMutation({
        mutationFn: updateProfile,
        onSuccess: (data) => {
            toast.success(t('notifications.profileUpdated'));
            queryClient.setQueryData(['profile'], data);
            setPhotoPreview(null);
            infoForm.reset(data);
        },
        onError: (err) => toast.error(err.response?.data?.message || t('notifications.updateFailed')),
    });

    const passwordMutation = useMutation({
        mutationFn: changePassword,
        onSuccess: () => {
            toast.success(t('notifications.passwordChanged'));
            passwordForm.reset();
        },
        onError: (err) => toast.error(err.response?.data?.message || t('notifications.passwordChangeFailed')),
    });

    const infoForm = useForm();
    const passwordForm = useForm();

    const onInfoSubmit = (data) => {
        const formData = new FormData();
        formData.append('firstName', data.firstName);
        formData.append('lastName', data.lastName);
        if (data.photo && data.photo[0]) {
            formData.append('photo', data.photo[0]);
        }
        updateMutation.mutate(formData);
    };

    const onPasswordSubmit = (data) => {
        passwordMutation.mutate(data);
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    // RTL support for Persian
    const isRTL = currentLanguage === 'fa';
    const directionClass = isRTL ? 'rtl' : 'ltr';
    const textAlignClass = isRTL ? 'text-right' : 'text-left';

    if (isLoading) return (
        <div className="flex justify-center items-center h-64">
            <Loader2 size={48} className="animate-spin text-blue-600" />
        </div>
    );

    return (
        <div className={`max-w-4xl mx-auto space-y-8 ${directionClass}`}>
            {/* Header */}
            <div className={`text-center ${textAlignClass}`}>
                <h1 className="text-3xl font-bold text-gray-900">{t('profile.title')}</h1>
                <p className="text-gray-600 mt-2">{t('profile.description')}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                                activeTab === 'profile'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {t('profile.personalInfo')}
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                                activeTab === 'security'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {t('profile.security')}
                        </button>
                    </nav>
                </div>

                <div className="p-8">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Photo Section */}
                            <div className="lg:w-1/3">
                                <div className="text-center">
                                    <div className="relative inline-block">
                                        <img 
                                            src={photoPreview || `${API_URL}${profile.photoUrl}?key=${new Date().getTime()}`} 
                                            alt="Profile" 
                                            className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 shadow-lg"
                                        />
                                        <label htmlFor="photo-upload" className="absolute bottom-2 right-2 bg-blue-600 p-2 rounded-full text-white cursor-pointer hover:bg-blue-700 shadow-lg transition-colors">
                                            <Camera size={16} />
                                            <input 
                                                id="photo-upload" 
                                                type="file" 
                                                {...infoForm.register('photo')} 
                                                onChange={handlePhotoChange} 
                                                className="hidden" 
                                                accept="image/*"
                                            />
                                        </label>
                                    </div>
                                    <div className="mt-4">
                                        <h3 className="font-semibold text-gray-900">{profile.firstName} {profile.lastName}</h3>
                                        <p className="text-sm text-gray-500">{profile.email}</p>
                                        <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                                            <User size={12} />
                                            {profile.role}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form Section */}
                            <div className="lg:w-2/3">
                                <form onSubmit={infoForm.handleSubmit(onInfoSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.firstName')}</label>
                                            <input 
                                                {...infoForm.register('firstName')} 
                                                defaultValue={profile.firstName} 
                                                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isRTL ? 'text-right' : 'text-left'}`}
                                                dir={isRTL ? 'rtl' : 'ltr'}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.lastName')}</label>
                                            <input 
                                                {...infoForm.register('lastName')} 
                                                defaultValue={profile.lastName} 
                                                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isRTL ? 'text-right' : 'text-left'}`}
                                                dir={isRTL ? 'rtl' : 'ltr'}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.email')}</label>
                                        <div className="relative">
                                            <Mail size={20} className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400`} />
                                            <input 
                                                type="email" 
                                                value={profile.email} 
                                                readOnly 
                                                className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}
                                                dir={isRTL ? 'rtl' : 'ltr'}
                                            />
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">{t('profile.emailCannotChange')}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.accountStatus')}</label>
                                        <div className="relative">
                                            <Calendar size={20} className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400`} />
                                            <input 
                                                value={profile.accountStatus} 
                                                readOnly 
                                                className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed text-gray-500 capitalize ${isRTL ? 'text-right' : 'text-left'}`}
                                                dir={isRTL ? 'rtl' : 'ltr'}
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={updateMutation.isPending}
                                        className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors font-semibold"
                                    >
                                        {updateMutation.isPending ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                                        {t('common.save')} {t('common.changes')}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="max-w-md">
                            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.currentPassword')}</label>
                                    <input 
                                        type="password" 
                                        {...passwordForm.register('currentPassword', { required: true })} 
                                        placeholder={t('profile.enterCurrentPassword')}
                                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isRTL ? 'text-right' : 'text-left'}`}
                                        dir={isRTL ? 'rtl' : 'ltr'}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile.newPassword')}</label>
                                    <input 
                                        type="password" 
                                        {...passwordForm.register('newPassword', { required: true, minLength: 6 })} 
                                        placeholder={t('profile.enterNewPassword')}
                                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${isRTL ? 'text-right' : 'text-left'}`}
                                        dir={isRTL ? 'rtl' : 'ltr'}
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={passwordMutation.isPending}
                                    className="flex items-center gap-3 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors font-semibold"
                                >
                                    {passwordMutation.isPending ? <Loader2 className="animate-spin" /> : <ShieldCheck size={18} />}
                                    {t('profile.updatePassword')}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;