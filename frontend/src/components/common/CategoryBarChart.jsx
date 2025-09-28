import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Card from './Card';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CategoryBarChart = ({ grievances }) => {
    const categoryCounts = grievances.reduce((acc, g) => {
        acc[g.category] = (acc[g.category] || 0) + 1;
        return acc;
    }, {});

    const chartData = {
        labels: Object.keys(categoryCounts),
        datasets: [
            {
                label: 'Number of Grievances',
                data: Object.values(categoryCounts),
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        indexAxis: 'y', // Makes the bar chart horizontal for better readability
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Grievances by Category',
                font: { size: 18 }
            },
        },
        scales: {
            x: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    };

    return (
        <Card className="h-full">
            <Bar options={options} data={chartData} />
        </Card>
    );
};

export default CategoryBarChart;