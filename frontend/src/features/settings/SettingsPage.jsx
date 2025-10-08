import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';
import { Save, Bell, Shield, CreditCard, Globe, Database, Download, Upload, Languages, Calendar, Clock, DollarSign } from 'lucide-react';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [isLoading, setIsLoading] = useState(false);
    const { t, language, changeLanguage } = useLanguage();

    const generalForm = useForm({
        defaultValues: {
            currency: 'USD',
            dateFormat: 'MM/DD/YYYY',
            language: language,
            timezone: 'UTC'
        }
    });

    const notificationsForm = useForm({
        defaultValues: {
            emailNotifications: true,
            pushNotifications: false,
            monthlyReports: true,
            largeTransactions: true,
            budgetAlerts: true
        }
    });

    const securityForm = useForm({
        defaultValues: {
            twoFactorAuth: false,
            sessionTimeout: 30,
            loginAlerts: true
        }
    });

    const onGeneralSubmit = async (data) => {
        setIsLoading(true);
        // Update language if changed
        if (data.language !== language) {
            changeLanguage(data.language);
        }
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success(t('common.saved'));
        setIsLoading(false);
    };

    const onNotificationsSubmit = async (data) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success(t('common.saved'));
        setIsLoading(false);
    };

    const onSecuritySubmit = async (data) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success(t('common.saved'));
        setIsLoading(false);
    };

    const handleExportData = () => {
        toast.success(t('settings.exportStarted'));
    };

    const handleImportData = () => {
        toast.success(t('settings.importInstructions'));
    };

    const handleDeleteAccount = () => {
        if (window.confirm(t('settings.deleteConfirm'))) {
            toast.error(t('settings.deleteNotImplemented'));
        }
    };

    const tabs = [
        { id: 'general', name: t('settings.general'), icon: <Globe size={18} /> },
        { id: 'notifications', name: t('settings.notifications'), icon: <Bell size={18} /> },
        { id: 'security', name: t('settings.security'), icon: <Shield size={18} /> },
        { id: 'data', name: t('settings.data'), icon: <Database size={18} /> },
    ];

    const currencies = [
        { value: 'USD', label: 'US Dollar (USD)' },
        { value: 'EUR', label: 'Euro (EUR)' },
        { value: 'GBP', label: 'British Pound (GBP)' },
        { value: 'JPY', label: 'Japanese Yen (JPY)' },
        { value: 'IRR', label: 'Iranian Rial (IRR)' }
    ];

    const dateFormats = [
        { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
        { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
        { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
        { value: 'YYYY/MM/DD', label: 'YYYY/MM/DD' }
    ];

    const timezones = [
        { value: 'UTC', label: 'UTC' },
        { value: 'EST', label: 'Eastern Time (EST)' },
        { value: 'PST', label: 'Pacific Time (PST)' },
        { value: 'CET', label: 'Central European Time (CET)' },
        { value: 'IRT', label: 'Iran Time (IRT)' }
    ];

    const languages = [
        { value: 'en', label: 'English' },
        { value: 'fa', label: 'فارسی (Persian)' }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">{t('settings.title')}</h1>
                <p className="text-gray-600 mt-2">{t('settings.description')}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {tab.icon}
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-8">
                    {/* General Settings */}
                    {activeTab === 'general' && (
                        <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)} className="space-y-6 max-w-2xl">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('settings.general')} {t('settings.preferences')}</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <div className="flex items-center gap-2">
                                                <Languages size={16} />
                                                {t('settings.language')}
                                            </div>
                                        </label>
                                        <select
                                            {...generalForm.register('language')}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {languages.map(lang => (
                                                <option key={lang.value} value={lang.value}>{lang.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <div className="flex items-center gap-2">
                                                <DollarSign size={16} />
                                                {t('settings.currency')}
                                            </div>
                                        </label>
                                        <select
                                            {...generalForm.register('currency')}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {currencies.map(currency => (
                                                <option key={currency.value} value={currency.value}>{currency.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} />
                                                {t('settings.dateFormat')}
                                            </div>
                                        </label>
                                        <select
                                            {...generalForm.register('dateFormat')}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {dateFormats.map(format => (
                                                <option key={format.value} value={format.value}>{format.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <div className="flex items-center gap-2">
                                                <Clock size={16} />
                                                {t('settings.timezone')}
                                            </div>
                                        </label>
                                        <select
                                            {...generalForm.register('timezone')}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {timezones.map(tz => (
                                                <option key={tz.value} value={tz.value}>{tz.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors font-semibold"
                            >
                                <Save size={18} />
                                {t('common.save')} {t('settings.general')} {t('settings.settings')}
                            </button>
                        </form>
                    )}

                    {/* Notifications Settings */}
                    {activeTab === 'notifications' && (
                        <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-6 max-w-2xl">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('settings.notifications')} {t('settings.preferences')}</h3>
                                
                                <div className="space-y-4">
                                    {[
                                        { name: 'emailNotifications', label: t('settings.emailNotifications'), description: t('settings.emailNotificationsDesc') },
                                        { name: 'pushNotifications', label: t('settings.pushNotifications'), description: t('settings.pushNotificationsDesc') },
                                        { name: 'monthlyReports', label: t('settings.monthlyReports'), description: t('settings.monthlyReportsDesc') },
                                        { name: 'largeTransactions', label: t('settings.largeTransactions'), description: t('settings.largeTransactionsDesc') },
                                        { name: 'budgetAlerts', label: t('settings.budgetAlerts'), description: t('settings.budgetAlertsDesc') },
                                    ].map((setting) => (
                                        <div key={setting.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">{setting.label}</p>
                                                <p className="text-sm text-gray-500">{setting.description}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    {...notificationsForm.register(setting.name)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors font-semibold"
                            >
                                <Save size={18} />
                                {t('common.save')} {t('settings.notifications')} {t('settings.settings')}
                            </button>
                        </form>
                    )}

                    {/* Security Settings */}
                    {activeTab === 'security' && (
                        <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6 max-w-2xl">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('settings.security')} {t('settings.settings')}</h3>
                                
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">{t('settings.twoFactorAuth')}</p>
                                            <p className="text-sm text-gray-500">{t('settings.twoFactorAuthDesc')}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                {...securityForm.register('twoFactorAuth')}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="p-4 border border-gray-200 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('settings.sessionTimeout')}
                                        </label>
                                        <select
                                            {...securityForm.register('sessionTimeout')}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="15">15 {t('settings.minutes')}</option>
                                            <option value="30">30 {t('settings.minutes')}</option>
                                            <option value="60">1 {t('settings.hour')}</option>
                                            <option value="120">2 {t('settings.hours')}</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">{t('settings.loginAlerts')}</p>
                                            <p className="text-sm text-gray-500">{t('settings.loginAlertsDesc')}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                {...securityForm.register('loginAlerts')}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors font-semibold"
                            >
                                <Save size={18} />
                                {t('common.save')} {t('settings.security')} {t('settings.settings')}
                            </button>
                        </form>
                    )}

                    {/* Data Management */}
                    {activeTab === 'data' && (
                        <div className="space-y-6 max-w-2xl">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('settings.data')} {t('settings.management')}</h3>
                                
                                <div className="space-y-4">
                                    <div className="p-6 border border-gray-200 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{t('settings.exportData')}</h4>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {t('settings.exportDataDesc')}
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleExportData}
                                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                                            >
                                                <Download size={18} />
                                                {t('common.export')}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-6 border border-gray-200 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">{t('settings.importData')}</h4>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {t('settings.importDataDesc')}
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleImportData}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                                            >
                                                <Upload size={18} />
                                                {t('common.import')}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-6 border border-red-200 rounded-lg bg-red-50">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-semibold text-red-900">{t('settings.deleteAccount')}</h4>
                                                <p className="text-sm text-red-700 mt-1">
                                                    {t('settings.deleteAccountDesc')}
                                                </p>
                                            </div>
                                            <button 
                                                onClick={handleDeleteAccount}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                                            >
                                                {t('settings.deleteAccount')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;