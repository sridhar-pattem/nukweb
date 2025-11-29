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
        return (
            <div key={category} className="theme-category">
                <h3>{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                <div className="color-grid">
                    {categorySettings.map(setting => (
                        <div key={setting.setting_id} className="color-setting">
                            <label>
                                {setting.description || setting.setting_key}
                            </label>
                            <div className="color-input-group">
                                <input
                                    type="color"
                                    value={setting.setting_value}
                                    onChange={(e) => handleColorChange(setting.setting_key, e.target.value)}
                                />
                                <input
                                    type="text"
                                    value={setting.setting_value}
                                    onChange={(e) => handleColorChange(setting.setting_key, e.target.value)}
                                    className="color-hex-input"
                                    placeholder="#000000"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (loading) {
        return <div className="loading">Loading theme settings...</div>;
    }

    return (
        <div className="theme-customizer">
            <div className="section-header">
                <h2>Theme & Color Customization</h2>
                <p>Customize your website's color scheme and appearance</p>
            </div>

            {message && (
                <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}

            <div className="theme-sections">
                {Object.keys(settings).map(category =>
                    renderColorSettings(category, settings[category])
                )}
            </div>

            <div className="action-buttons">
                <button
                    onClick={saveThemeSettings}
                    disabled={saving}
                    className="btn btn-primary"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                    onClick={resetTheme}
                    className="btn btn-secondary"
                >
                    Reset to Defaults
                </button>
                <button
                    onClick={fetchThemeSettings}
                    className="btn btn-tertiary"
                >
                    Refresh
                </button>
            </div>
        </div>
    );
};

export default ThemeCustomizer;
