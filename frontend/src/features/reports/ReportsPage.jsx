import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTransactions } from '../../api/transactionsApi';
import { Loader2, Download } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; // اطمینان از ایمپورت شدن استایل
import { startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, format } from 'date-fns';
import { Pie } from 'react-chartjs-2';

const ReportsPage = () => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const { data: allTransactions, isLoading } = useQuery({
        queryKey: ['transactions'],
        queryFn: () => getTransactions('all'),
    });
    
    // هوک برای تنظیم هوشمند محدوده تاریخ اولیه بر اساس داده‌های کاربر
    useEffect(() => {
        if (allTransactions && allTransactions.length > 0) {
            const dates = allTransactions.map(tx => new Date(tx.date));
            const minDate = new Date(Math.min.apply(null, dates));
            const maxDate = new Date(Math.max.apply(null, dates));
            setStartDate(minDate);
            setEndDate(maxDate);
        } else if (allTransactions) { // اگر تراکنشی نبود
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
        return <div className="flex justify-center items-center h-full"><Loader2 size={48} className="animate-spin text-blue-600" /></div>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Financial Reports</h1>

            {/* بخش فیلتر تاریخ */}
            <div className="bg-white p-4 rounded-xl shadow-md flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <DatePicker selected={startDate} onChange={date => setStartDate(date)} className="w-36 border-gray-300 rounded-lg p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                    <span className="text-gray-500 font-medium">to</span>
                    <DatePicker selected={endDate} onChange={date => setEndDate(date)} className="w-36 border-gray-300 rounded-lg p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => { setStartDate(startOfMonth(new Date())); setEndDate(endOfMonth(new Date())); }} className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">This Month</button>
                    <button onClick={() => { const lastMonth = subMonths(new Date(), 1); setStartDate(startOfMonth(lastMonth)); setEndDate(endOfMonth(lastMonth)); }} className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Last Month</button>
                    <button onClick={() => { setStartDate(startOfYear(new Date())); setEndDate(endOfYear(new Date())); }} className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">This Year</button>
                </div>
            </div>

            {/* بخش خلاصه و نمودار */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md space-y-4">
                     <h2 className="text-xl font-semibold text-gray-800">Summary</h2>
                     <div className="flex justify-between items-center text-lg"><span className="text-gray-600">Total Income:</span> <span className="font-bold text-green-600">${summary.totalIncome.toFixed(2)}</span></div>
                     <div className="flex justify-between items-center text-lg"><span className="text-gray-600">Total Expenses:</span> <span className="font-bold text-red-600">${summary.totalExpenses.toFixed(2)}</span></div>
                     <hr className="my-2"/>
                     <div className="flex justify-between items-center text-xl font-bold"><span className="text-gray-800">Net Balance:</span> <span className={summary.balance >= 0 ? 'text-blue-600' : 'text-red-600'}>${summary.balance.toFixed(2)}</span></div>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md flex justify-center items-center">
                    {summary.totalIncome > 0 || summary.totalExpenses > 0 ? (
                        <div className="w-full max-w-sm"><Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: true }} /></div>
                    ) : (
                        <p className="text-center text-gray-500 text-lg">No data for the selected period.</p>
                    )}
                </div>
            </div>

            {/* جدول تراکنش‌های دقیق */}
            <div className="bg-white rounded-xl shadow-md">
                <div className="p-4 flex justify-between items-center border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Detailed Transactions</h2>
                    <button onClick={handleExportCSV} disabled={filteredTransactions.length === 0} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed">
                        <Download size={16} /> Export to CSV
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50"><tr><th className="p-4 text-left font-medium text-gray-600">Description</th><th className="p-4 text-left font-medium text-gray-600">Category</th><th className="p-4 text-left font-medium text-gray-600">Date</th><th className="p-4 text-left font-medium text-gray-600">Amount</th></tr></thead>
                        <tbody>
                            {filteredTransactions.length > 0 ? filteredTransactions.map(tx => (
                                <tr key={tx.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-medium text-gray-900">{tx.description}</td>
                                    <td className="p-4 text-gray-500">{tx.category || 'General'}</td>
                                    <td className="p-4 text-gray-500">{format(new Date(tx.date), 'MMM d, yyyy')}</td>
                                    <td className={`p-4 font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                        {tx.type === 'income' ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" className="text-center p-8 text-gray-500">No transactions found in this date range.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;