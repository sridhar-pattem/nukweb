import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminDashboardAPI } from '../services/api';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#27ae60',
  warning: '#f39c12',
  danger: '#e74c3c',
  info: '#3498db',
  purple: '#9b59b6',
  teal: '#1abc9c',
  orange: '#e67e22',
  pink: '#e91e63'
};

const CHART_COLORS = [
  COLORS.primary, COLORS.success, COLORS.warning, COLORS.info,
  COLORS.purple, COLORS.teal, COLORS.orange, COLORS.pink
];

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [borrowingTrends, setBorrowingTrends] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [collectionDist, setCollectionDist] = useState([]);
  const [membershipDist, setMembershipDist] = useState([]);
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [patronActivity, setPatronActivity] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('checkouts');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [
        statsRes,
        trendsRes,
        popularRes,
        collectionRes,
        membershipRes,
        overdueRes,
        activityRes,
        patronRes
      ] = await Promise.all([
        adminDashboardAPI.getStats(),
        adminDashboardAPI.getBorrowingTrends(30),
        adminDashboardAPI.getPopularBooks(10),
        adminDashboardAPI.getCollectionDistribution(),
        adminDashboardAPI.getMembershipDistribution(),
        adminDashboardAPI.getOverdueBooks(),
        adminDashboardAPI.getRecentActivity(15),
        adminDashboardAPI.getPatronActivity()
      ]);

      setStats(statsRes.data);
      setBorrowingTrends(trendsRes.data);
      setPopularBooks(popularRes.data);
      setCollectionDist(collectionRes.data);
      setMembershipDist(membershipRes.data);
      setOverdueBooks(overdueRes.data);
      setRecentActivity(activityRes.data);
      setPatronActivity(patronRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (bookId) => {
    navigate(`/admin/books?bookId=${bookId}`);
  };

  const handlePatronClick = (patronId) => {
    navigate(`/admin/patron-management?patronId=${patronId}`);
  };

  const handleCollectionClick = (collectionId) => {
    navigate(`/admin/collections?collectionId=${collectionId}`);
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  const utilizationRate = stats?.books?.total_copies > 0
    ? ((stats.books.total_copies - stats.books.available_copies) / stats.books.total_copies * 100).toFixed(1)
    : 0;

  return (
    <div className="dashboard-container">
      <h1>Library Dashboard</h1>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card" style={{ borderLeftColor: COLORS.primary }}>
          <div className="kpi-icon" style={{ backgroundColor: COLORS.primary + '20', color: COLORS.primary }}>
            📚
          </div>
          <div className="kpi-content">
            <h3>{stats?.books?.total_books || 0}</h3>
            <p>Total Books</p>
            <small>{stats?.books?.total_copies || 0} total copies</small>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeftColor: COLORS.success }}>
          <div className="kpi-icon" style={{ backgroundColor: COLORS.success + '20', color: COLORS.success }}>
            👥
          </div>
          <div className="kpi-content">
            <h3>{stats?.patrons?.active_patrons || 0}</h3>
            <p>Active Patrons</p>
            <small>{stats?.patrons?.total_patrons || 0} total patrons</small>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeftColor: COLORS.info }}>
          <div className="kpi-icon" style={{ backgroundColor: COLORS.info + '20', color: COLORS.info }}>
            📖
          </div>
          <div className="kpi-content">
            <h3>{stats?.borrowings?.total_active || 0}</h3>
            <p>Active Checkouts</p>
            <small>{stats?.returns?.total_returns || 0} total returns</small>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeftColor: COLORS.danger }}>
          <div className="kpi-icon" style={{ backgroundColor: COLORS.danger + '20', color: COLORS.danger }}>
            ⚠️
          </div>
          <div className="kpi-content">
            <h3>{stats?.borrowings?.overdue || 0}</h3>
            <p>Overdue Books</p>
            <small>{stats?.borrowings?.on_time || 0} on time</small>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeftColor: COLORS.purple }}>
          <div className="kpi-icon" style={{ backgroundColor: COLORS.purple + '20', color: COLORS.purple }}>
            📊
          </div>
          <div className="kpi-content">
            <h3>{utilizationRate}%</h3>
            <p>Utilization Rate</p>
            <small>{stats?.books?.available_copies || 0} available</small>
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeftColor: COLORS.teal }}>
          <div className="kpi-icon" style={{ backgroundColor: COLORS.teal + '20', color: COLORS.teal }}>
            📂
          </div>
          <div className="kpi-content">
            <h3>{stats?.collections?.total_collections || 0}</h3>
            <p>Collections</p>
            <small>{stats?.collections?.books_with_collection || 0} books</small>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="charts-grid">
        {/* Borrowing Trends */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Borrowing Trends (Last 30 Days)</h3>
            <div className="chart-legend-custom">
              <span
                className={selectedMetric === 'checkouts' ? 'active' : ''}
                onClick={() => setSelectedMetric('checkouts')}
              >
                <span className="legend-dot" style={{ backgroundColor: COLORS.primary }}></span>
                Checkouts
              </span>
              <span
                className={selectedMetric === 'returns' ? 'active' : ''}
                onClick={() => setSelectedMetric('returns')}
              >
                <span className="legend-dot" style={{ backgroundColor: COLORS.success }}></span>
                Returns
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={borrowingTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                stroke="#999"
              />
              <YAxis stroke="#999" />
              <Tooltip
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '5px' }}
              />
              <Line
                type="monotone"
                dataKey="checkouts"
                stroke={COLORS.primary}
                strokeWidth={2}
                dot={{ fill: COLORS.primary, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="returns"
                stroke={COLORS.success}
                strokeWidth={2}
                dot={{ fill: COLORS.success, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Collection Distribution */}
        <div className="chart-card">
          <h3>Collection Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={collectionDist}
                dataKey="book_count"
                nameKey="collection_name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ collection_name, book_count }) => `${collection_name}: ${book_count}`}
                onClick={(data) => handleCollectionClick(data.collection_id)}
                style={{ cursor: 'pointer' }}
              >
                {collectionDist.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '5px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-grid">
        {/* Popular Books */}
        <div className="chart-card">
          <h3>Most Popular Books</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={popularBooks} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#999" />
              <YAxis
                type="category"
                dataKey="title"
                width={150}
                stroke="#999"
                tick={{ fontSize: 12 }}
                tickFormatter={(title) => title.length > 20 ? title.substring(0, 20) + '...' : title}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '5px' }}
                formatter={(value, name, props) => [`${value} borrows`, props.payload.title]}
              />
              <Bar
                dataKey="borrow_count"
                fill={COLORS.primary}
                onClick={(data) => handleBookClick(data.book_id)}
                style={{ cursor: 'pointer' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Membership Distribution */}
        <div className="chart-card">
          <h3>Membership Plans Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={membershipDist}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="plan_name" stroke="#999" tick={{ fontSize: 12 }} />
              <YAxis stroke="#999" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '5px' }} />
              <Bar dataKey="patron_count" fill={COLORS.success}>
                {membershipDist.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Overdue Books Table */}
      {overdueBooks.length > 0 && (
        <div className="chart-card" style={{ marginTop: '20px' }}>
          <h3 style={{ color: COLORS.danger }}>⚠️ Overdue Books ({overdueBooks.length})</h3>
          <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Author</th>
                  <th>Patron</th>
                  <th>Due Date</th>
                  <th>Days Overdue</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {overdueBooks.map((item) => (
                  <tr key={item.borrowing_id} style={{ backgroundColor: item.days_overdue > 7 ? '#fee' : 'transparent' }}>
                    <td>
                      <span
                        style={{ color: COLORS.primary, cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => handleBookClick(item.book_id)}
                      >
                        {item.title}
                      </span>
                    </td>
                    <td>{item.author}</td>
                    <td>
                      <span
                        style={{ color: COLORS.info, cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => handlePatronClick(item.patron_id)}
                      >
                        {item.patron_name}
                      </span>
                    </td>
                    <td>{new Date(item.due_date).toLocaleDateString()}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: item.days_overdue > 7 ? COLORS.danger : COLORS.warning,
                        color: 'white',
                        fontSize: '12px'
                      }}>
                        {item.days_overdue} days
                      </span>
                    </td>
                    <td>
                      <a href={`mailto:${item.patron_email}`} className="btn btn-sm btn-primary">
                        Email Reminder
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="chart-card" style={{ marginTop: '20px' }}>
        <h3>Recent Activity</h3>
        <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Book</th>
                <th>Patron</th>
                <th>Collection</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((activity) => (
                <tr key={activity.borrowing_id}>
                  <td>{new Date(activity.checkout_date).toLocaleDateString()}</td>
                  <td>
                    <span
                      style={{ color: COLORS.primary, cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => handleBookClick(activity.book_id)}
                    >
                      {activity.book_title}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{ color: COLORS.info, cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => handlePatronClick(activity.patron_id)}
                    >
                      {activity.patron_name}
                    </span>
                  </td>
                  <td>{activity.collection_name}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: activity.status === 'active' ? COLORS.info : COLORS.success,
                      color: 'white',
                      fontSize: '12px'
                    }}>
                      {activity.status}
                    </span>
                  </td>
                  <td>
                    {activity.status === 'active'
                      ? new Date(activity.due_date).toLocaleDateString()
                      : activity.return_date ? new Date(activity.return_date).toLocaleDateString() : '-'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Patrons */}
      <div className="chart-card" style={{ marginTop: '20px' }}>
        <h3>Most Active Patrons</h3>
        <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Patron</th>
                <th>Plan</th>
                <th>Total Borrows</th>
                <th>Active</th>
                <th>Returned</th>
                <th>Overdue</th>
                <th>Last Checkout</th>
              </tr>
            </thead>
            <tbody>
              {patronActivity.map((patron) => (
                <tr key={patron.patron_id}>
                  <td>
                    <span
                      style={{ color: COLORS.primary, cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => handlePatronClick(patron.patron_id)}
                    >
                      {patron.patron_name}
                    </span>
                  </td>
                  <td>{patron.plan_name || 'No Plan'}</td>
                  <td><strong>{patron.total_borrows}</strong></td>
                  <td>{patron.active_borrows}</td>
                  <td>{patron.returned_books}</td>
                  <td>
                    {patron.overdue_count > 0 ? (
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: COLORS.danger,
                        color: 'white',
                        fontSize: '12px'
                      }}>
                        {patron.overdue_count}
                      </span>
                    ) : (
                      <span style={{ color: COLORS.success }}>0</span>
                    )}
                  </td>
                  <td>{patron.last_checkout ? new Date(patron.last_checkout).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
