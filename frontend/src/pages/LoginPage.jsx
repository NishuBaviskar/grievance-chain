import React from 'react';
import LoginForm from '../components/common/LoginForm';

// This component now acts as a wrapper for the reusable LoginForm
const LoginPage = ({ role }) => {
    const isStudent = role === 'student';

    const config = {
        student: {
            title: 'Student Login',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-500',
            buttonColor: 'bg-blue-600 hover:bg-blue-700',
            demoEmail: 'alice@example.com'
        },
        admin: {
            title: 'Administrator Login',
            bgColor: 'bg-gray-100',
            borderColor: 'border-gray-700',
            buttonColor: 'bg-gray-700 hover:bg-gray-800',
            demoEmail: 'bob@example.com'
        }
    };

    const currentConfig = isStudent ? config.student : config.admin;

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${currentConfig.bgColor}`}>
            <LoginForm
                role={role}
                title={currentConfig.title}
                borderColor={currentConfig.borderColor}
                buttonColor={currentConfig.buttonColor}
                demoEmail={currentConfig.demoEmail}
            />
        </div>
    );
};

export default LoginPage;