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
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingPatron, setEditingPatron] = useState(null);
  const [newPatron, setNewPatron] = useState({
    patron_id: '',
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
    membership_plan_id: '',
    national_id: '',
    national_id_type: '',
    patron_email: '',
    secondary_phone_no: '',
    secondary_email: '',
    correspond_language: 'English'
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
        patron_id: '',
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
        membership_plan_id: '',
        national_id: '',
        national_id_type: '',
        patron_email: '',
        secondary_phone_no: '',
        secondary_email: '',
        correspond_language: 'English'
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

  const handleEditClick = async (patron) => {
    try {
      setError('');
      const response = await adminPatronsAPI.getPatron(patron.patron_id);
      setEditingPatron(response.data);
      setShowEditForm(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load patron details');
    }
  };

  const handleEditPatron = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await adminPatronsAPI.updatePatron(editingPatron.patron_id, editingPatron);
      setSuccess('Patron updated successfully!');
      setShowEditForm(false);
      setEditingPatron(null);
      loadPatrons();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update patron');
    }
  };

  const handleDeletePatron = async (patronId) => {
    const reason = window.prompt('Please provide a reason for deleting this patron:');
    if (!reason) return;

    if (!window.confirm('Are you sure you want to delete this patron? This action will move the patron to the deleted_patrons archive.')) return;

    try {
      setError('');
      await adminPatronsAPI.deletePatron(patronId, { reason });
      setSuccess('Patron deleted successfully!');
      loadPatrons();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete patron');
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
              {/* Patron ID */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Patron ID *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ padding: '0.5rem', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px 0 0 4px', fontFamily: 'monospace', fontSize: '1rem', fontWeight: 'bold' }}>
                    NUKG
                  </span>
                  <input
                    type="text"
                    value={newPatron.patron_id.replace(/^NUKG/, '')}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setNewPatron({ ...newPatron, patron_id: 'NUKG' + value });
                    }}
                    required
                    placeholder="9999999"
                    pattern="[0-9]+"
                    maxLength="11"
                    style={{ flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderLeft: 'none', borderRadius: '0 4px 4px 0', fontFamily: 'monospace', fontSize: '1rem' }}
                  />
                </div>
                <small style={{ color: '#666' }}>Enter only numbers (e.g., 9999999) - NUKG prefix is added automatically</small>
              </div>

              {/* Basic Information */}
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', borderBottom: '2px solid #5BC0BE', paddingBottom: '0.5rem' }}>Basic Information</h3>
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Date of Birth</label>
                <input
                  type="date"
                  value={newPatron.date_of_birth}
                  onChange={(e) => setNewPatron({ ...newPatron, date_of_birth: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>

              {/* Contact Information */}
              <h3 style={{ marginBottom: '1rem', marginTop: '1.5rem', fontSize: '1.1rem', borderBottom: '2px solid #5BC0BE', paddingBottom: '0.5rem' }}>Contact Information</h3>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Login Email *</label>
                <input
                  type="email"
                  value={newPatron.email}
                  onChange={(e) => setNewPatron({ ...newPatron, email: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
                <small style={{ color: '#666' }}>Used for login credentials</small>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Patron Email</label>
                <input
                  type="email"
                  value={newPatron.patron_email}
                  onChange={(e) => setNewPatron({ ...newPatron, patron_email: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
                <small style={{ color: '#666' }}>Primary contact email</small>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Secondary Email</label>
                <input
                  type="email"
                  value={newPatron.secondary_email}
                  onChange={(e) => setNewPatron({ ...newPatron, secondary_email: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Phone</label>
                  <input
                    type="tel"
                    value={newPatron.phone}
                    onChange={(e) => setNewPatron({ ...newPatron, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Secondary Phone</label>
                  <input
                    type="tel"
                    value={newPatron.secondary_phone_no}
                    onChange={(e) => setNewPatron({ ...newPatron, secondary_phone_no: e.target.value })}
                    maxLength="10"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Correspondence Language</label>
                <select
                  value={newPatron.correspond_language}
                  onChange={(e) => setNewPatron({ ...newPatron, correspond_language: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="English">English</option>
                  <option value="Kannada">Kannada</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>

              {/* Address Information */}
              <h3 style={{ marginBottom: '1rem', marginTop: '1.5rem', fontSize: '1.1rem', borderBottom: '2px solid #5BC0BE', paddingBottom: '0.5rem' }}>Address Information</h3>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Address</label>
                <textarea
                  value={newPatron.address}
                  onChange={(e) => setNewPatron({ ...newPatron, address: e.target.value })}
                  rows="2"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>City</label>
                  <input
                    type="text"
                    value={newPatron.city}
                    onChange={(e) => setNewPatron({ ...newPatron, city: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>State</label>
                  <input
                    type="text"
                    value={newPatron.state}
                    onChange={(e) => setNewPatron({ ...newPatron, state: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Postal Code</label>
                  <input
                    type="text"
                    value={newPatron.postal_code}
                    onChange={(e) => setNewPatron({ ...newPatron, postal_code: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Country</label>
                  <input
                    type="text"
                    value={newPatron.country}
                    onChange={(e) => setNewPatron({ ...newPatron, country: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>

              {/* Identification */}
              <h3 style={{ marginBottom: '1rem', marginTop: '1.5rem', fontSize: '1.1rem', borderBottom: '2px solid #5BC0BE', paddingBottom: '0.5rem' }}>Identification</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>National ID Type</label>
                  <select
                    value={newPatron.national_id_type}
                    onChange={(e) => setNewPatron({ ...newPatron, national_id_type: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="">Select ID Type</option>
                    <option value="Aadhaar">Aadhaar</option>
                    <option value="Driving License">Driving License</option>
                    <option value="PAN">PAN</option>
                    <option value="Passport No">Passport No</option>
                    <option value="Voter Id">Voter Id</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>National ID Number</label>
                  <input
                    type="text"
                    value={newPatron.national_id}
                    onChange={(e) => setNewPatron({ ...newPatron, national_id: e.target.value })}
                    maxLength="20"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>

              {/* Membership */}
              <h3 style={{ marginBottom: '1rem', marginTop: '1.5rem', fontSize: '1.1rem', borderBottom: '2px solid #5BC0BE', paddingBottom: '0.5rem' }}>Membership</h3>
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

      {/* Edit Patron Modal */}
      {showEditForm && editingPatron && (
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
        onClick={() => setShowEditForm(false)}
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
              <h2>Edit Patron</h2>
              <button onClick={() => setShowEditForm(false)} className="btn">×</button>
            </div>

            <form onSubmit={handleEditPatron}>
              {/* Patron ID (Read-only) */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Patron ID</label>
                <input
                  type="text"
                  value={editingPatron.patron_id}
                  disabled
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', background: '#f5f5f5', cursor: 'not-allowed' }}
                />
                <small style={{ color: '#666' }}>Patron ID cannot be changed</small>
              </div>

              {/* Basic Information */}
              <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', borderBottom: '2px solid #5BC0BE', paddingBottom: '0.5rem' }}>Basic Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>First Name *</label>
                  <input
                    type="text"
                    value={editingPatron.first_name || ''}
                    onChange={(e) => setEditingPatron({ ...editingPatron, first_name: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Last Name *</label>
                  <input
                    type="text"
                    value={editingPatron.last_name || ''}
                    onChange={(e) => setEditingPatron({ ...editingPatron, last_name: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Date of Birth</label>
                <input
                  type="date"
                  value={editingPatron.date_of_birth || ''}
                  onChange={(e) => setEditingPatron({ ...editingPatron, date_of_birth: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>

              {/* Contact Information */}
              <h3 style={{ marginBottom: '1rem', marginTop: '1.5rem', fontSize: '1.1rem', borderBottom: '2px solid #5BC0BE', paddingBottom: '0.5rem' }}>Contact Information</h3>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Login Email *</label>
                <input
                  type="email"
                  value={editingPatron.email || ''}
                  onChange={(e) => setEditingPatron({ ...editingPatron, email: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
                <small style={{ color: '#666' }}>Used for login credentials</small>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Patron Email</label>
                <input
                  type="email"
                  value={editingPatron.patron_email || ''}
                  onChange={(e) => setEditingPatron({ ...editingPatron, patron_email: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
                <small style={{ color: '#666' }}>Primary contact email</small>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Secondary Email</label>
                <input
                  type="email"
                  value={editingPatron.secondary_email || ''}
                  onChange={(e) => setEditingPatron({ ...editingPatron, secondary_email: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Phone</label>
                  <input
                    type="tel"
                    value={editingPatron.phone || ''}
                    onChange={(e) => setEditingPatron({ ...editingPatron, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Secondary Phone</label>
                  <input
                    type="tel"
                    value={editingPatron.secondary_phone_no || ''}
                    onChange={(e) => setEditingPatron({ ...editingPatron, secondary_phone_no: e.target.value })}
                    maxLength="10"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Correspondence Language</label>
                <select
                  value={editingPatron.correspond_language || 'English'}
                  onChange={(e) => setEditingPatron({ ...editingPatron, correspond_language: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="English">English</option>
                  <option value="Kannada">Kannada</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>

              {/* Address Information */}
              <h3 style={{ marginBottom: '1rem', marginTop: '1.5rem', fontSize: '1.1rem', borderBottom: '2px solid #5BC0BE', paddingBottom: '0.5rem' }}>Address Information</h3>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Address</label>
                <textarea
                  value={editingPatron.address || ''}
                  onChange={(e) => setEditingPatron({ ...editingPatron, address: e.target.value })}
                  rows="2"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>City</label>
                  <input
                    type="text"
                    value={editingPatron.city || ''}
                    onChange={(e) => setEditingPatron({ ...editingPatron, city: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>State</label>
                  <input
                    type="text"
                    value={editingPatron.state || ''}
                    onChange={(e) => setEditingPatron({ ...editingPatron, state: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Postal Code</label>
                  <input
                    type="text"
                    value={editingPatron.postal_code || ''}
                    onChange={(e) => setEditingPatron({ ...editingPatron, postal_code: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Country</label>
                  <input
                    type="text"
                    value={editingPatron.country || ''}
                    onChange={(e) => setEditingPatron({ ...editingPatron, country: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>

              {/* Identification */}
              <h3 style={{ marginBottom: '1rem', marginTop: '1.5rem', fontSize: '1.1rem', borderBottom: '2px solid #5BC0BE', paddingBottom: '0.5rem' }}>Identification</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>National ID Type</label>
                  <select
                    value={editingPatron.national_id_type || ''}
                    onChange={(e) => setEditingPatron({ ...editingPatron, national_id_type: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="">Select ID Type</option>
                    <option value="Aadhaar">Aadhaar</option>
                    <option value="Driving License">Driving License</option>
                    <option value="PAN">PAN</option>
                    <option value="Passport No">Passport No</option>
                    <option value="Voter Id">Voter Id</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>National ID Number</label>
                  <input
                    type="text"
                    value={editingPatron.national_id || ''}
                    onChange={(e) => setEditingPatron({ ...editingPatron, national_id: e.target.value })}
                    maxLength="20"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
              </div>

              {/* Membership */}
              <h3 style={{ marginBottom: '1rem', marginTop: '1.5rem', fontSize: '1.1rem', borderBottom: '2px solid #5BC0BE', paddingBottom: '0.5rem' }}>Membership</h3>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Membership Plan</label>
                <select
                  value={editingPatron.membership_plan_id || ''}
                  onChange={(e) => setEditingPatron({ ...editingPatron, membership_plan_id: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="">No Plan</option>
                  {membershipPlans.map(plan => (
                    <option key={plan.plan_id} value={plan.plan_id}>{plan.plan_name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Status</label>
                <select
                  value={editingPatron.status || ''}
                  onChange={(e) => setEditingPatron({ ...editingPatron, status: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="active">Active</option>
                  <option value="frozen">Frozen</option>
                  <option value="inactive">Inactive</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowEditForm(false)} className="btn">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Patron
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
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleEditClick(patron)}
                          className="btn"
                          style={{ fontSize: '0.875rem' }}
                          title="Edit Patron"
                        >
                          ✏️ Edit
                        </button>
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
                        <button
                          onClick={() => handleDeletePatron(patron.patron_id)}
                          className="btn"
                          style={{ fontSize: '0.875rem', background: '#f8d7da', color: '#721c24' }}
                          title="Delete Patron"
                        >
                          🗑️ Delete
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
