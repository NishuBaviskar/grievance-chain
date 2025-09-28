import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, XCircle, ClipboardCheck, Search, Users } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const baseStyle = "px-3 py-1.5 text-sm font-semibold rounded-full inline-flex items-center tracking-wide";
  
  // New, expanded configuration for all possible statuses
  const statusConfig = {
    'Not Processed': { style: "bg-gray-200 text-gray-800", icon: <AlertCircle size={16} className="mr-1.5" /> },
    'Acknowledged': { style: "bg-blue-200 text-blue-800", icon: <ClipboardCheck size={16} className="mr-1.5" /> },
    'Under Investigation': { style: "bg-indigo-200 text-indigo-800", icon: <Search size={16} className="mr-1.5" /> },
    'Pending Committee Review': { style: "bg-purple-200 text-purple-800", icon: <Users size={16} className="mr-1.5" /> },
    'Resolved': { style: "bg-green-200 text-green-800", icon: <CheckCircle size={16} className="mr-1.5" /> },
    'Rejected': { style: "bg-red-200 text-red-800", icon: <XCircle size={16} className="mr-1.5" /> },
  };

  const config = statusConfig[status] || statusConfig['Not Processed'];

  return (
    <motion.div
      className={`${baseStyle} ${config.style}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {config.icon} {status}
    </motion.div>
  );
};

export default StatusBadge;