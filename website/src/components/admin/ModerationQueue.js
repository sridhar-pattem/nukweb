import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { adminContentAPI } from '../../services/api';
import {
  FaBlog,
  FaLightbulb,
  FaStar,
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaEye,
} from 'react-icons/fa';
import '../../styles/moderation-queue.css';

const ModerationQueue = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'blog');
  const [blogPosts, setBlogPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionData, setActionData] = useState({ notes: '', action: '' });

  useEffect(() => {
    fetchContent();
  }, [activeTab]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      if (activeTab === 'blog') {
        const response = await adminContentAPI.getAllBlogPosts({ status: 'pending' });
        setBlogPosts(response.data.posts || []);
      } else if (activeTab === 'suggestions') {
        const response = await adminContentAPI.getAllSuggestions({ status: 'pending' });
        setSuggestions(response.data.suggestions || []);
      } else if (activeTab === 'testimonials') {
        const response = await adminContentAPI.getAllTestimonials({ status: 'pending' });
        setTestimonials(response.data.testimonials || []);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const openModal = (item, action) => {
    setSelectedItem(item);
    setActionData({ notes: '', action });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
    setActionData({ notes: '', action: '' });
  };

  const handleAction = async () => {
    if (!selectedItem) return;

    try {
      if (activeTab === 'blog') {
        if (actionData.action === 'approve') {
          await adminContentAPI.approveBlogPost(selectedItem.post_id, {
            publish: true,
            admin_notes: actionData.notes,
          });
        } else if (actionData.action === 'reject') {
          await adminContentAPI.rejectBlogPost(selectedItem.post_id, {
            reason: actionData.notes,
          });
        } else if (actionData.action === 'request_changes') {
          await adminContentAPI.requestChanges(selectedItem.post_id, {
            requested_changes: actionData.notes,
          });
        }
      } else if (activeTab === 'suggestions') {
        if (actionData.action === 'approve') {
          await adminContentAPI.approveSuggestion(selectedItem.suggestion_id, {
            admin_notes: actionData.notes,
          });
        } else if (actionData.action === 'reject') {
          await adminContentAPI.rejectSuggestion(selectedItem.suggestion_id, {
            reason: actionData.notes,
          });
        }
      } else if (activeTab === 'testimonials') {
        if (actionData.action === 'approve') {
          await adminContentAPI.approveTestimonial(selectedItem.testimonial_id);
        } else if (actionData.action === 'reject') {
          await adminContentAPI.rejectTestimonial(selectedItem.testimonial_id, {
            reason: actionData.notes,
          });
        }
      }

      closeModal();
      fetchContent();
      alert('Action completed successfully!');
    } catch (error) {
      console.error('Error performing action:', error);
      alert(error.response?.data?.message || 'Failed to perform action');
    }
  };

  if (loading) {
    return (
      <div className="moderation-queue loading">
        <div className="spinner"></div>
        <p>Loading content...</p>
      </div>
    );
  }

  return (
    <div className="moderation-queue">
      <div className="queue-header">
        <h1>Content Moderation Queue</h1>
        <p>Review and moderate community submissions</p>
      </div>

      {/* Tabs */}
      <div className="moderation-tabs">
        <button
          className={activeTab === 'blog' ? 'active' : ''}
          onClick={() => handleTabChange('blog')}
        >
          <FaBlog /> Blog Posts ({blogPosts.length})
        </button>
        <button
          className={activeTab === 'suggestions' ? 'active' : ''}
          onClick={() => handleTabChange('suggestions')}
        >
          <FaLightbulb /> Book Suggestions ({suggestions.length})
        </button>
        <button
          className={activeTab === 'testimonials' ? 'active' : ''}
          onClick={() => handleTabChange('testimonials')}
        >
          <FaStar /> Testimonials ({testimonials.length})
        </button>
      </div>

      {/* Content */}
      <div className="queue-content">
        {activeTab === 'blog' && (
          <div className="blog-queue">
            {blogPosts.length === 0 ? (
              <div className="empty-state">
                <FaBlog />
                <p>No blog posts awaiting review</p>
              </div>
            ) : (
              <div className="moderation-list">
                {blogPosts.map((post) => (
                  <div key={post.post_id} className="moderation-item">
                    <div className="item-header">
                      <h3>{post.title}</h3>
                      <div className="item-meta">
                        <span className="author">by {post.author_name}</span>
                        <span className="date">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="item-content">
                      <p className="excerpt">
                        {post.excerpt || post.content.substring(0, 200) + '...'}
                      </p>
                      {post.tags && (
                        <div className="tags">
                          {post.tags.split(',').map((tag, index) => (
                            <span key={index} className="tag">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="item-actions">
                      <button
                        className="btn btn-success"
                        onClick={() => openModal(post, 'approve')}
                      >
                        <FaCheckCircle /> Approve
                      </button>
                      <button
                        className="btn btn-warning"
                        onClick={() => openModal(post, 'request_changes')}
                      >
                        <FaEdit /> Request Changes
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => openModal(post, 'reject')}
                      >
                        <FaTimesCircle /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="suggestions-queue">
            {suggestions.length === 0 ? (
              <div className="empty-state">
                <FaLightbulb />
                <p>No book suggestions awaiting review</p>
              </div>
            ) : (
              <div className="moderation-list">
                {suggestions.map((suggestion) => (
                  <div key={suggestion.suggestion_id} className="moderation-item">
                    <div className="item-header">
                      <h3>{suggestion.book_title}</h3>
                      <div className="item-meta">
                        <span className="author">by {suggestion.author}</span>
                        <span className="patron">
                          Suggested by {suggestion.patron_name}
                        </span>
                      </div>
                    </div>
                    <div className="item-content">
                      <div className="book-details">
                        {suggestion.isbn && <p><strong>ISBN:</strong> {suggestion.isbn}</p>}
                        {suggestion.publisher && (
                          <p><strong>Publisher:</strong> {suggestion.publisher}</p>
                        )}
                        {suggestion.publication_year && (
                          <p><strong>Year:</strong> {suggestion.publication_year}</p>
                        )}
                        {suggestion.genre && <p><strong>Genre:</strong> {suggestion.genre}</p>}
                      </div>
                      <p className="reason">
                        <strong>Reason:</strong> {suggestion.reason}
                      </p>
                      {suggestion.purchase_link && (
                        <a
                          href={suggestion.purchase_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="purchase-link"
                        >
                          View Purchase Link
                        </a>
                      )}
                    </div>
                    <div className="item-actions">
                      <button
                        className="btn btn-success"
                        onClick={() => openModal(suggestion, 'approve')}
                      >
                        <FaCheckCircle /> Approve
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => openModal(suggestion, 'reject')}
                      >
                        <FaTimesCircle /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'testimonials' && (
          <div className="testimonials-queue">
            {testimonials.length === 0 ? (
              <div className="empty-state">
                <FaStar />
                <p>No testimonials awaiting review</p>
              </div>
            ) : (
              <div className="moderation-list">
                {testimonials.map((testimonial) => (
                  <div key={testimonial.testimonial_id} className="moderation-item">
                    <div className="item-header">
                      <div className="rating">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={i < testimonial.rating ? 'filled' : ''}
                          />
                        ))}
                      </div>
                      <div className="item-meta">
                        <span className="patron">by {testimonial.patron_name}</span>
                        <span className="date">
                          {new Date(testimonial.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="item-content">
                      <p className="testimonial-text">"{testimonial.content}"</p>
                    </div>
                    <div className="item-actions">
                      <button
                        className="btn btn-success"
                        onClick={() => openModal(testimonial, 'approve')}
                      >
                        <FaCheckCircle /> Approve
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => openModal(testimonial, 'reject')}
                      >
                        <FaTimesCircle /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {actionData.action === 'approve' && 'Approve Content'}
                {actionData.action === 'reject' && 'Reject Content'}
                {actionData.action === 'request_changes' && 'Request Changes'}
              </h2>
              <button className="close-btn" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                {actionData.action === 'approve' &&
                  'This content will be published. Add any notes for the author (optional):'}
                {actionData.action === 'reject' &&
                  'Please provide a reason for rejection:'}
                {actionData.action === 'request_changes' &&
                  'Specify what changes are needed:'}
              </p>
              <textarea
                value={actionData.notes}
                onChange={(e) =>
                  setActionData({ ...actionData, notes: e.target.value })
                }
                placeholder={
                  actionData.action === 'approve'
                    ? 'Great work! (optional)'
                    : actionData.action === 'reject'
                    ? 'Reason for rejection...'
                    : 'Changes needed...'
                }
                rows="4"
                required={actionData.action !== 'approve'}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button
                className={`btn ${
                  actionData.action === 'approve'
                    ? 'btn-success'
                    : actionData.action === 'reject'
                    ? 'btn-danger'
                    : 'btn-warning'
                }`}
                onClick={handleAction}
                disabled={
                  actionData.action !== 'approve' && !actionData.notes.trim()
                }
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModerationQueue;
