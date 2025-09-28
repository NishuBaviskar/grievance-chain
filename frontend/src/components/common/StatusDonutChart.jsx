import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import Card from './Card';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const StatusDonutChart = ({ grievances }) => {
    const statusCounts = grievances.reduce((acc, g) => {
        acc[g.status] = (acc[g.status] || 0) + 1;
        return acc;
    }, {});

    const chartData = {
        labels: Object.keys(statusCounts),
        datasets: [
            {
                label: '# of Grievances',
                data: Object.values(statusCounts),
                backgroundColor: [
                    'rgba(107, 114, 128, 0.6)', // Not Processed
                    'rgba(59, 130, 246, 0.6)',  // Acknowledged
                    'rgba(139, 92, 246, 0.6)',  // Under Investigation
                    'rgba(168, 85, 247, 0.6)',  // Pending Committee Review
                    'rgba(22, 163, 74, 0.6)',   // Resolved
                    'rgba(220, 38, 38, 0.6)',   // Rejected
                ],
                borderColor: [
                    'rgba(107, 114, 128, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(168, 85, 247, 1)',
                    'rgba(22, 163, 74, 1)',
                    'rgba(220, 38, 38, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right',
            },
            title: {
                display: true,
                text: 'Grievance Status Distribution',
                font: { size: 18 }
            },
        },
    };

    return (
        <Card className="h-full flex items-center justify-center">
            <div style={{ width: '100%', maxWidth: '400px' }}>
                <Doughnut data={chartData} options={options} />
            </div>
        </Card>
    );
};

export default StatusDonutChart;