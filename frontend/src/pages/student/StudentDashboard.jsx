import React from 'react';
import { useOutletContext } from 'react-router-dom';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import CategoryBarChart from '../../components/common/CategoryBarChart';
import StatusDonutChart from '../../components/common/StatusDonutChart';
import AISummary from '../../components/common/AISummary';

const StatCard = ({ title, value, colorClass }) => (
    <Card>
        <h3 className="text-lg font-semibold text-gray-600">{title}</h3>
        <p className={`text-4xl font-bold ${colorClass}`}>{value}</p>
    </Card>
);

const StudentDashboard = () => {
    const { grievances, loading, error } = useOutletContext();

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
    }

    if (error) {
        return <p className="text-red-500 text-center">{error}</p>;
    }

    const total = grievances.length;
    const resolved = grievances.filter(g => g.status === 'Resolved').length;
    const pending = total - resolved;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">My Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="My Total Grievances" value={total} colorClass="text-blue-600" />
                <StatCard title="My Resolved Grievances" value={resolved} colorClass="text-green-600" />
                <StatCard title="My Pending Grievances" value={pending} colorClass="text-yellow-600" />
            </div>

            <div>
                <AISummary grievances={grievances} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <CategoryBarChart grievances={grievances} />
                </div>
                <div className="lg:col-span-2">
                    <StatusDonutChart grievances={grievances} />
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;