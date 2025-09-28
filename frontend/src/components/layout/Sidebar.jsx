import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FilePlus, History, Shield, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';

const studentNavLinks = [
    { to: '/student/dashboard', icon: LayoutDashboard, text: 'Dashboard' },
    { to: '/student/new-grievance', icon: FilePlus, text: 'Lodge Grievance' },
    { to: '/student/history', icon: History, text: 'My History' },
];

// <<< NEW ADMIN LINKS >>>
const adminNavLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, text: 'My Dashboard' },
    { to: '/admin/manage-grievances', icon: Shield, text: 'Manage All' },
];

const NavItem = ({ to, icon: Icon, text }) => {
    const navLinkClasses = ({ isActive }) =>
        `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 text-lg ${
        isActive
            ? 'bg-blue-600 text-white shadow-lg'
            : 'text-gray-300 hover:bg-slate-700 hover:text-white'
        }`;

    return (
        <motion.li whileHover={{ x: 5 }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
            <NavLink to={to} className={navLinkClasses}>
                <Icon className="w-6 h-6 mr-4" />
                <span className="font-medium">{text}</span>
            </NavLink>
        </motion.li>
    );
};

const Sidebar = () => {
    const { user } = useAuth();
    const navLinks = user?.data.user.role === 'student' ? studentNavLinks : adminNavLinks;

    return (
        <aside className="w-72 bg-slate-800 text-white shadow-2xl flex-shrink-0 flex flex-col">
            <div className="p-6 border-b border-slate-700">
                <h2 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                    GrievanceChain
                </h2>
            </div>
            <nav className="p-4 flex-grow">
                <ul className="space-y-3">
                    {navLinks.map((link) => (
                        <NavItem key={link.to} to={link.to} icon={link.icon} text={link.text} />
                    ))}
                </ul>
            </nav>
            <div className="p-4 border-t border-slate-700 text-center text-xs text-gray-400">
                <p>&copy; 2025 Final Year Project</p>
                <p>Secure & Decentralized</p>
            </div>
        </aside>
    );
};

export default Sidebar;