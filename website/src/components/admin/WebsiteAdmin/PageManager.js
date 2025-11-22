import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SectionEditor from './SectionEditor';
import CardEditor from './CardEditor';

const PageManager = () => {
    const [pages, setPages] = useState([]);
    const [selectedPage, setSelectedPage] = useState(null);
    const [pageDetails, setPageDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPageForm, setShowPageForm] = useState(false);
    const [showSectionForm, setShowSectionForm] = useState(false);
    const [editingSection, setEditingSection] = useState(null);
    const [message, setMessage] = useState('');

    const [pageForm, setPageForm] = useState({
        page_title: '',
        page_slug: '',
        page_description: '',
        meta_title: '',
        meta_description: '',
        is_published: false,
        display_order: 0
    });

    useEffect(() => {
        fetchPages();
    }, []);

    useEffect(() => {
        if (selectedPage) {
            fetchPageDetails(selectedPage);
        }
    }, [selectedPage]);

    const fetchPages = async () => {
        try {
            const response = await axios.get('/api/admin/website/pages');
            if (response.data.success) {
                setPages(response.data.pages);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching pages:', error);
            setMessage('Error loading pages');
            setLoading(false);
        }
    };

    const fetchPageDetails = async (pageId) => {
        try {
            const response = await axios.get(`/api/admin/website/pages/${pageId}`);
            if (response.data.success) {
                setPageDetails(response.data.page);
            }
        } catch (error) {
            console.error('Error fetching page details:', error);
            setMessage('Error loading page details');
        }
    };

    const handlePageFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPageForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const createPage = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/admin/website/pages', pageForm);
            if (response.data.success) {
                setMessage('Page created successfully!');
                setShowPageForm(false);
                setPageForm({
                    page_title: '',
                    page_slug: '',
                    page_description: '',
                    meta_title: '',
                    meta_description: '',
                    is_published: false,
                    display_order: 0
                });
                fetchPages();
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error creating page:', error);
            setMessage(error.response?.data?.error || 'Error creating page');
        }
    };

    const updatePage = async (pageId, updates) => {
        try {
            const response = await axios.put(`/api/admin/website/pages/${pageId}`, updates);
            if (response.data.success) {
                setMessage('Page updated successfully!');
                fetchPages();
                if (selectedPage === pageId) {
                    fetchPageDetails(pageId);
                }
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error updating page:', error);
            setMessage('Error updating page');
        }
    };

    const deletePage = async (pageId) => {
        if (!window.confirm('Are you sure you want to delete this page? All sections and content will be removed.')) {
            return;
        }

        try {
            const response = await axios.delete(`/api/admin/website/pages/${pageId}`);
            if (response.data.success) {
                setMessage('Page deleted successfully!');
                if (selectedPage === pageId) {
                    setSelectedPage(null);
                    setPageDetails(null);
                }
                fetchPages();
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error deleting page:', error);
            setMessage('Error deleting page');
        }
    };

    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        handlePageFormChange(e);
        if (!pageForm.page_slug) {
            setPageForm(prev => ({
                ...prev,
                page_title: title,
                page_slug: generateSlug(title),
                meta_title: title
            }));
        }
    };

    const handleSectionAdded = () => {
        setShowSectionForm(false);
        fetchPageDetails(selectedPage);
        setMessage('Section added successfully!');
        setTimeout(() => setMessage(''), 3000);
    };

    const handleSectionUpdated = () => {
        setEditingSection(null);
        fetchPageDetails(selectedPage);
        setMessage('Section updated successfully!');
        setTimeout(() => setMessage(''), 3000);
    };

    const handleSectionDeleted = () => {
        fetchPageDetails(selectedPage);
        setMessage('Section deleted successfully!');
        setTimeout(() => setMessage(''), 3000);
    };

    if (loading) {
        return <div className="loading">Loading pages...</div>;
    }

    return (
        <div className="page-manager">
            <div className="section-header">
                <h2>Page Manager</h2>
                <button onClick={() => setShowPageForm(!showPageForm)} className="btn btn-primary">
                    {showPageForm ? 'Cancel' : '+ New Page'}
                </button>
            </div>

            {message && (
                <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                    {message}
                </div>
            )}

            {showPageForm && (
                <div className="page-form-modal">
                    <div className="modal-content">
                        <h3>Create New Page</h3>
                        <form onSubmit={createPage}>
                            <div className="form-group">
                                <label>Page Title *</label>
                                <input
                                    type="text"
                                    name="page_title"
                                    value={pageForm.page_title}
                                    onChange={handleTitleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>URL Slug *</label>
                                <input
                                    type="text"
                                    name="page_slug"
                                    value={pageForm.page_slug}
                                    onChange={handlePageFormChange}
                                    required
                                    placeholder="e.g., about-us"
                                />
                            </div>

                            <div className="form-group">
                                <label>Page Description</label>
                                <textarea
                                    name="page_description"
                                    value={pageForm.page_description}
                                    onChange={handlePageFormChange}
                                    rows="3"
                                />
                            </div>

                            <div className="form-group">
                                <label>Meta Title (SEO)</label>
                                <input
                                    type="text"
                                    name="meta_title"
                                    value={pageForm.meta_title}
                                    onChange={handlePageFormChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Meta Description (SEO)</label>
                                <textarea
                                    name="meta_description"
                                    value={pageForm.meta_description}
                                    onChange={handlePageFormChange}
                                    rows="2"
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        name="is_published"
                                        checked={pageForm.is_published}
                                        onChange={handlePageFormChange}
                                    />
                                    Publish immediately
                                </label>
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn btn-primary">Create Page</button>
                                <button type="button" onClick={() => setShowPageForm(false)} className="btn btn-secondary">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="page-manager-content">
                <div className="pages-list">
                    <h3>Pages</h3>
                    {pages.length === 0 ? (
                        <p>No pages yet. Create your first page!</p>
                    ) : (
                        <ul>
                            {pages.map(page => (
                                <li
                                    key={page.page_id}
                                    className={selectedPage === page.page_id ? 'selected' : ''}
                                    onClick={() => setSelectedPage(page.page_id)}
                                >
                                    <div className="page-item">
                                        <strong>{page.page_title}</strong>
                                        <span className={`status ${page.is_published ? 'published' : 'draft'}`}>
                                            {page.is_published ? 'Published' : 'Draft'}
                                        </span>
                                        <div className="page-actions">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    updatePage(page.page_id, { is_published: !page.is_published });
                                                }}
                                                className="btn-small"
                                            >
                                                {page.is_published ? 'Unpublish' : 'Publish'}
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deletePage(page.page_id);
                                                }}
                                                className="btn-small btn-danger"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="page-details">
                    {pageDetails ? (
                        <div>
                            <div className="page-header">
                                <h3>{pageDetails.page_title}</h3>
                                <span className="page-slug">/{pageDetails.page_slug}</span>
                            </div>

                            <div className="page-info">
                                <p>{pageDetails.page_description}</p>
                                <small>Created: {new Date(pageDetails.created_at).toLocaleDateString()}</small>
                            </div>

                            <div className="sections-header">
                                <h4>Sections</h4>
                                <button
                                    onClick={() => setShowSectionForm(!showSectionForm)}
                                    className="btn btn-primary btn-small"
                                >
                                    {showSectionForm ? 'Cancel' : '+ Add Section'}
                                </button>
                            </div>

                            {showSectionForm && (
                                <SectionEditor
                                    pageId={selectedPage}
                                    onSectionAdded={handleSectionAdded}
                                    onCancel={() => setShowSectionForm(false)}
                                />
                            )}

                            {editingSection && (
                                <SectionEditor
                                    pageId={selectedPage}
                                    section={editingSection}
                                    onSectionUpdated={handleSectionUpdated}
                                    onCancel={() => setEditingSection(null)}
                                />
                            )}

                            <div className="sections-list">
                                {pageDetails.sections && pageDetails.sections.length === 0 ? (
                                    <p className="no-content">No sections yet. Add your first section!</p>
                                ) : (
                                    pageDetails.sections && pageDetails.sections.map(section => (
                                        <div key={section.section_id} className="section-item">
                                            <div className="section-header-row">
                                                <h5>{section.section_name}</h5>
                                                <span className="section-type">{section.section_type}</span>
                                                <div className="section-actions">
                                                    <button
                                                        onClick={() => setEditingSection(section)}
                                                        className="btn-small"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            if (window.confirm('Delete this section?')) {
                                                                try {
                                                                    await axios.delete(`/api/admin/website/sections/${section.section_id}`);
                                                                    handleSectionDeleted();
                                                                } catch (error) {
                                                                    setMessage('Error deleting section');
                                                                }
                                                            }
                                                        }}
                                                        className="btn-small btn-danger"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>

                                            {section.section_header && (
                                                <p className="section-header-text">{section.section_header}</p>
                                            )}

                                            {section.cards && section.cards.length > 0 && (
                                                <div className="cards-preview">
                                                    <strong>Cards ({section.cards.length}):</strong>
                                                    {section.cards.map(card => (
                                                        <div key={card.card_id} className="card-preview">
                                                            {card.card_image_url && <span>🖼️ </span>}
                                                            {card.card_title}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {section.content_blocks && section.content_blocks.length > 0 && (
                                                <div className="blocks-preview">
                                                    <strong>Content Blocks ({section.content_blocks.length})</strong>
                                                </div>
                                            )}

                                            <CardEditor
                                                sectionId={section.section_id}
                                                cards={section.cards || []}
                                                onUpdate={() => fetchPageDetails(selectedPage)}
                                            />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="no-selection">
                            <p>Select a page to view and edit its sections</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PageManager;
