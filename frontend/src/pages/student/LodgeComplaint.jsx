import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { api } from '../../api';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { FileUp, Send, Loader, CheckCircle } from 'lucide-react';

const LodgeComplaint = () => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Academic');
    const [evidence, setEvidence] = useState(null);
    const [error, setError] = useState('');
    const [submissionState, setSubmissionState] = useState('idle');
    const navigate = useNavigate();
    
    // Get the new optimistic update function from the parent AppLayout.
    const { addGrievanceOptimistically } = useOutletContext();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!evidence) {
            setError('Please upload an evidence file.');
            return;
        }
        setError('');
        setSubmissionState('submitting');
        
        const formData = new FormData();
        formData.append('title', title);
        formData.append('category', category);
        formData.append('evidence', evidence);

        try {
            // Call the new, fast backend API
            const response = await api.post('/grievances', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            
            // --- *** THE NEW OPTIMISTIC UI LOGIC *** ---
            // 1. Get the newly created complaint object from the backend's instant response.
            const newComplaint = response.data.data.complaint;

            // 2. Call the parent function to instantly add this to the shared state.
            // This will make it appear on the history page immediately.
            addGrievanceOptimistically(newComplaint);

            // 3. Show a quick success message and navigate immediately.
            setSubmissionState('success');
            setTimeout(() => {
                navigate('/student/history');
            }, 1000); // Navigate after a 1-second success message

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to lodge grievance.');
            setSubmissionState('idle');
        }
    };
    
    const isProcessing = submissionState !== 'idle';

    return (
        <Card>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Lodge a New Grievance</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={isProcessing}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={isProcessing}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed">
                        <option>Academic</option>
                        <option>Infrastructure</option>
                        <option>Faculty</option>
                        <option>Hostel</option>
                        <option>Other</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Evidence (PDF, JPG, PNG)</label>
                    <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md ${isProcessing ? 'bg-gray-100' : ''}`}>
                        <div className="space-y-1 text-center">
                            <FileUp className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor="file-upload" className={`relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none ${isProcessing ? 'text-gray-400 cursor-not-allowed' : ''}`}>
                                    <span>Upload a file</span>
                                    <input id="file-upload" name="file-upload" type="file" disabled={isProcessing} className="sr-only" onChange={(e) => setEvidence(e.target.files[0])} />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">{evidence ? evidence.name : 'Max file size 5MB'}</p>
                        </div>
                    </div>
                </div>
                
                {error && <p className="text-red-500 text-sm">{error}</p>}
                
                <div className="pt-2">
                    {submissionState === 'idle' && (
                        <Button type="submit" className="w-full" disabled={!evidence}>
                            <Send className="w-5 h-5 mr-2" /> Submit Grievance
                        </Button>
                    )}
                    {submissionState === 'submitting' && (
                        <div className="text-center p-4 rounded-lg bg-blue-50 text-blue-700 font-semibold flex items-center justify-center">
                            <Loader className="animate-spin inline-block mr-3" /> Submitting to blockchain...
                        </div>
                    )}
                    {submissionState === 'success' && (
                         <div className="text-center p-4 rounded-lg bg-green-50 text-green-800 font-semibold flex items-center justify-center">
                            <CheckCircle className="inline-block mr-3" /> Success! Navigating...
                        </div>
                    )}
                </div>
            </form>
        </Card>
    );
};

export default LodgeComplaint;