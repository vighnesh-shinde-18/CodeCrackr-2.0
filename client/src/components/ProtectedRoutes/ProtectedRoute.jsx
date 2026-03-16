import React from 'react';
import { Navigate, Outlet } from 'react-router-dom'; 
import { useCurrentUser } from '../../hooks/Security/useCurrentUser.js';
import { Spinner } from '../ui/spinner.jsx';
const ProtectedRoute = () => {
  // 🟢 Access the existing data from the cache
  // enabled: false -> Ensures this hook NEVER triggers a network fetch

  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return <Spinner />;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;

};

export default ProtectedRoute;