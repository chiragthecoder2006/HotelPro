import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      if (user.role === 'admin' && from === '/') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoUser = () => {
    setEmail('jane@example.com');
    setPassword('UserPassword123!');
  };

  const handleFillAdmin = () => {
    setEmail('admin@hotelpro.com');
    setPassword('AdminPassword123!');
  };

  return (
    <div className="py-5" style={{ minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <div className="card shadow-lg border-0 rounded-4 overflow-hidden bg-white">
          <div className="bg-navy text-white text-center py-4 px-3">
            <h3 className="fw-bold mb-1">Welcome Back</h3>
            <p className="text-secondary small mb-0">Sign in to access your luxury reservations</p>
          </div>

          <div className="card-body p-4 p-sm-5">
            {error && (
              <div className="alert alert-danger py-2 mb-3 small" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            )}

            {/* Quick Demo Autofill Helpers */}
            <div className="p-3 bg-light rounded-3 mb-4 border">
              <span className="small text-muted fw-bold d-block mb-2 text-uppercase">
                <i className="bi bi-lightning-charge-fill text-warning me-1"></i> Quick Demo Access
              </span>
              <div className="d-flex flex-column gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary text-start d-flex justify-content-between align-items-center"
                  onClick={handleFillDemoUser}
                >
                  <span><i className="bi bi-person me-2"></i>Demo Guest (Jane Doe)</span>
                  <small className="badge bg-secondary">Fill</small>
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-warning text-dark text-start d-flex justify-content-between align-items-center"
                  onClick={handleFillAdmin}
                >
                  <span><i className="bi bi-shield-lock me-2 text-warning"></i>System Administrator</span>
                  <small className="badge bg-warning text-dark">Fill</small>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted mb-1">Email Address</label>
                <input
                  type="email"
                  className="form-control py-2"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-semibold text-muted mb-0">Password</label>
                </div>
                <input
                  type="password"
                  className="form-control py-2"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-gold w-100 py-2 fw-bold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Authenticating...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="text-center mt-4 pt-3 border-top">
              <span className="text-muted small">New to HotelPro? </span>
              <Link to="/register" className="fw-semibold text-primary small">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

