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
  FaSortUp,
  FaSortDown,
  FaSort,
} from 'react-icons/fa';
import '../../../styles/admin-library.css';

const Members = () => {
  const [loading, setLoading] = useState(true);
  const [patrons, setPatrons] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({
    patron_id: '',
    name: '',
    contact: '',
    status: '',
  });
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

  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort />;
    return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const filterPatrons = (patronsList) => {
    return patronsList.filter((patron) => {
      // Patron ID filter
      if (filters.patron_id && !patron.patron_id.toLowerCase().includes(filters.patron_id.toLowerCase())) {
        return false;
      }

      // Name filter
      if (filters.name) {
        const fullName = `${patron.first_name} ${patron.last_name}`.toLowerCase();
        if (!fullName.includes(filters.name.toLowerCase())) {
          return false;
        }
      }

      // Contact filter (email or phone)
      if (filters.contact) {
        const email = patron.email?.toLowerCase() || '';
        const phone = patron.phone?.toLowerCase() || '';
        const contactLower = filters.contact.toLowerCase();
        if (!email.includes(contactLower) && !phone.includes(contactLower)) {
          return false;
        }
      }

      // Status filter
      if (filters.status && patron.status !== filters.status) {
        return false;
      }

      return true;
    });
  };

  const sortPatrons = (patronsList) => {
    if (!sortField) return patronsList;

    return [...patronsList].sort((a, b) => {
      let aVal, bVal;

      if (sortField === 'name') {
        aVal = `${a.first_name} ${a.last_name}`.toLowerCase();
        bVal = `${b.first_name} ${b.last_name}`.toLowerCase();
      } else if (sortField === 'patron_id') {
        aVal = a.patron_id;
        bVal = b.patron_id;
      } else {
        return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDisplayStatus = (patron) => {
    // Check if membership is expired
    if (patron.membership_end_date && new Date(patron.membership_end_date) < new Date()) {
      return { status: 'inactive', label: 'Inactive (Expired)' };
    }
    return { status: patron.status, label: patron.status };
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
          className={`tab ${statusFilter === 'inactive' ? 'active' : ''}`}
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
                  <th className="sortable" onClick={() => handleSort('patron_id')}>
                    Patron ID {getSortIcon('patron_id')}
                  </th>
                  <th className="sortable" onClick={() => handleSort('name')}>
                    Name {getSortIcon('name')}
                  </th>
                  <th>Contact</th>
                  <th>Membership</th>
                  <th>Member Since</th>
                  <th>Active Borrowings</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
                <tr className="filter-row">
                  <th>
                    <input
                      type="text"
                      placeholder="Filter Patron ID..."
                      value={filters.patron_id}
                      onChange={(e) => handleFilterChange('patron_id', e.target.value)}
                      className="column-filter"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </th>
                  <th>
                    <input
                      type="text"
                      placeholder="Filter Name..."
                      value={filters.name}
                      onChange={(e) => handleFilterChange('name', e.target.value)}
                      className="column-filter"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </th>
                  <th>
                    <input
                      type="text"
                      placeholder="Filter Email/Phone..."
                      value={filters.contact}
                      onChange={(e) => handleFilterChange('contact', e.target.value)}
                      className="column-filter"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="column-filter"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="">All</option>
                      <option value="active">Active</option>
                      <option value="frozen">Frozen</option>
                      <option value="closed">Closed</option>
                    </select>
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sortPatrons(filterPatrons(patrons)).map((patron) => (
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
                        className={`status-badge ${getDisplayStatus(patron).status}`}
                      >
                        {getDisplayStatus(patron).label}
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
