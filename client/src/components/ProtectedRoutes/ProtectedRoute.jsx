import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => { 
  const isAuthenticated = document.cookie
    .split(';')
    .some((cookie) => cookie.trim().startsWith('AccessToken='));

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;