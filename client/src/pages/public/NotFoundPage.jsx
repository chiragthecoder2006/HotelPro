import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <div className="py-5 text-center my-auto" style={{ minHeight: '65vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: 500 }}>
        <div className="card p-5 border-0 shadow-sm rounded-4 bg-white">
          <span className="display-1 fw-bold text-navy mb-2">404</span>
          <h3 className="fw-bold text-navy mb-2">Page Not Found</h3>
          <p className="text-muted mb-4">
            The page or property suite you are looking for does not exist or may have been relocated.
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Link to="/" className="btn btn-navy px-4">
              Return Home
            </Link>
            <Link to="/hotels" className="btn btn-gold px-4">
              Explore Hotels
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

