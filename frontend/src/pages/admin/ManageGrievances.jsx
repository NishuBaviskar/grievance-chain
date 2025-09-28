import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import StatusBadge from '../../components/common/StatusBadge';
import ComplaintDetailsModal from '../../components/common/ComplaintDetailsModal';
import { Clock } from 'lucide-react';

const ManageGrievances = () => {
    const { grievances, loading, error, fetchGrievances } = useOutletContext();
    const [selectedComplaintId, setSelectedComplaintId] = useState(null);

    const onStatusUpdate = (complaintId, newStatus) => {
        // After an admin updates a status, the polling mechanism in AppLayout will
        // automatically pick up the change. We can call fetchGrievances here
        // to be more proactive if desired.
        setTimeout(() => {
            fetchGrievances();
        }, 1500); // A shorter delay for a snappier feel
    };

    return (
        <>
            <Card>
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage All Grievances</h1>
                {loading && <div className="text-center p-8"><Spinner size="lg" /></div>}
                {error && <p className="text-red-500 text-center p-4 bg-red-50 rounded-lg">{error}</p>}
                {!loading && !error && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="text-left py-3 px-4 font-semibold text-sm">Blockchain ID</th>
                                    <th className="text-left py-3 px-4 font-semibold text-sm">Student</th>
                                    <th className="text-left py-3 px-4 font-semibold text-sm">Title</th>
                                    <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                                    <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {grievances.map((c) => (
                                    <tr key={c.id} className="border-b hover:bg-gray-50">
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
                                        <td className="py-3 px-4">{c.student_name} ({c.student_id})</td>
                                        <td className="py-3 px-4">{c.title}</td>
                                        <td className="py-3 px-4"><StatusBadge status={c.status} /></td>
                                        <td className="py-3 px-4">
                                            <button 
                                                onClick={() => setSelectedComplaintId(c.complaint_id_bc)} 
                                                className="text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
                                                disabled={!c.complaint_id_bc || c.complaint_id_bc < 0}
                                            >
                                                Track & Update
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {grievances.length === 0 && <p className="text-center text-gray-500 py-8">No grievances have been submitted yet.</p>}
                    </div>
                )}
            </Card>

            <ComplaintDetailsModal
                complaintId={selectedComplaintId}
                isOpen={!!selectedComplaintId}
                onClose={() => setSelectedComplaintId(null)}
                isAdmin={true}
                onStatusUpdate={onStatusUpdate}
            />
        </>
    );
};

export default ManageGrievances;