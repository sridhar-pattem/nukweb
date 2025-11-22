import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GlobalSettings = () => {
    const [settings, setSettings] = useState({
        site_name: '',
        site_tagline: '',
        site_logo_url: '',
        site_favicon_url: '',
        contact_email: '',
        contact_phone: '',
        contact_address: '',
        social_media_links: {
            facebook: '',
            twitter: '',
            instagram: '',
            linkedin: ''
        },
        footer_text: '',
        copyright_text: '',
        analytics_code: '',
        custom_head_code: '',
        custom_footer_code: ''
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axios.get('/api/admin/website/settings/global');
            if (response.data.success) {
                const data = response.data.settings;
                // Parse social_media_links if it's a string
                if (typeof data.social_media_links === 'string') {
                    data.social_media_links = JSON.parse(data.social_media_links);
                }
                setSettings(data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching settings:', error);
            setMessage('Error loading settings');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSocialMediaChange = (platform, value) => {
        setSettings(prev => ({
            ...prev,
            social_media_links: {
                ...prev.social_media_links,
                [platform]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const response = await axios.put('/api/admin/website/settings/global', settings);
            if (response.data.success) {
                setMessage('Settings saved successfully!');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage('Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading settings...</div>;
    }

    return (
        <div className="global-settings">
            <div className="section-header">
                <h2>Global Website Settings</h2>
                <p>Configure your website's general information and settings</p>
            </div>

            {message && (
                <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="settings-form">
                <div className="settings-section">
                    <h3>Site Information</h3>

                    <div className="form-group">
                        <label>Site Name</label>
                        <input
                            type="text"
                            name="site_name"
                            value={settings.site_name || ''}
                            onChange={handleChange}
                            placeholder="Nuk Library"
                        />
                    </div>

                    <div className="form-group">
                        <label>Site Tagline</label>
                        <input
                            type="text"
                            name="site_tagline"
                            value={settings.site_tagline || ''}
                            onChange={handleChange}
                            placeholder="Your Gateway to Knowledge"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Site Logo URL</label>
                            <input
                                type="url"
                                name="site_logo_url"
                                value={settings.site_logo_url || ''}
                                onChange={handleChange}
                                placeholder="https://example.com/logo.png"
                            />
                        </div>

                        <div className="form-group">
                            <label>Site Favicon URL</label>
                            <input
                                type="url"
                                name="site_favicon_url"
                                value={settings.site_favicon_url || ''}
                                onChange={handleChange}
                                placeholder="https://example.com/favicon.ico"
                            />
                        </div>
                    </div>
                </div>

                <div className="settings-section">
                    <h3>Contact Information</h3>

                    <div className="form-group">
                        <label>Contact Email</label>
                        <input
                            type="email"
                            name="contact_email"
                            value={settings.contact_email || ''}
                            onChange={handleChange}
                            placeholder="info@example.com"
                        />
                    </div>

                    <div className="form-group">
                        <label>Contact Phone</label>
                        <input
                            type="tel"
                            name="contact_phone"
                            value={settings.contact_phone || ''}
                            onChange={handleChange}
                            placeholder="+1-234-567-8900"
                        />
                    </div>

                    <div className="form-group">
                        <label>Contact Address</label>
                        <textarea
                            name="contact_address"
                            value={settings.contact_address || ''}
                            onChange={handleChange}
                            rows="3"
                            placeholder="123 Library Street, City, State 12345"
                        />
                    </div>
                </div>

                <div className="settings-section">
                    <h3>Social Media Links</h3>

                    <div className="form-group">
                        <label>Facebook</label>
                        <input
                            type="url"
                            value={settings.social_media_links?.facebook || ''}
                            onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                            placeholder="https://facebook.com/yourpage"
                        />
                    </div>

                    <div className="form-group">
                        <label>Twitter</label>
                        <input
                            type="url"
                            value={settings.social_media_links?.twitter || ''}
                            onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                            placeholder="https://twitter.com/yourhandle"
                        />
                    </div>

                    <div className="form-group">
                        <label>Instagram</label>
                        <input
                            type="url"
                            value={settings.social_media_links?.instagram || ''}
                            onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                            placeholder="https://instagram.com/yourprofile"
                        />
                    </div>

                    <div className="form-group">
                        <label>LinkedIn</label>
                        <input
                            type="url"
                            value={settings.social_media_links?.linkedin || ''}
                            onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                            placeholder="https://linkedin.com/company/yourcompany"
                        />
                    </div>
                </div>

                <div className="settings-section">
                    <h3>Footer Settings</h3>

                    <div className="form-group">
                        <label>Footer Text</label>
                        <textarea
                            name="footer_text"
                            value={settings.footer_text || ''}
                            onChange={handleChange}
                            rows="2"
                            placeholder="Empowering minds through books and community learning."
                        />
                    </div>

                    <div className="form-group">
                        <label>Copyright Text</label>
                        <input
                            type="text"
                            name="copyright_text"
                            value={settings.copyright_text || ''}
                            onChange={handleChange}
                            placeholder="© 2025 Nuk Library. All rights reserved."
                        />
                    </div>
                </div>

                <div className="settings-section">
                    <h3>Advanced Settings</h3>

                    <div className="form-group">
                        <label>Analytics Code (Google Analytics, etc.)</label>
                        <textarea
                            name="analytics_code"
                            value={settings.analytics_code || ''}
                            onChange={handleChange}
                            rows="3"
                            placeholder="<!-- Google Analytics or other tracking code -->"
                        />
                    </div>

                    <div className="form-group">
                        <label>Custom Head Code</label>
                        <textarea
                            name="custom_head_code"
                            value={settings.custom_head_code || ''}
                            onChange={handleChange}
                            rows="3"
                            placeholder="<!-- Custom HTML to insert in <head> -->"
                        />
                        <small>This code will be inserted in the &lt;head&gt; section of your website</small>
                    </div>

                    <div className="form-group">
                        <label>Custom Footer Code</label>
                        <textarea
                            name="custom_footer_code"
                            value={settings.custom_footer_code || ''}
                            onChange={handleChange}
                            rows="3"
                            placeholder="<!-- Custom HTML to insert before </body> -->"
                        />
                        <small>This code will be inserted before the closing &lt;/body&gt; tag</small>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" disabled={saving} className="btn btn-primary">
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                    <button type="button" onClick={fetchSettings} className="btn btn-secondary">
                        Reset to Saved
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GlobalSettings;
