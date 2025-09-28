import React, { createContext, useState, useEffect } from 'react';
import { api } from '../api';

// Create the context that components will consume
export const AuthContext = createContext();

// Create the provider component that will wrap the application
export const AuthProvider = ({ children }) => {
    // State to hold the authenticated user object
    const [user, setUser] = useState(null);
    // State to track if we are still checking for a user in local storage
    const [loading, setLoading] = useState(true);

    // This effect runs only once when the application first loads
    useEffect(() => {
        try {
            // Check if a token and user data exist in local storage from a previous session
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');
            if (token && userData) {
                // If they exist, parse the user data and set it as the current user
                setUser(JSON.parse(userData));
            }
        } catch (error) {
            // If there's an error parsing the data, clear storage to be safe
            localStorage.clear();
            setUser(null);
        } finally {
            // After checking, set loading to false so the application can render
            setLoading(false);
        }
    }, []); // The empty dependency array ensures this effect runs only once

    // Function to handle user login
    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            if (data.token && data.data.user) {
                // If login is successful, store the token and user data
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data));
                // Update the user state, which will trigger a re-render in consuming components
                setUser(data);
                return data; // Return the user data to the login page
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error; // Throw the error so the login page can display a message
        }
    };

    // Function to handle user logout
    const logout = () => {
        // Clear the token and user data from local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Set the user state to null
        setUser(null);
    };

    // Provide the user object, loading state, and functions to all child components
    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};