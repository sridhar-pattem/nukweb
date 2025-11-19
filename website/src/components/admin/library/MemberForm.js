import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminLibraryAPI } from '../../../services/api';
import { FaUser, FaArrowLeft } from 'react-icons/fa';
import '../../../styles/admin-library.css';

const MemberForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [membershipPlans, setMembershipPlans] = useState([]);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    membership_plan_id: '',
    password: '',
  });

  useEffect(() => {
    fetchMembershipPlans();
    if (isEditMode) {
      fetchPatronDetails();
    }
  }, [id]);

  const fetchMembershipPlans = async () => {
    try {
      const response = await adminLibraryAPI.getMembershipPlans();
      // Handle different response formats from backend
      const plansData = Array.isArray(response.data)
        ? response.data
        : (response.data?.membership_plans || response.data?.plans || []);
      setMembershipPlans(plansData);
    } catch (err) {
      console.error('Error fetching membership plans:', err);
      setMembershipPlans([]); // Set empty array on error
    }
  };

  const fetchPatronDetails = async () => {
    try {
      setLoading(true);
      const response = await adminLibraryAPI.getPatronById(id);
      const patron = response.data;

      setFormData({
        first_name: patron.first_name || '',
        last_name: patron.last_name || '',
        email: patron.email || '',
        phone: patron.phone || '',
        address: patron.address || '',
        city: patron.city || '',
        state: patron.state || '',
        postal_code: patron.postal_code || '',
        country: patron.country || 'India',
        membership_plan_id: patron.membership_plan_id || '',
        password: '', // Don't populate password for edit
      });
    } catch (err) {
      console.error('Error fetching patron:', err);
      setError('Failed to load member details');
    } finally {
      setLoading(false);
    }
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

    if (!formData.first_name || !formData.last_name || !formData.email) {
      setError('First name, last name, and email are required');
      return;
    }

    if (!isEditMode && !formData.password) {
      setError('Password is required for new members');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const memberData = { ...formData };

      // Don't send empty password on edit
      if (isEditMode && !memberData.password) {
        delete memberData.password;
      }

      if (isEditMode) {
        await adminLibraryAPI.updatePatron(id, memberData);
        setSuccess('Member updated successfully!');
      } else {
        await adminLibraryAPI.createPatron(memberData);
        setSuccess('Member created successfully!');
      }

      setTimeout(() => {
        navigate('/admin/library/members');
      }, 1500);
    } catch (err) {
      console.error('Error saving member:', err);
      setError(err.response?.data?.error || 'Failed to save member');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-library loading">
        <div className="spinner"></div>
        <p>Loading member...</p>
      </div>
    );
  }

  return (
    <div className="admin-library">
      <div className="admin-header">
        <div>
          <h1>{isEditMode ? 'Edit Member' : 'Add Member'}</h1>
          <p>{isEditMode ? 'Update member information' : 'Add a new library member'}</p>
        </div>
        <Link to="/admin/library/members" className="btn btn-outline">
          <FaArrowLeft /> Back to Members
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="book-form">
        <div className="form-section">
          <h2>Personal Information</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">First Name *</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Last Name *</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          {!isEditMode && (
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-control"
                required={!isEditMode}
              />
              <p className="help-text">Minimum 6 characters</p>
            </div>
          )}
        </div>

        <div className="form-section">
          <h2>Address</h2>

          <div className="form-group">
            <label htmlFor="address">Street Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="state">State</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="postal_code">Postal Code</label>
              <input
                type="text"
                id="postal_code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="country">Country</label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Membership</h2>

          <div className="form-group">
            <label htmlFor="membership_plan_id">Membership Plan</label>
            <select
              id="membership_plan_id"
              name="membership_plan_id"
              value={formData.membership_plan_id}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">No Membership</option>
              {membershipPlans.map((plan) => (
                <option key={plan.plan_id} value={plan.plan_id}>
                  {plan.plan_name} - ₹{plan.price} ({plan.duration_months} months)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/admin/library/members')}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Saving...' : isEditMode ? 'Update Member' : 'Create Member'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MemberForm;
