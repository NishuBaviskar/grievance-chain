import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import StatusBadge from '../../components/common/StatusBadge';
import ComplaintDetailsModal from '../../components/common/ComplaintDetailsModal';
import { Eye, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const StudentHistory = () => {
    const { grievances, loading, error, fetchGrievances } = useOutletContext();
    const [selectedComplaintId, setSelectedComplaintId] = useState(null);

    return (
        <>
            <Card>
                <h1 className="text-3xl font-bold text-gray-800 mb-6">My Grievance History</h1>
                {loading && <div className="text-center p-8"><Spinner size="lg" /></div>}
                {error && <p className="text-red-500 text-center p-4 bg-red-50 rounded-lg">{error}</p>}
                {!loading && !error && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="text-left py-3 px-4 font-semibold text-sm">Blockchain ID</th>
                                    <th className="text-left py-3 px-4 font-semibold text-sm">Title</th>
                                    <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                                    <th className="text-left py-3 px-4 font-semibold text-sm">Track</th>
                                </tr>
                            </thead>
                            <tbody>
                                {grievances.map((c, index) => (
                                    <motion.tr 
                                        key={c.id} 
                                        className="border-b hover:bg-gray-50"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <td className="py-3 px-4 font-mono">
                                            {c.complaint_id_bc && c.complaint_id_bc > 0 ? (
                                                c.complaint_id_bc
                                            ) : (
                                                <span className="flex items-center text-xs text-gray-500 italic">
                                                    <Clock size={14} className="mr-1.5 animate-spin"/>
                                                    Confirming...
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">{c.title}</td>
                                        <td className="py-3 px-4"><StatusBadge status={c.status} /></td>
                                        <td className="py-3 px-4">
                                            <button 
                                                onClick={() => setSelectedComplaintId(c.complaint_id_bc)}
                                                className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 disabled:text-gray-400"
                                                disabled={!c.complaint_id_bc || c.complaint_id_bc < 0}
                                            >
                                                <Eye size={20} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                        {grievances.length === 0 && <p className="text-center text-gray-500 py-8">No grievances have been lodged yet.</p>}
                    </div>
                )}
            </Card>
            
            <ComplaintDetailsModal 
                complaintId={selectedComplaintId} 
                isOpen={!!selectedComplaintId}
                onClose={() => setSelectedComplaintId(null)}
                isAdmin={false} // This ensures no action buttons are shown to the student
            />
        </>
    );
};

export default StudentHistory;