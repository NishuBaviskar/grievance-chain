import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { School, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const PortalCard = ({ to, icon: Icon, title, description, color }) => (
    <motion.div
        whileHover={{ scale: 1.05, y: -5 }}
        className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center text-center transform transition-all duration-300"
    >
        <div className={`p-4 rounded-full mb-4 ${color.bg}`}>
            <Icon className={`w-8 h-8 ${color.text}`} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6 flex-grow">{description}</p>
        <Link
            to={to}
            className={`w-full flex items-center justify-center px-6 py-3 font-semibold text-white rounded-lg transition-colors duration-300 ${color.button}`}
        >
            Proceed to Login <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
    </motion.div>
);

const LandingPage = () => {
    const { user } = useAuth();

    // If a user is already logged in, redirect them to their respective dashboard immediately.
    if (user) {
        const redirectPath = user.data.user.role === 'student' ? '/student/dashboard' : '/admin/dashboard';
        return <Navigate to={redirectPath} replace />;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
            >
                <h1 className="text-5xl font-extrabold text-gray-800 mb-2">GrievanceChain</h1>
                <p className="text-xl text-gray-600">A Secure & Transparent Grievance Redressal System</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-4xl">
                <PortalCard
                    to="/login/student"
                    icon={School}
                    title="Student Portal"
                    description="Submit and track your grievances with full transparency and data security."
                    color={{
                        bg: 'bg-blue-100',
                        text: 'text-blue-600',
                        button: 'bg-blue-600 hover:bg-blue-700'
                    }}
                />
                <PortalCard
                    to="/login/admin"
                    icon={Shield}
                    title="Administrator Portal"
                    description="Manage, process, and resolve student grievances efficiently and securely."
                    color={{
                        bg: 'bg-gray-200',
                        text: 'text-gray-800',
                        button: 'bg-gray-700 hover:bg-gray-800'
                    }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mt-12 text-center"
            >
                <p className="text-gray-600">
                    New user?{' '}
                    <Link to="/register/student" className="font-semibold text-blue-600 hover:underline">
                        Register as a Student
                    </Link>
                    {' '}or{' '}
                    <Link to="/register/admin" className="font-semibold text-gray-700 hover:underline">
                        Register as an Admin
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default LandingPage;