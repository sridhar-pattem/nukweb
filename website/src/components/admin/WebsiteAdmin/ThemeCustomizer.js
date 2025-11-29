import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/api';

const ThemeCustomizer = () => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchThemeSettings();
    }, []);

    const fetchThemeSettings = async () => {
        try {
            const response = await apiClient.get('/admin/website/theme/settings');
            if (response.data.success) {
                setSettings(response.data.settings);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching theme settings:', error);
            setMessage(`Error loading theme settings: ${error.response?.data?.error || error.message}`);
            setLoading(false);
        }
    };

    const handleColorChange = (settingKey, value) => {
        // Find the setting in the grouped settings
        const updatedSettings = { ...settings };
        Object.keys(updatedSettings).forEach(category => {
            const setting = updatedSettings[category].find(s => s.setting_key === settingKey);
            if (setting) {
                setting.setting_value = value;
            }
        });
        setSettings(updatedSettings);
    };

    const saveThemeSettings = async () => {
        setSaving(true);
        setMessage('');

        try {
            // Flatten all settings
            const allSettings = [];
            Object.keys(settings).forEach(category => {
                settings[category].forEach(setting => {
                    allSettings.push({
                        setting_key: setting.setting_key,
                        setting_value: setting.setting_value
                    });
                });
            });

            const response = await apiClient.put('/admin/website/theme/settings/bulk', {
                settings: allSettings
            });

            if (response.data.success) {
                setMessage('Theme settings saved successfully!');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error saving theme settings:', error);
            setMessage(`Error saving theme settings: ${error.response?.data?.error || error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const resetTheme = async () => {
        if (!window.confirm('Are you sure you want to reset theme to defaults?')) {
            return;
        }

        try {
            const response = await apiClient.post('/admin/website/theme/reset');
            if (response.data.success) {
                setMessage('Theme reset to defaults. Refreshing...');
                setTimeout(() => {
                    fetchThemeSettings();
                }, 1500);
            }
        } catch (error) {
            console.error('Error resetting theme:', error);
            setMessage(`Error resetting theme: ${error.response?.data?.error || error.message}`);
        }
    };

    const renderColorSettings = (category, categorySettings) => {
        // Format category name for display
        const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

        return (
            <div key={category} className="theme-category">
                <h3>{categoryName}</h3>
                <div className="color-grid">
                    {categorySettings.map(setting => {
                        // Use description if available, otherwise format setting_key
                        const displayLabel = setting.description ||
                            setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                        return (
                            <div key={setting.setting_id} className="color-setting">
                                <label htmlFor={`color-${setting.setting_id}`} style={{
                                    fontWeight: '500',
                                    marginBottom: '0.5rem',
                                    display: 'block',
                                    fontSize: '0.9rem'
                                }}>
                                    {displayLabel}
                                </label>
                                <div className="color-input-group">
                                    <input
                                        id={`color-${setting.setting_id}`}
                                        type="color"
                                        value={setting.setting_value}
                                        onChange={(e) => handleColorChange(setting.setting_key, e.target.value)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <input
                                        type="text"
                                        value={setting.setting_value}
                                        onChange={(e) => handleColorChange(setting.setting_key, e.target.value)}
                                        className="color-hex-input"
                                        placeholder="#000000"
                                        style={{
                                            padding: '0.5rem',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontFamily: 'monospace',
                                            width: '100px'
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    if (loading) {
        return <div className="loading">Loading theme settings...</div>;
    }

    return (
        <div className="theme-customizer" style={{ padding: '2rem' }}>
            <div className="section-header" style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '0.5rem' }}>Theme & Color Customization</h2>
                <p style={{ color: '#666' }}>Customize your website's color scheme and appearance. Changes are saved to database.</p>
                <p style={{ color: '#e74c3c', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    <strong>Note:</strong> After saving changes, theme colors will be applied to admin panel only.
                    To apply to public website, you'll need to update CSS variables or restart the application.
                </p>
            </div>

            {message && (
                <div style={{
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    borderRadius: '4px',
                    backgroundColor: message.includes('Error') ? '#fee' : '#dfd',
                    border: `1px solid ${message.includes('Error') ? '#fcc' : '#cfc'}`,
                    color: message.includes('Error') ? '#c00' : '#060'
                }}>
                    {message}
                </div>
            )}

            <div className="theme-sections" style={{ marginBottom: '2rem' }}>
                {Object.keys(settings).length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                        <p>No theme settings found. Loading...</p>
                    </div>
                ) : (
                    Object.keys(settings).map(category =>
                        renderColorSettings(category, settings[category])
                    )
                )}
            </div>

            <div className="action-buttons" style={{
                display: 'flex',
                gap: '1rem',
                borderTop: '1px solid #ddd',
                paddingTop: '1.5rem',
                marginTop: '2rem'
            }}>
                <button
                    onClick={saveThemeSettings}
                    disabled={saving}
                    className="btn btn-primary"
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: saving ? '#ccc' : '#2c3e50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        fontWeight: '600'
                    }}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                    onClick={resetTheme}
                    className="btn btn-secondary"
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: 'white',
                        color: '#2c3e50',
                        border: '1px solid #2c3e50',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                >
                    Reset to Defaults
                </button>
                <button
                    onClick={fetchThemeSettings}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: 'white',
                        color: '#666',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Refresh
                </button>
            </div>

            {/* Add inline styles for color grid */}
            <style>{`
                .theme-category {
                    margin-bottom: 2.5rem;
                }
                .theme-category h3 {
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                    color: #2c3e50;
                    padding-bottom: 0.5rem;
                    border-bottom: 2px solid #e74c3c;
                }
                .color-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 1.5rem;
                }
                .color-setting {
                    padding: 1rem;
                    background: #f9f9f9;
                    border-radius: 8px;
                    border: 1px solid #e0e0e0;
                }
                .color-input-group {
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                }
                .color-input-group input[type="color"] {
                    width: 60px;
                    height: 40px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }
            `}</style>
        </div>
    );
};

export default ThemeCustomizer;
