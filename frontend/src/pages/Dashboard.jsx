import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { incidentsAPI } from '../api/client';
import Layout from '../components/Layout';
import { AlertCircle, CheckCircle, Clock, FileText, Plus, Search, ClipboardList, Upload } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => incidentsAPI.dashboardStats().then(res => res.data),
  });

  const { data: recentIncidents } = useQuery({
    queryKey: ['recent-incidents'],
    queryFn: () => incidentsAPI.list({ page_size: 5 }).then(res => res.data.results),
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="loading">Loading your workspace...</div>
      </Layout>
    );
  }

  const getGreeting = () => {
    const roleMap = {
      'guard': 'Officer',
      'supervisor': 'Supervisor',
      'head': 'Chief',
      'admin': 'Administrator'
    };
    return `Welcome back, ${roleMap[user?.role] || 'User'} ${user?.full_name?.split(' ')[0]}`;
  };

  const getSubtext = () => {
    if (user?.role === 'guard') return 'Focus on your assigned tasks and active patrols.';
    if (['supervisor', 'head'].includes(user?.role)) return 'Campus-wide security overview and rapid response monitoring.';
    return 'System-wide monitoring and administrative oversight.';
  };

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>{getGreeting()}</h1>
          <p style={{ color: '#64748b' }}>{getSubtext()}</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Incidents</h3>
          <div className="value">{stats?.total || 0}</div>
          <FileText size={24} style={{ color: '#3b82f6', marginTop: '10px' }} />
        </div>

        <div className="stat-card">
          <h3>Pending</h3>
          <div className="value" style={{ color: '#f59e0b' }}>{stats?.pending || 0}</div>
          <AlertCircle size={24} style={{ color: '#f59e0b', marginTop: '10px' }} />
        </div>

        <div className="stat-card">
          <h3>In Progress</h3>
          <div className="value" style={{ color: '#3b82f6' }}>{stats?.in_progress || 0}</div>
          <Clock size={24} style={{ color: '#3b82f6', marginTop: '10px' }} />
        </div>

        <div className="stat-card">
          <h3>Resolved</h3>
          <div className="value" style={{ color: '#10b981' }}>{stats?.resolved || 0}</div>
          <CheckCircle size={24} style={{ color: '#10b981', marginTop: '10px' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
        {/* Quick Actions Panel */}
        <div className="card">
          <h2 style={{ marginBottom: '20px' }}>Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <Link to="/incidents/new" style={{ textDecoration: 'none' }}>
              <button className="btn" style={{ width: '100%', padding: '20px', background: '#27ae60', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
                <Plus size={24} />
                Log New Incident
              </button>
            </Link>
            <Link to="/incidents" style={{ textDecoration: 'none' }}>
              <button className="btn" style={{ width: '100%', padding: '20px', background: '#3498db', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
                <Search size={24} />
                Search Incidents
              </button>
            </Link>
            <Link to="/my-incidents" style={{ textDecoration: 'none' }}>
              <button className="btn" style={{ width: '100%', padding: '20px', background: '#9b59b6', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
                <ClipboardList size={24} />
                My Assignments ({stats?.my_incidents || 0})
              </button>
            </Link>
            <Link to="/evidence" style={{ textDecoration: 'none' }}>
              <button className="btn" style={{ width: '100%', padding: '20px', background: '#16a085', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
                <Upload size={24} />
                Upload Evidence
              </button>
            </Link>
          </div>
        </div>

        {/* Recent Activity Panel */}
        <div className="card">
          <h2 style={{ marginBottom: '20px' }}>Recent Activity</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {recentIncidents && recentIncidents.slice(0, 5).map((incident, index) => (
              <div key={incident.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: index === 0 ? '#e67e22' : index === 1 ? '#3498db' : index === 2 ? '#9b59b6' : index === 3 ? '#27ae60' : '#3498db', marginTop: '5px', flexShrink: 0 }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: '#e67e22', fontWeight: '600', marginBottom: '3px' }}>
                    {new Date(incident.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ fontSize: '13px', color: '#2c3e50' }}>
                    {incident.reference_number} {incident.status === 'assigned' ? 'assigned to you' : incident.status === 'resolved' ? 'status updated' : `reported at ${incident.location_building}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '20px' }}>
          {user?.role === 'guard' ? 'My Recent Assignments' : 'Recent Campus Incidents'}
        </h2>
        {recentIncidents && recentIncidents.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Type</th>
                <th>Location</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentIncidents.map((incident) => (
                <tr key={incident.id}>
                  <td>{incident.reference_number}</td>
                  <td>{incident.incident_type}</td>
                  <td>{incident.location_building}</td>
                  <td>
                    <span className={`badge badge-${incident.status}`}>
                      {incident.status}
                    </span>
                  </td>
                  <td>{new Date(incident.created_at).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/incidents/${incident.id}`} className="btn btn-primary" style={{ padding: '5px 15px', fontSize: '12px' }}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No incidents found</p>
        )}

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link to="/incidents" className="btn btn-secondary">
            View All Incidents
          </Link>
        </div>
      </div>
    </Layout>
  );
}
