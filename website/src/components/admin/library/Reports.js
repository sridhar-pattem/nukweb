import React, { useState, useEffect } from 'react';
import { adminLibraryAPI } from '../../../services/api';
import {
  FaBook,
  FaUsers,
  FaExchangeAlt,
  FaExclamationTriangle,
  FaChartLine,
  FaCalendar,
} from 'react-icons/fa';
import '../../../styles/admin-library.css';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminLibraryAPI.getLibraryDashboardStats();
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-library loading">
        <div className="spinner"></div>
        <p>Loading reports...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="admin-library">
        <div className="admin-header">
          <h1>Reports</h1>
          <p>Library statistics and analytics</p>
        </div>
        <div className="error-message">{error || 'No statistics available'}</div>
      </div>
    );
  }

  return (
    <div className="admin-library">
      <div className="admin-header">
        <h1>Reports</h1>
        <p>Library statistics and analytics</p>
      </div>

      {/* Overview Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon books">
            <FaBook />
          </div>
          <div className="stat-content">
            <h3>{stats.total_books || 0}</h3>
            <p>Total Books</p>
            <span className="stat-detail">
              {stats.total_items || 0} items
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon members">
            <FaUsers />
          </div>
          <div className="stat-content">
            <h3>{stats.total_patrons || 0}</h3>
            <p>Active Members</p>
            <span className="stat-detail">
              {stats.new_patrons_this_month || 0} new this month
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon circulation">
            <FaExchangeAlt />
          </div>
          <div className="stat-content">
            <h3>{stats.active_borrowings || 0}</h3>
            <p>Active Borrowings</p>
            <span className="stat-detail">
              {stats.borrowings_this_month || 0} this month
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon overdue">
            <FaExclamationTriangle />
          </div>
          <div className="stat-content">
            <h3>{stats.overdue_borrowings || 0}</h3>
            <p>Overdue Items</p>
            <span className="stat-detail">
              Requires attention
            </span>
          </div>
        </div>
      </div>

      {/* Collection Statistics */}
      <div className="report-section">
        <h2>
          <FaBook /> Collection Overview
        </h2>
        <div className="report-grid">
          <div className="report-item">
            <label>Total Books</label>
            <value>{stats.total_books || 0}</value>
          </div>
          <div className="report-item">
            <label>Total Items</label>
            <value>{stats.total_items || 0}</value>
          </div>
          <div className="report-item">
            <label>Available Items</label>
            <value>{stats.available_items || 0}</value>
          </div>
          <div className="report-item">
            <label>Checked Out</label>
            <value>{stats.checked_out_items || 0}</value>
          </div>
        </div>
      </div>

      {/* Circulation Statistics */}
      <div className="report-section">
        <h2>
          <FaExchangeAlt /> Circulation Statistics
        </h2>
        <div className="report-grid">
          <div className="report-item">
            <label>Active Borrowings</label>
            <value>{stats.active_borrowings || 0}</value>
          </div>
          <div className="report-item">
            <label>This Month</label>
            <value>{stats.borrowings_this_month || 0}</value>
          </div>
          <div className="report-item">
            <label>This Year</label>
            <value>{stats.borrowings_this_year || 0}</value>
          </div>
          <div className="report-item">
            <label>Total All Time</label>
            <value>{stats.total_borrowings || 0}</value>
          </div>
        </div>
      </div>

      {/* Member Statistics */}
      <div className="report-section">
        <h2>
          <FaUsers /> Membership Statistics
        </h2>
        <div className="report-grid">
          <div className="report-item">
            <label>Active Members</label>
            <value>{stats.total_patrons || 0}</value>
          </div>
          <div className="report-item">
            <label>New This Month</label>
            <value>{stats.new_patrons_this_month || 0}</value>
          </div>
          <div className="report-item">
            <label>Members with Active Borrowings</label>
            <value>{stats.patrons_with_borrowings || 0}</value>
          </div>
        </div>
      </div>

      {/* Most Popular Books */}
      {stats.popular_books && stats.popular_books.length > 0 && (
        <div className="report-section">
          <h2>
            <FaChartLine /> Most Popular Books
          </h2>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Times Borrowed</th>
                  <th>Current Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.popular_books.slice(0, 10).map((book, index) => (
                  <tr key={index}>
                    <td>
                      <strong>{book.title}</strong>
                    </td>
                    <td>{book.author || 'N/A'}</td>
                    <td>{book.borrow_count}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          book.available_items > 0 ? 'available' : 'unavailable'
                        }`}
                      >
                        {book.available_items > 0 ? 'Available' : 'All Checked Out'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="report-section">
        <h2>
          <FaCalendar /> Activity Summary
        </h2>
        <div className="activity-summary">
          <div className="activity-item">
            <FaBook />
            <div>
              <strong>{stats.checkouts_today || 0}</strong> checkouts today
            </div>
          </div>
          <div className="activity-item">
            <FaExchangeAlt />
            <div>
              <strong>{stats.returns_today || 0}</strong> returns today
            </div>
          </div>
          <div className="activity-item">
            <FaUsers />
            <div>
              <strong>{stats.new_members_today || 0}</strong> new members today
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
