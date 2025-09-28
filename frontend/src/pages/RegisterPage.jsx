import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { motion } from 'framer-motion';
import Button from '../components/common/Button';

const RegisterPage = ({ role }) => {
    const [formData, setFormData] = useState({ name: '', userId: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await api.post('/auth/register', { ...formData, role });
            // After successful registration, automatically log the user in for a seamless experience
            await login(formData.email, formData.password);
            navigate(role === 'student' ? '/student/dashboard' : '/admin/dashboard');
        } catch (err) {
            // <<< THE FIX: Display the specific error message from the backend >>>
            // The backend sends a 409 Conflict error, which we can check for here.
            if (err.response && err.response.status === 409) {
                setError(err.response.data.message); // e.g., "Email or User ID already exists."
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const isStudent = role === 'student';
    const config = isStudent ? {
        title: 'Student Registration',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-500',
        buttonColor: 'bg-blue-600 hover:bg-blue-700',
        userIdLabel: 'Student ID (e.g., S003)',
        loginLink: '/login/student',
        loginText: 'Already have an account? Login here.'
    } : {
        title: 'Admin Registration',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-700',
        buttonColor: 'bg-gray-700 hover:bg-gray-800',
        userIdLabel: 'Admin ID (e.g., A002)',
        loginLink: '/login/admin',
        loginText: 'Return to Admin Login'
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${config.bgColor}`}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-8 bg-white rounded-xl shadow-2xl w-full max-w-md border-t-4 ${config.borderColor}`}
            >
                <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">{config.title}</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input name="name" type="text" onChange={handleChange} required className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{config.userIdLabel}</label>
                        <input name="userId" type="text" onChange={handleChange} required className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input name="email" type="email" onChange={handleChange} required className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input name="password" type="password" onChange={handleChange} required className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center font-semibold">{error}</p>}
                    <div className="pt-2">
                        <Button type="submit" isLoading={isLoading} className={`w-full ${config.buttonColor}`}>
                            Create Account
                        </Button>
                    </div>
                </form>
                <div className="mt-6 text-center">
                    <Link to={config.loginLink} className="text-sm font-medium text-blue-600 hover:underline">
                        {config.loginText}
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;