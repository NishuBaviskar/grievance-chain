import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// <<< THE FIX: Corrected the import paths >>>
// AuthProvider is imported from its own context file.
import { AuthProvider } from './context/AuthContext'; 
// useAuth is imported from its own hook file.
import { useAuth } from './hooks/useAuth'; 

import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/student/StudentDashboard';
import LodgeComplaint from './pages/student/LodgeComplaint';
import StudentHistory from './pages/student/StudentHistory';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageGrievances from './pages/admin/ManageGrievances';
import Spinner from './components/common/Spinner';

// A protected route component that checks for user authentication and role
const ProtectedRoute = ({ children, role }) => {
    const { user, loading } = useAuth();

    // Show a loading spinner while the auth state is being determined
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <Spinner size="lg" />
            </div>
        );
    }

    // If not loading and no user, redirect to the main landing page
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // If a specific role is required and the user's role doesn't match,
    // redirect them to their own default dashboard to prevent unauthorized access.
    if (role && user.data.user.role !== role) {
        const defaultPath = user.data.user.role === 'student' ? '/student/dashboard' : '/admin/dashboard';
        return <Navigate to={defaultPath} replace />;
    }

    return children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes for Landing, Login, and Registration */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login/student" element={<LoginPage role="student" />} />
                    <Route path="/login/admin" element={<LoginPage role="admin" />} />
                    <Route path="/register/student" element={<RegisterPage role="student" />} />
                    <Route path="/register/admin" element={<RegisterPage role="admin" />} />

                    {/* Student Protected Routes */}
                    <Route path="/student" element={<ProtectedRoute role="student"><AppLayout /></ProtectedRoute>}>
                        <Route path="dashboard" element={<StudentDashboard />} />
                        <Route path="new-grievance" element={<LodgeComplaint />} />
                        <Route path="history" element={<StudentHistory />} />
                    </Route>

                    {/* Admin Protected Routes with two separate pages */}
                    <Route path="/admin" element={<ProtectedRoute role="admin"><AppLayout /></ProtectedRoute>}>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="manage-grievances" element={<ManageGrievances />} />
                    </Route>
                    
                    {/* A fallback route to redirect any unknown paths to the landing page */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
