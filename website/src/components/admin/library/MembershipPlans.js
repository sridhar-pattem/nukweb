import React, { useState, useEffect } from 'react';
import { adminLibraryAPI } from '../../../services/api';
import { FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import '../../../styles/admin-library.css';

const MembershipPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    plan_name: '',
    description: '',
    duration_days: '',
    max_books: '',
    price: '',
    late_fee_per_day: '',
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await adminLibraryAPI.getMembershipPlans();
      setPlans(response.data || []);
    } catch (err) {
      console.error('Error fetching membership plans:', err);
      setError('Failed to load membership plans');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      plan_name: '',
      description: '',
      duration_days: '',
      max_books: '',
      price: '',
      late_fee_per_day: '',
    });
    setShowModal(true);
  };

  const handleEdit = (plan) => {
    setEditingId(plan.plan_id);
    setFormData({
      plan_name: plan.plan_name || '',
      description: plan.description || '',
      duration_days: plan.duration_days || '',
      max_books: plan.max_books || '',
      price: plan.price || '',
      late_fee_per_day: plan.late_fee_per_day || '',
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.plan_name) {
      setError('Plan name is required');
      return;
    }

    try {
      setError('');

      if (editingId) {
        await adminLibraryAPI.updateMembershipPlan(editingId, formData);
        setSuccess('Membership plan updated successfully!');
      } else {
        await adminLibraryAPI.createMembershipPlan(formData);
        setSuccess('Membership plan created successfully!');
      }

      setShowModal(false);
      fetchPlans();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving membership plan:', err);
      setError(err.response?.data?.error || 'Failed to save membership plan');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this membership plan? Members with this plan may be affected.')) {
      return;
    }

    try {
      await adminLibraryAPI.deleteMembershipPlan(id);
      setSuccess('Membership plan deleted successfully!');
      fetchPlans();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting membership plan:', err);
      setError(err.response?.data?.error || 'Failed to delete membership plan');
    }
  };

  if (loading) {
    return (
      <div className="admin-library loading">
        <div className="spinner"></div>
        <p>Loading membership plans...</p>
      </div>
    );
  }

  return (
    <div className="admin-library">
      <div className="admin-header">
        <div>
          <h1>Membership Plans</h1>
          <p>Manage library membership plans and pricing</p>
        </div>
        <button onClick={handleAdd} className="btn btn-primary">
          <FaPlus /> Add Plan
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Plan Name</th>
              <th>Description</th>
              <th>Duration (Days)</th>
              <th>Max Books</th>
              <th>Price</th>
              <th>Late Fee/Day</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  No membership plans found. Add your first plan!
                </td>
              </tr>
            ) : (
              plans.map((plan) => (
                <tr key={plan.plan_id}>
                  <td>
                    <strong>{plan.plan_name}</strong>
                  </td>
                  <td>{plan.description || '-'}</td>
                  <td>{plan.duration_days || '-'}</td>
                  <td>{plan.max_books || '-'}</td>
                  <td>
                    {plan.price ? `$${parseFloat(plan.price).toFixed(2)}` : '-'}
                  </td>
                  <td>
                    {plan.late_fee_per_day
                      ? `$${parseFloat(plan.late_fee_per_day).toFixed(2)}`
                      : '-'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(plan)}
                        className="btn btn-icon btn-small"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(plan.plan_id)}
                        className="btn btn-icon btn-small btn-danger"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Membership Plan' : 'Add Membership Plan'}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-icon"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="plan_name">Plan Name *</label>
                <input
                  type="text"
                  id="plan_name"
                  name="plan_name"
                  value={formData.plan_name}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-control"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="duration_days">Duration (Days)</label>
                  <input
                    type="number"
                    id="duration_days"
                    name="duration_days"
                    value={formData.duration_days}
                    onChange={handleChange}
                    className="form-control"
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="max_books">Max Books</label>
                  <input
                    type="number"
                    id="max_books"
                    name="max_books"
                    value={formData.max_books}
                    onChange={handleChange}
                    className="form-control"
                    min="1"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Price ($)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="form-control"
                    step="0.01"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="late_fee_per_day">Late Fee Per Day ($)</label>
                  <input
                    type="number"
                    id="late_fee_per_day"
                    name="late_fee_per_day"
                    value={formData.late_fee_per_day}
                    onChange={handleChange}
                    className="form-control"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipPlans;
