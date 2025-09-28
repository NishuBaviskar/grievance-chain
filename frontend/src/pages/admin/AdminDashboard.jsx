import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const StatCard = ({ title, value, colorClass }) => (
    <Card>
        <h3 className="text-lg font-semibold text-gray-600">{title}</h3>
        <p className={`text-4xl font-bold ${colorClass}`}>{value}</p>
    </Card>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const response = await api.get('/grievances/admin-stats');
                setStats(response.data.data.stats);
            } catch (err) {
                // The interceptor will handle 401, but we catch other errors here
                setError('Failed to fetch your dashboard statistics.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
    }

    if (error) {
        return <p className="text-red-500 text-center p-4 bg-red-50 rounded-lg">{error}</p>;
    }

    const sentimentData = {
        labels: ['Positive', 'Negative', 'Neutral'],
        datasets: [{
            data: [stats.sentiment.positive, stats.sentiment.negative, stats.sentiment.neutral],
            backgroundColor: ['rgba(22, 163, 74, 0.6)', 'rgba(220, 38, 38, 0.6)', 'rgba(107, 114, 128, 0.6)'],
            borderColor: ['#ffffff'],
            borderWidth: 2,
        }]
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">My Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">This dashboard shows statistics for grievances that you have personally resolved or rejected.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Cases Handled by Me" value={stats.totalResolved} colorClass="text-blue-600" />
                <StatCard title="Resolved by Me" value={stats.resolvedCount} colorClass="text-green-600" />
                <StatCard title="Rejected by Me" value={stats.rejectedCount} colorClass="text-red-600" />
            </div>

            <Card>
                <h3 className="text-lg font-semibold text-center mb-4">Sentiment of Cases Handled by Me</h3>
                {stats.totalResolved > 0 ? (
                    <div style={{ maxWidth: '400px', margin: 'auto' }}>
                        <Doughnut data={sentimentData} />
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-8">You have not handled any cases yet. Your stats will appear here once you resolve or reject a grievance from the "Manage All" page.</p>
                )}
            </Card>
        </div>
    );
};

export default AdminDashboard;