import React from 'react';
import { FaBars, FaBell, FaUserCircle, FaSearch } from 'react-icons/fa';
import '../styles/Header.css';

const Header = ({ toggleSidebar, sidebarOpen }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className=\"header\">
      <div className=\"header-left\">
        <button 
          className=\"sidebar-toggle\"
          onClick={toggleSidebar}
          aria-label=\"Toggle sidebar\"
        >
          <FaBars />
        </button>
        
        <div className=\"search-container\">
          <FaSearch className=\"search-icon\" />
          <input
            type=\"text\"
            placeholder=\"Search guests, rooms, reservations...\"
            className=\"search-input\"
          />
        </div>
      </div>

      <div className=\"header-center\">
        <div className=\"date-display\">
          <span className=\"current-date\">{currentDate}</span>
        </div>
      </div>

      <div className=\"header-right\">
        <button className=\"notification-btn\" title=\"Notifications\">
          <FaBell />
          <span className=\"notification-badge\">3</span>
        </button>

        <div className=\"user-menu\">
          <button className=\"user-avatar\">
            <FaUserCircle />
            <span className=\"user-name\">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;