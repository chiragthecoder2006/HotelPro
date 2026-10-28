import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await register(name, email, password, phone);
      navigate('/hotels');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5" style={{ minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '520px' }}>
        <div className="card shadow-lg border-0 rounded-4 overflow-hidden bg-white">
          <div className="bg-navy text-white text-center py-4 px-3">
            <h3 className="fw-bold mb-1">Create an Account</h3>
            <p className="text-secondary small mb-0">Join HotelPro for exclusive rates & seamless stays</p>
          </div>

          <div className="card-body p-4 p-sm-5">
            {error && (
              <div className="alert alert-danger py-2 mb-3 small" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted mb-1">Full Name</label>
                <input
                  type="text"
                  className="form-control py-2"
                  required
                  placeholder="e.g. Alexander Hamilton"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted mb-1">Email Address</label>
                <input
                  type="email"
                  className="form-control py-2"
                  required
                  placeholder="alexander@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted mb-1">Contact Phone</label>
                <input
                  type="tel"
                  className="form-control py-2"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-muted mb-1">Password</label>
                <input
                  type="password"
                  className="form-control py-2"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <small className="text-muted">Must contain minimum 6 characters.</small>
              </div>

              <button
                type="submit"
                className="btn btn-gold w-100 py-2 fw-bold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="text-center mt-4 pt-3 border-top">
              <span className="text-muted small">Already have an account? </span>
              <Link to="/login" className="fw-semibold text-primary small">
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

