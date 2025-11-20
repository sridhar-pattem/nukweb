import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminLibraryAPI } from '../../../services/api';
import {
  FaUser,
  FaSearch,
  FaPlus,
  FaPause,
  FaPlay,
  FaBook,
  FaEnvelope,
  FaPhone,
  FaIdCard,
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

  const handlePause = async (patronId) => {
    if (!window.confirm('Are you sure you want to pause this member\'s account?')) return;

    try {
      await adminLibraryAPI.updatePatronStatus(patronId, { action: 'freeze' });
      setSuccess('Member account paused successfully');
      fetchPatrons();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error pausing member:', err);
      setError(err.response?.data?.error || 'Failed to pause member');
    }
  };

  const handleResume = async (patronId) => {
    if (!window.confirm('Resume this member\'s account?')) return;

    try {
      await adminLibraryAPI.updatePatronStatus(patronId, { action: 'renew' });
      setSuccess('Member account resumed successfully');
      fetchPatrons();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error resuming member:', err);
      setError(err.response?.data?.error || 'Failed to resume member');
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
          className={`tab ${statusFilter === 'frozen' ? 'active' : ''}`}
          onClick={() => {
            setStatusFilter('frozen');
            setPage(1);
          }}
        >
          Frozen
        </button>
        <button
          className={`tab ${statusFilter === 'closed' ? 'active' : ''}`}
          onClick={() => {
            setStatusFilter('closed');
            setPage(1);
          }}
        >
          Closed
        </button>
      </div>

      {/* Search */}
      <div className="admin-toolbar">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search by name, email, patron ID, or phone..."
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
            <table className="admin-table members-table">
              <thead>
                <tr>
                  <th>Patron ID</th>
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
                      <div className="patron-id-cell">
                        <FaIdCard /> {patron.patron_id}
                      </div>
                    </td>
                    <td>
                      <Link
                        to={`/admin/library/members/${patron.patron_id}`}
                        className="patron-name-link"
                      >
                        <strong>
                          {patron.first_name} {patron.last_name}
                        </strong>
                        {patron.city && <span className="patron-location">{patron.city}</span>}
                      </Link>
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
                            : patron.status === 'frozen'
                            ? 'frozen'
                            : 'closed'
                        }`}
                      >
                        {patron.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {patron.status === 'active' ? (
                          <button
                            onClick={() => handlePause(patron.patron_id)}
                            className="btn btn-icon btn-warning"
                            title="Pause Account"
                          >
                            <FaPause />
                          </button>
                        ) : patron.status === 'frozen' ? (
                          <button
                            onClick={() => handleResume(patron.patron_id)}
                            className="btn btn-icon btn-success"
                            title="Resume Account"
                          >
                            <FaPlay />
                          </button>
                        ) : null}
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
