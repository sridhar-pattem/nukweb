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
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  const [selectedPatron, setSelectedPatron] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [newPatron, setNewPatron] = useState({
    email: '',
    name: '',
    phone: '',
    mobile_number: '',
    address: '',
    membership_plan_id: ''
  });

  useEffect(() => {
    if (viewMode === 'list') {
      loadPatrons();
      loadMembershipPlans();
    }
  }, [page, search, viewMode]);

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

  const loadPatronDetails = async (patronId) => {
    try {
      setLoading(true);
      const response = await adminPatronsAPI.getPatronDetails(patronId);
      setSelectedPatron(response.data.patron);
      setEditFormData({
        name: response.data.patron.name,
        email: response.data.patron.email,
        phone: response.data.patron.phone || '',
        mobile_number: response.data.patron.mobile_number || '',
        address: response.data.patron.address || '',
        membership_plan_id: response.data.patron.membership_plan_id || ''
      });
      setViewMode('detail');
    } catch (err) {
      alert('Failed to load patron details');
    } finally {
      setLoading(false);
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

  const handleUpdatePatron = async (e) => {
    e.preventDefault();
    try {
      await adminPatronsAPI.updatePatron(selectedPatron.patron_id, editFormData);
      alert('Patron updated successfully!');
      setViewMode('list');
      setSelectedPatron(null);
      setEditFormData(null);
      loadPatrons();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update patron');
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
        if (viewMode === 'detail') {
          loadPatronDetails(patronId);
        } else {
          loadPatrons();
        }
        alert(`Patron ${action}d successfully!`);
      } catch (err) {
        alert(`Failed to ${action} patron`);
      }
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedPatron(null);
    setEditFormData(null);
  };

  if (loading && patrons.length === 0 && !selectedPatron) {
    return <div className="loading">Loading patrons...</div>;
  }

  // Detail View
  if (viewMode === 'detail' && selectedPatron) {
    return (
      <div>
        <div style={{ marginBottom: '20px' }}>
          <button onClick={handleBackToList} className="btn btn-secondary">
            ← Back to List
          </button>
        </div>

        <div className="card">
          <h2>Edit Patron Details</h2>
          <form onSubmit={handleUpdatePatron}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
              <div className="form-group">
                <label>Patron ID</label>
                <input type="text" value={selectedPatron.patron_id} disabled style={{ backgroundColor: '#f0f0f0' }} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <input type="text" value={selectedPatron.status} disabled style={{ backgroundColor: '#f0f0f0' }} />
              </div>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  value={editFormData.mobile_number}
                  onChange={(e) => setEditFormData({...editFormData, mobile_number: e.target.value})}
                />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Address</label>
                <textarea
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                  rows="2"
                />
              </div>
              <div className="form-group">
                <label>Membership Plan</label>
                <select
                  value={editFormData.membership_plan_id}
                  onChange={(e) => setEditFormData({...editFormData, membership_plan_id: e.target.value})}
                >
                  <option value="">Select a plan</option>
                  {membershipPlans.map(plan => (
                    <option key={plan.plan_id} value={plan.plan_id}>
                      {plan.plan_name} - ${plan.price} ({plan.duration_days} days)
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Membership Start Date</label>
                <input
                  type="text"
                  value={selectedPatron.membership_start_date || 'N/A'}
                  disabled
                  style={{ backgroundColor: '#f0f0f0' }}
                />
              </div>
              <div className="form-group">
                <label>Membership Expiry Date</label>
                <input
                  type="text"
                  value={selectedPatron.membership_expiry_date || 'N/A'}
                  disabled
                  style={{ backgroundColor: '#f0f0f0' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button type="submit" className="btn btn-success">
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => handleResetPassword(selectedPatron.patron_id)}
                className="btn btn-secondary"
              >
                Reset Password
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange(selectedPatron.patron_id, 'renew')}
                className="btn btn-success"
              >
                Renew Membership
              </button>
              {selectedPatron.status === 'active' && (
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedPatron.patron_id, 'freeze')}
                  className="btn btn-secondary"
                >
                  Freeze Account
                </button>
              )}
              {selectedPatron.status === 'frozen' && (
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedPatron.patron_id, 'renew')}
                  className="btn btn-success"
                >
                  Activate Account
                </button>
              )}
              <button
                type="button"
                onClick={() => handleStatusChange(selectedPatron.patron_id, 'close')}
                className="btn btn-danger"
              >
                Close Account
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // List View
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
                  <td>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        loadPatronDetails(patron.patron_id);
                      }}
                      style={{ color: '#6c5ce7', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      {patron.name}
                    </a>
                  </td>
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
                  <td>{patron.plan_name || patron.membership_type || 'N/A'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'nowrap' }}>
                      <button
                        onClick={() => handleStatusChange(patron.patron_id, 'renew')}
                        className="btn btn-success"
                        style={{ fontSize: '11px', padding: '4px 10px', whiteSpace: 'nowrap' }}
                        title="Renew membership"
                      >
                        Renew
                      </button>
                      {patron.status === 'active' && (
                        <button
                          onClick={() => handleStatusChange(patron.patron_id, 'freeze')}
                          className="btn btn-secondary"
                          style={{ fontSize: '11px', padding: '4px 10px', whiteSpace: 'nowrap' }}
                          title="Freeze account"
                        >
                          Freeze
                        </button>
                      )}
                      {patron.status === 'frozen' && (
                        <button
                          onClick={() => handleStatusChange(patron.patron_id, 'renew')}
                          className="btn btn-success"
                          style={{ fontSize: '11px', padding: '4px 10px', whiteSpace: 'nowrap' }}
                          title="Activate account"
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
