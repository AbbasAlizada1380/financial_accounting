import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTransactions } from '../../api/transactionsApi';
import { Loader2, Download, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, format } from 'date-fns';
import { Pie } from 'react-chartjs-2';

const ReportsPage = () => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

    const { data: allTransactions, isLoading } = useQuery({
        queryKey: ['transactions'],
        queryFn: () => getTransactions('all'),
    });
    
    // Hook for setting initial date range based on user data
    useEffect(() => {
        if (allTransactions && allTransactions.length > 0) {
            const dates = allTransactions.map(tx => new Date(tx.date));
            const minDate = new Date(Math.min.apply(null, dates));
            const maxDate = new Date(Math.max.apply(null, dates));
            setStartDate(minDate);
            setEndDate(maxDate);
        } else if (allTransactions) { // If no transactions
            setStartDate(startOfMonth(new Date()));
            setEndDate(endOfMonth(new Date()));
        }
    }, [allTransactions]);

    const { filteredTransactions, summary, pieChartData } = useMemo(() => {
        if (!allTransactions || !startDate || !endDate) {
            return { filteredTransactions: [], summary: { totalIncome: 0, totalExpenses: 0, balance: 0 }, pieChartData: {} };
        }

        const filtered = allTransactions.filter(tx => {
            const txDate = new Date(tx.date);
            return txDate >= startDate && txDate <= endDate;
        });

        const totalIncome = filtered.filter(tx => tx.type === 'income').reduce((acc, tx) => acc + parseFloat(tx.amount), 0);
        const totalExpenses = filtered.filter(tx => tx.type === 'expense').reduce((acc, tx) => acc + parseFloat(tx.amount), 0);
        
        return {
            filteredTransactions: filtered,
            summary: { totalIncome, totalExpenses, balance: totalIncome - totalExpenses },
            pieChartData: {
                labels: ['Income', 'Expenses'],
                datasets: [{
                    data: [totalIncome, totalExpenses],
                    backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(255, 99, 132, 0.8)'],
                    borderColor: ['#FFFFFF'],
                    borderWidth: 2,
                }],
            },
        };
    }, [allTransactions, startDate, endDate]);

    const handleExportCSV = () => {
        const headers = "ID,Date,Description,Category,Type,Amount\n";
        const rows = filteredTransactions.map(tx => {
            const description = `"${tx.description.replace(/"/g, '""')}"`; // Handle quotes in description
            return `${tx.id},${format(new Date(tx.date), 'yyyy-MM-dd')},${description},${tx.category || 'General'},${tx.type},${tx.amount}`
        }).join("\n");
        
        const csvContent = headers + rows;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `report_${format(new Date(), 'yyyyMMdd')}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    if (isLoading || !startDate) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 size={48} className="animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8 p-4 sm:p-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Financial Reports</h1>
                <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center gap-2 w-full sm:w-auto justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                >
                    <Calendar size={20} />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
            </div>

            {/* Date Filter Section */}
            <div className={`bg-white p-4 sm:p-6 rounded-xl shadow-md ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    {/* Date Range Picker */}
                    <div className="w-full lg:w-auto">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                        <div className="relative">
                            <button
                                onClick={() => setIsDateRangeOpen(!isDateRangeOpen)}
                                className="flex items-center gap-2 w-full lg:w-64 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <Calendar size={16} />
                                <span className="flex-1 text-left">
                                    {startDate && endDate 
                                        ? `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`
                                        : 'Select date range'
                                    }
                                </span>
                                {isDateRangeOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            
                            {isDateRangeOpen && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 p-4">
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                                            <DatePicker 
                                                selected={startDate} 
                                                onChange={date => setStartDate(date)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                                            <DatePicker 
                                                selected={endDate} 
                                                onChange={date => setEndDate(date)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <button
                                            onClick={() => setIsDateRangeOpen(false)}
                                            className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Date Buttons */}
                    <div className="w-full lg:w-auto">
                        <label className="block text-sm font-medium text-gray-700 mb-2 lg:sr-only">Quick Filters</label>
                        <div className="flex flex-wrap gap-2">
                            <button 
                                onClick={() => { setStartDate(startOfMonth(new Date())); setEndDate(endOfMonth(new Date())); }}
                                className="flex-1 sm:flex-none px-3 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                This Month
                            </button>
                            <button 
                                onClick={() => { const lastMonth = subMonths(new Date(), 1); setStartDate(startOfMonth(lastMonth)); setEndDate(endOfMonth(lastMonth)); }}
                                className="flex-1 sm:flex-none px-3 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Last Month
                            </button>
                            <button 
                                onClick={() => { setStartDate(startOfYear(new Date())); setEndDate(endOfYear(new Date())); }}
                                className="flex-1 sm:flex-none px-3 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                This Year
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary and Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Summary Cards */}
                <div className="lg:col-span-1 space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-1 sm:gap-4">
                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Summary</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm sm:text-base text-gray-600">Total Income:</span>
                                <span className="font-bold text-green-600 text-sm sm:text-base">${summary.totalIncome.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm sm:text-base text-gray-600">Total Expenses:</span>
                                <span className="font-bold text-red-600 text-sm sm:text-base">${summary.totalExpenses.toFixed(2)}</span>
                            </div>
                            <hr className="my-2"/>
                            <div className="flex justify-between items-center">
                                <span className="text-base sm:text-lg font-bold text-gray-800">Net Balance:</span>
                                <span className={`text-base sm:text-lg font-bold ${summary.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                    ${summary.balance.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-xl shadow-md">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Income vs Expenses</h2>
                    <div className="flex justify-center items-center min-h-[300px] sm:min-h-[400px]">
                        {summary.totalIncome > 0 || summary.totalExpenses > 0 ? (
                            <div className="w-full max-w-xs sm:max-w-sm">
                                <Pie 
                                    data={pieChartData} 
                                    options={{ 
                                        responsive: true, 
                                        maintainAspectRatio: true,
                                        plugins: {
                                            legend: {
                                                position: 'bottom',
                                                labels: {
                                                    boxWidth: 12,
                                                    font: {
                                                        size: window.innerWidth < 640 ? 10 : 12
                                                    }
                                                }
                                            }
                                        }
                                    }} 
                                />
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 text-sm sm:text-base">No data for the selected period.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Detailed Transactions Table */}
            <div className="bg-white rounded-xl shadow-md">
                <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Detailed Transactions</h2>
                    <button 
                        onClick={handleExportCSV} 
                        disabled={filteredTransactions.length === 0}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                    >
                        <Download size={16} /> 
                        <span>Export to CSV</span>
                    </button>
                </div>
                
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 text-left font-medium text-gray-600">Description</th>
                                <th className="p-4 text-left font-medium text-gray-600">Category</th>
                                <th className="p-4 text-left font-medium text-gray-600">Date</th>
                                <th className="p-4 text-left font-medium text-gray-600">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.length > 0 ? filteredTransactions.map(tx => (
                                <tr key={tx.id} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-medium text-gray-900">{tx.description}</td>
                                    <td className="p-4 text-gray-500">{tx.category || 'General'}</td>
                                    <td className="p-4 text-gray-500">{format(new Date(tx.date), 'MMM d, yyyy')}</td>
                                    <td className={`p-4 font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                        {tx.type === 'income' ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="text-center p-8 text-gray-500">
                                        No transactions found in this date range.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards View */}
                <div className="lg:hidden">
                    {filteredTransactions.length > 0 ? (
                        <div className="p-4 space-y-4">
                            {filteredTransactions.map(tx => (
                                <div key={tx.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 text-sm">{tx.description}</h3>
                                            <p className="text-xs text-gray-600 mt-1">
                                                {format(new Date(tx.date), 'MMM d, yyyy')}
                                            </p>
                                        </div>
                                        <span className={`font-semibold text-sm ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.type === 'income' ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                                        </span>
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {tx.category || 'General'}
                                        </span>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            tx.type === 'income' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {tx.type === 'income' ? 'Income' : 'Expense'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            No transactions found in this date range.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;