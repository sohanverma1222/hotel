import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaBed, 
  FaCalendarCheck, 
  FaChartBar,
  FaTimes,
  FaHotel
} from 'react-icons/fa';
import '../styles/Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const menuItems = [
    { path: '/dashboard', icon: FaTachometerAlt, label: 'Dashboard' },
    { path: '/guests', icon: FaUsers, label: 'Guests' },
    { path: '/rooms', icon: FaBed, label: 'Rooms' },
    { path: '/reservations', icon: FaCalendarCheck, label: 'Reservations' },
    { path: '/reports', icon: FaChartBar, label: 'Reports' }
  ];

  return (
    <>
      {isOpen && <div className=\"sidebar-overlay\" onClick={toggleSidebar} />}
      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className=\"sidebar-header\">
          <div className=\"logo-container\">
            <FaHotel className=\"logo-icon\" />
            <h1 className=\"logo-text\">Hotel Manager</h1>
          </div>
          <button className=\"close-btn\" onClick={toggleSidebar}>
            <FaTimes />
          </button>
        </div>
        
        <nav className=\"sidebar-nav\">
          <ul>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => 
                      `nav-link ${isActive ? 'active' : ''}`
                    }
                    onClick={() => {
                      if (window.innerWidth <= 768) {
                        toggleSidebar();
                      }
                    }}
                  >
                    <Icon className=\"nav-icon\" />
                    <span className=\"nav-text\">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className=\"sidebar-footer\">
          <div className=\"version-info\">
            <small>Version 1.0.0</small>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;