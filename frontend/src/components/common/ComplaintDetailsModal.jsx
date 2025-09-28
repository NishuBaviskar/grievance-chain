// ====================================================================================
// GrievanceChain Project - Complaint Details Modal (Final Version with Corrected Logic)
// ====================================================================================
// This component displays the full details of a single grievance, including a visual
// timeline. It now implements the final, correct, stepwise state machine for admin actions.
// ====================================================================================

import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import Modal from './Modal';
import Spinner from './Spinner';
import StatusBadge from './StatusBadge';
import Button from './Button';
import { ExternalLink, Hash, Clock, Calendar, Check } from 'lucide-react';

// A helper component to render a single step in the visual timeline
const TimelineStep = ({ status, isCompleted, isCurrent, isLast }) => {
    return (
        <div className="flex items-start">
            <div className="flex flex-col items-center mr-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${isCompleted ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    {isCompleted ? <Check size={20} /> : <div className="w-3 h-3 bg-gray-500 rounded-full"></div>}
                </div>
                {!isLast && (<div className={`w-0.5 h-16 mt-2 transition-colors duration-300 ${isCompleted ? 'bg-blue-600' : 'bg-gray-300'}`}></div>)}
            </div>
            <div>
                <h5 className={`font-semibold transition-colors duration-300 ${isCurrent ? 'text-blue-700' : 'text-gray-800'}`}>{status}</h5>
            </div>
        </div>
    );
};

const ComplaintDetailsModal = ({ complaintId, isOpen, onClose, isAdmin, onStatusUpdate = () => {} }) => {
    const [details, setDetails] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState('');

    // The single source of truth for the resolution chain steps.
    const resolutionSteps = ["Not Processed", "Acknowledged", "Under Investigation", "Pending Committee Review", "Resolved"];

    useEffect(() => {
        if (complaintId && isOpen) {
            const fetchDetails = async () => {
                setLoading(true);
                setError('');
                try {
                    const [detailsRes, txRes] = await Promise.all([
                        api.get(`/grievances/${complaintId}`),
                        api.get(`/grievances/${complaintId}/transactions`)
                    ]);
                    setDetails(detailsRes.data.data.complaint);
                    setTransactions(txRes.data.data.transactions);
                } catch (err) {
                    setError('Failed to fetch complaint history. The complaint may not exist on the blockchain.');
                } finally {
                    setLoading(false);
                }
            };
            fetchDetails();
        }
    }, [complaintId, isOpen]);
    
    const handleUpdateStatus = async (status) => {
        setIsUpdating(true);
        try {
            await api.patch(`/grievances/${complaintId}/status`, { status });
            onStatusUpdate(complaintId, status);
            // Instantly update the UI with the new status and a fresh timestamp
            setDetails(prev => ({ 
                ...prev, 
                status, 
                lastUpdatedAt: new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) 
            }));
        } catch (err) {
            alert("Failed to update status. See console for details.");
        } finally {
            setIsUpdating(false);
        }
    };
    
    const currentStepIndex = details ? resolutionSteps.indexOf(details.status) : -1;

    // --- <<< THE FINAL, CORRECTED ACTION LOGIC >>> ---
    // This function now implements the precise, stepwise flow you requested.
    const adminActionButtons = () => {
        if (!isAdmin || !details || details.status === 'Resolved' || details.status === 'Rejected') {
            return null; // No actions if not admin or the case is already closed.
        }

        const actions = [];
        const currentStatus = details.status;

        // Determine the possible next "Advance" action based on the current status
        if (currentStatus === 'Not Processed') {
            actions.push({ label: 'Acknowledge', status: 'Acknowledged', color: 'bg-blue-600 hover:bg-blue-700' });
        } else if (currentStatus === 'Acknowledged') {
            actions.push({ label: 'Advance to: Under Investigation', status: 'Under Investigation', color: 'bg-blue-600 hover:bg-blue-700' });
        } else if (currentStatus === 'Under Investigation') {
            actions.push({ label: 'Advance to: Committee Review', status: 'Pending Committee Review', color: 'bg-blue-600 hover:bg-blue-700' });
        } else if (currentStatus === 'Pending Committee Review') {
            actions.push({ label: 'Resolve Grievance', status: 'Resolved', color: 'bg-green-600 hover:bg-green-700' });
        }
        
        // The "Reject" button is always available as a secondary option, unless the case is already closed.
        actions.push({ label: 'Reject Grievance', status: 'Rejected', color: 'bg-red-600 hover:bg-red-700' });
        
        return (
            <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Admin Actions</h4>
                <div className="flex flex-wrap gap-2">
                    {actions.map(action => (
                        <Button
                            key={action.status}
                            onClick={() => handleUpdateStatus(action.status)}
                            isLoading={isUpdating}
                            className={action.color}
                        >
                            {action.label}
                        </Button>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Grievance Tracking ID: ${complaintId}`}>
            {loading && <div className="text-center p-8"><Spinner size="lg"/></div>}
            {error && <p className="text-red-500 text-center p-4 bg-red-50 rounded-lg">{error}</p>}
            {!loading && !error && details && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left side: The visual timeline */}
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-4">Resolution Progress</h4>
                        <div>
                            {resolutionSteps.map((step, index) => (
                                <TimelineStep
                                    key={step}
                                    status={step}
                                    isCompleted={currentStepIndex >= index}
                                    isCurrent={currentStepIndex === index}
                                    isLast={index === resolutionSteps.length - 1}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Right side: Details and Actions */}
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-bold text-lg mb-2 text-gray-900">{details.title}</h4>
                            <div className="flex items-center mb-2">
                                <strong className="font-semibold mr-2">Current Status:</strong> <StatusBadge status={details.status} />
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p><strong>Submitted By:</strong> {details.studentId}</p>
                                <p><strong>Submitted On:</strong> {details.createdAt}</p>
                                <p><strong>Last Update:</strong> {details.lastUpdatedAt}</p>
                                <p><strong>Evidence:</strong>
                                    <a href={`https://ipfs.io/ipfs/${details.ipfsHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">View on IPFS</a>
                                </p>
                            </div>
                        </div>

                        {adminActionButtons()}
                        
                        <div className="border-t pt-4">
                            <h4 className="font-semibold text-gray-800 mb-2">Immutable Transaction History</h4>
                            <div className="space-y-2 border-l-2 pl-4 max-h-48 overflow-y-auto">
                                {transactions.map(tx => (
                                     <div key={tx.id} className="flex items-start space-x-3 py-2">
                                        <Hash size={16} className="text-gray-500 mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-gray-700 text-sm">{tx.action_type.replace(/_/g, ' ').toUpperCase()} to <span className="font-semibold">{tx.status_to}</span></p>
                                            <a href={`https://sepolia.etherscan.io/tx/${tx.transaction_hash}`} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-blue-600 hover:underline truncate" title={tx.transaction_hash}>{tx.transaction_hash}</a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default ComplaintDetailsModal;