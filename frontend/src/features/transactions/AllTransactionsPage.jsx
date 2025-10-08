import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTransactions, deleteTransaction } from '../../api/transactionsApi';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useLanguage } from '../../contexts/LanguageContext';
import { Trash2, Loader2, Search, Filter, Download, Eye, Edit, Plus, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

const AllTransactionsPage = () => {
    const queryClient = useQueryClient();
    const { t, currentLanguage } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;

    const { data: transactions, isLoading, isError } = useQuery({
        queryKey: ['transactions'],
        queryFn: () => getTransactions('all'),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteTransaction,
        onSuccess: () => {
            toast.success(t('notifications.transactionDeleted'));
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
        onError: (error) => toast.error(error.message)
    });

    const filteredTransactions = useMemo(() => {
        if (!transactions) return [];

        return transactions.filter(transaction => {
            const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                transaction.category?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
            
            const transactionDate = new Date(transaction.date);
            const matchesDate = (!startDate || transactionDate >= startDate) && 
                              (!endDate || transactionDate <= endDate);

            return matchesSearch && matchesType && matchesDate;
        });
    }, [transactions, searchTerm, typeFilter, startDate, endDate]);

    const handleExportCSV = () => {
        const headers = "Date,Description,Category,Type,Amount\n";
        const rows = filteredTransactions.map(tx => {
            return `${format(new Date(tx.date), 'yyyy-MM-dd')},"${tx.description}",${tx.category || t('transactions.general')},${tx.type},${tx.amount}`;
        }).join("\n");
        
        const csvContent = headers + rows;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `transactions_${format(new Date(), 'yyyyMMdd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setTypeFilter('all');
        setDateRange([null, null]);
    };

    // RTL support for Persian
    const isRTL = currentLanguage === 'fa';
    const directionClass = isRTL ? 'rtl' : 'ltr';
    const textAlignClass = isRTL ? 'text-right' : 'text-left';

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 size={48} className="animate-spin text-blue-600" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center text-red-600">
                    <p>{t('common.error')} {t('common.loading')} {t('transactions.title')}. {t('common.tryAgain')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${directionClass}`}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className={textAlignClass}>
                    <h1 className="text-3xl font-bold text-gray-900">{t('transactions.title')}</h1>
                    <p className="text-gray-600 mt-2">{t('transactions.description')}</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                    <Plus size={20} />
                    {t('common.add')} {t('transactions.title')}
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex flex-col lg:flex-row gap-4 items-end">
                    {/* Search */}
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.search')}</label>
                        <div className="relative">
                            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400`} size={20} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={t('transactions.searchPlaceholder')}
                                className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                                dir={isRTL ? 'rtl' : 'ltr'}
                            />
                        </div>
                    </div>

                    {/* Type Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('transactions.type')}</label>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className={`px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                            dir={isRTL ? 'rtl' : 'ltr'}
                        >
                            <option value="all">{t('transactions.all')}</option>
                            <option value="income">{t('transactions.income')}</option>
                            <option value="expense">{t('transactions.expenses')}</option>
                        </select>
                    </div>

                    {/* Date Range */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('transactions.dateRange')}</label>
                        <DatePicker
                            selectsRange={true}
                            startDate={startDate}
                            endDate={endDate}
                            onChange={(update) => setDateRange(update)}
                            isClearable={true}
                            placeholderText={t('transactions.dateRange')}
                            className={`px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                            popperPlacement={isRTL ? 'bottom-end' : 'bottom-start'}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleExportCSV}
                            disabled={filteredTransactions.length === 0}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            <Download size={18} />
                            {t('transactions.export')}
                        </button>
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <Filter size={18} />
                            {t('transactions.clearFilters')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className={textAlignClass}>
                            <p className="text-sm font-medium text-gray-600">{t('transactions.totalTransactions')}</p>
                            <p className="text-2xl font-bold text-gray-900">{filteredTransactions.length}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <CreditCard className="text-blue-600" size={24} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className={textAlignClass}>
                            <p className="text-sm font-medium text-gray-600">{t('transactions.income')}</p>
                            <p className="text-2xl font-bold text-green-600">
                                ${filteredTransactions
                                    .filter(tx => tx.type === 'income')
                                    .reduce((acc, tx) => acc + parseFloat(tx.amount), 0)
                                    .toFixed(2)}
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <TrendingUp className="text-green-600" size={24} />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className={textAlignClass}>
                            <p className="text-sm font-medium text-gray-600">{t('transactions.expenses')}</p>
                            <p className="text-2xl font-bold text-red-600">
                                ${filteredTransactions
                                    .filter(tx => tx.type === 'expense')
                                    .reduce((acc, tx) => acc + parseFloat(tx.amount), 0)
                                    .toFixed(2)}
                            </p>
                        </div>
                        <div className="p-3 bg-red-100 rounded-lg">
                            <TrendingDown className="text-red-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">{t('transactions.history')}</h2>
                    <div className="text-sm text-gray-500">
                        {filteredTransactions.length} {t('common.records')}
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className={`px-6 py-3 ${textAlignClass} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                    {t('transactions.date')}
                                </th>
                                <th className={`px-6 py-3 ${textAlignClass} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                    {t('transactions.description')}
                                </th>
                                <th className={`px-6 py-3 ${textAlignClass} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                    {t('transactions.category')}
                                </th>
                                <th className={`px-6 py-3 ${textAlignClass} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                    {t('transactions.type')}
                                </th>
                                <th className={`px-6 py-3 ${textAlignClass} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                    {t('transactions.amount')}
                                </th>
                                <th className={`px-6 py-3 ${textAlignClass} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                    {t('transactions.actions')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredTransactions.length > 0 ? (
                                filteredTransactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${textAlignClass}`}>
                                            {format(new Date(transaction.date), 'MMM d, yyyy')}
                                        </td>
                                        <td className={`px-6 py-4 ${textAlignClass}`}>
                                            <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap ${textAlignClass}`}>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {transaction.category || t('transactions.general')}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap ${textAlignClass}`}>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                transaction.type === 'income' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {transaction.type === 'income' ? t('transactions.income') : t('transactions.expenses')}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap ${textAlignClass}`}>
                                            <span className={`text-sm font-semibold ${
                                                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {transaction.type === 'income' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${textAlignClass}`}>
                                            <div className="flex items-center gap-2">
                                                <button className="text-blue-600 hover:text-blue-900 p-1 rounded" title={t('common.view')}>
                                                    <Eye size={16} />
                                                </button>
                                                <button className="text-gray-600 hover:text-gray-900 p-1 rounded" title={t('common.edit')}>
                                                    <Edit size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => deleteMutation.mutate(transaction.id)}
                                                    disabled={deleteMutation.isPending}
                                                    className="text-red-600 hover:text-red-900 p-1 rounded disabled:opacity-50"
                                                    title={t('common.delete')}
                                                >
                                                    {deleteMutation.isPending ? (
                                                        <Loader2 size={16} className="animate-spin" />
                                                    ) : (
                                                        <Trash2 size={16} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center">
                                        <div className="text-gray-500">
                                            <CreditCard size={48} className="mx-auto mb-4 text-gray-300" />
                                            <p className="text-lg font-medium">{t('transactions.noTransactions')}</p>
                                            <p className="text-sm">{t('transactions.tryAdjustingFilters')}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AllTransactionsPage;