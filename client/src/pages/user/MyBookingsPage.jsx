import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export const MyBookingsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Cancel modal state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('Personal schedule change');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [cancelSuccess, setCancelSuccess] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/bookings/my-bookings');
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setCancelling(true);
    setCancelError('');
    try {
      const { data } = await api.put(`/bookings/${selectedBooking.bookingReference}/cancel`, {
        reason: cancelReason
      });

      if (data.success) {
        setCancelSuccess(`Booking ${selectedBooking.bookingReference} has been cancelled successfully.`);
        setSelectedBooking(null);
        fetchBookings();
      }
    } catch (err) {
      setCancelError(err.message || 'Failed to cancel reservation');
    } finally {
      setCancelling(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'all') return true;
    return b.bookingStatus === filter;
  });

  return (
    <div className="py-5">
      <div className="container">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb small">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item active" aria-current="page">My Reservations</li>
              </ol>
            </nav>
            <h1 className="fw-bold mb-1">My Bookings & Stays</h1>
            <p className="text-muted mb-0">
              Manage your upcoming luxury reservations, view past itineraries, and access receipts.
            </p>
          </div>

          <div className="mt-3 mt-md-0">
            <Link to="/hotels" className="btn btn-gold">
              <i className="bi bi-plus-lg me-1"></i> Book Another Stay
            </Link>
          </div>
        </div>

        {cancelSuccess && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i>
            {cancelSuccess}
            <button type="button" className="btn-close" onClick={() => setCancelSuccess('')}></button>
          </div>
        )}

        {/* Status Filter Tabs */}
        <div className="d-flex gap-2 mb-4 border-bottom pb-2">
          {['all', 'confirmed', 'completed', 'cancelled'].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`btn btn-sm px-3 py-2 rounded-pill font-semibold text-capitalize ${
                filter === tab ? 'btn-navy' : 'btn-outline-secondary'
              }`}
              onClick={() => setFilter(tab)}
            >
              {tab === 'all' ? `All Bookings (${bookings.length})` : tab}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading bookings...</span>
            </div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="card p-5 text-center border-0 shadow-sm rounded-4 bg-white">
            <i className="bi bi-journal-x text-muted display-4 mb-3"></i>
            <h4 className="fw-bold">No reservations found</h4>
            <p className="text-muted mb-4">
              {filter === 'all'
                ? "You haven't made any reservations yet. Start exploring our luxury destinations!"
                : `You have no ${filter} bookings.`}
            </p>
            <div>
              <Link to="/hotels" className="btn btn-navy px-4 py-2">
                Explore Destinations
              </Link>
            </div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {filteredBookings.map((b) => {
              const checkIn = new Date(b.checkIn).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });
              const checkOut = new Date(b.checkOut).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <div key={b._id || b.id} className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white">
                  <div className="card-body p-4">
                    <div className="row align-items-center g-3">
                      {/* Left: Reference & Hotel Name */}
                      <div className="col-lg-4 col-md-5">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="font-monospace fw-bold text-primary small">
                            {b.bookingReference}
                          </span>
                          <span
                            className={`badge px-2 py-1 text-uppercase ${
                              b.bookingStatus === 'confirmed'
                                ? 'badge-confirmed'
                                : b.bookingStatus === 'completed'
                                ? 'badge-completed'
                                : 'badge-cancelled'
                            }`}
                          >
                            {b.bookingStatus}
                          </span>
                        </div>
                        <h5 className="fw-bold text-navy mb-1">{b.hotel?.name || 'Luxury Hotel'}</h5>
                        <p className="text-muted small mb-0">
                          {b.room?.roomType || 'Deluxe Suite'} • {b.roomCount} Suite ({b.nights} Nights)
                        </p>
                      </div>

                      {/* Middle: Dates */}
                      <div className="col-lg-4 col-md-4">
                        <div className="d-flex align-items-center gap-3">
                          <div className="p-2 bg-light rounded text-center" style={{ minWidth: '100px' }}>
                            <small className="text-muted d-block">Check-In</small>
                            <span className="fw-bold text-dark small">{checkIn}</span>
                          </div>
                          <i className="bi bi-arrow-right text-muted"></i>
                          <div className="p-2 bg-light rounded text-center" style={{ minWidth: '100px' }}>
                            <small className="text-muted d-block">Check-Out</small>
                            <span className="fw-bold text-dark small">{checkOut}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Price & Actions */}
                      <div className="col-lg-4 col-md-3 text-md-end">
                        <div className="price-display fs-5 mb-2">
                          ₹{b.pricing?.totalAmount?.toLocaleString('en-IN')}
                        </div>

                        <div className="d-flex justify-content-md-end gap-2">
                          <Link
                            to={`/booking/confirmation/${b.bookingReference}`}
                            className="btn btn-outline-navy btn-sm px-3"
                          >
                            Voucher
                          </Link>

                          {b.bookingStatus === 'confirmed' && (
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm px-3"
                              onClick={() => {
                                setSelectedBooking(b);
                                setCancelError('');
                              }}
                            >
                              Cancel Stay
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Cancellation Modal */}
        {selectedBooking && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="modal-header bg-danger text-white py-3 px-4">
                  <h5 className="modal-title fw-bold">Cancel Reservation</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setSelectedBooking(null)}
                  ></button>
                </div>

                <form onSubmit={handleCancel}>
                  <div className="modal-body p-4">
                    {cancelError && (
                      <div className="alert alert-danger py-2 mb-3 small">{cancelError}</div>
                    )}

                    <p className="mb-3">
                      Are you sure you want to cancel reservation{' '}
                      <strong>{selectedBooking.bookingReference}</strong> at{' '}
                      <strong>{selectedBooking.hotel?.name}</strong>?
                    </p>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-muted mb-1">
                        Reason for Cancellation
                      </label>
                      <select
                        className="form-select"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                      >
                        <option value="Personal schedule change">Personal schedule change</option>
                        <option value="Flight / Travel delay or cancellation">Flight / Travel delay</option>
                        <option value="Found an alternate stay">Found alternate stay</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="alert alert-warning py-2 mb-0 small">
                      <i className="bi bi-info-circle me-1"></i>
                      Cancelling will immediately release room inventory back to other travelers.
                    </div>
                  </div>

                  <div className="modal-footer bg-light px-4 py-3">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setSelectedBooking(null)}
                      disabled={cancelling}
                    >
                      Keep Reservation
                    </button>
                    <button
                      type="submit"
                      className="btn btn-danger px-4"
                      disabled={cancelling}
                    >
                      {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;

