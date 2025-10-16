import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();

  if (!user) return null;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand" to="/dashboard">
          <i className="fas fa-city me-2"></i>
          CivicChain
        </Link>
        
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                to="/dashboard"
              >
                <i className="fas fa-tachometer-alt me-1"></i>
                Dashboard
              </Link>
            </li>
            
            {user.role !== 'ADMIN' && (
              <li className="nav-item">
                <Link 
                  className={`nav-link ${location.pathname === '/report' ? 'active' : ''}`}
                  to="/report"
                >
                  <i className="fas fa-plus-circle me-1"></i>
                  Report Issue
                </Link>
              </li>
            )}
            
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/reports' ? 'active' : ''}`}
                to="/reports"
              >
                <i className="fas fa-list me-1"></i>
                View Reports
              </Link>
            </li>
            
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/leaderboard' ? 'active' : ''}`}
                to="/leaderboard"
              >
                <i className="fas fa-trophy me-1"></i>
                Leaderboard
              </Link>
            </li>
          </ul>
          
          <ul className="navbar-nav">
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="navbarDropdown"
                role="button"
                data-bs-toggle="dropdown"
              >
                <i className="fas fa-user-circle me-1"></i>
                {user.username}
                <span className="badge bg-light text-dark ms-2">
                  Level {user.level}
                </span>
              </a>
              <ul className="dropdown-menu">
                <li>
                  <h6 className="dropdown-header">
                    <i className="fas fa-star text-warning me-1"></i>
                    {user.xp} XP
                  </h6>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <span className="dropdown-item-text">
                    <small className="text-muted">
                      Role: {user.role}
                    </small>
                  </span>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button 
                    className="dropdown-item"
                    onClick={onLogout}
                  >
                    <i className="fas fa-sign-out-alt me-1"></i>
                    Logout
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;