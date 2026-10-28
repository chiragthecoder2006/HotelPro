import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';

export const BookingConfirmationPage = () => {
  const { reference } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBooking();
  }, [reference]);

  const fetchBooking = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/bookings/${reference}`);
      if (data.success && data.booking) {
        setBooking(data.booking);
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve booking information');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="text-center py-5 my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading confirmation...</span>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container py-5 text-center">
        <div className="card p-5 border-0 shadow-sm mx-auto" style={{ maxWidth: 500 }}>
          <i className="bi bi-x-circle text-danger display-4 mb-3"></i>
          <h4>Booking Not Found</h4>
          <p className="text-muted">{error || 'Could not locate reservation with this reference.'}</p>
          <Link to="/" className="btn btn-navy px-4">Return Home</Link>
        </div>
      </div>
    );
  }

  const checkInDate = new Date(booking.checkIn).toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const checkOutDate = new Date(booking.checkOut).toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="py-5">
      <div className="container" style={{ maxWidth: '850px' }}>
        {/* Success Alert Banner */}
        <div className="text-center mb-4">
          <div className="d-inline-flex p-3 rounded-circle bg-success text-white mb-3 shadow">
            <i className="bi bi-check2-circle display-4"></i>
          </div>
          <h1 className="fw-bold text-navy">Reservation Confirmed!</h1>
          <p className="text-muted">
            Thank you for booking with HotelPro. An official confirmation voucher has been generated.
          </p>
        </div>

        {/* Voucher Card */}
        <div className="card shadow-md border-0 rounded-4 overflow-hidden mb-4 bg-white">
          {/* Card Header with Reference */}
          <div className="bg-navy text-white p-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
            <div>
              <span className="small text-warning text-uppercase fw-bold letter-spacing-1">
                Official Booking Reference
              </span>
              <h2 className="display-6 fw-bold mb-0 text-white font-monospace">
                {booking.bookingReference}
              </h2>
            </div>
            <div className="text-sm-end">
              <span className="badge bg-success px-3 py-2 fs-6">
                Status: {booking.bookingStatus.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="p-4 p-md-5">
            {/* Property Information */}
            <div className="row g-4 mb-4 pb-4 border-bottom">
              <div className="col-md-7">
                <span className="text-muted small text-uppercase fw-semibold">Reserved Property</span>
                <h4 className="fw-bold text-navy mb-1">{booking.hotel?.name}</h4>
                <p className="text-muted small mb-2">
                  <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                  {booking.hotel?.address?.street}, {booking.hotel?.address?.city}, {booking.hotel?.address?.state}
                </p>
                <p className="text-muted small mb-0">
                  <i className="bi bi-telephone-fill text-warning me-1"></i>
                  Contact: {booking.hotel?.contact?.phone || '+91 22 6600 1122'}
                </p>
              </div>

              <div className="col-md-5">
                <span className="text-muted small text-uppercase fw-semibold">Suite Category</span>
                <h5 className="fw-bold text-navy mb-1">{booking.room?.roomType}</h5>
                <p className="text-muted small mb-1">
                  Bed: {booking.room?.bedConfiguration || 'King Bed'}
                </p>
                <p className="text-muted small mb-0">
                  Quantity: {booking.roomCount} Suite ({booking.nights} Nights)
                </p>
              </div>
            </div>

            {/* Check-In / Check-Out Schedule */}
            <div className="row g-3 mb-4 pb-4 border-bottom text-center">
              <div className="col-sm-6">
                <div className="p-3 bg-light rounded-3">
                  <span className="text-muted small d-block">Check-In</span>
                  <h5 className="fw-bold text-navy mb-1">{checkInDate}</h5>
                  <span className="small text-muted">From {booking.hotel?.policies?.checkInTime || '14:00'} hrs</span>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="p-3 bg-light rounded-3">
                  <span className="text-muted small d-block">Check-Out</span>
                  <h5 className="fw-bold text-navy mb-1">{checkOutDate}</h5>
                  <span className="small text-muted">Until {booking.hotel?.policies?.checkOutTime || '11:00'} hrs</span>
                </div>
              </div>
            </div>

            {/* Guest Details */}
            <div className="row g-3 mb-4 pb-4 border-bottom">
              <div className="col-sm-4">
                <span className="text-muted small d-block">Primary Guest</span>
                <span className="fw-semibold text-dark">{booking.guestDetails?.primaryGuestName}</span>
              </div>
              <div className="col-sm-4">
                <span className="text-muted small d-block">Guest Email</span>
                <span className="fw-semibold text-dark">{booking.guestDetails?.email}</span>
              </div>
              <div className="col-sm-4">
                <span className="text-muted small d-block">Phone Number</span>
                <span className="fw-semibold text-dark">{booking.guestDetails?.phone}</span>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-light p-4 rounded-3 mb-4">
              <h6 className="fw-bold text-navy mb-3">Financial Settlement Breakdown</h6>
              <div className="d-flex justify-content-between small mb-2">
                <span className="text-muted">Nightly Suite Rate:</span>
                <span className="fw-semibold">₹{booking.pricing?.pricePerNight?.toLocaleString('en-IN')}</span>
              </div>
              <div className="d-flex justify-content-between small mb-2">
                <span className="text-muted">Stay Subtotal ({booking.nights} Nights × {booking.roomCount} Room):</span>
                <span className="fw-semibold">₹{booking.pricing?.subtotal?.toLocaleString('en-IN')}</span>
              </div>
              <div className="d-flex justify-content-between small mb-2">
                <span className="text-muted">State GST & Hospitality Tax (12%):</span>
                <span className="fw-semibold">₹{booking.pricing?.taxAndFees?.toLocaleString('en-IN')}</span>
              </div>
              <hr className="my-2" />
              <div className="d-flex justify-content-between align-items-center mt-2">
                <span className="fw-bold text-navy fs-5">Total Paid / Verified</span>
                <span className="fw-bold text-navy fs-4">
                  ₹{booking.pricing?.totalAmount?.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="small text-success mt-2">
                <i className="bi bi-shield-check me-1"></i>
                Payment Status: {booking.paymentStatus === 'demo_verified' ? 'Demo Verified (Instant Approval)' : booking.paymentStatus.toUpperCase()}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex flex-column flex-sm-row justify-content-between gap-2">
              <Link to="/my-bookings" className="btn btn-navy px-4 py-2">
                <i className="bi bi-journal-bookmark me-2"></i>
                View in My Reservations
              </Link>

              <button type="button" className="btn btn-outline-secondary px-4 py-2" onClick={handlePrint}>
                <i className="bi bi-printer me-2"></i>
                Print Voucher
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;

