import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import ImageWithFallback from '../../components/common/ImageWithFallback';

export const HotelDetailPage = () => {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Date selection for stay
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultOut = new Date();
  defaultOut.setDate(defaultOut.getDate() + 4);

  const [checkIn, setCheckIn] = useState(tomorrow.toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(defaultOut.toISOString().split('T')[0]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomCount, setRoomCount] = useState(1);
  const [dateError, setDateError] = useState('');

  // Guest booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('demo_checkout');

  const [guestForm, setGuestForm] = useState({
    primaryGuestName: '',
    email: '',
    phone: '',
    specialRequests: '',
    adults: 2,
    children: 0
  });

  useEffect(() => {
    fetchHotelDetails();
  }, [identifier]);

  // Sync user details to guest form when logged in
  useEffect(() => {
    if (user) {
      setGuestForm(prev => ({
        ...prev,
        primaryGuestName: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const fetchHotelDetails = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/hotels/${identifier}`);
      if (data.success) {
        setHotel(data.hotel);
        setRooms(data.rooms);
      }
    } catch (err) {
      setError(err.message || 'Failed to load hotel details');
    } finally {
      setLoading(false);
    }
  };

  const calculateStayNights = () => {
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    const diff = Math.round((outDate - inDate) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  };

  const handleOpenBooking = (room) => {
    setDateError('');
    if (new Date(checkOut) <= new Date(checkIn)) {
      setDateError('Check-out date must be after check-in date');
      return;
    }

    if (!isAuthenticated) {
      // Redirect to login preserving destination
      navigate('/login', { state: { from: { pathname: `/hotels/${identifier}` } } });
      return;
    }

    setSelectedRoom(room);
    setBookingError('');
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingError('');

    try {
      const payload = {
        hotelId: hotel._id || hotel.id,
        roomId: selectedRoom._id || selectedRoom.id,
        checkIn,
        checkOut,
        roomCount: Number(roomCount),
        guestDetails: {
          primaryGuestName: guestForm.primaryGuestName,
          email: guestForm.email,
          phone: guestForm.phone,
          specialRequests: guestForm.specialRequests,
          adults: Number(guestForm.adults) || 1,
          children: Number(guestForm.children) || 0
        },
        paymentMethod
      };

      const { data } = await api.post('/bookings', payload);
      if (data.success && data.booking) {
        setShowBookingModal(false);
        navigate(`/booking/confirmation/${data.booking.bookingReference}`);
      }
    } catch (err) {
      setBookingError(err.message || 'Failed to complete reservation. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5 my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Hotel details...</span>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="container py-5 text-center">
        <div className="card p-5 border-0 shadow-sm mx-auto" style={{ maxWidth: 500 }}>
          <i className="bi bi-exclamation-circle text-danger display-4 mb-3"></i>
          <h4>Property Not Found</h4>
          <p className="text-muted">{error || 'The requested hotel property is unavailable.'}</p>
          <div>
            <Link to="/hotels" className="btn btn-navy px-4">Browse All Hotels</Link>
          </div>
        </div>
      </div>
    );
  }

  const nights = calculateStayNights();
  const roomPrice = selectedRoom?.pricePerNight || 0;
  const subtotal = roomPrice * nights * roomCount;
  const taxes = Math.round(subtotal * 0.12);
  const totalAmount = subtotal + taxes;

  return (
    <div className="py-4">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb small">
            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/hotels">Hotels</Link></li>
            <li className="breadcrumb-item active" aria-current="page">{hotel.name}</li>
          </ol>
        </nav>

        {/* Header Title & Rating */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start mb-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-navy text-warning px-2 py-1">
                ★ {hotel.starRating} Star Luxury
              </span>
              <span className="text-muted small">
                <i className="bi bi-geo-alt me-1 text-danger"></i>
                {hotel.address?.street}, {hotel.address?.city}, {hotel.address?.state}
              </span>
            </div>
            <h1 className="fw-bold mb-1">{hotel.name}</h1>
            <p className="text-muted fst-italic mb-0">{hotel.tagline}</p>
          </div>

          <div className="mt-3 mt-md-0 text-md-end">
            <span className="text-muted small d-block">Starting Nightly Rate</span>
            <div className="price-display text-primary">
              ₹{(rooms.length > 0 ? Math.min(...rooms.map(r => r.pricePerNight)) : 4500).toLocaleString('en-IN')}
              <span className="price-sub"> / night</span>
            </div>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="row g-3 mb-4">
          <div className="col-lg-8">
            <div className="rounded-4 overflow-hidden shadow-sm" style={{ height: '420px' }}>
              <ImageWithFallback
                src={hotel.images?.[0]}
                alt={hotel.name}
                className="w-100 h-100 object-fit-cover"
              />
            </div>
          </div>
          <div className="col-lg-4 d-none d-lg-block">
            <div className="d-flex flex-column gap-3 h-100">
              <div className="rounded-4 overflow-hidden shadow-sm flex-fill" style={{ height: '200px' }}>
                <ImageWithFallback
                  src={hotel.images?.[1] || hotel.images?.[0]}
                  alt="Gallery 1"
                  className="w-100 h-100 object-fit-cover"
                />
              </div>
              <div className="rounded-4 overflow-hidden shadow-sm flex-fill" style={{ height: '200px' }}>
                <ImageWithFallback
                  src={hotel.images?.[2] || hotel.images?.[0]}
                  alt="Gallery 2"
                  className="w-100 h-100 object-fit-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stay Dates Bar */}
        <div className="card shadow-sm border-0 p-3 mb-4 rounded-3 bg-white">
          <div className="row g-3 align-items-center">
            <div className="col-md-4">
              <label className="form-label small fw-semibold text-muted mb-1">
                <i className="bi bi-calendar-check text-warning me-1"></i> Check-in Date
              </label>
              <input
                type="date"
                className="form-control"
                value={checkIn}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label small fw-semibold text-muted mb-1">
                <i className="bi bi-calendar-x text-warning me-1"></i> Check-out Date
              </label>
              <input
                type="date"
                className="form-control"
                value={checkOut}
                min={checkIn}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <div className="p-2 bg-light rounded text-center">
                <span className="small text-muted d-block">Reservation Length</span>
                <span className="fw-bold text-navy fs-6">
                  {nights} {nights === 1 ? 'Night' : 'Nights'}
                </span>
              </div>
            </div>
          </div>

          {dateError && (
            <div className="alert alert-danger py-2 mt-2 mb-0 small">{dateError}</div>
          )}
        </div>

        {/* Overview & Amenities Details */}
        <div className="row g-4 mb-5">
          <div className="col-lg-8">
            <div className="card shadow-sm border-0 p-4 rounded-3 mb-4 bg-white">
              <h4 className="fw-bold mb-3">About This Sanctuary</h4>
              <p className="text-secondary lh-lg mb-4">{hotel.description}</p>

              <h5 className="fw-bold mb-3">Hotel Amenities & Highlights</h5>
              <div className="row g-2">
                {hotel.amenities?.map((amenity, i) => (
                  <div key={i} className="col-sm-6">
                    <div className="d-flex align-items-center gap-2 p-2 rounded bg-light">
                      <i className="bi bi-check-circle-fill text-success"></i>
                      <span className="small fw-semibold">{amenity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Room Categories */}
            <div>
              <h3 className="fw-bold mb-3">Available Suites & Rooms</h3>
              {rooms.length === 0 ? (
                <div className="card p-4 text-center border-0 shadow-sm rounded-3">
                  <p className="text-muted mb-0">No suites currently active for this property.</p>
                </div>
              ) : (
                rooms.map((room) => (
                  <div key={room._id || room.id} className="room-card">
                    <div className="row g-0">
                      <div className="col-md-4">
                        <div className="h-100" style={{ minHeight: '220px' }}>
                          <ImageWithFallback
                            src={room.images?.[0]}
                            alt={room.roomType}
                            className="w-100 h-100 object-fit-cover"
                          />
                        </div>
                      </div>

                      <div className="col-md-8 p-4 d-flex flex-column justify-content-between">
                        <div>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h4 className="fw-bold mb-0 text-navy">{room.roomType}</h4>
                            <span className="badge bg-success-subtle text-success border border-success-subtle">
                              Instant Confirmation
                            </span>
                          </div>

                          <div className="d-flex flex-wrap gap-3 small text-muted mb-3">
                            <span><i className="bi bi-people-fill me-1 text-warning"></i>Max {room.capacity?.maxGuests || 2} Guests</span>
                            <span><i className="bi bi-lamp-fill me-1 text-warning"></i>{room.bedConfiguration || '1 King Bed'}</span>
                            <span><i className="bi bi-aspect-ratio me-1 text-warning"></i>{room.sizeSqFt || 400} sq ft</span>
                          </div>

                          <p className="small text-muted mb-3">
                            {room.description}
                          </p>

                          <div className="d-flex flex-wrap gap-1 mb-3">
                            {room.amenities?.slice(0, 4).map((amenity, idx) => (
                              <span key={idx} className="amenity-pill">
                                <i className="bi bi-check text-success"></i>
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                          <div>
                            <span className="price-sub">Price per night</span>
                            <div className="price-display">
                              ₹{(room.pricePerNight).toLocaleString('en-IN')}
                            </div>
                          </div>

                          <button
                            type="button"
                            className="btn btn-gold px-4 py-2"
                            onClick={() => handleOpenBooking(room)}
                          >
                            Reserve Suite
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Policies & Contact */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 p-4 rounded-3 mb-4 bg-white">
              <h5 className="fw-bold mb-3">Property Policies</h5>
              <div className="mb-3">
                <small className="text-muted d-block">Check-in Schedule</small>
                <span className="fw-semibold text-dark">From {hotel.policies?.checkInTime || '14:00'} hrs</span>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block">Check-out Schedule</small>
                <span className="fw-semibold text-dark">Until {hotel.policies?.checkOutTime || '11:00'} hrs</span>
              </div>
              <div>
                <small className="text-muted d-block">Cancellation Guarantee</small>
                <span className="small text-secondary">
                  {hotel.policies?.cancellationPolicy || 'Free cancellation up to 48 hours prior to arrival.'}
                </span>
              </div>
            </div>

            <div className="card shadow-sm border-0 p-4 rounded-3 bg-white">
              <h5 className="fw-bold mb-3">Need Assistance?</h5>
              <p className="small text-muted mb-2">Our concierge is at your service 24 hours a day.</p>
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className="bi bi-telephone-fill text-warning"></i>
                <span className="fw-semibold">{hotel.contact?.phone || '+91 22 6600 1122'}</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-envelope-fill text-warning"></i>
                <span className="small">{hotel.contact?.email || 'reservations@hotelpro.com'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Checkout Modal */}
      {showBookingModal && selectedRoom && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-navy text-white py-3 px-4">
                <div>
                  <h5 className="modal-title fw-bold">Complete Your Reservation</h5>
                  <small className="text-warning">{hotel.name} — {selectedRoom.roomType}</small>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowBookingModal(false)}
                ></button>
              </div>

              <form onSubmit={handleBookingSubmit}>
                <div className="modal-body p-4">
                  {bookingError && (
                    <div className="alert alert-danger py-2 mb-3 small">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      {bookingError}
                    </div>
                  )}

                  <div className="row g-4">
                    {/* Left: Guest Details Form */}
                    <div className="col-md-7">
                      <h6 className="fw-bold text-navy mb-3">
                        <i className="bi bi-person-fill text-warning me-2"></i>Guest Details
                      </h6>

                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted mb-1">Full Name</label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          value={guestForm.primaryGuestName}
                          onChange={(e) => setGuestForm({ ...guestForm, primaryGuestName: e.target.value })}
                        />
                      </div>

                      <div className="row g-2 mb-3">
                        <div className="col-sm-6">
                          <label className="form-label small fw-semibold text-muted mb-1">Email Address</label>
                          <input
                            type="email"
                            className="form-control"
                            required
                            value={guestForm.email}
                            onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                          />
                        </div>
                        <div className="col-sm-6">
                          <label className="form-label small fw-semibold text-muted mb-1">Contact Phone</label>
                          <input
                            type="tel"
                            className="form-control"
                            required
                            value={guestForm.phone}
                            onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="row g-2 mb-3">
                        <div className="col-sm-4">
                          <label className="form-label small fw-semibold text-muted mb-1">Room Count</label>
                          <select
                            className="form-select"
                            value={roomCount}
                            onChange={(e) => setRoomCount(Number(e.target.value))}
                          >
                            <option value="1">1 Suite</option>
                            <option value="2">2 Suites</option>
                            <option value="3">3 Suites</option>
                          </select>
                        </div>
                        <div className="col-sm-4">
                          <label className="form-label small fw-semibold text-muted mb-1">Adults</label>
                          <input
                            type="number"
                            className="form-control"
                            min="1"
                            max="8"
                            value={guestForm.adults}
                            onChange={(e) => setGuestForm({ ...guestForm, adults: e.target.value })}
                          />
                        </div>
                        <div className="col-sm-4">
                          <label className="form-label small fw-semibold text-muted mb-1">Children</label>
                          <input
                            type="number"
                            className="form-control"
                            min="0"
                            max="4"
                            value={guestForm.children}
                            onChange={(e) => setGuestForm({ ...guestForm, children: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-muted mb-1">Special Requests (Optional)</label>
                        <textarea
                          className="form-control"
                          rows="2"
                          placeholder="e.g. Airport pickup, quiet room, late check-in..."
                          value={guestForm.specialRequests}
                          onChange={(e) => setGuestForm({ ...guestForm, specialRequests: e.target.value })}
                        ></textarea>
                      </div>

                      {/* Payment Mode Selection */}
                      <div className="mt-3">
                        <label className="form-label small fw-semibold text-muted mb-1">Payment Method</label>
                        <div className="d-flex flex-column gap-2">
                          <div className="form-check p-3 border rounded bg-light">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="paymentMethod"
                              id="demoPay"
                              value="demo_checkout"
                              checked={paymentMethod === 'demo_checkout'}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <label className="form-check-label fw-semibold" htmlFor="demoPay">
                              <i className="bi bi-shield-check text-success me-2"></i>
                              Instant Demo Confirmation (No real card required)
                            </label>
                            <small className="d-block text-muted ps-4">
                              Instantly confirms and issues official booking reference.
                            </small>
                          </div>

                          <div className="form-check p-3 border rounded">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="paymentMethod"
                              id="hotelPay"
                              value="pay_at_hotel"
                              checked={paymentMethod === 'pay_at_hotel'}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <label className="form-check-label fw-semibold" htmlFor="hotelPay">
                              <i className="bi bi-cash-stack text-warning me-2"></i>
                              Pay at Hotel upon Arrival
                            </label>
                            <small className="d-block text-muted ps-4">
                              Settle payment during check-in at the front desk.
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Stay & Price Summary */}
                    <div className="col-md-5">
                      <div className="card bg-light border-0 p-3 rounded-3 h-100">
                        <h6 className="fw-bold text-navy mb-3">Reservation Summary</h6>

                        <div className="small mb-2">
                          <span className="text-muted">Dates:</span>{' '}
                          <span className="fw-semibold">{checkIn} to {checkOut}</span>
                        </div>
                        <div className="small mb-2">
                          <span className="text-muted">Duration:</span>{' '}
                          <span className="fw-semibold">{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
                        </div>
                        <div className="small mb-3">
                          <span className="text-muted">Rate:</span>{' '}
                          <span className="fw-semibold">₹{roomPrice.toLocaleString('en-IN')} / night</span>
                        </div>

                        <hr className="my-2" />

                        <div className="d-flex justify-content-between small mb-2">
                          <span className="text-muted">Subtotal ({roomCount} Suite × {nights} N):</span>
                          <span className="fw-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="d-flex justify-content-between small mb-2">
                          <span className="text-muted">State GST & Luxury Tax (12%):</span>
                          <span className="fw-semibold">₹{taxes.toLocaleString('en-IN')}</span>
                        </div>

                        <hr className="my-2" />

                        <div className="d-flex justify-content-between align-items-center my-2">
                          <span className="fw-bold text-navy">Total Amount</span>
                          <span className="fs-5 fw-bold text-navy">
                            ₹{totalAmount.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="mt-3 p-2 bg-white rounded border small text-muted">
                          <i className="bi bi-info-circle text-primary me-1"></i>
                          Cancellation is free up to 48 hours before check-in.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light px-4 py-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowBookingModal(false)}
                    disabled={bookingLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-gold px-4"
                    disabled={bookingLoading}
                  >
                    {bookingLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Confirming Reservation...
                      </>
                    ) : (
                      'Confirm & Book Now'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelDetailPage;

