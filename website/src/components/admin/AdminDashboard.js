import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminContentAPI } from '../../services/api';
import {
  FaBlog,
  FaLightbulb,
  FaStar,
  FaCalendar,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from 'react-icons/fa';
import '../../styles/admin-dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingContent, setPendingContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, pendingRes] = await Promise.all([
        adminContentAPI.getDashboardStats(),
        adminContentAPI.getPendingContent(),
      ]);

      setStats(statsRes.data);
      setPendingContent(pendingRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Content Management Dashboard</h1>
          <p>Manage and moderate community-contributed content</p>
        </div>
        <div className="header-actions">
          <Link to="/admin/events/new" className="btn btn-primary">
            <FaCalendar /> Create Event
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="dashboard-stats">
        <div className="stat-card pending">
          <div className="stat-icon">
            <FaClock />
          </div>
          <div className="stat-content">
            <h3>{stats?.pending_blog_posts + stats?.pending_suggestions + stats?.pending_testimonials || 0}</h3>
            <p>Pending Review</p>
          </div>
          <Link to="/admin/moderation" className="stat-link">
            Review Now →
          </Link>
        </div>

        <div className="stat-card blog">
          <div className="stat-icon">
            <FaBlog />
          </div>
          <div className="stat-content">
            <h3>{stats?.total_blog_posts || 0}</h3>
            <p>Blog Posts</p>
            <small>{stats?.pending_blog_posts || 0} pending</small>
          </div>
        </div>

        <div className="stat-card suggestions">
          <div className="stat-icon">
            <FaLightbulb />
          </div>
          <div className="stat-content">
            <h3>{stats?.total_suggestions || 0}</h3>
            <p>Book Suggestions</p>
            <small>{stats?.pending_suggestions || 0} pending</small>
          </div>
        </div>

        <div className="stat-card testimonials">
          <div className="stat-icon">
            <FaStar />
          </div>
          <div className="stat-content">
            <h3>{stats?.total_testimonials || 0}</h3>
            <p>Testimonials</p>
            <small>{stats?.pending_testimonials || 0} pending</small>
          </div>
        </div>

        <div className="stat-card events">
          <div className="stat-icon">
            <FaCalendar />
          </div>
          <div className="stat-content">
            <h3>{stats?.upcoming_events || 0}</h3>
            <p>Upcoming Events</p>
          </div>
          <Link to="/admin/events" className="stat-link">
            Manage Events →
          </Link>
        </div>
      </div>

      {/* Content Statistics */}
      <div className="content-statistics">
        <div className="stat-section">
          <h2>Content Activity (Last 30 Days)</h2>
          <div className="activity-stats">
            <div className="activity-item">
              <FaCheckCircle className="icon success" />
              <div className="activity-content">
                <h4>{stats?.approved_last_30_days || 0}</h4>
                <p>Approved</p>
              </div>
            </div>
            <div className="activity-item">
              <FaTimesCircle className="icon danger" />
              <div className="activity-content">
                <h4>{stats?.rejected_last_30_days || 0}</h4>
                <p>Rejected</p>
              </div>
            </div>
            <div className="activity-item">
              <FaClock className="icon warning" />
              <div className="activity-content">
                <h4>{stats?.pending_last_30_days || 0}</h4>
                <p>Awaiting Review</p>
              </div>
            </div>
          </div>
        </div>

        <div className="stat-section">
          <h2>Most Active Contributors</h2>
          <div className="contributor-list">
            {stats?.top_contributors?.length > 0 ? (
              stats.top_contributors.slice(0, 5).map((contributor, index) => (
                <div key={contributor.user_id} className="contributor-item">
                  <span className="rank">#{index + 1}</span>
                  <span className="name">{contributor.name || contributor.email}</span>
                  <span className="count">{contributor.contribution_count} posts</span>
                </div>
              ))
            ) : (
              <p className="empty-text">No contributors yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Pending Content Summary */}
      <div className="pending-content-section">
        <div className="section-header">
          <h2>Items Awaiting Review</h2>
          <Link to="/admin/moderation" className="btn btn-primary">
            View All
          </Link>
        </div>

        <div className="pending-content-grid">
          {/* Pending Blog Posts */}
          {pendingContent?.blog_posts?.length > 0 && (
            <div className="pending-card">
              <div className="card-header">
                <FaBlog />
                <h3>Blog Posts ({pendingContent.blog_posts.length})</h3>
              </div>
              <div className="pending-list">
                {pendingContent.blog_posts.slice(0, 3).map((post) => (
                  <div key={post.post_id} className="pending-item">
                    <div className="item-content">
                      <h4>{post.title}</h4>
                      <p className="meta">
                        by {post.author_name} • {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      to={`/admin/moderation/blog/${post.post_id}`}
                      className="btn btn-small"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
              {pendingContent.blog_posts.length > 3 && (
                <Link to="/admin/moderation?tab=blog" className="view-all-link">
                  View all {pendingContent.blog_posts.length} blog posts →
                </Link>
              )}
            </div>
          )}

          {/* Pending Suggestions */}
          {pendingContent?.suggestions?.length > 0 && (
            <div className="pending-card">
              <div className="card-header">
                <FaLightbulb />
                <h3>Book Suggestions ({pendingContent.suggestions.length})</h3>
              </div>
              <div className="pending-list">
                {pendingContent.suggestions.slice(0, 3).map((suggestion) => (
                  <div key={suggestion.suggestion_id} className="pending-item">
                    <div className="item-content">
                      <h4>{suggestion.book_title}</h4>
                      <p className="meta">
                        by {suggestion.author} • Suggested by {suggestion.patron_name}
                      </p>
                    </div>
                    <Link
                      to={`/admin/moderation/suggestions/${suggestion.suggestion_id}`}
                      className="btn btn-small"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
              {pendingContent.suggestions.length > 3 && (
                <Link to="/admin/moderation?tab=suggestions" className="view-all-link">
                  View all {pendingContent.suggestions.length} suggestions →
                </Link>
              )}
            </div>
          )}

          {/* Pending Testimonials */}
          {pendingContent?.testimonials?.length > 0 && (
            <div className="pending-card">
              <div className="card-header">
                <FaStar />
                <h3>Testimonials ({pendingContent.testimonials.length})</h3>
              </div>
              <div className="pending-list">
                {pendingContent.testimonials.slice(0, 3).map((testimonial) => (
                  <div key={testimonial.testimonial_id} className="pending-item">
                    <div className="item-content">
                      <p className="testimonial-preview">
                        "{testimonial.content.substring(0, 100)}..."
                      </p>
                      <p className="meta">
                        by {testimonial.patron_name} • {testimonial.rating} stars
                      </p>
                    </div>
                    <Link
                      to={`/admin/moderation/testimonials/${testimonial.testimonial_id}`}
                      className="btn btn-small"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
              {pendingContent.testimonials.length > 3 && (
                <Link to="/admin/moderation?tab=testimonials" className="view-all-link">
                  View all {pendingContent.testimonials.length} testimonials →
                </Link>
              )}
            </div>
          )}
        </div>

        {!pendingContent?.blog_posts?.length &&
          !pendingContent?.suggestions?.length &&
          !pendingContent?.testimonials?.length && (
            <div className="empty-state">
              <FaCheckCircle />
              <h3>All caught up!</h3>
              <p>There are no items awaiting review at the moment.</p>
            </div>
          )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <Link to="/admin/moderation" className="action-card">
            <FaClock />
            <h3>Review Content</h3>
            <p>Moderate pending submissions</p>
          </Link>
          <Link to="/admin/events" className="action-card">
            <FaCalendar />
            <h3>Manage Events</h3>
            <p>Create and manage library events</p>
          </Link>
          <Link to="/admin/content/blog" className="action-card">
            <FaBlog />
            <h3>All Blog Posts</h3>
            <p>View and manage all blog posts</p>
          </Link>
          <Link to="/admin/activity" className="action-card">
            <FaStar />
            <h3>Activity Log</h3>
            <p>View moderation history</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
