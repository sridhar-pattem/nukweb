import React, { useState, useEffect } from 'react';
import { adminCollectionsAPI } from '../services/api';

function Collections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [formData, setFormData] = useState({
    collection_name: '',
    description: ''
  });

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const response = await adminCollectionsAPI.getCollections();
      setCollections(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingCollection) {
        await adminCollectionsAPI.updateCollection(editingCollection.collection_id, formData);
        alert('Collection updated successfully!');
      } else {
        await adminCollectionsAPI.createCollection(formData);
        alert('Collection created successfully!');
      }

      setShowForm(false);
      setEditingCollection(null);
      setFormData({ collection_name: '', description: '' });
      loadCollections();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save collection');
    }
  };

  const handleEdit = (collection) => {
    setEditingCollection(collection);
    setFormData({
      collection_name: collection.collection_name,
      description: collection.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (collection) => {
    if (!window.confirm(`Delete collection "${collection.collection_name}"? This will only work if no books are assigned to this collection.`)) {
      return;
    }

    try {
      await adminCollectionsAPI.deleteCollection(collection.collection_id);
      alert('Collection deleted successfully!');
      loadCollections();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete collection');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCollection(null);
    setFormData({ collection_name: '', description: '' });
  };

  if (loading) {
    return <div className="loading">Loading collections...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Collections</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : 'Add New Collection'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>{editingCollection ? 'Edit Collection' : 'Add New Collection'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Collection Name *</label>
              <input
                type="text"
                value={formData.collection_name}
                onChange={(e) => setFormData({ ...formData, collection_name: e.target.value })}
                placeholder="e.g., History, Science Fiction, Philosophy"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this collection"
                rows="3"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-success">
                {editingCollection ? 'Update Collection' : 'Create Collection'}
              </button>
              <button type="button" onClick={handleCancel} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3>All Collections ({collections.length})</h3>
        {collections.length === 0 ? (
          <p>No collections found. Add your first collection!</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Collection Name</th>
                  <th>Description</th>
                  <th>Books</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {collections.map((collection) => (
                  <tr key={collection.collection_id}>
                    <td>{collection.collection_id}</td>
                    <td><strong>{collection.collection_name}</strong></td>
                    <td>{collection.description || '-'}</td>
                    <td>{collection.book_count || 0}</td>
                    <td>{new Date(collection.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'nowrap' }}>
                        <button
                          onClick={() => handleEdit(collection)}
                          className="btn btn-primary"
                          style={{ fontSize: '11px', padding: '5px 10px' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(collection)}
                          className="btn btn-danger"
                          style={{ fontSize: '11px', padding: '5px 10px' }}
                          disabled={collection.book_count > 0}
                          title={collection.book_count > 0 ? 'Cannot delete - books assigned to this collection' : 'Delete collection'}
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

export default Collections;
