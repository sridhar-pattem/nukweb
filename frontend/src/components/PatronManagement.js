import React, { useState, useEffect } from 'react';
import { adminPatronsAPI } from '../services/api';

function PatronManagement() {
  const [patrons, setPatrons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [newPatron, setNewPatron] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    date_of_birth: '',
    membership_plan_id: ''
  });

  useEffect(() => {
    loadPatrons();
    loadMembershipPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, statusFilter]);

  const loadPatrons = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminPatronsAPI.getPatrons(page, search, statusFilter);
      setPatrons(response.data.patrons || []);
      setTotalPages(response.data.total_pages || 1);
    } catch (err) {
      console.error('Error loading patrons:', err);
      setError('Failed to load patrons');
    } finally {
      setLoading(false);
    }
  };

  const loadMembershipPlans = async () => {
    try {
      const response = await adminPatronsAPI.getMembershipPlans();
      setMembershipPlans(response.data.plans || []);
    } catch (err) {
      console.error('Failed to load membership plans:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadPatrons();
  };

  const handleAddPatron = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await adminPatronsAPI.createPatron(newPatron);
      setSuccess('Patron added successfully!');
      setShowAddForm(false);
      setNewPatron({
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        date_of_birth: '',
        membership_plan_id: ''
      });
      loadPatrons();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add patron');
    }
  };

  const handleStatusChange = async (patronId, action) => {
    const actionText = action === 'freeze' ? 'freeze' : action === 'renew' ? 'unfreeze' : action;
    if (!window.confirm(`Are you sure you want to ${actionText} this patron's account?`)) return;

    try {
      setError('');
      await adminPatronsAPI.updateStatus(patronId, action);
      setSuccess(`Patron account ${actionText}d successfully!`);
      loadPatrons();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${actionText} patron`);
    }
  };

  const handleResetPassword = async (patronId) => {
    if (!window.confirm('Reset password for this patron? They will receive a new temporary password.')) return;

    try {
      setError('');
      const response = await adminPatronsAPI.resetPassword(patronId);
      alert(`New password: ${response.data.new_password}\n\nPlease provide this to the patron and ask them to change it on first login.`);
      setSuccess('Password reset successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
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

  if (loading && patrons.length === 0) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Patron Management</h1>
          <p>Manage library patrons and memberships</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="btn btn-primary">
          + Add Patron
        </button>
      </div>

      {error && <div style={{ padding: '1rem', background: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ padding: '1rem', background: '#d4edda', color: '#155724', borderRadius: '4px', marginBottom: '1rem' }}>{success}</div>}

      {/* Add Patron Modal */}
      {showAddForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
        onClick={() => setShowAddForm(false)}
        >
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2>Add New Patron</h2>
              <button onClick={() => setShowAddForm(false)} className="btn">×</button>
            </div>

            <form onSubmit={handleAddPatron}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>First Name *</label>
                  <input
                    type="text"
                    value={newPatron.first_name}
                    onChange={(e) => setNewPatron({ ...newPatron, first_name: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Last Name *</label>
                  <input
                    type="text"
                    value={newPatron.last_name}
                    onChange={(e) => setNewPatron({ ...newPatron, last_name: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Email *</label>
                <input
                  type="email"
                  value={newPatron.email}
                  onChange={(e) => setNewPatron({ ...newPatron, email: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Phone</label>
                <input
                  type="tel"
                  value={newPatron.phone}
                  onChange={(e) => setNewPatron({ ...newPatron, phone: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Membership Plan</label>
                <select
                  value={newPatron.membership_plan_id}
                  onChange={(e) => setNewPatron({ ...newPatron, membership_plan_id: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="">No Plan</option>
                  {membershipPlans.map(plan => (
                    <option key={plan.plan_id} value={plan.plan_id}>{plan.plan_name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowAddForm(false)} className="btn">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Patron
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ borderBottom: '2px solid #ddd', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0' }}>
          {['active', 'frozen', 'inactive', 'closed'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                background: statusFilter === status ? '#5BC0BE' : 'transparent',
                color: statusFilter === status ? 'white' : '#333',
                borderRadius: '8px 8px 0 0',
                fontWeight: statusFilter === status ? '600' : '400',
                cursor: 'pointer',
                fontSize: '1rem',
                textTransform: 'capitalize',
                transition: 'all 0.2s ease',
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Search by name, email, patron ID, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </div>
      </form>

      <div style={{ marginBottom: '1rem', color: '#666' }}>
        Found {patrons.length} patron(s)
      </div>

      {/* Patrons Table */}
      {patrons.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
          <p>No patrons found</p>
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Patron ID</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Name</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Email</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Phone</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Membership</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Member Since</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patrons.map((patron) => (
                  <tr key={patron.patron_id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '0.75rem' }}>{patron.patron_id}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <strong>{patron.first_name} {patron.last_name}</strong>
                      {patron.city && <div style={{ fontSize: '0.875rem', color: '#666' }}>{patron.city}</div>}
                    </td>
                    <td style={{ padding: '0.75rem' }}>{patron.email}</td>
                    <td style={{ padding: '0.75rem' }}>{patron.phone || '-'}</td>
                    <td style={{ padding: '0.75rem' }}>
                      {patron.plan_name ? (
                        <div>
                          <strong>{patron.plan_name}</strong>
                          {patron.membership_end_date && (
                            <div style={{ fontSize: '0.75rem', color: '#666' }}>
                              Expires: {formatDate(patron.membership_end_date)}
                            </div>
                          )}
                        </div>
                      ) : (
                        'No Plan'
                      )}
                    </td>
                    <td style={{ padding: '0.75rem' }}>{formatDate(patron.created_at)}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        background:
                          patron.status === 'active' ? '#d4edda' :
                          patron.status === 'frozen' ? '#fff3cd' :
                          patron.status === 'inactive' ? '#f8d7da' :
                          '#e2e3e5',
                        color:
                          patron.status === 'active' ? '#155724' :
                          patron.status === 'frozen' ? '#856404' :
                          patron.status === 'inactive' ? '#721c24' :
                          '#383d41'
                      }}>
                        {patron.status ? patron.status.charAt(0).toUpperCase() + patron.status.slice(1) : 'Unknown'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {patron.status === 'active' && (
                          <button
                            onClick={() => handleStatusChange(patron.patron_id, 'freeze')}
                            className="btn"
                            style={{ fontSize: '0.875rem' }}
                            title="Freeze"
                          >
                            ⏸ Freeze
                          </button>
                        )}
                        {patron.status === 'frozen' && (
                          <button
                            onClick={() => handleStatusChange(patron.patron_id, 'renew')}
                            className="btn"
                            style={{ fontSize: '0.875rem' }}
                            title="Unfreeze"
                          >
                            ▶ Unfreeze
                          </button>
                        )}
                        <button
                          onClick={() => handleResetPassword(patron.patron_id)}
                          className="btn"
                          style={{ fontSize: '0.875rem' }}
                          title="Reset Password"
                        >
                          🔑 Reset
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem', alignItems: 'center' }}>
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn"
              >
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PatronManagement;
