import React, { useState, useEffect } from 'react';
import { adminPatronsAPI } from '../services/api';

function PatronManagement() {
  const [patrons, setPatrons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [newPatron, setNewPatron] = useState({
    email: '',
    name: '',
    phone: '',
    mobile_number: '',
    address: '',
    membership_plan_id: ''
  });

  useEffect(() => {
    loadPatrons();
    loadMembershipPlans();
  }, [page, search]);

  const loadPatrons = async () => {
    try {
      setLoading(true);
      const response = await adminPatronsAPI.getPatrons(page, search);
      setPatrons(response.data.patrons);
      setTotalPages(response.data.total_pages);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load patrons');
    } finally {
      setLoading(false);
    }
  };

  const loadMembershipPlans = async () => {
    try {
      const response = await adminPatronsAPI.getMembershipPlans();
      setMembershipPlans(response.data.plans);
    } catch (err) {
      console.error('Failed to load membership plans:', err);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleAddPatron = async (e) => {
    e.preventDefault();
    try {
      await adminPatronsAPI.createPatron(newPatron);
      setShowAddForm(false);
      setNewPatron({
        email: '',
        name: '',
        phone: '',
        mobile_number: '',
        address: '',
        membership_plan_id: ''
      });
      loadPatrons();
      alert('Patron created successfully! Default password: BookNook313');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create patron');
    }
  };

  const handleResetPassword = async (patronId) => {
    if (window.confirm('Reset password to default (BookNook313)?')) {
      try {
        await adminPatronsAPI.resetPassword(patronId);
        alert('Password reset successfully!');
      } catch (err) {
        alert('Failed to reset password');
      }
    }
  };

  const handleStatusChange = async (patronId, action) => {
    if (window.confirm(`Are you sure you want to ${action} this patron?`)) {
      try {
        await adminPatronsAPI.updateStatus(patronId, action);
        loadPatrons();
        alert(`Patron ${action}d successfully!`);
      } catch (err) {
        alert(`Failed to ${action} patron`);
      }
    }
  };

  if (loading && patrons.length === 0) {
    return <div className="loading">Loading patrons...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Patron Management</h1>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary">
          {showAddForm ? 'Cancel' : 'Add New Patron'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showAddForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Add New Patron</h3>
          <form onSubmit={handleAddPatron}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={newPatron.email}
                  onChange={(e) => setNewPatron({...newPatron, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={newPatron.name}
                  onChange={(e) => setNewPatron({...newPatron, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={newPatron.phone}
                  onChange={(e) => setNewPatron({...newPatron, phone: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  value={newPatron.mobile_number}
                  onChange={(e) => setNewPatron({...newPatron, mobile_number: e.target.value})}
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Address</label>
                <textarea
                  value={newPatron.address}
                  onChange={(e) => setNewPatron({...newPatron, address: e.target.value})}
                  rows="2"
                />
              </div>
              <div className="form-group">
                <label>Membership Plan *</label>
                <select
                  value={newPatron.membership_plan_id}
                  onChange={(e) => setNewPatron({...newPatron, membership_plan_id: e.target.value})}
                  required
                >
                  <option value="">Select a plan</option>
                  {membershipPlans.map(plan => (
                    <option key={plan.plan_id} value={plan.plan_id}>
                      {plan.plan_name} - ${plan.price} ({plan.duration_days} days)
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-success" style={{ marginTop: '10px' }}>
              Create Patron
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Search by name, email, phone, or ID..."
            value={search}
            onChange={handleSearch}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Membership</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patrons.map((patron) => (
                <tr key={patron.patron_id}>
                  <td>{patron.patron_id}</td>
                  <td>{patron.name}</td>
                  <td>{patron.email}</td>
                  <td>{patron.mobile_number || patron.phone || 'N/A'}</td>
                  <td>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '3px',
                      fontSize: '12px',
                      backgroundColor: patron.status === 'active' ? '#27ae60' : '#e74c3c',
                      color: 'white'
                    }}>
                      {patron.status}
                    </span>
                  </td>
                  <td>{patron.membership_type || 'N/A'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleResetPassword(patron.patron_id)}
                        className="btn btn-secondary"
                        style={{ fontSize: '12px', padding: '5px 10px' }}
                      >
                        Reset Password
                      </button>
                      {patron.status === 'active' && (
                        <button
                          onClick={() => handleStatusChange(patron.patron_id, 'freeze')}
                          className="btn btn-secondary"
                          style={{ fontSize: '12px', padding: '5px 10px' }}
                        >
                          Freeze
                        </button>
                      )}
                      {patron.status === 'frozen' && (
                        <button
                          onClick={() => handleStatusChange(patron.patron_id, 'renew')}
                          className="btn btn-success"
                          style={{ fontSize: '12px', padding: '5px 10px' }}
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-secondary"
            >
              Previous
            </button>
            <span style={{ padding: '0 15px' }}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn btn-secondary"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PatronManagement;
