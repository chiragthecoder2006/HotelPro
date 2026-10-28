import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export const ProfilePage = () => {
  const { user, checkAuth } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const { data } = await api.put('/auth/me', formData);
      if (data.success) {
        setMessage('Profile updated successfully!');
        await checkAuth();
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5" style={{ minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '680px' }}>
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb small">
            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
            <li className="breadcrumb-item active" aria-current="page">My Profile</li>
          </ol>
        </nav>

        <div className="card shadow-md border-0 rounded-4 overflow-hidden bg-white">
          <div className="bg-navy text-white p-4 d-flex justify-content-between align-items-center">
            <div>
              <span className="small text-warning text-uppercase fw-bold letter-spacing-1">
                Account Settings
              </span>
              <h2 className="fw-bold mb-0 text-white">Member Profile</h2>
            </div>
            <div className="rounded-circle bg-white text-navy p-3 d-flex align-items-center justify-content-center" style={{ width: 56, height: 56 }}>
              <i className="bi bi-person-fill fs-3"></i>
            </div>
          </div>

          <div className="card-body p-4 p-sm-5">
            {message && (
              <div className="alert alert-success alert-dismissible fade show mb-4 small" role="alert">
                <i className="bi bi-check-circle-fill me-2"></i>
                {message}
                <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
              </div>
            )}

            {error && (
              <div className="alert alert-danger alert-dismissible fade show mb-4 small" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
                <button type="button" className="btn-close" onClick={() => setError('')}></button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-4">
                <div className="col-12">
                  <label className="form-label small fw-semibold text-muted">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">Email Address (Registered)</label>
                  <input
                    type="email"
                    className="form-control bg-light"
                    disabled
                    value={user?.email || ''}
                  />
                  <small className="text-muted">Email address cannot be changed.</small>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">Account Role</label>
                  <div>
                    <span className={`badge ${user?.role === 'admin' ? 'bg-warning text-dark' : 'bg-primary'} px-3 py-2 text-capitalize`}>
                      <i className={`bi ${user?.role === 'admin' ? 'bi-shield-check' : 'bi-person-check'} me-1`}></i>
                      {user?.role || 'customer'}
                    </span>
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">Account Status</label>
                  <div>
                    <span className="badge bg-success px-3 py-2 text-capitalize">
                      <i className="bi bi-check2 me-1"></i>
                      {user?.accountStatus || 'active'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="d-flex flex-column flex-sm-row gap-2 justify-content-between align-items-center pt-3 border-top">
                <Link to="/my-bookings" className="btn btn-outline-secondary">
                  <i className="bi bi-journal-bookmark me-1"></i> View My Bookings
                </Link>
                <button
                  type="submit"
                  className="btn btn-navy px-4"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2-circle me-1"></i> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

