import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="footer-hotelpro">
      <div className="container">
        <div className="row gy-4">
          <div className="col-lg-4 col-md-6">
            <h5 className="footer-heading d-flex align-items-center gap-2">
              <i className="bi bi-building-fill text-warning"></i>
              <span>Hotel<span className="brand-gold">Pro</span></span>
            </h5>
            <p className="text-secondary small pe-lg-4">
              HotelPro provides seamless, verified reservation management for boutique and luxury properties across India. Experience handpicked excellence and guaranteed best rates.
            </p>
            <div className="d-flex gap-3 text-secondary mt-3">
              <span className="badge bg-secondary text-light">College Capstone MVP</span>
              <span className="badge bg-dark border border-secondary text-light">MERN Stack</span>
            </div>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="footer-heading">Quick Links</h6>
            <Link to="/hotels" className="footer-link">Find Hotels</Link>
            <Link to="/about" className="footer-link">About HotelPro</Link>
            <Link to="/contact" className="footer-link">Help & Support</Link>
            <Link to="/my-bookings" className="footer-link">My Bookings</Link>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="footer-heading">Top Destinations</h6>
            <Link to="/hotels?city=Mumbai" className="footer-link">Mumbai Oceanfront</Link>
            <Link to="/hotels?city=Goa" className="footer-link">Goa Beach Resorts</Link>
            <Link to="/hotels?city=Jaipur" className="footer-link">Jaipur Royal Haveli</Link>
            <Link to="/hotels?city=Udaipur" className="footer-link">Udaipur Floating Palaces</Link>
            <Link to="/hotels?city=Munnar" className="footer-link">Munnar Tea Hills</Link>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="footer-heading">Support & Security</h6>
            <p className="small text-secondary mb-2">
              <i className="bi bi-shield-check text-warning me-2"></i>
              Strict server-side validation & half-open reservation intervals.
            </p>
            <p className="small text-secondary mb-2">
              <i className="bi bi-lock-fill text-warning me-2"></i>
              Bcrypt hashed passwords & JWT authentication.
            </p>
            <div className="mt-3">
              <small className="text-muted">Direct Contact: support@hotelpro.com</small>
            </div>
          </div>
        </div>

        <hr className="border-secondary my-4 opacity-25" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center text-secondary small">
          <div>
            &copy; {new Date().getFullYear()} HotelPro Reservation Systems. All rights reserved.
          </div>
          <div className="mt-2 mt-md-0">
            <span>Academic Demonstration Project</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

