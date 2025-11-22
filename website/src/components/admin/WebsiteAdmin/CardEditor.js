import React, { useState } from 'react';
import axios from 'axios';

const CardEditor = ({ sectionId, cards, onUpdate }) => {
    const [showForm, setShowForm] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [formData, setFormData] = useState({
        card_title: '',
        card_description: '',
        card_image_url: '',
        card_icon: '',
        link_url: '',
        link_text: '',
        background_color: '',
        text_color: '',
        display_order: 0,
        is_visible: true
    });

    const resetForm = () => {
        setFormData({
            card_title: '',
            card_description: '',
            card_image_url: '',
            card_icon: '',
            link_url: '',
            link_text: '',
            background_color: '',
            text_color: '',
            display_order: 0,
            is_visible: true
        });
        setEditingCard(null);
        setShowForm(false);
    };

    const handleEdit = (card) => {
        setFormData({
            card_title: card.card_title || '',
            card_description: card.card_description || '',
            card_image_url: card.card_image_url || '',
            card_icon: card.card_icon || '',
            link_url: card.link_url || '',
            link_text: card.link_text || '',
            background_color: card.background_color || '',
            text_color: card.text_color || '',
            display_order: card.display_order || 0,
            is_visible: card.is_visible !== undefined ? card.is_visible : true
        });
        setEditingCard(card);
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
            if (editingCard) {
                await axios.put(`/api/admin/website/cards/${editingCard.card_id}`, formData);
            } else {
                await axios.post('/api/admin/website/cards', {
                    ...formData,
                    section_id: sectionId
                });
            }
            resetForm();
            onUpdate();
        } catch (error) {
            console.error('Error saving card:', error);
            alert('Error saving card');
        }
    };

    const handleDelete = async (cardId) => {
        if (!window.confirm('Delete this card?')) return;

        try {
            await axios.delete(`/api/admin/website/cards/${cardId}`);
            onUpdate();
        } catch (error) {
            console.error('Error deleting card:', error);
            alert('Error deleting card');
        }
    };

    return (
        <div className="card-editor">
            <div className="card-editor-header">
                <h5>Cards</h5>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn btn-primary btn-small"
                >
                    {showForm ? 'Cancel' : '+ Add Card'}
                </button>
            </div>

            {showForm && (
                <div className="card-form">
                    <h6>{editingCard ? 'Edit Card' : 'Add New Card'}</h6>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Card Title *</label>
                            <input
                                type="text"
                                name="card_title"
                                value={formData.card_title}
                                onChange={handleChange}
                                required
                                placeholder="Card title"
                            />
                        </div>

                        <div className="form-group">
                            <label>Card Description</label>
                            <textarea
                                name="card_description"
                                value={formData.card_description}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Card description"
                            />
                        </div>

                        <div className="form-group">
                            <label>Card Image URL</label>
                            <input
                                type="url"
                                name="card_image_url"
                                value={formData.card_image_url}
                                onChange={handleChange}
                                placeholder="https://example.com/image.jpg"
                            />
                            {formData.card_image_url && (
                                <img
                                    src={formData.card_image_url}
                                    alt="Preview"
                                    className="image-preview"
                                    style={{ maxWidth: '200px', marginTop: '10px' }}
                                />
                            )}
                        </div>

                        <div className="form-group">
                            <label>Card Icon (optional)</label>
                            <input
                                type="text"
                                name="card_icon"
                                value={formData.card_icon}
                                onChange={handleChange}
                                placeholder="e.g., 🏆 or icon-class-name"
                            />
                        </div>

                        <div className="form-row">
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
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Background Color</label>
                                <div className="color-input-group">
                                    <input
                                        type="color"
                                        name="background_color"
                                        value={formData.background_color || '#ffffff'}
                                        onChange={handleChange}
                                    />
                                    <input
                                        type="text"
                                        name="background_color"
                                        value={formData.background_color}
                                        onChange={handleChange}
                                        placeholder="#ffffff"
                                        className="color-hex-input"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Text Color</label>
                                <div className="color-input-group">
                                    <input
                                        type="color"
                                        name="text_color"
                                        value={formData.text_color || '#000000'}
                                        onChange={handleChange}
                                    />
                                    <input
                                        type="text"
                                        name="text_color"
                                        value={formData.text_color}
                                        onChange={handleChange}
                                        placeholder="#000000"
                                        className="color-hex-input"
                                    />
                                </div>
                            </div>

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
                                {editingCard ? 'Update Card' : 'Add Card'}
                            </button>
                            <button type="button" onClick={resetForm} className="btn btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="cards-list">
                {cards && cards.length > 0 ? (
                    cards.map(card => (
                        <div key={card.card_id} className="card-item">
                            {card.card_image_url && (
                                <img src={card.card_image_url} alt={card.card_title} className="card-thumbnail" />
                            )}
                            <div className="card-content">
                                <h6>{card.card_icon && <span>{card.card_icon} </span>}{card.card_title}</h6>
                                <p>{card.card_description}</p>
                                {card.link_url && (
                                    <small>Link: {card.link_text || card.link_url}</small>
                                )}
                            </div>
                            <div className="card-actions">
                                <button onClick={() => handleEdit(card)} className="btn-small">
                                    Edit
                                </button>
                                <button onClick={() => handleDelete(card.card_id)} className="btn-small btn-danger">
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="no-content">No cards yet. Add your first card!</p>
                )}
            </div>
        </div>
    );
};

export default CardEditor;
