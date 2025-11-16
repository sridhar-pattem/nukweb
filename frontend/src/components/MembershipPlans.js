import React, { useState, useEffect } from 'react';
import { adminPatronsAPI } from '../services/api';

function MembershipPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    plan_name: '',
    plan_type: 'Active',
    duration_days: '',
    price: '',
    description: '',
    borrowing_limit: 3
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await adminPatronsAPI.getMembershipPlans();
      setPlans(response.data.plans);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load membership plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await adminPatronsAPI.updateMembershipPlan(editingPlan.plan_id, formData);
        alert('Membership plan updated successfully!');
      } else {
        await adminPatronsAPI.createMembershipPlan(formData);
        alert('Membership plan created successfully!');
      }

      setShowAddForm(false);
      setEditingPlan(null);
      setFormData({
        plan_name: '',
        plan_type: 'Active',
        duration_days: '',
        price: '',
        description: '',
        borrowing_limit: 3
      });
      loadPlans();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save membership plan');
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      plan_name: plan.plan_name,
      plan_type: plan.plan_type,
      duration_days: plan.duration_days,
      price: plan.price,
      description: plan.description || '',
      borrowing_limit: plan.borrowing_limit || 3
    });
    setShowAddForm(true);
  };

  const handleDelete = async (planId) => {
    if (window.confirm('Are you sure you want to delete this membership plan? This action cannot be undone.')) {
      try {
        await adminPatronsAPI.deleteMembershipPlan(planId);
        alert('Membership plan deleted successfully!');
        loadPlans();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete membership plan');
      }
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingPlan(null);
    setFormData({
      plan_name: '',
      plan_type: 'Active',
      duration_days: '',
      price: '',
      description: '',
      borrowing_limit: 3
    });
  };

  if (loading && plans.length === 0) {
    return <div className="loading">Loading membership plans...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Membership Plans</h1>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            if (editingPlan) handleCancel();
          }}
          className="btn btn-primary"
        >
          {showAddForm ? 'Cancel' : 'Add New Plan'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showAddForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>{editingPlan ? 'Edit Membership Plan' : 'Add New Membership Plan'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>Plan Name *</label>
                <input
                  type="text"
                  value={formData.plan_name}
                  onChange={(e) => setFormData({...formData, plan_name: e.target.value})}
                  placeholder="e.g., Basic Monthly"
                  required
                />
              </div>

              <div className="form-group">
                <label>Plan Type *</label>
                <select
                  value={formData.plan_type}
                  onChange={(e) => setFormData({...formData, plan_type: e.target.value})}
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Renewal Due">Renewal Due</option>
                  <option value="Freeze">Freeze</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="form-group">
                <label>Duration (Days) *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.duration_days}
                  onChange={(e) => setFormData({...formData, duration_days: e.target.value})}
                  placeholder="e.g., 30"
                  required
                />
              </div>

              <div className="form-group">
                <label>Price (₹) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="e.g., 299.99"
                  required
                />
              </div>

              <div className="form-group">
                <label>Borrowing Limit *</label>
                <input
                  type="number"
                  min="1"
                  value={formData.borrowing_limit}
                  onChange={(e) => setFormData({...formData, borrowing_limit: parseInt(e.target.value)})}
                  placeholder="e.g., 3"
                  required
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Optional description of the plan benefits..."
                  rows="3"
                />
              </div>
            </div>

            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-success">
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </button>
              <button type="button" onClick={handleCancel} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Current Membership Plans</h3>

        {plans.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
            No membership plans found. Add your first plan to get started!
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Plan Name</th>
                  <th>Type</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Borrowing Limit</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.plan_id}>
                    <td>{plan.plan_id}</td>
                    <td><strong>{plan.plan_name}</strong></td>
                    <td>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '3px',
                        fontSize: '12px',
                        backgroundColor: plan.plan_type === 'Active' ? '#27ae60' : '#95a5a6',
                        color: 'white'
                      }}>
                        {plan.plan_type}
                      </span>
                    </td>
                    <td>{plan.duration_days} days</td>
                    <td>₹{parseFloat(plan.price).toFixed(2)}</td>
                    <td>{plan.borrowing_limit || 3} books</td>
                    <td>{plan.description || 'N/A'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleEdit(plan)}
                          className="btn btn-secondary"
                          style={{ fontSize: '12px', padding: '5px 10px' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(plan.plan_id)}
                          className="btn btn-danger"
                          style={{ fontSize: '12px', padding: '5px 10px' }}
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
      </div>
    </div>
  );
}

export default MembershipPlans;
