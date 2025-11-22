import React, { useState } from 'react';
import axios from 'axios';

const ContentBlockEditor = ({ sectionId, blocks, onUpdate }) => {
    const [showForm, setShowForm] = useState(false);
    const [editingBlock, setEditingBlock] = useState(null);
    const [formData, setFormData] = useState({
        block_type: 'text',
        block_title: '',
        block_content: '',
        image_url: '',
        link_url: '',
        link_text: '',
        display_order: 0,
        is_visible: true
    });

    const resetForm = () => {
        setFormData({
            block_type: 'text',
            block_title: '',
            block_content: '',
            image_url: '',
            link_url: '',
            link_text: '',
            display_order: 0,
            is_visible: true
        });
        setEditingBlock(null);
        setShowForm(false);
    };

    const handleEdit = (block) => {
        setFormData({
            block_type: block.block_type || 'text',
            block_title: block.block_title || '',
            block_content: block.block_content || '',
            image_url: block.image_url || '',
            link_url: block.link_url || '',
            link_text: block.link_text || '',
            display_order: block.display_order || 0,
            is_visible: block.is_visible !== undefined ? block.is_visible : true
        });
        setEditingBlock(block);
        setShowForm(true);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingBlock) {
                await axios.put(`/api/admin/website/content-blocks/${editingBlock.block_id}`, formData);
            } else {
                await axios.post('/api/admin/website/content-blocks', {
                    ...formData,
                    section_id: sectionId
                });
            }
            resetForm();
            onUpdate();
        } catch (error) {
            console.error('Error saving content block:', error);
            alert('Error saving content block');
        }
    };

    const handleDelete = async (blockId) => {
        if (!window.confirm('Delete this content block?')) return;

        try {
            await axios.delete(`/api/admin/website/content-blocks/${blockId}`);
            onUpdate();
        } catch (error) {
            console.error('Error deleting content block:', error);
            alert('Error deleting content block');
        }
    };

    const blockTypes = [
        { value: 'text', label: 'Text' },
        { value: 'image', label: 'Image' },
        { value: 'button', label: 'Button' },
        { value: 'html', label: 'HTML' }
    ];

    return (
        <div className="content-block-editor">
            <div className="block-editor-header">
                <h5>Content Blocks</h5>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn btn-primary btn-small"
                >
                    {showForm ? 'Cancel' : '+ Add Block'}
                </button>
            </div>

            {showForm && (
                <div className="block-form">
                    <h6>{editingBlock ? 'Edit Content Block' : 'Add New Content Block'}</h6>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Block Type *</label>
                            <select
                                name="block_type"
                                value={formData.block_type}
                                onChange={handleChange}
                                required
                            >
                                {blockTypes.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Block Title</label>
                            <input
                                type="text"
                                name="block_title"
                                value={formData.block_title}
                                onChange={handleChange}
                                placeholder="Optional title"
                            />
                        </div>

                        <div className="form-group">
                            <label>Block Content</label>
                            <textarea
                                name="block_content"
                                value={formData.block_content}
                                onChange={handleChange}
                                rows="5"
                                placeholder="Enter content or HTML"
                            />
                        </div>

                        {(formData.block_type === 'image' || formData.block_type === 'button') && (
                            <div className="form-group">
                                <label>Image URL</label>
                                <input
                                    type="url"
                                    name="image_url"
                                    value={formData.image_url}
                                    onChange={handleChange}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                        )}

                        {(formData.block_type === 'button' || formData.link_url) && (
                            <>
                                <div className="form-group">
                                    <label>Link URL</label>
                                    <input
                                        type="url"
                                        name="link_url"
                                        value={formData.link_url}
                                        onChange={handleChange}
                                        placeholder="https://example.com"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Link Text</label>
                                    <input
                                        type="text"
                                        name="link_text"
                                        value={formData.link_text}
                                        onChange={handleChange}
                                        placeholder="Learn More"
                                    />
                                </div>
                            </>
                        )}

                        <div className="form-group">
                            <label>Display Order</label>
                            <input
                                type="number"
                                name="display_order"
                                value={formData.display_order}
                                onChange={handleChange}
                                min="0"
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="is_visible"
                                    checked={formData.is_visible}
                                    onChange={handleChange}
                                />
                                Visible
                            </label>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">
                                {editingBlock ? 'Update Block' : 'Add Block'}
                            </button>
                            <button type="button" onClick={resetForm} className="btn btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="blocks-list">
                {blocks && blocks.length > 0 ? (
                    blocks.map(block => (
                        <div key={block.block_id} className="block-item">
                            <div className="block-header">
                                <span className="block-type">{block.block_type}</span>
                                {block.block_title && <strong>{block.block_title}</strong>}
                            </div>
                            <div className="block-preview">
                                {block.block_content && (
                                    <p>{block.block_content.substring(0, 100)}...</p>
                                )}
                                {block.image_url && <small>🖼️ Image: {block.image_url}</small>}
                            </div>
                            <div className="block-actions">
                                <button onClick={() => handleEdit(block)} className="btn-small">
                                    Edit
                                </button>
                                <button onClick={() => handleDelete(block.block_id)} className="btn-small btn-danger">
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="no-content">No content blocks yet.</p>
                )}
            </div>
        </div>
    );
};

export default ContentBlockEditor;
