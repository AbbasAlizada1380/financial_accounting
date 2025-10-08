import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Save, Bell, Shield, CreditCard, Globe, Database, Download, Upload } from 'lucide-react';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [isLoading, setIsLoading] = useState(false);

    const generalForm = useForm({
        defaultValues: {
            currency: 'USD',
            dateFormat: 'MM/DD/YYYY',
            language: 'en',
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
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('General settings updated successfully!');
        setIsLoading(false);
    };

    const onNotificationsSubmit = async (data) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Notification settings updated successfully!');
        setIsLoading(false);
    };

    const onSecuritySubmit = async (data) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Security settings updated successfully!');
        setIsLoading(false);
    };

    const handleExportData = () => {
        toast.success('Data export started. You will receive an email shortly.');
    };

    const handleImportData = () => {
        toast.success('Please check your email for import instructions.');
    };

    const tabs = [
        { id: 'general', name: 'General', icon: <Globe size={18} /> },
        { id: 'notifications', name: 'Notifications', icon: <Bell size={18} /> },
        { id: 'security', name: 'Security', icon: <Shield size={18} /> },
        { id: 'data', name: 'Data Management', icon: <Database size={18} /> },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-2">Manage your application preferences and security settings</p>
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
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">General Preferences</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                                        <select
                                            {...generalForm.register('currency')}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="USD">US Dollar (USD)</option>
                                            <option value="EUR">Euro (EUR)</option>
                                            <option value="GBP">British Pound (GBP)</option>
                                            <option value="JPY">Japanese Yen (JPY)</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                                        <select
                                            {...generalForm.register('dateFormat')}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                                        <select
                                            {...generalForm.register('language')}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="en">English</option>
                                            <option value="es">Spanish</option>
                                            <option value="fr">French</option>
                                            <option value="de">German</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                                        <select
                                            {...generalForm.register('timezone')}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="UTC">UTC</option>
                                            <option value="EST">Eastern Time</option>
                                            <option value="PST">Pacific Time</option>
                                            <option value="CET">Central European Time</option>
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
                                Save General Settings
                            </button>
                        </form>
                    )}

                    {/* Notifications Settings */}
                    {activeTab === 'notifications' && (
                        <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-6 max-w-2xl">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                                
                                <div className="space-y-4">
                                    {[
                                        { name: 'emailNotifications', label: 'Email Notifications', description: 'Receive important updates via email' },
                                        { name: 'pushNotifications', label: 'Push Notifications', description: 'Get real-time alerts in your browser' },
                                        { name: 'monthlyReports', label: 'Monthly Reports', description: 'Receive monthly financial summary reports' },
                                        { name: 'largeTransactions', label: 'Large Transactions', description: 'Alert for transactions above $1,000' },
                                        { name: 'budgetAlerts', label: 'Budget Alerts', description: 'Notify when approaching budget limits' },
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
                                Save Notification Settings
                            </button>
                        </form>
                    )}

                    {/* Security Settings */}
                    {activeTab === 'security' && (
                        <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6 max-w-2xl">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
                                
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                                            <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
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
                                            Session Timeout (minutes)
                                        </label>
                                        <select
                                            {...securityForm.register('sessionTimeout')}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="15">15 minutes</option>
                                            <option value="30">30 minutes</option>
                                            <option value="60">1 hour</option>
                                            <option value="120">2 hours</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">Login Alerts</p>
                                            <p className="text-sm text-gray-500">Get notified of new sign-ins to your account</p>
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
                                Save Security Settings
                            </button>
                        </form>
                    )}

                    {/* Data Management */}
                    {activeTab === 'data' && (
                        <div className="space-y-6 max-w-2xl">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
                                
                                <div className="space-y-4">
                                    <div className="p-6 border border-gray-200 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Export Data</h4>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Download all your transactions and account data in CSV format
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleExportData}
                                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                                            >
                                                <Download size={18} />
                                                Export Data
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-6 border border-gray-200 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Import Data</h4>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Upload transaction data from other financial applications
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleImportData}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                                            >
                                                <Upload size={18} />
                                                Import Data
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-6 border border-red-200 rounded-lg bg-red-50">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-semibold text-red-900">Delete Account</h4>
                                                <p className="text-sm text-red-700 mt-1">
                                                    Permanently delete your account and all associated data
                                                </p>
                                            </div>
                                            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold">
                                                Delete Account
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