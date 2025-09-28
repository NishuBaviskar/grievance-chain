import React from 'react';
import { LogOut, UserCircle, Bell } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/'); // Navigate to the main landing page on logout
    };

    return (
        <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-end items-center h-16">
                    <div className="flex items-center space-x-4">
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none">
                            <Bell className="h-6 w-6" />
                        </motion.button>
                        <div className="flex items-center">
                            <UserCircle className="h-7 w-7 text-gray-500" />
                            <span className="ml-2 text-gray-800 font-medium hidden sm:block">{user?.data.user.name}</span>
                        </div>
                        <motion.button
                            onClick={handleLogout}
                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 focus:outline-none transition-colors"
                            aria-label="Logout"
                        >
                            <LogOut className="h-6 w-6" />
                        </motion.button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;