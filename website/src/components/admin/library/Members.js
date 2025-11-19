import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminLibraryAPI } from '../../../services/api';
import {
  FaUser,
  FaSearch,
  FaPlus,
  FaEdit,
  FaBan,
  FaCheckCircle,
  FaBook,
  FaEnvelope,
  FaPhone,
} from 'react-icons/fa';
import '../../../styles/admin-library.css';

const Members = () => {
  const [loading, setLoading] = useState(true);
  const [patrons, setPatrons] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const itemsPerPage = 20;

  useEffect(() => {
    fetchPatrons();
  }, [page, statusFilter]);

  const fetchPatrons = async () => {
    try {
      setLoading(true);
      const params = { page, status: statusFilter };

      if (searchTerm) params.search = searchTerm;

      const response = await adminLibraryAPI.getPatrons(params);
      setPatrons(response.data.patrons || []);
      setTotal(response.data.total || 0);
    } catch (err) {
      console.error('Error fetching patrons:', err);
      setError('Failed to load patrons');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPatrons();
  };

  const handleDeactivate = async (patronId) => {
    if (!window.confirm('Are you sure you want to deactivate this patron?')) return;

    try {
      await adminLibraryAPI.deactivatePatron(patronId);
      setSuccess('Patron deactivated successfully');
      fetchPatrons();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deactivating patron:', err);
      setError(err.response?.data?.error || 'Failed to deactivate patron');
    }
  };

  const handleReactivate = async (patronId) => {
    if (!window.confirm('Reactivate this patron?')) return;

    try {
      await adminLibraryAPI.reactivatePatron(patronId);
      setSuccess('Patron reactivated successfully');
      fetchPatrons();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error reactivating patron:', err);
      setError(err.response?.data?.error || 'Failed to reactivate patron');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const totalPages = Math.ceil(total / itemsPerPage);

  if (loading && patrons.length === 0) {
    return (
      <div className="admin-library loading">
        <div className="spinner"></div>
        <p>Loading members...</p>
      </div>
    );
  }

  return (
    <div className="admin-library">
      <div className="admin-header">
        <div>
          <h1>Members</h1>
          <p>Manage library patrons and memberships</p>
        </div>
        <Link to="/admin/library/members/new" className="btn btn-primary">
          <FaPlus /> Add Member
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab ${statusFilter === 'active' ? 'active' : ''}`}
          onClick={() => {
            setStatusFilter('active');
            setPage(1);
          }}
        >
          Active
        </button>
        <button
          className={`tab ${statusFilter === 'inactive' ? 'active' : ''}`}
          onClick={() => {
            setStatusFilter('inactive');
            setPage(1);
          }}
        >
          Inactive
        </button>
        <button
          className={`tab ${statusFilter === 'suspended' ? 'active' : ''}`}
          onClick={() => {
            setStatusFilter('suspended');
            setPage(1);
          }}
        >
          Suspended
        </button>
      </div>

      {/* Search */}
      <div className="admin-toolbar">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <p>Found {total} member(s)</p>
      </div>

      {/* Patrons Table */}
      {patrons.length === 0 ? (
        <div className="empty-state">
          <FaUser />
          <p>No members found</p>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Membership</th>
                  <th>Member Since</th>
                  <th>Active Borrowings</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patrons.map((patron) => (
                  <tr key={patron.patron_id}>
                    <td>
                      <div className="patron-name">
                        <strong>
                          {patron.first_name} {patron.last_name}
                        </strong>
                        {patron.city && <span className="patron-location">{patron.city}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="contact-info">
                        {patron.email && (
                          <div>
                            <FaEnvelope /> {patron.email}
                          </div>
                        )}
                        {patron.phone && (
                          <div>
                            <FaPhone /> {patron.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      {patron.plan_name ? (
                        <div className="membership-info">
                          <strong>{patron.plan_name}</strong>
                          <span className="expiry">
                            Expires: {formatDate(patron.membership_end_date)}
                          </span>
                        </div>
                      ) : (
                        'No Plan'
                      )}
                    </td>
                    <td>{formatDate(patron.created_at)}</td>
                    <td>
                      <span className="borrowing-count">
                        <FaBook /> {patron.active_borrowings || 0}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          patron.status === 'active'
                            ? 'active'
                            : patron.status === 'suspended'
                            ? 'suspended'
                            : 'inactive'
                        }`}
                      >
                        {patron.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Link
                          to={`/admin/library/members/${patron.patron_id}`}
                          className="btn btn-icon"
                          title="View Details"
                        >
                          <FaEdit />
                        </Link>
                        {patron.status === 'active' ? (
                          <button
                            onClick={() => handleDeactivate(patron.patron_id)}
                            className="btn btn-icon btn-danger"
                            title="Deactivate"
                          >
                            <FaBan />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReactivate(patron.patron_id)}
                            className="btn btn-icon btn-success"
                            title="Reactivate"
                          >
                            <FaCheckCircle />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn btn-outline"
              >
                Previous
              </button>

              <span className="page-info">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="btn btn-outline"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Members;
