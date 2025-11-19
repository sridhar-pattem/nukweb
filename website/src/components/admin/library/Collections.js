import React, { useState, useEffect } from 'react';
import { adminLibraryAPI } from '../../../services/api';
import { FaBook, FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import '../../../styles/admin-library.css';

const Collections = () => {
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    collection_name: '',
    description: '',
  });

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const response = await adminLibraryAPI.getCollections();
      setCollections(response.data || []);
    } catch (err) {
      console.error('Error fetching collections:', err);
      setError('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.collection_name) {
      setError('Collection name is required');
      return;
    }

    try {
      setError('');

      if (editingId) {
        await adminLibraryAPI.updateCollection(editingId, formData);
        setSuccess('Collection updated successfully!');
      } else {
        await adminLibraryAPI.createCollection(formData);
        setSuccess('Collection created successfully!');
      }

      setShowModal(false);
      setEditingId(null);
      setFormData({ collection_name: '', description: '' });
      fetchCollections();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving collection:', err);
      setError(err.response?.data?.error || 'Failed to save collection');
    }
  };

  const handleEdit = (collection) => {
    setEditingId(collection.collection_id);
    setFormData({
      collection_name: collection.collection_name,
      description: collection.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this collection?')) return;

    try {
      await adminLibraryAPI.deleteCollection(id);
      setSuccess('Collection deleted successfully!');
      fetchCollections();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting collection:', err);
      setError(err.response?.data?.error || 'Failed to delete collection');
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ collection_name: '', description: '' });
    setError('');
  };

  if (loading) {
    return (
      <div className="admin-library loading">
        <div className="spinner"></div>
        <p>Loading collections...</p>
      </div>
    );
  }

  return (
    <div className="admin-library">
      <div className="admin-header">
        <div>
          <h1>Collections</h1>
          <p>Manage library collections</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <FaPlus /> Add Collection
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Collection Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Collection' : 'Add Collection'}</h2>
              <button className="modal-close" onClick={handleCancel}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="collection_name">Collection Name *</label>
                <input
                  type="text"
                  id="collection_name"
                  value={formData.collection_name}
                  onChange={(e) =>
                    setFormData({ ...formData, collection_name: e.target.value })
                  }
                  className="form-control"
                  required
                  placeholder="e.g., Fiction, Non-Fiction, Reference"
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="form-control"
                  rows="3"
                  placeholder="Brief description of this collection"
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collections Table */}
      {collections.length === 0 ? (
        <div className="empty-state">
          <FaBook />
          <p>No collections found</p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <FaPlus /> Add First Collection
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Collection Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {collections.map((collection) => (
                <tr key={collection.collection_id}>
                  <td>
                    <strong>{collection.collection_name}</strong>
                  </td>
                  <td>{collection.description || 'No description'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(collection)}
                        className="btn btn-icon"
                        title="Edit Collection"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(collection.collection_id)}
                        className="btn btn-icon btn-danger"
                        title="Delete Collection"
                      >
                        <FaTrash />
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
  );
};

export default Collections;
