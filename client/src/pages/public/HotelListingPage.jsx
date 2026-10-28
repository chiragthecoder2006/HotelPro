import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../api/client';
import ImageWithFallback from '../../components/common/ImageWithFallback';

export const HotelListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters from searchParams
  const cityParam = searchParams.get('city') || '';
  const searchParam = searchParams.get('search') || '';
  const ratingParam = searchParams.get('starRating') || '';
  const sortParam = searchParams.get('sort') || 'rating-desc';

  const [searchInput, setSearchInput] = useState(searchParam);
  const [selectedCity, setSelectedCity] = useState(cityParam);
  const [selectedRating, setSelectedRating] = useState(ratingParam);
  const [selectedSort, setSelectedSort] = useState(sortParam);

  const cities = ['All', 'Mumbai', 'Goa', 'Jaipur', 'Udaipur', 'Munnar'];

  useEffect(() => {
    fetchHotels();
  }, [searchParams]);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const queryString = searchParams.toString();
      const { data } = await api.get(`/hotels?${queryString}`);
      if (data.success) {
        setHotels(data.hotels);
        setTotalCount(data.total || data.count);
      }
    } catch (err) {
      console.error('Failed to fetch hotels:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (newFilters = {}) => {
    const updated = new URLSearchParams(searchParams);

    const merged = {
      search: searchInput,
      city: selectedCity === 'All' ? '' : selectedCity,
      starRating: selectedRating,
      sort: selectedSort,
      ...newFilters
    };

    Object.entries(merged).forEach(([k, v]) => {
      if (v) updated.set(k, v);
      else updated.delete(k);
    });

    setSearchParams(updated);
  };

  const handleCityClick = (city) => {
    const newCity = city === 'All' ? '' : city;
    setSelectedCity(city);
    applyFilters({ city: newCity });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applyFilters({ search: searchInput });
  };

  const resetFilters = () => {
    setSearchInput('');
    setSelectedCity('All');
    setSelectedRating('');
    setSelectedSort('rating-desc');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="py-4">
      <div className="container">
        {/* Page Header */}
        <div className="mb-4">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb small">
              <li className="breadcrumb-item"><Link to="/">Home</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Explore Hotels</li>
            </ol>
          </nav>
          <h1 className="fw-bold mb-1">Explore Luxury Properties</h1>
          <p className="text-muted">
            Showing {totalCount} handpicked sanctuaries across prime destinations.
          </p>
        </div>

        {/* City Filter Pills */}
        <div className="d-flex flex-wrap gap-2 mb-4 pb-2 border-bottom">
          {cities.map((city) => (
            <button
              key={city}
              type="button"
              className={`btn btn-sm px-3 py-2 rounded-pill font-semibold ${
                (city === 'All' && !selectedCity) || selectedCity === city
                  ? 'btn-navy'
                  : 'btn-outline-secondary'
              }`}
              onClick={() => handleCityClick(city)}
            >
              {city === 'All' ? 'All Destinations' : city}
            </button>
          ))}
        </div>

        <div className="row g-4">
          {/* Filter Sidebar */}
          <div className="col-lg-3">
            <div className="card shadow-sm border-0 p-3 rounded-3 sticky-top" style={{ top: '90px' }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">
                  <i className="bi bi-sliders me-2 text-warning"></i>Filter Stays
                </h6>
                <button
                  type="button"
                  className="btn btn-link text-decoration-none btn-sm p-0 text-muted"
                  onClick={resetFilters}
                >
                  Reset All
                </button>
              </div>

              {/* Keyword Search */}
              <form onSubmit={handleSearchSubmit} className="mb-3">
                <label className="form-label small fw-semibold text-muted mb-1">Search Property</label>
                <div className="input-group input-group-sm">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Name or landmark..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                  <button className="btn btn-navy" type="submit">
                    <i className="bi bi-search"></i>
                  </button>
                </div>
              </form>

              {/* Star Rating Filter */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted mb-1">Minimum Rating</label>
                <select
                  className="form-select form-select-sm"
                  value={selectedRating}
                  onChange={(e) => {
                    setSelectedRating(e.target.value);
                    applyFilters({ starRating: e.target.value });
                  }}
                >
                  <option value="">Any Star Rating</option>
                  <option value="5">★★★★★ 5-Star Luxury Only</option>
                  <option value="4">★★★★☆ 4-Star & Above</option>
                  <option value="3">★★★☆☆ 3-Star & Above</option>
                </select>
              </div>

              {/* Sort By Filter */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted mb-1">Sort Results By</label>
                <select
                  className="form-select form-select-sm"
                  value={selectedSort}
                  onChange={(e) => {
                    setSelectedSort(e.target.value);
                    applyFilters({ sort: e.target.value });
                  }}
                >
                  <option value="rating-desc">Highest Guest Rating</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Hotel Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="col-lg-9">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading hotels...</span>
                </div>
                <p className="text-muted mt-2">Discovering premier accommodations...</p>
              </div>
            ) : hotels.length === 0 ? (
              <div className="card p-5 text-center border-0 shadow-sm rounded-3">
                <i className="bi bi-buildings text-muted display-4 mb-3"></i>
                <h4 className="fw-bold">No properties found</h4>
                <p className="text-muted mb-3">
                  We could not find any properties matching your current filter criteria.
                </p>
                <div>
                  <button className="btn btn-navy btn-sm px-4" onClick={resetFilters}>
                    Clear Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="row g-4">
                {hotels.map((hotel) => (
                  <div key={hotel._id || hotel.id} className="col-md-6">
                    <div className="hotel-card">
                      <div className="hotel-card-img-wrapper">
                        <ImageWithFallback
                          src={hotel.images?.[0]}
                          alt={hotel.name}
                          className="hotel-card-img"
                        />
                        <span className="hotel-badge-featured">
                          ★ {hotel.starRating} Star
                        </span>
                        <span className="hotel-badge-city">
                          <i className="bi bi-geo-alt me-1"></i>
                          {hotel.address?.city}
                        </span>
                      </div>

                      <div className="hotel-card-body">
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <h5 className="hotel-card-title mb-0">{hotel.name}</h5>
                          <span className="star-rating">
                            {'★'.repeat(hotel.starRating || 4)}
                          </span>
                        </div>

                        <p className="small text-muted mb-1">
                          <i className="bi bi-map me-1 text-secondary"></i>
                          {hotel.address?.street}, {hotel.address?.city}
                        </p>

                        <p className="text-muted small mb-3 flex-grow-1">
                          {hotel.tagline || hotel.description.slice(0, 95) + '...'}
                        </p>

                        <div className="d-flex flex-wrap gap-1 mb-3">
                          {hotel.amenities?.slice(0, 3).map((a, i) => (
                            <span key={i} className="amenity-pill">
                              <i className="bi bi-check2 text-success"></i>
                              {a}
                            </span>
                          ))}
                        </div>

                        <hr className="my-2 opacity-10" />

                        <div className="d-flex justify-content-between align-items-center mt-2">
                          <div>
                            <div className="price-sub">From</div>
                            <div className="price-display">
                              ₹{(hotel.startingPrice || 4500).toLocaleString('en-IN')}
                              <span className="price-sub"> / night</span>
                            </div>
                          </div>

                          <Link
                            to={`/hotels/${hotel.slug || hotel._id}`}
                            className="btn btn-gold btn-sm px-3 py-2"
                          >
                            Select Suites
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelListingPage;

