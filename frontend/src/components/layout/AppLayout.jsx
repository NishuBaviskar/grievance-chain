// ====================================================================================
// GrievanceChain Project - Main App Layout (Final, Stable Version)
// ====================================================================================
// This component manages the overall page structure and the global state for grievances.
// It uses reliable HTTP polling for real-time updates and is free of render loops.
// ====================================================================================

import React, { useState, useEffect, useCallback } from 'react'; // <<< THE FIX: Typo "a" is removed.
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './Header';
import Sidebar from './Sidebar';
import { api } from '../../api';
import { useAuth } from '../../hooks/useAuth';

const AppLayout = () => {
    const { user } = useAuth();
    const [grievances, setGrievances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const location = useLocation();

    // A memoized function to fetch or refresh the grievances list.
    const fetchGrievances = useCallback(async (isInitialLoad = false) => {
        if (isInitialLoad) setLoading(true);
        try {
            const response = await api.get('/grievances');
            setGrievances(response.data.data.complaints);
            setError('');
        } catch (err) {
            if (err.response?.status !== 401) {
              setError('Failed to fetch grievances.');
            }
            setGrievances([]);
        } finally {
            if (isInitialLoad) {
                setLoading(false);
            }
        }
    }, []);

    // This useEffect handles the initial data load when the user logs in.
    useEffect(() => {
        if (user) {
            fetchGrievances(true);
        }
    }, [user, fetchGrievances]);

    // This useEffect handles the background polling for real-time updates.
    useEffect(() => {
        if (!user) return; // Only poll if the user is logged in.

        const pollingInterval = setInterval(() => {
            if (!document.hidden) {
                fetchGrievances(false);
            }
        }, 7000); // Poll every 7 seconds for updates.

        // This is the "cleanup function" to stop polling when the user logs out.
        return () => {
            clearInterval(pollingInterval);
        };
    }, [user, fetchGrievances]);

    // This function allows child components to perform an "optimistic update".
    const addGrievanceOptimistically = (newGrievance) => {
        setGrievances(prevGrievances => [newGrievance, ...prevGrievances]);
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Pass the shared state and functions down to all child pages */}
                                <Outlet context={{ grievances, loading, error, fetchGrievances, addGrievanceOptimistically }} />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AppLayout;