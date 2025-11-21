import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MenuEditor = () => {
    const [menu, setMenu] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState('header');
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [message, setMessage] = useState('');

    const [formData, setFormData] = useState({
        menu_location: 'header',
        menu_text: '',
        menu_url: '',
        parent_id: null,
        display_order: 0,
        is_visible: true,
        target: '_self',
        icon: ''
    });

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        try {
            const response = await axios.get('/api/admin/website/menu');
            if (response.data.success) {
                setMenu(response.data.menu);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching menu:', error);
            setMessage('Error loading menu');
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            menu_location: selectedLocation,
            menu_text: '',
            menu_url: '',
            parent_id: null,
            display_order: 0,
            is_visible: true,
            target: '_self',
            icon: ''
        });
        setEditingItem(null);
        setShowForm(false);
    };

    const handleEdit = (item) => {
        setFormData({
            menu_location: item.menu_location,
            menu_text: item.menu_text,
            menu_url: item.menu_url,
            parent_id: item.parent_id,
            display_order: item.display_order,
            is_visible: item.is_visible,
            target: item.target,
            icon: item.icon || ''
        });
        setEditingItem(item);
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
            if (editingItem) {
                await axios.put(`/api/admin/website/menu/${editingItem.menu_item_id}`, formData);
                setMessage('Menu item updated successfully!');
            } else {
                await axios.post('/api/admin/website/menu', formData);
                setMessage('Menu item created successfully!');
            }
            resetForm();
            fetchMenu();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error saving menu item:', error);
            setMessage(error.response?.data?.error || 'Error saving menu item');
        }
    };

    const handleDelete = async (itemId) => {
        if (!window.confirm('Delete this menu item?')) return;

        try {
            await axios.delete(`/api/admin/website/menu/${itemId}`);
            setMessage('Menu item deleted successfully!');
            fetchMenu();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error deleting menu item:', error);
            setMessage('Error deleting menu item');
        }
    };

    const menuLocations = [
        { value: 'header', label: 'Header Navigation' },
        { value: 'footer', label: 'Footer Navigation' },
        { value: 'sidebar', label: 'Sidebar Navigation' }
    ];

    if (loading) {
        return <div className="loading">Loading menu...</div>;
    }

    const currentMenu = menu[selectedLocation] || [];

    return (
        <div className="menu-editor">
            <div className="section-header">
                <h2>Navigation Menu Editor</h2>
                <p>Manage your website's navigation menus</p>
            </div>

            {message && (
                <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}

            <div className="menu-location-selector">
                <label>Select Menu Location:</label>
                <div className="location-tabs">
                    {menuLocations.map(location => (
                        <button
                            key={location.value}
                            className={selectedLocation === location.value ? 'tab active' : 'tab'}
                            onClick={() => setSelectedLocation(location.value)}
                        >
                            {location.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="menu-actions">
                <button
                    onClick={() => {
                        setFormData({ ...formData, menu_location: selectedLocation });
                        setShowForm(!showForm);
                    }}
                    className="btn btn-primary"
                >
                    {showForm ? 'Cancel' : '+ Add Menu Item'}
                </button>
            </div>

            {showForm && (
                <div className="menu-form">
                    <h3>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Menu Text *</label>
                                <input
                                    type="text"
                                    name="menu_text"
                                    value={formData.menu_text}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., Home, About Us"
                                />
                            </div>

                            <div className="form-group">
                                <label>Menu URL *</label>
                                <input
                                    type="text"
                                    name="menu_url"
                                    value={formData.menu_url}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., /, /about"
                                />
                            </div>
                        </div>

                        <div className="form-row">
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
                                <label>Link Target</label>
                                <select
                                    name="target"
                                    value={formData.target}
                                    onChange={handleChange}
                                >
                                    <option value="_self">Same Window</option>
                                    <option value="_blank">New Window</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Icon (Optional)</label>
                                <input
                                    type="text"
                                    name="icon"
                                    value={formData.icon}
                                    onChange={handleChange}
                                    placeholder="e.g., 🏠 or icon-class"
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
                                {editingItem ? 'Update Menu Item' : 'Add Menu Item'}
                            </button>
                            <button type="button" onClick={resetForm} className="btn btn-secondary">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="menu-items-list">
                <h3>{menuLocations.find(l => l.value === selectedLocation)?.label}</h3>
                {currentMenu.length === 0 ? (
                    <p className="no-content">No menu items yet. Add your first item!</p>
                ) : (
                    <table className="menu-table">
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Icon</th>
                                <th>Text</th>
                                <th>URL</th>
                                <th>Target</th>
                                <th>Visible</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentMenu.map(item => (
                                <tr key={item.menu_item_id}>
                                    <td>{item.display_order}</td>
                                    <td>{item.icon || '-'}</td>
                                    <td>{item.menu_text}</td>
                                    <td>{item.menu_url}</td>
                                    <td>{item.target}</td>
                                    <td>
                                        <span className={`status ${item.is_visible ? 'visible' : 'hidden'}`}>
                                            {item.is_visible ? '✓' : '✗'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="btn-small"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.menu_item_id)}
                                            className="btn-small btn-danger"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default MenuEditor;
