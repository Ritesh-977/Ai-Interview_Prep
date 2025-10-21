import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // You can add a loading spinner here
    return <div>Loading...</div>;
  }

  // Outlet renders the child route (e.g., /upload or /chat)
  // If authenticated, render the child route
  // Otherwise, redirect to the login page
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;