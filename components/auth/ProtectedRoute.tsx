import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredRole?: UserRole[] | 'any';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // User not logged in, redirect to login page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If a role is required, check if the user has it
  if (requiredRole && requiredRole !== 'any' && !requiredRole.includes(user.role)) {
    // User does not have the required role, redirect to access denied page
    return <Navigate to="/access-denied" state={{ from: location }} replace />;
  }

  // User is authenticated and has the required role, render the child component
  return children;
};

export default ProtectedRoute;
