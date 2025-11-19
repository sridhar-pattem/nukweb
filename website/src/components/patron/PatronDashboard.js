import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { patronContentAPI } from '../../services/api';
import { FaBlog, FaLightbulb, FaStar, FaBell, FaPlus, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import '../../styles/patron-dashboard.css';

const PatronDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [blogPosts, setBlogPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, postsRes, suggestionsRes, testimonialsRes, notificationsRes] = await Promise.all([
        patronContentAPI.getDashboardStats(),
        patronContentAPI.getBlogPosts({ limit: 5 }),
        patronContentAPI.getBookSuggestions({ limit: 5 }),
        patronContentAPI.getTestimonials({ limit: 5 }),
        patronContentAPI.getNotifications({ limit: 5 }),
      ]);

      setStats(statsRes.data);
      setBlogPosts(postsRes.data.posts || []);
      setSuggestions(suggestionsRes.data.suggestions || []);
      setTestimonials(testimonialsRes.data.testimonials || []);
      setNotifications(notificationsRes.data.notifications || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await patronContentAPI.deleteBlogPost(postId);
        fetchDashboardData();
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      draft: 'badge-gray',
      pending: 'badge-yellow',
      approved: 'badge-green',
      published: 'badge-blue',
      rejected: 'badge-red',
      changes_requested: 'badge-orange',
    };
    return `status-badge ${statusColors[status] || 'badge-gray'}`;
  };

  if (loading) {
    return (
      <div className="patron-dashboard loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="patron-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Welcome back, {user?.name || user?.email}!</h1>
          <p>Manage your contributions to Nuk Library</p>
        </div>
        <div className="header-actions">
          <Link to="/patron/blog/new" className="btn btn-primary">
            <FaPlus /> New Blog Post
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon blog">
            <FaBlog />
          </div>
          <div className="stat-content">
            <h3>{stats?.total_blog_posts || 0}</h3>
            <p>Blog Posts</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon suggestions">
            <FaLightbulb />
          </div>
          <div className="stat-content">
            <h3>{stats?.total_suggestions || 0}</h3>
            <p>Book Suggestions</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon testimonials">
            <FaStar />
          </div>
          <div className="stat-content">
            <h3>{stats?.total_testimonials || 0}</h3>
            <p>Testimonials</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon notifications">
            <FaBell />
          </div>
          <div className="stat-content">
            <h3>{stats?.unread_notifications || 0}</h3>
            <p>Notifications</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={activeTab === 'blog' ? 'active' : ''}
          onClick={() => setActiveTab('blog')}
        >
          Blog Posts
        </button>
        <button
          className={activeTab === 'suggestions' ? 'active' : ''}
          onClick={() => setActiveTab('suggestions')}
        >
          Book Suggestions
        </button>
        <button
          className={activeTab === 'testimonials' ? 'active' : ''}
          onClick={() => setActiveTab('testimonials')}
        >
          Testimonials
        </button>
        <button
          className={activeTab === 'notifications' ? 'active' : ''}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications {stats?.unread_notifications > 0 && (
            <span className="badge">{stats.unread_notifications}</span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <h2>Recent Activity</h2>
            <div className="activity-grid">
              {blogPosts.length > 0 && (
                <div className="activity-section">
                  <h3>Recent Blog Posts</h3>
                  {blogPosts.slice(0, 3).map((post) => (
                    <div key={post.post_id} className="activity-item">
                      <h4>{post.title}</h4>
                      <span className={getStatusBadge(post.status)}>
                        {post.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {notifications.length > 0 && (
                <div className="activity-section">
                  <h3>Recent Notifications</h3>
                  {notifications.slice(0, 3).map((notif) => (
                    <div key={notif.notification_id} className="activity-item">
                      <p>{notif.message}</p>
                      <small>{new Date(notif.created_at).toLocaleDateString()}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'blog' && (
          <div className="blog-section">
            <div className="section-header">
              <h2>My Blog Posts</h2>
              <Link to="/patron/blog/new" className="btn btn-primary">
                <FaPlus /> Create New Post
              </Link>
            </div>
            {blogPosts.length === 0 ? (
              <div className="empty-state">
                <FaBlog />
                <p>You haven't created any blog posts yet</p>
                <Link to="/patron/blog/new" className="btn btn-primary">
                  Create Your First Post
                </Link>
              </div>
            ) : (
              <div className="content-list">
                {blogPosts.map((post) => (
                  <div key={post.post_id} className="content-item">
                    <div className="content-info">
                      <h3>{post.title}</h3>
                      <p className="content-meta">
                        Created: {new Date(post.created_at).toLocaleDateString()} |
                        Views: {post.view_count || 0}
                      </p>
                      <span className={getStatusBadge(post.status)}>
                        {post.status.replace('_', ' ')}
                      </span>
                      {post.admin_notes && (
                        <p className="admin-notes">
                          <strong>Admin Notes:</strong> {post.admin_notes}
                        </p>
                      )}
                    </div>
                    <div className="content-actions">
                      <button
                        className="btn btn-icon"
                        onClick={() => navigate(`/patron/blog/edit/${post.post_id}`)}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-icon"
                        onClick={() => handleDeletePost(post.post_id)}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="suggestions-section">
            <div className="section-header">
              <h2>Book Suggestions</h2>
              <Link to="/patron/suggestions/new" className="btn btn-primary">
                <FaPlus /> Suggest a Book
              </Link>
            </div>
            {suggestions.length === 0 ? (
              <div className="empty-state">
                <FaLightbulb />
                <p>You haven't suggested any books yet</p>
                <Link to="/patron/suggestions/new" className="btn btn-primary">
                  Suggest Your First Book
                </Link>
              </div>
            ) : (
              <div className="content-list">
                {suggestions.map((suggestion) => (
                  <div key={suggestion.suggestion_id} className="content-item">
                    <div className="content-info">
                      <h3>{suggestion.book_title}</h3>
                      <p>by {suggestion.author}</p>
                      <p className="content-meta">
                        Suggested: {new Date(suggestion.created_at).toLocaleDateString()}
                      </p>
                      <span className={getStatusBadge(suggestion.status)}>
                        {suggestion.status}
                      </span>
                      {suggestion.admin_notes && (
                        <p className="admin-notes">
                          <strong>Admin Response:</strong> {suggestion.admin_notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'testimonials' && (
          <div className="testimonials-section">
            <div className="section-header">
              <h2>My Testimonials</h2>
              <Link to="/patron/testimonials/new" className="btn btn-primary">
                <FaPlus /> Write a Testimonial
              </Link>
            </div>
            {testimonials.length === 0 ? (
              <div className="empty-state">
                <FaStar />
                <p>You haven't written any testimonials yet</p>
                <Link to="/patron/testimonials/new" className="btn btn-primary">
                  Write Your First Testimonial
                </Link>
              </div>
            ) : (
              <div className="content-list">
                {testimonials.map((testimonial) => (
                  <div key={testimonial.testimonial_id} className="content-item">
                    <div className="content-info">
                      <p className="testimonial-text">"{testimonial.content}"</p>
                      <p className="content-meta">
                        Submitted: {new Date(testimonial.created_at).toLocaleDateString()}
                      </p>
                      <span className={getStatusBadge(testimonial.status)}>
                        {testimonial.status}
                      </span>
                      {testimonial.is_featured && (
                        <span className="featured-badge">Featured</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="notifications-section">
            <div className="section-header">
              <h2>Notifications</h2>
              {notifications.some(n => !n.is_read) && (
                <button
                  className="btn btn-secondary"
                  onClick={async () => {
                    try {
                      await patronContentAPI.markAllNotificationsAsRead();
                      fetchDashboardData();
                    } catch (error) {
                      console.error('Error marking notifications as read:', error);
                    }
                  }}
                >
                  Mark All as Read
                </button>
              )}
            </div>
            {notifications.length === 0 ? (
              <div className="empty-state">
                <FaBell />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="notification-list">
                {notifications.map((notif) => (
                  <div
                    key={notif.notification_id}
                    className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
                    onClick={async () => {
                      if (!notif.is_read) {
                        try {
                          await patronContentAPI.markNotificationAsRead(notif.notification_id);
                          fetchDashboardData();
                        } catch (error) {
                          console.error('Error marking notification as read:', error);
                        }
                      }
                    }}
                  >
                    <div className="notification-content">
                      <p>{notif.message}</p>
                      <small>{new Date(notif.created_at).toLocaleString()}</small>
                    </div>
                    {!notif.is_read && <div className="unread-indicator"></div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatronDashboard;
