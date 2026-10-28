import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-5">
      <div className="container" style={{ maxWidth: '900px' }}>
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb small">
            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Contact Us</li>
          </ol>
        </nav>

        <div className="text-center mb-5">
          <h1 className="fw-bold text-navy">Get in Touch with HotelPro</h1>
          <p className="text-muted">
            Have questions regarding property bookings, partner registrations, or special requests? We are here 24/7.
          </p>
        </div>

        <div className="row g-4">
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-navy text-white h-100">
              <h4 className="fw-bold text-warning mb-4">Concierge Desk</h4>

              <div className="d-flex align-items-start gap-3 mb-4">
                <i className="bi bi-geo-alt-fill text-warning fs-5"></i>
                <div>
                  <h6 className="fw-bold mb-1">Corporate Headquarters</h6>
                  <p className="small text-secondary mb-0">124 Marine Drive, Nariman Point, Mumbai 400021</p>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3 mb-4">
                <i className="bi bi-telephone-fill text-warning fs-5"></i>
                <div>
                  <h6 className="fw-bold mb-1">24/7 Reservation Hotline</h6>
                  <p className="small text-secondary mb-0">+91 22 6600 1122</p>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3 mb-4">
                <i className="bi bi-envelope-fill text-warning fs-5"></i>
                <div>
                  <h6 className="fw-bold mb-1">Email Inquiries</h6>
                  <p className="small text-secondary mb-0">support@hotelpro.com</p>
                </div>
              </div>

              <div className="mt-auto pt-3 border-top border-secondary">
                <small className="text-secondary">Average response time: Within 15 minutes.</small>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
              {submitted ? (
                <div className="text-center py-5">
                  <div className="d-inline-flex p-3 rounded-circle bg-success text-white mb-3">
                    <i className="bi bi-check2-circle display-4"></i>
                  </div>
                  <h4 className="fw-bold text-navy">Message Received</h4>
                  <p className="text-muted mb-4">
                    Thank you, {form.name}. Our concierge team has received your message and will respond shortly.
                  </p>
                  <button className="btn btn-navy" onClick={() => setSubmitted(false)}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h5 className="fw-bold text-navy mb-3">Send us a Message</h5>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted mb-1">Your Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Johnathan Smith"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted mb-1">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      required
                      placeholder="name@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted mb-1">Subject</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Reservation Inquiry / Special Requirement"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-semibold text-muted mb-1">Message</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      required
                      placeholder="How may our concierge assist your stay?"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-gold w-100 py-2 fw-semibold">
                    Send Inquiry
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

