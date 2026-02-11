import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, FileText, Plus, BarChart, LogOut, User } from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const canAccessAnalytics = ['supervisor', 'head', 'admin'].includes(user?.role);

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>JKUAT Security</h1>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '5px' }}>
            <User size={14} style={{ display: 'inline', marginRight: '5px' }} />
            {user?.full_name}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            {user?.role?.toUpperCase()}
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
              <Link to="/incidents" className={isActive('/incidents')}>
                <FileText size={18} />
                All Incidents
              </Link>
            </li>
            <li>
              <Link to="/incidents/new" className={isActive('/incidents/new')}>
                <Plus size={18} />
                Create Incident
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
          </ul>
        </nav>

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
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
