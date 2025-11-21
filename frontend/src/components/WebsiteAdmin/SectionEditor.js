import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SectionEditor = ({ pageId, section, onSectionAdded, onSectionUpdated, onCancel }) => {
    const [formData, setFormData] = useState({
        section_name: '',
        section_type: 'content',
        section_header: '',
        section_subheader: '',
        background_color: '',
        text_color: '',
        display_order: 0,
        is_visible: true,
        custom_css: ''
    });

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (section) {
            setFormData({
                section_name: section.section_name || '',
                section_type: section.section_type || 'content',
                section_header: section.section_header || '',
                section_subheader: section.section_subheader || '',
                background_color: section.background_color || '',
                text_color: section.text_color || '',
                display_order: section.display_order || 0,
                is_visible: section.is_visible !== undefined ? section.is_visible : true,
                custom_css: section.custom_css || ''
            });
        }
    }, [section]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (section) {
                // Update existing section
                const response = await axios.put(`/api/admin/website/sections/${section.section_id}`, formData);
                if (response.data.success && onSectionUpdated) {
                    onSectionUpdated();
                }
            } else {
                // Create new section
                const response = await axios.post('/api/admin/website/sections', {
                    ...formData,
                    page_id: pageId
                });
                if (response.data.success && onSectionAdded) {
                    onSectionAdded();
                }
            }
        } catch (error) {
            console.error('Error saving section:', error);
            alert('Error saving section');
        } finally {
            setSaving(false);
        }
    };

    const sectionTypes = [
        { value: 'hero', label: 'Hero Section' },
        { value: 'content', label: 'Content Section' },
        { value: 'cards', label: 'Card Grid' },
        { value: 'gallery', label: 'Image Gallery' },
        { value: 'testimonials', label: 'Testimonials' },
        { value: 'features', label: 'Features' },
        { value: 'cta', label: 'Call to Action' },
        { value: 'custom', label: 'Custom' }
    ];

    return (
        <div className="section-editor">
            <h4>{section ? 'Edit Section' : 'Add New Section'}</h4>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group">
                        <label>Section Name *</label>
                        <input
                            type="text"
                            name="section_name"
                            value={formData.section_name}
                            onChange={handleChange}
                            required
                            placeholder="e.g., Introduction, Features, About Us"
                        />
                    </div>

                    <div className="form-group">
                        <label>Section Type *</label>
                        <select
                            name="section_type"
                            value={formData.section_type}
                            onChange={handleChange}
                            required
                        >
                            {sectionTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label>Section Header</label>
                    <input
                        type="text"
                        name="section_header"
                        value={formData.section_header}
                        onChange={handleChange}
                        placeholder="Main heading for this section"
                    />
                </div>

                <div className="form-group">
                    <label>Section Subheader</label>
                    <textarea
                        name="section_subheader"
                        value={formData.section_subheader}
                        onChange={handleChange}
                        rows="2"
                        placeholder="Subheading or description"
                    />
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
                    <label>Custom CSS (Advanced)</label>
                    <textarea
                        name="custom_css"
                        value={formData.custom_css}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Add custom CSS styles for this section"
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
                    <button type="submit" disabled={saving} className="btn btn-primary">
                        {saving ? 'Saving...' : (section ? 'Update Section' : 'Add Section')}
                    </button>
                    <button type="button" onClick={onCancel} className="btn btn-secondary">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SectionEditor;
