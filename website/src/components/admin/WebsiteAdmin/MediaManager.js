import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MediaManager = () => {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingMedia, setEditingMedia] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const [message, setMessage] = useState('');

    const [formData, setFormData] = useState({
        media_name: '',
        media_url: '',
        media_type: 'image',
        alt_text: '',
        caption: ''
    });

    useEffect(() => {
        fetchMedia();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterType]);

    const fetchMedia = async () => {
        try {
            const url = filterType === 'all'
                ? '/api/admin/website/media'
                : `/api/admin/website/media?type=${filterType}`;
            const response = await axios.get(url);
            if (response.data.success) {
                setMedia(response.data.media);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching media:', error);
            setMessage('Error loading media');
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            media_name: '',
            media_url: '',
            media_type: 'image',
            alt_text: '',
            caption: ''
        });
        setEditingMedia(null);
        setShowForm(false);
    };

    const handleEdit = (mediaItem) => {
        setFormData({
            media_name: mediaItem.media_name,
            media_url: mediaItem.media_url,
            media_type: mediaItem.media_type,
            alt_text: mediaItem.alt_text || '',
            caption: mediaItem.caption || ''
        });
        setEditingMedia(mediaItem);
        setShowForm(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingMedia) {
                await axios.put(`/api/admin/website/media/${editingMedia.media_id}`, {
                    media_name: formData.media_name,
                    alt_text: formData.alt_text,
                    caption: formData.caption
                });
                setMessage('Media updated successfully!');
            } else {
                await axios.post('/api/admin/website/media', formData);
                setMessage('Media added successfully!');
            }
            resetForm();
            fetchMedia();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error saving media:', error);
            setMessage(error.response?.data?.error || 'Error saving media');
        }
    };

    const handleDelete = async (mediaId) => {
        if (!window.confirm('Delete this media file? This action cannot be undone.')) return;

        try {
            await axios.delete(`/api/admin/website/media/${mediaId}`);
            setMessage('Media deleted successfully!');
            fetchMedia();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error deleting media:', error);
            setMessage('Error deleting media');
        }
    };

    const copyUrl = (url) => {
        navigator.clipboard.writeText(url);
        setMessage('URL copied to clipboard!');
        setTimeout(() => setMessage(''), 2000);
    };

    if (loading) {
        return <div className="loading">Loading media...</div>;
    }

    return (
        <div className="media-manager">
            <div className="section-header">
                <h2>Media Library</h2>
                <p>Manage images and files for your website</p>
            </div>

            {message && (
                <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}

            <div className="media-controls">
                <div className="filter-buttons">
                    <button
                        className={filterType === 'all' ? 'active' : ''}
                        onClick={() => setFilterType('all')}
                    >
                        All Media
                    </button>
                    <button
                        className={filterType === 'image' ? 'active' : ''}
                        onClick={() => setFilterType('image')}
                    >
                        Images
                    </button>
                    <button
                        className={filterType === 'video' ? 'active' : ''}
                        onClick={() => setFilterType('video')}
                    >
                        Videos
                    </button>
                    <button
                        className={filterType === 'document' ? 'active' : ''}
                        onClick={() => setFilterType('document')}
                    >
                        Documents
                    </button>
                </div>

                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn btn-primary"
                >
                    {showForm ? 'Cancel' : '+ Add Media'}
                </button>
            </div>

            {showForm && (
                <div className="media-form">
                    <h3>{editingMedia ? 'Edit Media' : 'Add New Media'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Media Name *</label>
                            <input
                                type="text"
                                name="media_name"
                                value={formData.media_name}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Hero Image, Logo"
                            />
                        </div>

                        <div className="form-group">
                            <label>Media URL *</label>
                            <input
                                type="url"
                                name="media_url"
                                value={formData.media_url}
                                onChange={handleChange}
                                required
                                placeholder="https://example.com/image.jpg"
                                disabled={editingMedia}
                            />
                            <small>Note: Actual file upload functionality should be implemented separately</small>
                        </div>

                        <div className="form-group">
                            <label>Media Type</label>
                            <select
                                name="media_type"
                                value={formData.media_type}
                                onChange={handleChange}
                                disabled={editingMedia}
                            >
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                                <option value="document">Document</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Alt Text (for images)</label>
                            <input
                                type="text"
                                name="alt_text"
                                value={formData.alt_text}
                                onChange={handleChange}
                                placeholder="Descriptive text for accessibility"
                            />
                        </div>

                        <div className="form-group">
                            <label>Caption</label>
                            <textarea
                                name="caption"
                                value={formData.caption}
                                onChange={handleChange}
                                rows="2"
                                placeholder="Optional caption"
                            />
                        </div>

                        {formData.media_url && formData.media_type === 'image' && (
                            <div className="form-group">
                                <label>Preview:</label>
                                <img
                                    src={formData.media_url}
                                    alt="Preview"
                                    className="media-preview"
                                    style={{ maxWidth: '300px' }}
                                />
                            </div>
                        )}

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">
                                {editingMedia ? 'Update Media' : 'Add Media'}
                            </button>
                            <button type="button" onClick={resetForm} className="btn btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="media-grid">
                {media.length === 0 ? (
                    <p className="no-content">No media files yet. Add your first media!</p>
                ) : (
                    media.map(item => (
                        <div key={item.media_id} className="media-item">
                            {item.media_type === 'image' && (
                                <div className="media-thumbnail">
                                    <img src={item.media_url} alt={item.alt_text || item.media_name} />
                                </div>
                            )}
                            {item.media_type === 'video' && (
                                <div className="media-thumbnail video">
                                    🎥 Video
                                </div>
                            )}
                            {item.media_type === 'document' && (
                                <div className="media-thumbnail document">
                                    📄 Document
                                </div>
                            )}

                            <div className="media-info">
                                <h4>{item.media_name}</h4>
                                {item.alt_text && <p className="alt-text">{item.alt_text}</p>}
                                {item.caption && <p className="caption">{item.caption}</p>}
                                <small>Uploaded: {new Date(item.created_at).toLocaleDateString()}</small>
                            </div>

                            <div className="media-actions">
                                <button
                                    onClick={() => copyUrl(item.media_url)}
                                    className="btn-small"
                                    title="Copy URL"
                                >
                                    📋 Copy URL
                                </button>
                                <button
                                    onClick={() => handleEdit(item)}
                                    className="btn-small"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(item.media_id)}
                                    className="btn-small btn-danger"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MediaManager;
