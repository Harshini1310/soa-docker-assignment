
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const API = "http://localhost:8081/PestControllerBooking";

const emptyForm = {
  customerName: "",
  pestType: "",
  serviceCost: "",
  completed: false
};

function App() {
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [searchId, setSearchId] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // API request helper
  const request = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.body
          ? { "Content-Type": "application/json" }
          : {}),
        ...options.headers
      }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `Request failed: ${response.status}`);
    }

    if (response.status === 204) return null;

    const text = await response.text();
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  };

  // Display all bookings
  const loadBookings = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await request(`${API}/DisplayAll`);
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Unable to load bookings. Check your backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // Handle form inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Validate form
  const validate = () => {
    if (!form.customerName.trim()) {
      return "Customer name is required.";
    }

    if (!form.pestType.trim()) {
      return "Pest type is required.";
    }

    if (
      form.serviceCost === "" ||
      !Number.isFinite(Number(form.serviceCost)) ||
      Number(form.serviceCost) < 0
    ) {
      return "Enter a valid service cost.";
    }

    return "";
  };

  // Add or update booking
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    const payload = {
      customerName: form.customerName.trim(),
      pestType: form.pestType.trim(),
      serviceCost: Number(form.serviceCost),
      completed: form.completed
    };

    try {
      if (editingId !== null) {
        await request(`${API}/Update/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });

        setMessage("Booking updated successfully!");
      } else {
        await request(`${API}/Add`, {
          method: "POST",
          body: JSON.stringify(payload)
        });

        setMessage("Booking added successfully!");
      }

      setForm({ ...emptyForm });
      setEditingId(null);
      setSearchId("");

      const data = await request(`${API}/DisplayAll`);
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to save booking.");
    } finally {
      setLoading(false);
    }
  };

  // Display booking by ID
  const searchBooking = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!/^[1-9]\d*$/.test(searchId.trim())) {
      setError("Enter a valid booking ID.");
      return;
    }

    setLoading(true);

    try {
      const data = await request(`${API}/DisplayById/${searchId}`);
      setBookings(data ? [data] : []);

      if (!data) {
        setMessage("No booking found.");
      }
    } catch {
      setBookings([]);
      setError("Booking not found or server unavailable.");
    } finally {
      setLoading(false);
    }
  };

  // Edit: load selected booking into form
  const editBooking = (booking) => {
    setEditingId(booking.id);

    setForm({
      customerName: booking.customerName || "",
      pestType: booking.pestType || "",
      serviceCost: String(booking.serviceCost ?? ""),
      completed: Boolean(booking.completed)
    });

    setMessage("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete booking
  const deleteBooking = async (id) => {
    if (!window.confirm(`Delete booking ${id}?`)) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      await request(`${API}/Delete/${id}`, {
        method: "DELETE"
      });

      if (editingId === id) {
        setEditingId(null);
        setForm({ ...emptyForm });
      }

      setMessage("Booking deleted successfully.");

      const data = await request(`${API}/DisplayAll`);
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      setError("Unable to delete booking.");
    } finally {
      setLoading(false);
    }
  };

  // Cancel update
  const cancelEdit = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setMessage("");
    setError("");
  };

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark app-navbar">
        <div className="container">
          <a className="navbar-brand fw-bold" href="#home">
            <span className="brand-icon">✦</span> PestCare
          </a>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
            aria-controls="mainNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="mainNavbar">
            <div className="navbar-nav ms-auto">
              <a className="nav-link" href="#home">Home</a>
              <a className="nav-link" href="#booking-form">
                {editingId !== null ? "Update Booking" : "Add Booking"}
              </a>
              <a className="nav-link" href="#booking-records">
                Booking Records
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="hero" id="home">
        <div className="container">
          <p className="hero-tag">CLEAN HOME. HEALTHY LIFE.</p>
          <h1>Pest Control Booking System</h1>
          <p>Manage pest control bookings easily in one place.</p>
        </div>
      </header>

      <main className="container py-4">
        {/* Messages */}
        {message && (
          <div className="alert alert-success" role="status">
            {message}
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Add / Update Form */}
        <section className="panel mb-4" id="booking-form">
          <div className="panel-heading">
            <div>
              <h2>
                {editingId !== null ? "Update Booking" : "Add New Booking"}
              </h2>
              <p>
                {editingId !== null
                  ? `Editing booking #${editingId}`
                  : "Enter customer and pest control details."}
              </p>
            </div>
            <span className="heading-icon">＋</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">Customer Name *</label>
                <input
                  className="form-control"
                  type="text"
                  name="customerName"
                  value={form.customerName}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  maxLength={100}
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Pest Type *</label>
                <input
                  className="form-control"
                  type="text"
                  name="pestType"
                  value={form.pestType}
                  onChange={handleChange}
                  placeholder="Enter pest type"
                  maxLength={100}
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Service Cost *</label>
                <input
                  className="form-control"
                  type="number"
                  name="serviceCost"
                  value={form.serviceCost}
                  onChange={handleChange}
                  placeholder="Enter service cost"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label d-block">Service Status</label>
                <div className="form-check mt-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="completed"
                    id="completed"
                    checked={form.completed}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="completed">
                    Booking completed
                  </label>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2 mt-4">
              <button
                className="btn btn-success px-4"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : editingId !== null
                    ? "Save Changes"
                    : "Add Booking"}
              </button>

              {editingId !== null && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={cancelEdit}
                  disabled={loading}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Records */}
        <section className="panel" id="booking-records">
          <div className="panel-heading">
            <div>
              <h2>Booking Records</h2>
              <p>View, search, update and delete bookings.</p>
            </div>

            <button
              className="btn btn-outline-success"
              type="button"
              onClick={loadBookings}
              disabled={loading}
            >
              Refresh
            </button>
          </div>

          {/* Search by ID */}
          <form className="search-bar mb-4" onSubmit={searchBooking}>
            <input
              className="form-control"
              type="number"
              min="1"
              placeholder="Search by booking ID"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />

            <button className="btn btn-dark" type="submit" disabled={loading}>
              Search
            </button>

            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => {
                setSearchId("");
                setError("");
                setMessage("");
                loadBookings();
              }}
              disabled={loading}
            >
              Show All
            </button>
          </form>

          {loading && bookings.length === 0 ? (
            <div className="text-center py-4">
              <div className="spinner-border text-success"></div>
              <p className="mt-2">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="empty-state">
              <h3>No bookings available</h3>
              <p>Add a booking or try another search.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer Name</th>
                    <th>Pest Type</th>
                    <th>Service Cost</th>
                    <th>Completed</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>
                        <span className="id-badge">#{booking.id}</span>
                      </td>

                      <td className="fw-semibold">
                        {booking.customerName}
                      </td>

                      <td>{booking.pestType}</td>

                      <td>
                        {Number(booking.serviceCost).toFixed(2)}
                      </td>

                      <td>
                        <span
                          className={
                            booking.completed
                              ? "badge text-bg-success"
                              : "badge text-bg-secondary"
                          }
                        >
                          {booking.completed ? "Completed" : "Pending"}
                        </span>
                      </td>

                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            type="button"
                            onClick={() => editBooking(booking)}
                            disabled={loading}
                          >
                            Edit
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            type="button"
                            onClick={() => deleteBooking(booking.id)}
                            disabled={loading}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="text-center py-4">
          PestCare · Pest Control Booking Management
        </footer>
      </main>
    </div>
  );
}

export default App;
