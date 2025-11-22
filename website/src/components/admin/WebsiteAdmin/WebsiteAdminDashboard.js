import React, { useState } from 'react';
import './WebsiteAdmin.css';
import ThemeCustomizer from './ThemeCustomizer';
import PageManager from './PageManager';
import MenuEditor from './MenuEditor';
import MediaManager from './MediaManager';
import GlobalSettings from './GlobalSettings';

const WebsiteAdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('pages');

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'theme':
                return <ThemeCustomizer />;
            case 'pages':
                return <PageManager />;
            case 'menu':
                return <MenuEditor />;
            case 'media':
                return <MediaManager />;
            case 'settings':
                return <GlobalSettings />;
            default:
                return <PageManager />;
        }
    };

    return (
        <div className="website-admin-dashboard">
            <div className="admin-header">
                <h1>Website Admin</h1>
                <p>Manage your website content, theme, and settings</p>
            </div>

            <div className="admin-tabs">
                <button
                    className={activeTab === 'pages' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('pages')}
                >
                    📄 Pages & Sections
                </button>
                <button
                    className={activeTab === 'theme' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('theme')}
                >
                    🎨 Theme & Colors
                </button>
                <button
                    className={activeTab === 'menu' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('menu')}
                >
                    📋 Navigation Menu
                </button>
                <button
                    className={activeTab === 'media' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('media')}
                >
                    🖼️ Media Library
                </button>
                <button
                    className={activeTab === 'settings' ? 'tab active' : 'tab'}
                    onClick={() => setActiveTab('settings')}
                >
                    ⚙️ Global Settings
                </button>
            </div>

            <div className="admin-content">
                {renderActiveTab()}
            </div>
        </div>
    );
};

export default WebsiteAdminDashboard;
