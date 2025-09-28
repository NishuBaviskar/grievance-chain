import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import Card from './Card';
import Spinner from './Spinner';
import { Sparkles } from 'lucide-react';

const AISummary = ({ grievances }) => {
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            if (grievances.length === 0) {
                setSummary('No grievance data is available yet to generate a summary.');
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const response = await api.get('/grievances/summary');
                setSummary(response.data.data.summary);
            } catch (error) {
                setSummary('Could not generate AI summary at this time.');
            } finally {
                setLoading(false);
            }
        };

        const debounceTimeout = setTimeout(() => {
            fetchSummary();
        }, 500);

        return () => clearTimeout(debounceTimeout);

    }, [grievances]);

    return (
        <Card>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <Sparkles className="w-6 h-6 mr-2 text-purple-600" />
                AI-Powered Grievance Overview
            </h3>
            {loading ? (
                <div className="flex items-center justify-center h-24">
                    <Spinner />
                </div>
            ) : (
                <p className="text-gray-600 leading-relaxed">
                    {summary}
                </p>
            )}
        </Card>
    );
};

export default AISummary;