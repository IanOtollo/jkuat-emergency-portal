import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, FileText, Plus, BarChart, LogOut, User } from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const canAccessAnalytics = ['supervisor', 'head', 'admin'].includes(user?.role);
  const canAccessUsers = user?.role === 'admin';

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>JKUAT Emergency Incident Management System</h1>
          <div style={{ fontSize: '13px', color: '#ecf0f1', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={16} />
            <span>{user?.full_name} ({user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)})</span>
          </div>
          <div style={{ fontSize: '11px', color: '#95a5a6', marginTop: '3px', paddingLeft: '24px' }}>
            [Logout]
          </div>
        </div>

        <nav>
          <ul className="sidebar-nav">
            <li>
              <Link to="/" className={isActive('/')}>
                <Home size={18} />
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/incidents/new" className={isActive('/incidents/new')}>
                <Plus size={18} />
                New Incident
              </Link>
            </li>
            <li>
              <Link to="/my-incidents" className={isActive('/my-incidents')}>
                <FileText size={18} />
                My Incidents
              </Link>
            </li>
            <li>
              <Link to="/incidents" className={isActive('/incidents')}>
                <FileText size={18} />
                All Incidents
              </Link>
            </li>
            {canAccessAnalytics && (
              <li>
                <Link to="/analytics" className={isActive('/analytics')}>
                  <BarChart size={18} />
                  Analytics
                </Link>
              </li>
            )}
            <li>
              <Link to="/evidence" className={isActive('/evidence')}>
                <FileText size={18} />
                Evidence
              </Link>
            </li>
            <li>
              <Link to="/profile" className={isActive('/profile')}>
                <User size={18} />
                Profile
              </Link>
            </li>
            {canAccessUsers && (
              <li>
                <div style={{ padding: '10px 15px', fontSize: '12px', color: '#95a5a6', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '10px' }}>
                  Administration
                </div>
                <Link to="/users" className={isActive('/users')}>
                  <User size={18} />
                  User Management
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <div style={{ position: 'absolute', bottom: '80px', width: 'calc(100% - 40px)' }}>
          <a
            href="tel:0800-JKUAT-1"
            className="emergency-link"
            style={{
              color: '#e74c3c',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 15px',
              borderRadius: '8px',
              border: '2px solid #e74c3c',
              backgroundColor: '#fef5e7',
              textDecoration: 'none'
            }}
          >
            <div style={{ fontSize: '12px', textTransform: 'uppercase', flex: 1 }}>🚨 Emergency</div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: '#e67e22' }}>Security Desk</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>0800-JKUAT-1</div>
              <div style={{ fontSize: '9px', color: '#95a5a6' }}>24/7 Hotline</div>
            </div>
          </a>
        </div>

        <div style={{ position: 'absolute', bottom: '20px', width: 'calc(100% - 40px)' }}>
          <button
            onClick={logout}
            className="btn btn-secondary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside >

      <main className="main-content">
        {children}
      </main>
    </div >
  );
}
