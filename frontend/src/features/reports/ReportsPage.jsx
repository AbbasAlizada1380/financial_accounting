import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTransactions } from '../../api/transactionsApi';
import { Loader2 } from 'lucide-react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ReportsPage = () => {
    const { data: transactions, isLoading, isError } = useQuery({
        queryKey: ['transactions'],
        queryFn: () => getTransactions('all'),
    });

    const chartData = useMemo(() => {
        if (!transactions) return null;

        const totalIncome = transactions
            .filter(tx => tx.type === 'income')
            .reduce((acc, tx) => acc + parseFloat(tx.amount), 0);

        const totalExpenses = transactions
            .filter(tx => tx.type === 'expense')
            .reduce((acc, tx) => acc + parseFloat(tx.amount), 0);

        return {
            labels: ['Total Income', 'Total Expenses'],
            datasets: [
                {
                    label: 'Amount',
                    data: [totalIncome, totalExpenses],
                    backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
                    borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
                    borderWidth: 1,
                },
            ],
        };
    }, [transactions]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Loader2 size={48} className="animate-spin text-blue-500" /></div>;
    }

    if (isError) {
        return <p className="text-center text-red-500">Failed to load report data.</p>;
    }
    
    const balance = (chartData?.datasets[0].data[0] || 0) - (chartData?.datasets[0].data[1] || 0);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Financial Reports</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Chart Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Income vs. Expenses</h2>
                    {chartData && (
                        <div className="max-w-md mx-auto">
                            <Pie data={chartData} />
                        </div>
                    )}
                </div>

                {/* Summary Section */}
                <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
                    <h2 className="text-xl font-semibold text-gray-700">Summary</h2>
                    <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-gray-600">Total Income:</span>
                        <span className="font-bold text-green-600">${(chartData?.datasets[0].data[0] || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-gray-600">Total Expenses:</span>
                        <span className="font-bold text-red-600">${(chartData?.datasets[0].data[1] || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                        <span className="text-lg font-bold text-gray-800">Final Balance:</span>
                        <span className={`text-lg font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            ${balance.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;