import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5 my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading HotelPro...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div className="container py-5 text-center">
        <div className="card shadow-sm p-5 border-0 mx-auto" style={{ maxWidth: 500 }}>
          <i className="bi bi-shield-lock-fill text-danger display-3 mb-3"></i>
          <h3 className="text-danger fw-bold">Access Denied</h3>
          <p className="text-muted">
            Administrator privileges are required to access this portal.
          </p>
          <Navigate to="/" replace />
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

