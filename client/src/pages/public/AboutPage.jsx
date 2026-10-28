import React from 'react';
import { Link } from 'react-router-dom';

export const AboutPage = () => {
  return (
    <div className="py-5">
      <div className="container">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb small">
            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
            <li className="breadcrumb-item active" aria-current="page">About Us</li>
          </ol>
        </nav>

        <div className="row g-5 align-items-center mb-5">
          <div className="col-lg-6">
            <span className="badge bg-warning text-dark px-3 py-1 mb-2">Hospitality Excellence</span>
            <h1 className="fw-bold display-5 text-navy mb-4">
              Setting the Standard in Luxury Hospitality Management
            </h1>
            <p className="text-secondary lh-lg mb-4">
              HotelPro was engineered to redefine how discriminating travelers discover, inspect, and reserve luxury stays. We bridge world-renowned 5-star properties with guests seeking authentic grandeur, meticulous cleanliness, and heartfelt hospitality.
            </p>
            <div className="row g-3">
              <div className="col-6">
                <div className="p-3 bg-white rounded-3 shadow-sm border">
                  <h3 className="fw-bold text-navy mb-0">5+</h3>
                  <small className="text-muted">Prime Destinations</small>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 bg-white rounded-3 shadow-sm border">
                  <h3 className="fw-bold text-navy mb-0">100%</h3>
                  <small className="text-muted">Verified Inventory</small>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="rounded-4 overflow-hidden shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80"
                alt="HotelPro Architecture"
                className="w-100 h-100 object-fit-cover"
                style={{ minHeight: '380px' }}
              />
            </div>
          </div>
        </div>

        {/* Tech Architecture Box (Great for College Presentation!) */}
        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
          <h4 className="fw-bold text-navy mb-3">
            <i className="bi bi-cpu-fill text-warning me-2"></i>Technical Architecture & Foundations
          </h4>
          <p className="text-muted mb-4">
            Built as a robust full-stack enterprise web application demonstrating modern software engineering principles:
          </p>
          <div className="row g-3">
            <div className="col-md-3">
              <div className="p-3 bg-light rounded-3 h-100">
                <h6 className="fw-bold text-navy">Frontend Client</h6>
                <small className="text-muted">React 18, Vite, React Router 6, Bootstrap 5, Custom Responsive Design.</small>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 bg-light rounded-3 h-100">
                <h6 className="fw-bold text-navy">Backend API</h6>
                <small className="text-muted">Node.js, Express, Helmet, CORS, Rate Limiting, Centralized Error Interceptor.</small>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 bg-light rounded-3 h-100">
                <h6 className="fw-bold text-navy">Database & Storage</h6>
                <small className="text-muted">MongoDB, Mongoose schemas with compound indexes, Aggregation pipelines.</small>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3 bg-light rounded-3 h-100">
                <h6 className="fw-bold text-navy">Security & RBAC</h6>
                <small className="text-muted">Bcrypt password hashing, Signed JWT HttpOnly tokens, Server-side role guards.</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

