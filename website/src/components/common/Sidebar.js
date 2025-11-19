import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaTachometerAlt,
  FaBook,
  FaBookReader,
  FaCalendarAlt,
  FaPencilAlt,
  FaLightbulb,
  FaStar,
  FaGavel,
  FaTools,
  FaUser,
  FaChartLine,
  FaCog,
} from 'react-icons/fa';
import '../../styles/sidebar.css';

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const isAdminPath = location.pathname.startsWith('/admin');

  const patronLinks = [
    {
      title: 'Dashboard',
      path: '/patron/dashboard',
      icon: <FaTachometerAlt />,
    },
    {
      title: 'My Library',
      path: '/patron/library/borrowing',
      icon: <FaBookReader />,
    },
    {
      title: 'Content',
      icon: <FaPencilAlt />,
      submenu: [
        { title: 'Blog Posts', path: '/patron/dashboard' },
        { title: 'Write Post', path: '/patron/blog/new' },
        { title: 'Suggestions', path: '/patron/suggestions/new' },
        { title: 'Testimonials', path: '/patron/testimonials/new' },
      ],
    },
  ];

  const adminLinks = [
    {
      title: 'Dashboard',
      path: '/admin/dashboard',
      icon: <FaTachometerAlt />,
    },
    {
      title: 'Content Management',
      icon: <FaGavel />,
      submenu: [
        { title: 'Moderation Queue', path: '/admin/moderation' },
        { title: 'Events', path: '/admin/events' },
        { title: 'Activity Log', path: '/admin/activity' },
      ],
    },
    {
      title: 'Library Management',
      icon: <FaBook />,
      submenu: [
        { title: 'Cataloging', path: '/admin/library/cataloging' },
        { title: 'Circulation', path: '/admin/library/circulation' },
        { title: 'Members', path: '/admin/library/members' },
        { title: 'Reports', path: '/admin/library/reports' },
      ],
    },
    {
      title: 'Settings',
      path: '/admin/settings',
      icon: <FaCog />,
    },
  ];

  const links = isAdminPath && isAdmin() ? adminLinks : patronLinks;

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <nav className="sidebar-nav">
        {links.map((link, index) => (
          <div key={index} className="sidebar-item">
            {link.submenu ? (
              <div className="sidebar-group">
                <div className="sidebar-group-title">
                  {link.icon}
                  {!collapsed && <span>{link.title}</span>}
                </div>
                {!collapsed && (
                  <div className="sidebar-submenu">
                    {link.submenu.map((sublink, subIndex) => (
                      <Link
                        key={subIndex}
                        to={sublink.path}
                        className={`sidebar-link submenu-link ${
                          isActive(sublink.path) ? 'active' : ''
                        }`}
                      >
                        {sublink.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                to={link.path}
                className={`sidebar-link ${isActive(link.path) ? 'active' : ''}`}
              >
                {link.icon}
                {!collapsed && <span>{link.title}</span>}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
