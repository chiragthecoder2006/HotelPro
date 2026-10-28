import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-hotelpro sticky-top">
      <div className="container">
        <Link className="navbar-brand brand-logo" to="/">
          <i className="bi bi-building-fill brand-gold"></i>
          <span>Hotel<span className="brand-gold">Pro</span></span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#hotelProNav"
          aria-controls="hotelProNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="hotelProNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
            <li className="nav-item">
              <NavLink className="nav-link nav-link-custom" to="/hotels">
                Explore Stays
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link nav-link-custom" to="/about">
                About Us
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link nav-link-custom" to="/contact">
                Contact & Support
              </NavLink>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2">
            {isAuthenticated ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-light dropdown-toggle d-flex align-items-center gap-2 py-2 px-3 rounded-pill"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle brand-gold fs-5"></i>
                  <span className="fw-semibold">{user.name.split(' ')[0]}</span>
                  {isAdmin && (
                    <span className="badge bg-warning text-dark ms-1">Admin</span>
                  )}
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 py-2 mt-2" aria-labelledby="userDropdown">
                  <li className="px-3 py-2 border-bottom">
                    <small className="text-muted d-block">Signed in as</small>
                    <span className="fw-bold text-dark">{user.email}</span>
                  </li>

                  <li>
                    <Link className="dropdown-item py-2" to="/my-bookings">
                      <i className="bi bi-journal-bookmark me-2 text-primary"></i>
                      My Reservations
                    </Link>
                  </li>

                  <li>
                    <Link className="dropdown-item py-2" to="/profile">
                      <i className="bi bi-person-gear me-2 text-secondary"></i>
                      My Account & Profile
                    </Link>
                  </li>

                  {isAdmin && (
                    <li>
                      <Link className="dropdown-item py-2" to="/admin">
                        <i className="bi bi-speedometer2 me-2 text-warning"></i>
                        Admin Control Center
                      </Link>
                    </li>
                  )}

                  <li><hr className="dropdown-divider" /></li>

                  <li>
                    <button
                      className="dropdown-item py-2 text-danger"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-outline-light px-3 py-2">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-gold px-3 py-2">
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

