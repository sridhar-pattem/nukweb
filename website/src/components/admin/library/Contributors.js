import React, { useState, useEffect } from 'react';
import { adminLibraryAPI } from '../../../services/api';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaSearch } from 'react-icons/fa';
import '../../../styles/admin-library.css';

const Contributors = () => {
  const [contributors, setContributors] = useState([]);
  const [filteredContributors, setFilteredContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    role: 'Author',
    biography: '',
  });

  useEffect(() => {
    fetchContributors();
  }, []);

  useEffect(() => {
    filterContributors();
  }, [contributors, searchTerm, roleFilter]);

  const fetchContributors = async () => {
    try {
      setLoading(true);
      const response = await adminLibraryAPI.getContributors();
      // Handle different response formats from backend
      const contributorsData = Array.isArray(response.data)
        ? response.data
        : (response.data?.contributors || []);
      setContributors(contributorsData);
    } catch (err) {
      console.error('Error fetching contributors:', err);
      setError('Failed to load contributors');
      setContributors([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const filterContributors = () => {
    // Ensure contributors is an array before filtering
    if (!Array.isArray(contributors)) {
      setFilteredContributors([]);
      return;
    }

    let filtered = [...contributors];

    if (searchTerm) {
      filtered = filtered.filter((contributor) =>
        contributor.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter) {
      filtered = filtered.filter((contributor) => contributor.role === roleFilter);
    }

    setFilteredContributors(filtered);
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      role: 'Author',
      biography: '',
    });
    setShowModal(true);
  };

  const handleEdit = (contributor) => {
    setEditingId(contributor.contributor_id);
    setFormData({
      name: contributor.name || '',
      role: contributor.role || 'Author',
      biography: contributor.biography || '',
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

    if (!formData.name) {
      setError('Name is required');
      return;
    }

    try {
      setError('');

      if (editingId) {
        await adminLibraryAPI.updateContributor(editingId, formData);
        setSuccess('Contributor updated successfully!');
      } else {
        await adminLibraryAPI.createContributor(formData);
        setSuccess('Contributor created successfully!');
      }

      setShowModal(false);
      fetchContributors();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving contributor:', err);
      setError(err.response?.data?.error || 'Failed to save contributor');
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this contributor? This may affect books they are associated with.'
      )
    ) {
      return;
    }

    try {
      await adminLibraryAPI.deleteContributor(id);
      setSuccess('Contributor deleted successfully!');
      fetchContributors();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting contributor:', err);
      setError(err.response?.data?.error || 'Failed to delete contributor');
    }
  };

  if (loading) {
    return (
      <div className="admin-library loading">
        <div className="spinner"></div>
        <p>Loading contributors...</p>
      </div>
    );
  }

  return (
    <div className="admin-library">
      <div className="admin-header">
        <div>
          <h1>Contributors</h1>
          <p>Manage authors, editors, translators, and illustrators</p>
        </div>
        <button onClick={handleAdd} className="btn btn-primary">
          <FaPlus /> Add Contributor
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Search and Filters */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="form-control"
          >
            <option value="">All Roles</option>
            <option value="Author">Author</option>
            <option value="Editor">Editor</option>
            <option value="Translator">Translator</option>
            <option value="Illustrator">Illustrator</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Biography</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredContributors.length === 0 ? (
              <tr>
                <td colSpan="4" className="no-data">
                  {searchTerm || roleFilter
                    ? 'No contributors found matching your filters'
                    : 'No contributors found. Add your first contributor!'}
                </td>
              </tr>
            ) : (
              filteredContributors.map((contributor) => (
                <tr key={contributor.contributor_id}>
                  <td>
                    <strong>{contributor.name}</strong>
                  </td>
                  <td>
                    <span className="badge badge-secondary">{contributor.role}</span>
                  </td>
                  <td>
                    {contributor.biography ? (
                      contributor.biography.length > 100 ? (
                        `${contributor.biography.substring(0, 100)}...`
                      ) : (
                        contributor.biography
                      )
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(contributor)}
                        className="btn btn-icon btn-small"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(contributor.contributor_id)}
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

      <div className="results-info">
        Showing {filteredContributors.length} of {contributors.length} contributors
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Contributor' : 'Add Contributor'}</h2>
              <button onClick={() => setShowModal(false)} className="btn btn-icon">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Role *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="form-control"
                  required
                >
                  <option value="Author">Author</option>
                  <option value="Editor">Editor</option>
                  <option value="Translator">Translator</option>
                  <option value="Illustrator">Illustrator</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="biography">Biography</label>
                <textarea
                  id="biography"
                  name="biography"
                  value={formData.biography}
                  onChange={handleChange}
                  className="form-control"
                  rows="4"
                  placeholder="Brief biography of the contributor..."
                />
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
                  {editingId ? 'Update Contributor' : 'Create Contributor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contributors;
