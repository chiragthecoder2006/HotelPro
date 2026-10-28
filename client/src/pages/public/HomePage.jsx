import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import ImageWithFallback from '../../components/common/ImageWithFallback';

export const HomePage = () => {
  const navigate = useNavigate();

  // Search form state
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const checkoutDefault = new Date();
  checkoutDefault.setDate(checkoutDefault.getDate() + 4);

  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState(tomorrow.toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(checkoutDefault.toISOString().split('T')[0]);
  const [guests, setGuests] = useState('2');
  const [dateError, setDateError] = useState('');

  // Featured hotels state
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get('/hotels/featured');
        if (data.success) {
          setFeaturedHotels(data.hotels);
        }
      } catch (err) {
        console.error('Failed to load featured hotels:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setDateError('');

    if (new Date(checkOut) <= new Date(checkIn)) {
      setDateError('Check-out date must be after check-in date');
      return;
    }

    const params = new URLSearchParams();
    if (destination) params.append('search', destination);
    if (checkIn) params.append('checkIn', checkIn);
    if (checkOut) params.append('checkOut', checkOut);
    if (guests) params.append('guests', guests);

    navigate(`/hotels?${params.toString()}`);
  };

  const destinations = [
    { name: 'Mumbai', image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80', count: 'Oceanfront Luxury' },
    { name: 'Goa', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80', count: 'Beach Resorts & Spa' },
    { name: 'Jaipur', image: 'https://images.unsplash.com/photo-1603262110263-fb010d6e59d4?auto=format&fit=crop&w=600&q=80', count: 'Royal Heritage Forts' },
    { name: 'Udaipur', image: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=600&q=80', count: 'Lakeside Palaces' }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-wrapper text-center text-md-start">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <div className="hero-tagline">
                <i className="bi bi-stars me-2"></i> Handpicked Luxury Hospitality
              </div>
              <h1 className="hero-title">
                Experience Timeless Elegance & Unmatched Stays
              </h1>
              <p className="hero-subtitle">
                Discover bespoke 5-star properties, royal heritage palaces, and oceanfront sanctuaries. Verified reservations with instant confirmation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Search Container */}
      <div className="container">
        <div className="search-card">
          <form onSubmit={handleSearch}>
            <div className="row g-3 align-items-end">
              <div className="col-lg-3 col-md-6">
                <label className="form-label fw-semibold text-muted small mb-1">
                  <i className="bi bi-geo-alt-fill text-warning me-1"></i> Destination or Hotel
                </label>
                <input
                  type="text"
                  className="form-control py-2"
                  placeholder="e.g. Mumbai, Goa, Palace..."
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>

              <div className="col-lg-2 col-md-3 col-6">
                <label className="form-label fw-semibold text-muted small mb-1">
                  <i className="bi bi-calendar-event text-warning me-1"></i> Check-In
                </label>
                <input
                  type="date"
                  className="form-control py-2"
                  value={checkIn}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckIn(e.target.value)}
                  required
                />
              </div>

              <div className="col-lg-2 col-md-3 col-6">
                <label className="form-label fw-semibold text-muted small mb-1">
                  <i className="bi bi-calendar-check text-warning me-1"></i> Check-Out
                </label>
                <input
                  type="date"
                  className="form-control py-2"
                  value={checkOut}
                  min={checkIn}
                  onChange={(e) => setCheckOut(e.target.value)}
                  required
                />
              </div>

              <div className="col-lg-2 col-md-6">
                <label className="form-label fw-semibold text-muted small mb-1">
                  <i className="bi bi-people-fill text-warning me-1"></i> Guests
                </label>
                <select
                  className="form-select py-2"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                >
                  <option value="1">1 Adult (Single)</option>
                  <option value="2">2 Adults (Couple/Twin)</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests (Family Suite)</option>
                </select>
              </div>

              <div className="col-lg-3 col-md-6">
                <button type="submit" className="btn btn-gold w-100 py-2 d-flex align-items-center justify-content-center gap-2">
                  <i className="bi bi-search"></i>
                  <span>Find Available Rooms</span>
                </button>
              </div>
            </div>

            {dateError && (
              <div className="alert alert-danger py-2 mt-3 small mb-0">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {dateError}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Featured Properties Section */}
      <section className="py-5 my-4">
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
            <div>
              <span className="text-uppercase fw-bold text-warning small letter-spacing-1">
                Curated Collection
              </span>
              <h2 className="display-6 fw-bold mb-1">Featured Luxury Stays</h2>
              <p className="text-muted mb-0">
                Explore handpicked properties recognized for exceptional hospitality and architectural charm.
              </p>
            </div>
            <Link to="/hotels" className="btn btn-outline-navy mt-3 mt-md-0 d-inline-flex align-items-center gap-2">
              <span>View All Properties</span>
              <i className="bi bi-arrow-right"></i>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading featured properties...</span>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {featuredHotels.map((hotel) => (
                <div key={hotel._id || hotel.id} className="col-lg-4 col-md-6">
                  <div className="hotel-card">
                    <div className="hotel-card-img-wrapper">
                      <ImageWithFallback
                        src={hotel.images?.[0]}
                        alt={hotel.name}
                        className="hotel-card-img"
                      />
                      <span className="hotel-badge-featured">
                        ★ {hotel.starRating} Star Luxury
                      </span>
                      <span className="hotel-badge-city">
                        <i className="bi bi-geo-alt me-1"></i>
                        {hotel.address?.city}
                      </span>
                    </div>

                    <div className="hotel-card-body">
                      <h5 className="hotel-card-title">{hotel.name}</h5>
                      <p className="text-muted small mb-3 flex-grow-1">
                        {hotel.tagline || hotel.description.slice(0, 100) + '...'}
                      </p>

                      <div className="d-flex flex-wrap gap-1 mb-3">
                        {hotel.amenities?.slice(0, 3).map((amenity, idx) => (
                          <span key={idx} className="amenity-pill">
                            <i className="bi bi-check2 text-success"></i>
                            {amenity}
                          </span>
                        ))}
                      </div>

                      <hr className="my-2 opacity-10" />

                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <div>
                          <div className="price-sub">Starting from</div>
                          <div className="price-display">
                            ₹{(hotel.startingPrice || 4500).toLocaleString('en-IN')}
                            <span className="price-sub"> / night</span>
                          </div>
                        </div>

                        <Link
                          to={`/hotels/${hotel.slug || hotel._id}`}
                          className="btn btn-navy btn-sm px-3 py-2"
                        >
                          View Suites
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Destinations Showcase */}
      <section className="py-5 bg-white border-top border-bottom">
        <div className="container">
          <div className="text-center max-w-700 mx-auto mb-5">
            <span className="text-uppercase fw-bold text-warning small">Inspirational Escapes</span>
            <h2 className="display-6 fw-bold">Explore By Destination</h2>
            <p className="text-muted">
              Whether you yearn for the Arabian sea breeze, royal forts, or tranquil backwaters, HotelPro has you covered.
            </p>
          </div>

          <div className="row g-4">
            {destinations.map((dest, i) => (
              <div key={i} className="col-lg-3 col-sm-6">
                <Link
                  to={`/hotels?city=${dest.name}`}
                  className="card border-0 rounded-4 overflow-hidden shadow-sm position-relative text-white h-100 text-decoration-none group-hover"
                  style={{ minHeight: '260px' }}
                >
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-100 h-100 position-absolute top-0 start-0 object-fit-cover"
                    style={{ filter: 'brightness(0.65)' }}
                  />
                  <div className="position-relative p-4 d-flex flex-column justify-content-end h-100">
                    <h4 className="fw-bold mb-1 text-white">{dest.name}</h4>
                    <span className="small text-warning fw-semibold">{dest.count}</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Book With HotelPro Pillar Section */}
      <section className="py-5 my-4">
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-md-3 col-sm-6">
              <div className="p-4 bg-white rounded-3 shadow-sm h-100 border border-light">
                <i className="bi bi-shield-check display-5 text-warning mb-3"></i>
                <h5 className="fw-bold">100% Verified Stays</h5>
                <p className="text-muted small mb-0">
                  Every hotel and suite is vetted for impeccable cleanliness and 5-star service standards.
                </p>
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div className="p-4 bg-white rounded-3 shadow-sm h-100 border border-light">
                <i className="bi bi-tag-fill display-5 text-warning mb-3"></i>
                <h5 className="fw-bold">Best Price Promise</h5>
                <p className="text-muted small mb-0">
                  Direct partner rates with zero hidden reservation surcharges or booking fees.
                </p>
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div className="p-4 bg-white rounded-3 shadow-sm h-100 border border-light">
                <i className="bi bi-arrow-repeat display-5 text-warning mb-3"></i>
                <h5 className="fw-bold">Flexible Cancellation</h5>
                <p className="text-muted small mb-0">
                  Plans changed? Enjoy effortless cancellation with instantaneous inventory release.
                </p>
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div className="p-4 bg-white rounded-3 shadow-sm h-100 border border-light">
                <i className="bi bi-headset display-5 text-warning mb-3"></i>
                <h5 className="fw-bold">24/7 Concierge</h5>
                <p className="text-muted small mb-0">
                  Dedicated hospitality specialists standing by to assist with transfers and special requests.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

