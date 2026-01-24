import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

const ProtectedRoute = () => {
  // 🟢 Access the existing data from the cache
  // enabled: false -> Ensures this hook NEVER triggers a network fetch
  const { data: userResponse } = useQuery({
    queryKey: ["current-user"],
    enabled: false, 
  });

  // Extract the actual user object (assuming API returns { success: true, data: { ... } })
 
  // 🟢 Validation Logic:
  // Check if user exists AND has the required fields (email & username)
  const isAuthenticated = userResponse && userResponse.email && userResponse.username;

  // If authenticated, render child routes (Outlet). Otherwise, redirect to login.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;