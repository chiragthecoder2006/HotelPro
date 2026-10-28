import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboardPage = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedHotelForRooms, setSelectedHotelForRooms] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  // Add Hotel Modal
  const [showAddHotelModal, setShowAddHotelModal] = useState(false);
  const [hotelForm, setHotelForm] = useState({
    name: '',
    tagline: '',
    description: '',
    city: '',
    street: '',
    state: '',
    starRating: 5,
    featured: true
  });

  // Add Room Modal
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [roomForm, setRoomForm] = useState({
    hotel: '',
    roomType: '',
    description: '',
    pricePerNight: 6000,
    totalInventory: 5,
    maxGuests: 2,
    bedConfiguration: '1 King Bed'
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, hotelsRes, bookingsRes, usersRes] = await Promise.all([
        api.get('/admin/dashboard-stats'),
        api.get('/hotels?limit=50'),
        api.get('/bookings/admin/all?limit=50'),
        api.get('/admin/users?limit=50')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (hotelsRes.data.success) {
        setHotels(hotelsRes.data.hotels);
        if (hotelsRes.data.hotels.length > 0 && !selectedHotelForRooms) {
          const firstHotelId = hotelsRes.data.hotels[0]._id || hotelsRes.data.hotels[0].id;
          setSelectedHotelForRooms(firstHotelId);
          fetchRoomsForHotel(firstHotelId);
        }
      }
      if (bookingsRes.data.success) setBookings(bookingsRes.data.bookings);
      if (usersRes.data.success) setUsers(usersRes.data.users);
    } catch (err) {
      setActionError(err.message || 'Failed to load administrative records');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const { data } = await api.put(`/admin/users/${userId}/status`, { accountStatus: nextStatus });
      if (data.success) {
        setActionMessage(`User account status updated to ${nextStatus}`);
        fetchDashboardData();
      }
    } catch (err) {
      setActionError(err.message || 'Failed to update user status');
    }
  };

  const fetchRoomsForHotel = async (hotelId) => {
    try {
      const { data } = await api.get(`/rooms/hotel/${hotelId}`);
      if (data.success) {
        setRooms(data.rooms);
      }
    } catch (err) {
      console.error('Failed to load rooms for hotel:', err);
    }
  };

  const handleToggleHotel = async (hotelId) => {
    try {
      const { data } = await api.delete(`/hotels/${hotelId}`);
      if (data.success) {
        setActionMessage(data.message);
        fetchDashboardData();
      }
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleToggleRoom = async (roomId) => {
    try {
      const { data } = await api.delete(`/rooms/${roomId}`);
      if (data.success) {
        setActionMessage(data.message);
        fetchRoomsForHotel(selectedHotelForRooms);
      }
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const { data } = await api.put(`/bookings/admin/${bookingId}/status`, {
        status: newStatus
      });
      if (data.success) {
        setActionMessage(`Booking status updated to ${newStatus}`);
        fetchDashboardData();
      }
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleCreateHotel = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: hotelForm.name,
        tagline: hotelForm.tagline,
        description: hotelForm.description,
        address: {
          city: hotelForm.city,
          street: hotelForm.street,
          state: hotelForm.state,
          country: 'India'
        },
        starRating: Number(hotelForm.starRating),
        featured: hotelForm.featured
      };
      const { data } = await api.post('/hotels', payload);
      if (data.success) {
        setActionMessage('New property created successfully!');
        setShowAddHotelModal(false);
        fetchDashboardData();
      }
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        hotel: roomForm.hotel || selectedHotelForRooms,
        roomType: roomForm.roomType,
        description: roomForm.description,
        pricePerNight: Number(roomForm.pricePerNight),
        totalInventory: Number(roomForm.totalInventory),
        capacity: { maxGuests: Number(roomForm.maxGuests), adults: Number(roomForm.maxGuests), children: 1 },
        bedConfiguration: roomForm.bedConfiguration
      };
      const { data } = await api.post('/rooms', payload);
      if (data.success) {
        setActionMessage('New suite category added successfully!');
        setShowAddRoomModal(false);
        fetchRoomsForHotel(payload.hotel);
      }
    } catch (err) {
      setActionError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5 my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading administrative stats...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="container-fluid px-lg-5">
        {/* Admin Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-3 border-bottom">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-danger px-2 py-1">Admin Control Room</span>
              <span className="text-muted small">Real MongoDB Aggregate Queries</span>
            </div>
            <h2 className="fw-bold text-navy mb-0">Platform Administration & Insights</h2>
          </div>

          <div className="d-flex gap-2 mt-3 mt-md-0">
            <button
              className="btn btn-navy btn-sm px-3"
              onClick={() => setShowAddHotelModal(true)}
            >
              <i className="bi bi-building-add me-1"></i> Add Property
            </button>
            <button
              className="btn btn-gold btn-sm px-3"
              onClick={() => {
                setRoomForm(prev => ({ ...prev, hotel: selectedHotelForRooms }));
                setShowAddRoomModal(true);
              }}
            >
              <i className="bi bi-door-open me-1"></i> Add Suite Category
            </button>
          </div>
        </div>

        {actionMessage && (
          <div className="alert alert-success alert-dismissible fade show small" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i>
            {actionMessage}
            <button type="button" className="btn-close" onClick={() => setActionMessage('')}></button>
          </div>
        )}

        {actionError && (
          <div className="alert alert-danger alert-dismissible fade show small" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {actionError}
            <button type="button" className="btn-close" onClick={() => setActionError('')}></button>
          </div>
        )}

        {/* Navigation Tabs */}
        <ul className="nav nav-pills mb-4 gap-2">
          <li className="nav-item">
            <button
              className={`nav-link px-4 ${activeTab === 'overview' ? 'active bg-navy text-gold fw-bold' : 'text-dark bg-white shadow-sm'}`}
              onClick={() => setActiveTab('overview')}
            >
              <i className="bi bi-pie-chart-fill me-2"></i> Analytics Overview
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link px-4 ${activeTab === 'hotels' ? 'active bg-navy text-gold fw-bold' : 'text-dark bg-white shadow-sm'}`}
              onClick={() => setActiveTab('hotels')}
            >
              <i className="bi bi-buildings-fill me-2"></i> Properties ({hotels.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link px-4 ${activeTab === 'rooms' ? 'active bg-navy text-gold fw-bold' : 'text-dark bg-white shadow-sm'}`}
              onClick={() => setActiveTab('rooms')}
            >
              <i className="bi bi-door-closed-fill me-2"></i> Suites & Inventory
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link px-4 ${activeTab === 'bookings' ? 'active bg-navy text-gold fw-bold' : 'text-dark bg-white shadow-sm'}`}
              onClick={() => setActiveTab('bookings')}
            >
              <i className="bi bi-journal-check me-2"></i> Global Bookings ({bookings.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link px-4 ${activeTab === 'users' ? 'active bg-navy text-gold fw-bold' : 'text-dark bg-white shadow-sm'}`}
              onClick={() => setActiveTab('users')}
            >
              <i className="bi bi-people-fill me-2"></i> Users ({users.length})
            </button>
          </li>
        </ul>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && stats && (
          <div>
            {/* KPI Metric Cards */}
            <div className="row g-3 mb-4">
              <div className="col-xl-3 col-sm-6">
                <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100 border-start border-4 border-warning">
                  <span className="text-muted small text-uppercase fw-semibold">Net Platform Revenue</span>
                  <h3 className="fw-bold text-navy my-1">
                    ₹{stats.totalRevenue.toLocaleString('en-IN')}
                  </h3>
                  <small className="text-success fw-semibold">
                    <i className="bi bi-shield-check me-1"></i>
                    From verified bookings
                  </small>
                </div>
              </div>

              <div className="col-xl-3 col-sm-6">
                <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100 border-start border-4 border-primary">
                  <span className="text-muted small text-uppercase fw-semibold">Total Reservations</span>
                  <h3 className="fw-bold text-navy my-1">{stats.totalBookings}</h3>
                  <small className="text-muted">
                    {stats.confirmedBookings} confirmed • {stats.cancelledBookings} cancelled
                  </small>
                </div>
              </div>

              <div className="col-xl-3 col-sm-6">
                <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100 border-start border-4 border-success">
                  <span className="text-muted small text-uppercase fw-semibold">Active Properties</span>
                  <h3 className="fw-bold text-navy my-1">
                    {stats.activeHotels} / {stats.totalHotels}
                  </h3>
                  <small className="text-muted">
                    {stats.activeRooms} total room categories
                  </small>
                </div>
              </div>

              <div className="col-xl-3 col-sm-6">
                <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100 border-start border-4 border-info">
                  <span className="text-muted small text-uppercase fw-semibold">Registered Guests</span>
                  <h3 className="fw-bold text-navy my-1">{stats.totalUsers}</h3>
                  <small className="text-muted">
                    {stats.totalCustomers} customer profiles
                  </small>
                </div>
              </div>
            </div>

            {/* City Distribution and Recent Bookings */}
            <div className="row g-4">
              <div className="col-lg-5">
                <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
                  <h5 className="fw-bold text-navy mb-3">Destinations Breakdown</h5>
                  <div className="d-flex flex-column gap-3">
                    {stats.cityDistribution.map((item, idx) => (
                      <div key={idx} className="d-flex justify-content-between align-items-center p-2 rounded bg-light">
                        <span className="fw-semibold text-dark">
                          <i className="bi bi-geo-alt-fill text-danger me-2"></i>
                          {item._id || 'Other'}
                        </span>
                        <span className="badge bg-navy text-gold px-3 py-2 rounded-pill">
                          {item.count} {item.count === 1 ? 'Property' : 'Properties'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="col-lg-7">
                <div className="card border-0 shadow-sm rounded-3 p-4 bg-white h-100">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-navy mb-0">Recent Reservations</h5>
                    <button
                      className="btn btn-link text-decoration-none btn-sm text-primary p-0"
                      onClick={() => setActiveTab('bookings')}
                    >
                      View All Bookings &rarr;
                    </button>
                  </div>

                  <div className="table-responsive">
                    <table className="table align-middle table-hover small">
                      <thead className="table-light">
                        <tr>
                          <th>Ref</th>
                          <th>Hotel</th>
                          <th>Guest</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentBookings.map((b) => (
                          <tr key={b._id}>
                            <td className="font-monospace fw-bold">{b.bookingReference}</td>
                            <td>{b.hotel?.name}</td>
                            <td>{b.user?.name || 'Guest'}</td>
                            <td className="fw-semibold">₹{b.pricing?.totalAmount?.toLocaleString('en-IN')}</td>
                            <td>
                              <span
                                className={`badge text-uppercase ${
                                  b.bookingStatus === 'confirmed'
                                    ? 'badge-confirmed'
                                    : b.bookingStatus === 'completed'
                                    ? 'badge-completed'
                                    : 'badge-cancelled'
                                }`}
                              >
                                {b.bookingStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Tab 5: Users Management */}
        {activeTab === 'users' && (
          <div className="card border-0 shadow-sm rounded-3 bg-white p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold text-navy mb-0">Platform Registered Users</h5>
                <small className="text-muted">Total registered customer and admin accounts</small>
              </div>
              <span className="badge bg-navy text-gold px-3 py-2">
                {users.length} Registered Accounts
              </span>
            </div>

            <div className="table-responsive">
              <table className="table align-middle table-hover small">
                <thead className="table-light">
                  <tr>
                    <th>User Details</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                    <th>System Role</th>
                    <th>Account Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const uId = u._id || u.id;
                    const isCurrentUser = user && ((user._id || user.id) === uId || user.email === u.email);
                    return (
                      <tr key={uId}>
                        <td>
                          <div className="fw-bold text-dark">{u.name}</div>
                          <small className="text-muted">ID: {uId}</small>
                        </td>
                        <td>{u.email}</td>
                        <td>{u.phone || '—'}</td>
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'bg-warning text-dark' : 'bg-primary'}`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${u.accountStatus === 'active' ? 'bg-success' : 'bg-danger'}`}>
                            {u.accountStatus ? u.accountStatus.toUpperCase() : 'ACTIVE'}
                          </span>
                        </td>
                        <td>
                          {isCurrentUser ? (
                            <span className="text-muted small fst-italic">Current Session</span>
                          ) : (
                            <button
                              className={`btn btn-sm ${u.accountStatus === 'active' ? 'btn-outline-danger' : 'btn-outline-success'} py-1 px-2`}
                              onClick={() => handleToggleUserStatus(uId, u.accountStatus || 'active')}
                            >
                              <i className={`bi ${u.accountStatus === 'active' ? 'bi-person-slash' : 'bi-person-check'} me-1`}></i>
                              {u.accountStatus === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Hotels Management */}
        {activeTab === 'hotels' && (
          <div className="card border-0 shadow-sm rounded-3 bg-white p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-navy mb-0">Properties Registry</h5>
              <button className="btn btn-navy btn-sm" onClick={() => setShowAddHotelModal(true)}>
                <i className="bi bi-plus-lg me-1"></i> Add Property
              </button>
            </div>

            <div className="table-responsive">
              <table className="table align-middle table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Hotel Name</th>
                    <th>City</th>
                    <th>Rating</th>
                    <th>Starting Rate</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hotels.map((h) => {
                    const hId = h._id || h.id;
                    return (
                      <tr key={hId}>
                        <td>
                          <div className="fw-bold text-navy">{h.name}</div>
                          <small className="text-muted">{h.tagline || h.address?.street}</small>
                        </td>
                        <td>{h.address?.city}</td>
                        <td className="text-warning">★ {h.starRating}</td>
                        <td className="fw-semibold">₹{(h.startingPrice || 4500).toLocaleString('en-IN')}</td>
                        <td>
                          <span className={`badge ${h.isActive !== false ? 'bg-success' : 'bg-secondary'}`}>
                            {h.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="text-end">
                          <button
                            type="button"
                            className={`btn btn-sm ${h.isActive !== false ? 'btn-outline-danger' : 'btn-outline-success'} me-2`}
                            onClick={() => handleToggleHotel(hId)}
                          >
                            {h.isActive !== false ? 'Deactivate' : 'Activate'}
                          </button>
                          <Link
                            to={`/hotels/${h.slug || hId}`}
                            className="btn btn-sm btn-outline-navy"
                            target="_blank"
                          >
                            Preview
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* Tab 5: Users Management */}
        {activeTab === 'users' && (
          <div className="card border-0 shadow-sm rounded-3 bg-white p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold text-navy mb-0">Platform Registered Users</h5>
                <small className="text-muted">Total registered customer and admin accounts</small>
              </div>
              <span className="badge bg-navy text-gold px-3 py-2">
                {users.length} Registered Accounts
              </span>
            </div>

            <div className="table-responsive">
              <table className="table align-middle table-hover small">
                <thead className="table-light">
                  <tr>
                    <th>User Details</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                    <th>System Role</th>
                    <th>Account Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const uId = u._id || u.id;
                    const isCurrentUser = user && ((user._id || user.id) === uId || user.email === u.email);
                    return (
                      <tr key={uId}>
                        <td>
                          <div className="fw-bold text-dark">{u.name}</div>
                          <small className="text-muted">ID: {uId}</small>
                        </td>
                        <td>{u.email}</td>
                        <td>{u.phone || '—'}</td>
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'bg-warning text-dark' : 'bg-primary'}`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${u.accountStatus === 'active' ? 'bg-success' : 'bg-danger'}`}>
                            {u.accountStatus ? u.accountStatus.toUpperCase() : 'ACTIVE'}
                          </span>
                        </td>
                        <td>
                          {isCurrentUser ? (
                            <span className="text-muted small fst-italic">Current Session</span>
                          ) : (
                            <button
                              className={`btn btn-sm ${u.accountStatus === 'active' ? 'btn-outline-danger' : 'btn-outline-success'} py-1 px-2`}
                              onClick={() => handleToggleUserStatus(uId, u.accountStatus || 'active')}
                            >
                              <i className={`bi ${u.accountStatus === 'active' ? 'bi-person-slash' : 'bi-person-check'} me-1`}></i>
                              {u.accountStatus === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Rooms Management */}
        {activeTab === 'rooms' && (
          <div className="card border-0 shadow-sm rounded-3 bg-white p-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
              <div>
                <h5 className="fw-bold text-navy mb-1">Room Categories & Physical Inventory</h5>
                <p className="text-muted small mb-0">Select a property to inspect and configure its suites.</p>
              </div>

              <div className="d-flex align-items-center gap-2">
                <select
                  className="form-select form-select-sm"
                  value={selectedHotelForRooms}
                  onChange={(e) => {
                    setSelectedHotelForRooms(e.target.value);
                    fetchRoomsForHotel(e.target.value);
                  }}
                  style={{ minWidth: '220px' }}
                >
                  {hotels.map((h) => (
                    <option key={h._id || h.id} value={h._id || h.id}>
                      {h.name} ({h.address?.city})
                    </option>
                  ))}
                </select>

                <button
                  className="btn btn-gold btn-sm text-nowrap"
                  onClick={() => {
                    setRoomForm(prev => ({ ...prev, hotel: selectedHotelForRooms }));
                    setShowAddRoomModal(true);
                  }}
                >
                  <i className="bi bi-plus-lg me-1"></i> Add Room Category
                </button>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table align-middle table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Room Type</th>
                    <th>Bed / Configuration</th>
                    <th>Capacity</th>
                    <th>Total Inventory</th>
                    <th>Price / Night</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted">
                        No rooms configured for this property.
                      </td>
                    </tr>
                  ) : (
                    rooms.map((r) => {
                      const rId = r._id || r.id;
                      return (
                        <tr key={rId}>
                          <td className="fw-semibold text-navy">{r.roomType}</td>
                          <td>{r.bedConfiguration || '1 King Bed'}</td>
                          <td>Max {r.capacity?.maxGuests || 2} Guests</td>
                          <td>
                            <span className="badge bg-light text-dark border">
                              {r.totalInventory || 5} Rooms
                            </span>
                          </td>
                          <td className="fw-bold">₹{r.pricePerNight?.toLocaleString('en-IN')}</td>
                          <td>
                            <span className={`badge ${r.isActive !== false ? 'bg-success' : 'bg-secondary'}`}>
                              {r.isActive !== false ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="text-end">
                            <button
                              type="button"
                              className={`btn btn-sm ${r.isActive !== false ? 'btn-outline-danger' : 'btn-outline-success'}`}
                              onClick={() => handleToggleRoom(rId)}
                            >
                              {r.isActive !== false ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* Tab 5: Users Management */}
        {activeTab === 'users' && (
          <div className="card border-0 shadow-sm rounded-3 bg-white p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold text-navy mb-0">Platform Registered Users</h5>
                <small className="text-muted">Total registered customer and admin accounts</small>
              </div>
              <span className="badge bg-navy text-gold px-3 py-2">
                {users.length} Registered Accounts
              </span>
            </div>

            <div className="table-responsive">
              <table className="table align-middle table-hover small">
                <thead className="table-light">
                  <tr>
                    <th>User Details</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                    <th>System Role</th>
                    <th>Account Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const uId = u._id || u.id;
                    const isCurrentUser = user && ((user._id || user.id) === uId || user.email === u.email);
                    return (
                      <tr key={uId}>
                        <td>
                          <div className="fw-bold text-dark">{u.name}</div>
                          <small className="text-muted">ID: {uId}</small>
                        </td>
                        <td>{u.email}</td>
                        <td>{u.phone || '—'}</td>
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'bg-warning text-dark' : 'bg-primary'}`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${u.accountStatus === 'active' ? 'bg-success' : 'bg-danger'}`}>
                            {u.accountStatus ? u.accountStatus.toUpperCase() : 'ACTIVE'}
                          </span>
                        </td>
                        <td>
                          {isCurrentUser ? (
                            <span className="text-muted small fst-italic">Current Session</span>
                          ) : (
                            <button
                              className={`btn btn-sm ${u.accountStatus === 'active' ? 'btn-outline-danger' : 'btn-outline-success'} py-1 px-2`}
                              onClick={() => handleToggleUserStatus(uId, u.accountStatus || 'active')}
                            >
                              <i className={`bi ${u.accountStatus === 'active' ? 'bi-person-slash' : 'bi-person-check'} me-1`}></i>
                              {u.accountStatus === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Bookings Management */}
        {activeTab === 'bookings' && (
          <div className="card border-0 shadow-sm rounded-3 bg-white p-4">
            <h5 className="fw-bold text-navy mb-3">All Customer Reservations</h5>

            <div className="table-responsive">
              <table className="table align-middle table-hover small">
                <thead className="table-light">
                  <tr>
                    <th>Reference</th>
                    <th>Hotel & Suite</th>
                    <th>Guest Information</th>
                    <th>Stay Dates</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th className="text-end">Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => {
                    const bId = b._id || b.id;
                    const checkIn = new Date(b.checkIn).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
                    const checkOut = new Date(b.checkOut).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });

                    return (
                      <tr key={bId}>
                        <td className="font-monospace fw-bold text-primary">{b.bookingReference}</td>
                        <td>
                          <div className="fw-semibold">{b.hotel?.name}</div>
                          <small className="text-muted">{b.room?.roomType} ({b.nights}N)</small>
                        </td>
                        <td>
                          <div className="fw-semibold">{b.guestDetails?.primaryGuestName}</div>
                          <small className="text-muted">{b.guestDetails?.email} • {b.guestDetails?.phone}</small>
                        </td>
                        <td>{checkIn} - {checkOut}</td>
                        <td className="fw-bold">₹{b.pricing?.totalAmount?.toLocaleString('en-IN')}</td>
                        <td>
                          <span
                            className={`badge text-uppercase ${
                              b.bookingStatus === 'confirmed'
                                ? 'badge-confirmed'
                                : b.bookingStatus === 'completed'
                                ? 'badge-completed'
                                : 'badge-cancelled'
                            }`}
                          >
                            {b.bookingStatus}
                          </span>
                        </td>
                        <td className="text-end">
                          <select
                            className="form-select form-select-sm d-inline-block"
                            style={{ width: '130px' }}
                            value={b.bookingStatus}
                            onChange={(e) => handleUpdateBookingStatus(bId, e.target.value)}
                          >
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Users Management */}
        {activeTab === 'users' && (
          <div className="card border-0 shadow-sm rounded-3 bg-white p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold text-navy mb-0">Platform Registered Users</h5>
                <small className="text-muted">Total registered customer and admin accounts</small>
              </div>
              <span className="badge bg-navy text-gold px-3 py-2">
                {users.length} Registered Accounts
              </span>
            </div>

            <div className="table-responsive">
              <table className="table align-middle table-hover small">
                <thead className="table-light">
                  <tr>
                    <th>User Details</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                    <th>System Role</th>
                    <th>Account Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const uId = u._id || u.id;
                    const isCurrentUser = user && ((user._id || user.id) === uId || user.email === u.email);
                    return (
                      <tr key={uId}>
                        <td>
                          <div className="fw-bold text-dark">{u.name}</div>
                          <small className="text-muted">ID: {uId}</small>
                        </td>
                        <td>{u.email}</td>
                        <td>{u.phone || '—'}</td>
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'bg-warning text-dark' : 'bg-primary'}`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${u.accountStatus === 'active' ? 'bg-success' : 'bg-danger'}`}>
                            {u.accountStatus ? u.accountStatus.toUpperCase() : 'ACTIVE'}
                          </span>
                        </td>
                        <td>
                          {isCurrentUser ? (
                            <span className="text-muted small fst-italic">Current Session</span>
                          ) : (
                            <button
                              className={`btn btn-sm ${u.accountStatus === 'active' ? 'btn-outline-danger' : 'btn-outline-success'} py-1 px-2`}
                              onClick={() => handleToggleUserStatus(uId, u.accountStatus || 'active')}
                            >
                              <i className={`bi ${u.accountStatus === 'active' ? 'bi-person-slash' : 'bi-person-check'} me-1`}></i>
                              {u.accountStatus === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Add Property */}
        {showAddHotelModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="modal-header bg-navy text-white py-3 px-4">
                  <h5 className="modal-title fw-bold">Register New Property</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddHotelModal(false)}></button>
                </div>
                <form onSubmit={handleCreateHotel}>
                  <div className="modal-body p-4">
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-muted mb-1">Hotel Name</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="e.g. The Imperial Residency"
                        value={hotelForm.name}
                        onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-muted mb-1">Tagline</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Modern Opulence in the Heart of the City"
                        value={hotelForm.tagline}
                        onChange={(e) => setHotelForm({ ...hotelForm, tagline: e.target.value })}
                      />
                    </div>
                    <div className="row g-2 mb-3">
                      <div className="col-sm-6">
                        <label className="form-label small fw-semibold text-muted mb-1">City</label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          placeholder="e.g. Mumbai, Goa..."
                          value={hotelForm.city}
                          onChange={(e) => setHotelForm({ ...hotelForm, city: e.target.value })}
                        />
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label small fw-semibold text-muted mb-1">Star Rating</label>
                        <select
                          className="form-select"
                          value={hotelForm.starRating}
                          onChange={(e) => setHotelForm({ ...hotelForm, starRating: Number(e.target.value) })}
                        >
                          <option value="5">5 Star Luxury</option>
                          <option value="4">4 Star Premium</option>
                          <option value="3">3 Star Boutique</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-muted mb-1">Address Street</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Street or beach promenade..."
                        value={hotelForm.street}
                        onChange={(e) => setHotelForm({ ...hotelForm, street: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-muted mb-1">Description</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        required
                        placeholder="Provide details on architecture, dining, and highlights..."
                        value={hotelForm.description}
                        onChange={(e) => setHotelForm({ ...hotelForm, description: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer bg-light px-4 py-3">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowAddHotelModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-gold px-4">
                      Create Property
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}


        {/* Tab 5: Users Management */}
        {activeTab === 'users' && (
          <div className="card border-0 shadow-sm rounded-3 bg-white p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold text-navy mb-0">Platform Registered Users</h5>
                <small className="text-muted">Total registered customer and admin accounts</small>
              </div>
              <span className="badge bg-navy text-gold px-3 py-2">
                {users.length} Registered Accounts
              </span>
            </div>

            <div className="table-responsive">
              <table className="table align-middle table-hover small">
                <thead className="table-light">
                  <tr>
                    <th>User Details</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                    <th>System Role</th>
                    <th>Account Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const uId = u._id || u.id;
                    const isCurrentUser = user && ((user._id || user.id) === uId || user.email === u.email);
                    return (
                      <tr key={uId}>
                        <td>
                          <div className="fw-bold text-dark">{u.name}</div>
                          <small className="text-muted">ID: {uId}</small>
                        </td>
                        <td>{u.email}</td>
                        <td>{u.phone || '—'}</td>
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'bg-warning text-dark' : 'bg-primary'}`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${u.accountStatus === 'active' ? 'bg-success' : 'bg-danger'}`}>
                            {u.accountStatus ? u.accountStatus.toUpperCase() : 'ACTIVE'}
                          </span>
                        </td>
                        <td>
                          {isCurrentUser ? (
                            <span className="text-muted small fst-italic">Current Session</span>
                          ) : (
                            <button
                              className={`btn btn-sm ${u.accountStatus === 'active' ? 'btn-outline-danger' : 'btn-outline-success'} py-1 px-2`}
                              onClick={() => handleToggleUserStatus(uId, u.accountStatus || 'active')}
                            >
                              <i className={`bi ${u.accountStatus === 'active' ? 'bi-person-slash' : 'bi-person-check'} me-1`}></i>
                              {u.accountStatus === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Add Room */}
        {showAddRoomModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                <div className="modal-header bg-navy text-white py-3 px-4">
                  <h5 className="modal-title fw-bold">Add Suite Category</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddRoomModal(false)}></button>
                </div>
                <form onSubmit={handleCreateRoom}>
                  <div className="modal-body p-4">
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-muted mb-1">Select Hotel Property</label>
                      <select
                        className="form-select"
                        value={roomForm.hotel || selectedHotelForRooms}
                        onChange={(e) => setRoomForm({ ...roomForm, hotel: e.target.value })}
                      >
                        {hotels.map((h) => (
                          <option key={h._id || h.id} value={h._id || h.id}>{h.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-muted mb-1">Suite / Room Title</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="e.g. Royal Grand Pavilion Suite"
                        value={roomForm.roomType}
                        onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value })}
                      />
                    </div>
                    <div className="row g-2 mb-3">
                      <div className="col-sm-6">
                        <label className="form-label small fw-semibold text-muted mb-1">Nightly Rate (₹)</label>
                        <input
                          type="number"
                          className="form-control"
                          required
                          min="1000"
                          value={roomForm.pricePerNight}
                          onChange={(e) => setRoomForm({ ...roomForm, pricePerNight: Number(e.target.value) })}
                        />
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label small fw-semibold text-muted mb-1">Physical Inventory</label>
                        <input
                          type="number"
                          className="form-control"
                          required
                          min="1"
                          max="50"
                          value={roomForm.totalInventory}
                          onChange={(e) => setRoomForm({ ...roomForm, totalInventory: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="row g-2 mb-3">
                      <div className="col-sm-6">
                        <label className="form-label small fw-semibold text-muted mb-1">Bed Configuration</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. 1 King Bed, 2 Queen Beds"
                          value={roomForm.bedConfiguration}
                          onChange={(e) => setRoomForm({ ...roomForm, bedConfiguration: e.target.value })}
                        />
                      </div>
                      <div className="col-sm-6">
                        <label className="form-label small fw-semibold text-muted mb-1">Max Guests</label>
                        <input
                          type="number"
                          className="form-control"
                          min="1"
                          max="6"
                          value={roomForm.maxGuests}
                          onChange={(e) => setRoomForm({ ...roomForm, maxGuests: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-muted mb-1">Description</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Features, balcony views, bathroom amenities..."
                        value={roomForm.description}
                        onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer bg-light px-4 py-3">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowAddRoomModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-gold px-4">
                      Create Suite Category
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}


        {/* Tab 5: Users Management */}
        {activeTab === 'users' && (
          <div className="card border-0 shadow-sm rounded-3 bg-white p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold text-navy mb-0">Platform Registered Users</h5>
                <small className="text-muted">Total registered customer and admin accounts</small>
              </div>
              <span className="badge bg-navy text-gold px-3 py-2">
                {users.length} Registered Accounts
              </span>
            </div>

            <div className="table-responsive">
              <table className="table align-middle table-hover small">
                <thead className="table-light">
                  <tr>
                    <th>User Details</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                    <th>System Role</th>
                    <th>Account Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const uId = u._id || u.id;
                    const isCurrentUser = user && ((user._id || user.id) === uId || user.email === u.email);
                    return (
                      <tr key={uId}>
                        <td>
                          <div className="fw-bold text-dark">{u.name}</div>
                          <small className="text-muted">ID: {uId}</small>
                        </td>
                        <td>{u.email}</td>
                        <td>{u.phone || '—'}</td>
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'bg-warning text-dark' : 'bg-primary'}`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${u.accountStatus === 'active' ? 'bg-success' : 'bg-danger'}`}>
                            {u.accountStatus ? u.accountStatus.toUpperCase() : 'ACTIVE'}
                          </span>
                        </td>
                        <td>
                          {isCurrentUser ? (
                            <span className="text-muted small fst-italic">Current Session</span>
                          ) : (
                            <button
                              className={`btn btn-sm ${u.accountStatus === 'active' ? 'btn-outline-danger' : 'btn-outline-success'} py-1 px-2`}
                              onClick={() => handleToggleUserStatus(uId, u.accountStatus || 'active')}
                            >
                              <i className={`bi ${u.accountStatus === 'active' ? 'bi-person-slash' : 'bi-person-check'} me-1`}></i>
                              {u.accountStatus === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;

